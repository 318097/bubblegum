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

// Notion rows can have an empty or malformed url, which normalize-url throws on
const toDisplayUrl = (url) => {
  try {
    return normalizeUrl(url, { stripProtocol: true, stripWWW: true });
  } catch {
    return url || "";
  }
};

const generateContent = (data, contentType) => {
  let htmlOutput = "";
  let markdownOutput = "";

  data.forEach((item) => {
    switch (contentType) {
      case "vocab": {
        htmlOutput += `
      <div class="card">
        <h6>Word</h6>
        <h4>${_.capitalize(item["name"])}</h4>
        <h6 style="margin-top: 0.8em;">Definition</h6>
        <p>${item["description"]}</p>
        <h6 style="margin-top: 0.8em;">Example</h6>
        <p>${item["ex"]}</p>
      </div>
    `;
        markdownOutput += `
###### Word
## ${_.capitalize(item["name"])}
---
###### Definition
### ${item["description"]}
---
###### Example
### ${item["ex"]}
    `;
        break;
      }
      case "tech-snippet": {
        const displayUrl = toDisplayUrl(item["url"]);
        const items = [item["L0"], ...(item["tags"] || [])].filter(Boolean);
        htmlOutput += `
          <div class="card">
            <div class='header'>${items.map((tag) => `<span class='tag'>${tag}</span>`).join(" · ")}</div>
            <h4>${_.capitalize(item["title"])}</h4>
            ${item["description"] ? `<p>${item["description"]}</p>` : ""}
            ${
              item["preview"]
                ? generateLinkPreview(item["url"], item["preview"])
                : `<a href="${item["url"]}" target="_blank">${displayUrl}</a>`
            }
          </div>
        `;
        break;
      }
      case "keybindings": {
        htmlOutput += `
          <div class="card">
            <h4>${_.capitalize(item["platform"])}: ${_.capitalize(item["title"])}</h4>
            <div class='flex gap-2'>
            ${item["mac"] ? `<code>${item["mac"]}</code>` : ""}
            ${item["mac"] && item["windows"] ? "|" : ""}
            ${item["windows"] ? `<code>${item["windows"]}</code>` : ""}
            </div>
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
