import _ from "lodash";
import config from "../../config.js";
import logger from "../../utils/logger.js";
import { addToRedis, getFromRedis } from "../../redis.js";
import { fetchDataFromNotion, generateContent } from "./helpers.js";

async function getLiquidTech(req, res) {
  try {
    const query = {
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

    const { parsed } = await fetchDataFromNotion(
      config.NOTION_DB.LIQUID_TECH,
      query,
    );

    const parsedContent = parsed.map(
      ({ _id, title, url, tags, description, L0, L1, rank }) => {
        return {
          _id,
          title,
          url,
          tags,
          description,
          type: L0.toLowerCase(),
          subType: L1,
          priority: rank,
        };
      },
    );

    res.send({ data: _.groupBy(_.sortBy(parsedContent, "subType"), "type") });
  } catch (err) {
    logger.error(err);
  }
}

async function getVocab(req, res) {
  try {
    const cacheKey = `vocab:${req.query.cursor || "default"}`;
    const cachedData = await getFromRedis(cacheKey, req);
    if (cachedData) {
      _.set(cachedData, "apiParams.lastUpdatedAt", new Date().toISOString());
      res.send(cachedData);
      return;
    }

    const query = {
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
      ],
    };

    const { parsed, next_cursor } = await fetchDataFromNotion(
      config.NOTION_DB.VOCAB,
      {
        ...query,
        page_size: 1,
        start_cursor: req.query.cursor || undefined,
      },
    );

    const { html, markdown } = generateContent(parsed);

    const response = {
      parsed,
      html,
      markdown: req.query.markdown ? markdown : undefined,
      apiParams: {
        cursor: next_cursor,
        lastUpdatedAt: new Date().toISOString(),
      },
    };

    await addToRedis(cacheKey, response);
    res.send(response);
  } catch (err) {
    logger.error(err);
  }
}

async function getAllKeyBindings(req, res) {
  try {
    const query = {
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

    const { parsed } = await fetchDataFromNotion(
      config.NOTION_DB.KEYBINDINGS,
      query,
    );

    const parsedList = parsed.map(({ title, platform, binding, _id }) => {
      return {
        _id,
        title,
        platform,
        binding: JSON.parse(binding),
      };
    });

    res.send({ data: parsedList });
  } catch (err) {
    logger.error(err);
  }
}

export { getLiquidTech, getVocab, getAllKeyBindings };
