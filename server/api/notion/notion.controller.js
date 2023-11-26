const _ = require("lodash");
const { Client } = require("@notionhq/client");
const config = require("../../config");

const notion = new Client({
  auth: config.NOTION_AUTH_KEY,
});

const parseNotionData = (data) => {
  return data.map((item) => {
    const { properties } = item;
    const result = {};
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
        default:
          console.log("Unhandled notion type", type, value);
      }
      result[key] = finalValue;
    });
    return result;
  });
};

// const renameKeys = (list, mapping = {}) => {
//   return list.map((item) => {
//     const obj = { ...item };
//     Object.entries(mapping).forEach(([currentKey, newKey]) => {
//       obj[newKey] = item[currentKey];
//       delete obj[currentKey];
//     })
//   })
// };

const fetchAllData = async (params) => {
  const list = [];
  const fetchDetails = async (p = {}) => {
    const response = await notion.databases.query(p);
    list.push(...response.results);

    if (response.has_more)
      await fetchDetails({ ...p, start_cursor: response.next_cursor });
  };

  await fetchDetails(params);

  return list;
};

exports.getLiquidTech = async (req, res) => {
  try {
    const params = {
      database_id: config.NOTION_DB.LIQUID_TECH,
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

    const list = await fetchAllData(params);

    const parsedList = parseNotionData(list).map((listItem) => {
      return {
        _id: listItem["_id"],
        title: listItem["title"],
        url: listItem["url"],
        type: _.toLower(listItem["L0"]),
        subType: _.toLower(listItem["L1"]),
        tags: listItem["tags"],
        description: listItem["description"],
      };
    });

    res.send({ data: _.groupBy(_.sortBy(parsedList, "subType"), "type") });
  } catch (err) {
    console.log(err);
  }
};

exports.getAllKeyBindings = async (req, res) => {
  try {
    const params = {
      database_id: config.NOTION_DB.KEYBINDINGS,
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

    const list = await fetchAllData(params);

    const parsedList = parseNotionData(list).map(
      ({ title, platform, binding, _id }) => {
        return {
          _id,
          title,
          platform,
          binding: JSON.parse(binding),
        };
      }
    );

    res.send({ data: parsedList });
  } catch (err) {
    console.log(err);
  }
};
