import { decodeHTML } from "entities";
import { addToRedis, getFromRedis } from "../redis.js";
import logger from "./logger.js";

const UNFURL_TIMEOUT = 4000; // ms
const UNFURL_CACHE_EXPIRY = 60 * 60 * 24 * 7; // 7 days
const MAX_HEAD_CHARS = 512 * 1024; // metadata lives in <head>; don't download whole pages

// <meta>/<link> tags, allowing ">" inside quoted attribute values
const TAG_RE = /<(meta|link)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const ATTR_RE = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
const TITLE_RE = /<title[^>]*>([^<]*)<\/title>/i;

const parseAttrs = (tag) => {
  const attrs = {};
  for (const [, name, dq, sq, bare] of tag.matchAll(ATTR_RE)) {
    attrs[name.toLowerCase()] = decodeHTML(dq ?? sq ?? bare ?? "").trim();
  }
  return attrs;
};

// absolute http(s) URL, or undefined for anything else (data:, javascript:, garbage)
const resolveUrl = (value, base) => {
  if (!value) return undefined;
  try {
    const url = new URL(value, base);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};

const readHead = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  while (html.length < MAX_HEAD_CHARS) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
    if (/<\/head>/i.test(html)) break;
  }
  reader.cancel().catch(() => {});
  return html;
};

const fetchMetadata = async (url) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BubblegumUnfurl/1.0)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(UNFURL_TIMEOUT),
  });
  if (!response.ok) return null;
  if (!response.headers.get("content-type")?.includes("text/html")) return null;

  const html = await readHead(response);
  const base = response.url; // relative image/icon paths resolve against the post-redirect URL

  const meta = {};
  const icons = [];
  for (const [tag, tagName] of html.matchAll(TAG_RE)) {
    const attrs = parseAttrs(tag);
    if (tagName.toLowerCase() === "meta") {
      const key = (attrs.property || attrs.name || "").toLowerCase();
      if (key && attrs.content && !(key in meta)) meta[key] = attrs.content;
    } else if (attrs.href && /(^|\s)(icon|apple-touch-icon)(\s|$)/i.test(attrs.rel)) {
      icons.push(attrs);
    }
  }

  const title =
    meta["og:title"] ||
    meta["twitter:title"] ||
    decodeHTML(html.match(TITLE_RE)?.[1] || "").trim();
  if (!title) return null;

  const icon =
    icons.find((i) => !/apple-touch-icon/i.test(i.rel)) || icons[0];

  return {
    title,
    description:
      meta["og:description"] ||
      meta["twitter:description"] ||
      meta["description"] ||
      null,
    image:
      resolveUrl(meta["og:image"] || meta["og:image:url"], base) ||
      resolveUrl(meta["twitter:image"], base) ||
      null,
    favicon: resolveUrl(icon?.href || "/favicon.ico", base) || null,
    domain: new URL(url).hostname.replace(/^www\./, ""),
  };
};

// Open Graph preview for a URL, or null. The cache is best-effort, and only
// successes are cached so a timeout or a flaky site doesn't hide the preview for a week.
const unfurl = async (url) => {
  const cacheKey = `unfurl:${url}`;
  const cached = await getFromRedis(cacheKey).catch(() => null);
  if (cached) return cached;

  try {
    const preview = await fetchMetadata(url);
    if (preview) {
      await addToRedis(cacheKey, preview, null, UNFURL_CACHE_EXPIRY).catch(
        () => {},
      );
    }
    return preview;
  } catch (err) {
    logger.error("[unfurl]", url, err.message);
    return null;
  }
};

export default unfurl;
