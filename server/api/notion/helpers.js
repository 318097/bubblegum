import { Client } from "@notionhq/client";
import config from "../../config.js";
import logger from "../../utils/logger.js";
import _ from "lodash";

const notion = new Client({
  auth: config.NOTION_AUTH_KEY,
});

const generateContent = (data) => {
  let htmlOutput = "";
  let markdownOutput = "";

  data.forEach((item) => {
    htmlOutput += `
      <div class="card" style="width: 100%;">
        <div class="title" style="color: #9b9b9bff; font-size: 0.75em;">Word of the day</div>
        <div style="font-size: 1.875em; line-height: normal; font-weight: 700;">${_.capitalize(item["name"])}</div>
        <div style="margin-top: 0.8em; color: #9b9b9bff; font-size: 0.75em;">Definition</div>
        <div>${item["description"]}</div>
        <div style="margin-top: 0.8em; color: #9b9b9bff; font-size: 0.75em;">Example</div>
        <div>${item["ex"]}</div>
      </div>
    `;
    markdownOutput += `
###### Word of the day
## ${_.capitalize(item["name"])}
---
###### Definition
### ${item["description"]}
---
###### Example
### ${item["ex"]}
    `;
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
