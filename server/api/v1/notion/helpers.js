import { Client } from "@notionhq/client";
import normalizeUrl from "normalize-url";
import config from "../../../config.js";
import logger from "../../../utils/logger.js";
import _ from "lodash";

const notion = new Client({
  auth: config.NOTION_AUTH_KEY,
});

// Link card for an unfurled URL. Everything in `preview` comes from a third-party
// page and ends up in innerHTML, so all of it is escaped.
const generateLinkPreview = (url, preview) => {
  const { title, description, image, favicon, domain } = preview;
  const e = _.escape;

  return `
    <a class="link-preview" href="${e(url)}" target="_blank" rel="noopener noreferrer">
      ${image ? `<img class="link-preview-image" src="${e(image)}" alt="" />` : ""}
      <div class="link-preview-body">
        <div class="link-preview-site">
          ${favicon ? `<img src="${e(favicon)}" alt="" />` : ""}
          <span>${e(domain)}</span>
        </div>
        <div class="link-preview-title">${e(title)}</div>
        ${description ? `<div class="link-preview-description">${e(description)}</div>` : ""}
      </div>
    </a>`;
};

const generateTagHeader = (tags) =>
  `<div class='header'>${tags
    .filter(Boolean)
    .map((tag) => `<span class='tag'>${tag}</span>`)
    .join(" • ")}</div>`;

// `⌘ + Shift + M` -> <span>⌘</span> + <span>Shift</span> + <span>M</span>
const generateShortcut = (shortcut) =>
  shortcut
    .split("+")
    .map((key) => `<span class='key'>${key.trim()}</span>`)
    .join(" + ");

// Notion rows can have an empty or malformed url, which normalize-url throws on.
const toDisplayUrl = (url) => {
  try {
    return normalizeUrl(url, { stripProtocol: true, stripWWW: true });
  } catch {
    return url || "";
  }
};

// Same caveat as above: anything `URL` can't parse is passed through untouched.
const withUtmSource = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", "pulse_extension");
    return parsed.toString();
  } catch {
    return url;
  }
};

const generateContent = (data, key) => {
  let htmlOutput = "";
  let markdownOutput = "";

  data.forEach((item) => {
    switch (key) {
      case "vocab": {
        const { name, description, ex } = item;
        const finalName = _.capitalize(name);
        htmlOutput += `
          <div class="card">
            <h6>Word</h6>
            <h4>${finalName}</h4>
            <h6 style="margin-top: 0.8em;">Definition</h6>
            <p>${description}</p>
            <h6 style="margin-top: 0.8em;">Example</h6>
            <p>${ex}</p>
          </div>
    `;
        markdownOutput += `
###### Word
## ${finalName}
---
###### Definition
### ${description}
---
###### Example
### ${ex}
    `;
        break;
      }
      case "code404": {
        const { url, L0, tags, title, description, preview } = item;
        const displayUrl = toDisplayUrl(url);
        const trackedUrl = withUtmSource(url);
        const tagHeaders = generateTagHeader([L0, ...(tags || [])]);
        const finalName = _.capitalize(title);
        htmlOutput += `
          <div class="card">
            ${tagHeaders}
            <h4>${finalName}</h4>
            ${description ? `<p>${description}</p>` : ""}
            ${
              preview
                ? generateLinkPreview(trackedUrl, preview)
                : `<a href="${trackedUrl}" target="_blank">${displayUrl}</a>`
            }
          </div>
        `;
        break;
      }
      case "keybindings": {
        const { mac, windows, title, description, platform, group } = item;
        const finalName = _.capitalize(title);
        const tagHeaders = generateTagHeader([group]);
        htmlOutput += `
          <div class="card">
            ${tagHeaders}
            <h4>${finalName}</h4>
            ${description ? `<p>${description}</p>` : ""}
            ${mac ? `<div class="shortcut-container"><div class='platform'>MACOS</div> ${generateShortcut(mac)} </div>` : ""}
            ${windows ? `<div class="shortcut-container"><div class='platform'>WINDOWS</div> ${generateShortcut(windows)} </div>` : ""}
          </div>
        `;
        break;
      }
      default: {
        break;
      }
    }
  });

  return {
    html: htmlOutput,
    markdown: markdownOutput,
  };
};

const parseNotionData = (data) => {
  return data
    .map((item) => {
      const { properties } = item;
      const result = {
        id: item.id,
      };
      _.forEach(properties, (value, key) => {
        const { type } = value;
        let finalValue = "";
        switch (type) {
          case "multi_select":
            finalValue = value.multi_select.map((item) => item.name);
            break;
          case "title":
            finalValue = _.get(value, "title.0.plain_text");
            break;
          case "rich_text":
            finalValue = _.get(value, "rich_text.0.plain_text");
            break;
          case "select":
            finalValue = _.get(value, "select.name");
            break;
          case "checkbox":
          case "number":
          case "url":
            finalValue = _.get(value, type);
            break;
          case "relation":
            finalValue = _.get(value, "relation", []);
            break;
          case "formula":
            finalValue = _.get(value, "formula.string");
            break;
          default:
            logger.info("Unhandled notion type", type, value);
        }
        result[key] = finalValue;
      });
      return result;
    })
    .filter((item) => _.isEmpty(item["Parent item"])); // do not return nested items
};

const fetchDataFromNotion = async (
  database_id,
  params,
  fetchAllPages = false,
) => {
  const data = [];
  let next_cursor = null;

  const db = await notion.request({
    method: "get",
    path: `databases/${database_id}`,
  });
  const data_source_id = db.data_sources[0].id;

  const fetchBatch = async (p = {}) => {
    const response = await notion.dataSources.query(p);
    data.push(...response.results);

    next_cursor = response.next_cursor;

    if (fetchAllPages && response.has_more)
      await fetchBatch({ ...p, start_cursor: response.next_cursor });
  };

  await fetchBatch({ ...params, data_source_id });

  return { data, next_cursor, parsed: parseNotionData(data) };
};

export { generateContent, parseNotionData, fetchDataFromNotion };
