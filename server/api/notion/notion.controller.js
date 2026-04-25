import _ from "lodash";
import { Client } from "@notionhq/client";
import config from "../../config.js";
import logger from "../../utils/logger.js";

const notion = new Client({
  auth: config.NOTION_AUTH_KEY,
});

const generateHtml = (data) => {
  let output = "";

  data.forEach((item) => {
    output += `
      <div class="vocab-item" style="width: 100%;">
      <div style="margin-top: 0.8rem; color: #9b9b9bff; font-size: 0.75rem;">Word of the day</div>
      <div style="font-size: 1.875rem; line-height: normal; font-weight: 700;">${item["name"]}</div>
      <div style="margin-top: 0.8rem; color: #9b9b9bff; font-size: 0.75rem;">Definition</div>
      <div>${item["description"]}</div>
      <div style="margin-top: 0.8rem; color: #9b9b9bff; font-size: 0.75rem;">Example</div>
      <div>${item["ex"]}</div>
      </div>
    `;
  });

  return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; max-width: 480px; margin: 0 auto;">${output}</div>`;
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
            logger.error("Unhandled notion type", type, value);
        }
        result[key] = finalValue;
      });
      return result;
    })
    .filter((item) => _.isEmpty(item["Parent item"])); // do not return nested items
};

const fetchDataFromNotion = async (database_id, params) => {
  const list = [];
  let next_cursor = null;

  const db = await notion.request({
    method: "get",
    path: `databases/${database_id}`,
  });
  const data_source_id = db.data_sources[0].id;

  const fetchPage = async (p = {}) => {
    const response = await notion.dataSources.query(p);
    list.push(...response.results);
    next_cursor = response.next_cursor;
    // if (response.has_more)
    //   await fetchPage({ ...p, start_cursor: response.next_cursor });
  };

  await fetchPage({ ...params, data_source_id });

  return { list, next_cursor };
};

async function getLiquidTech(req, res) {
  try {
    const params = {
      filter: {
        and: [
          {
            property: "status",
            multi_select: {
              contains: "Reviewed",
            },
          },
          {
            property: "status",
            multi_select: {
              contains: "DB",
            },
          },
          {
            property: "status",
            multi_select: {
              contains: "Live",
            },
          },
          {
            property: "void",
            multi_select: {
              is_empty: true,
            },
          },
          {
            property: "rank",
            select: {
              does_not_equal: "Low",
            },
          },
        ],
      },
      sorts: [
        {
          property: "title",
          direction: "ascending",
        },
      ],
    };

    const { list } = await fetchDataFromNotion(
      config.NOTION_DB.LIQUID_TECH,
      params,
    );

    const parsedList = parseNotionData(list).map((listItem) => {
      // const [, subType] = _.split(_.toLower(listItem["L1"]), ":");
      return {
        ..._.pick(listItem, ["_id", "title", "url", "tags", "description"]),
        type: _.toLower(listItem["L0"]),
        subType: _.get(listItem, "L1"),
        priority: _.get(listItem, "rank"),
      };
    });

    res.send({ data: _.groupBy(_.sortBy(parsedList, "subType"), "type") });
  } catch (err) {
    logger.error(err);
  }
}

async function getVocab(req, res) {
  try {
    const params = {
      filter: {
        and: [
          {
            property: "status",
            multi_select: {
              contains: "Posted",
            },
          },
          {
            property: "status",
            multi_select: {
              contains: "Ready to post",
            },
          },
          {
            property: "status",
            multi_select: {
              contains: "Up Next",
            },
          },
        ],
      },
      sorts: [
        {
          property: "posted on social media",
          direction: "ascending",
        },
        {
          property: "name",
          direction: "ascending",
        },
      ],
    };

    const { list, next_cursor } = await fetchDataFromNotion(
      config.NOTION_DB.VOCAB,
      {
        ...params,
        page_size: 1,
        start_cursor: req.query.cursor || undefined,
      },
    );

    const data = parseNotionData(list);

    const html = generateHtml(data);

    res.send({
      data,
      html,
      apiParams: {
        cursor: next_cursor,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.error(err);
  }
}

async function getAllKeyBindings(req, res) {
  try {
    const params = {
      filter: {
        and: [
          {
            property: "status",
            multi_select: {
              contains: "DB",
            },
          },
          {
            property: "status",
            multi_select: {
              contains: "Live",
            },
          },
          {
            property: "void",
            multi_select: {
              is_empty: true,
            },
          },
        ],
      },
    };

    const { list } = await fetchDataFromNotion(
      config.NOTION_DB.KEYBINDINGS,
      params,
    );

    const parsedList = parseNotionData(list).map(
      ({ title, platform, binding, _id }) => {
        return {
          _id,
          title,
          platform,
          binding: JSON.parse(binding),
        };
      },
    );

    res.send({ data: parsedList });
  } catch (err) {
    logger.error(err);
  }
}

export { getLiquidTech, getVocab, getAllKeyBindings };
