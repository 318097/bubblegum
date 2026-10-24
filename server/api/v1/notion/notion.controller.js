import _ from "lodash";
import config from "../../../config.js";
import logger from "../../../utils/logger.js";
import { addToRedis, getFromRedis } from "../../../redis.js";
import { fetchDataFromNotion, generateContent } from "./helpers.js";
import unfurl from "../../../utils/unfurl.js";

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
      true,
    );

    const parsedContent = parsed.map(
      ({ _id, title, url, tags, description, L0, L1, rank }) => {
        return {
          _id,
          title,
          url,
          description,
          tags,
          type: L0.toLowerCase(),
          subType: L1,
          priority: rank,
        };
      },
    );

    res.send({ data: _.groupBy(_.sortBy(parsedContent, "subType"), "type") });
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
}

async function getKeybindings(req, res) {
  try {
    const query = {
      filter: {
        and: [
          {
            property: "void",
            multi_select: {
              is_empty: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: "_id",
          direction: "ascending",
        },
      ],
    };

    const { parsed, next_cursor } = await fetchDataFromNotion(
      config.NOTION_DB.KEYBINDINGS,
      {
        ...query,
        page_size: 1,
        start_cursor: req.query.cursor || undefined,
      },
    );

    const { html, markdown } = generateContent(parsed, "keybindings");

    const response = {
      parsed,
      html,
      markdown: req.query.markdown ? markdown : undefined,
      apiParams: {
        cursor: next_cursor,
        lastUpdatedAt: new Date().toISOString(),
      },
    };

    res.send(response);
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
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

    const { html, markdown } = generateContent(parsed, "vocab");

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
    res.status(500).send(err.message);
  }
}

async function getTechSnippets(req, res) {
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
            property: "social media status",
            multi_select: {
              contains: "Posted",
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
      config.NOTION_DB.LIQUID_TECH,
      {
        ...query,
        page_size: 1,
        start_cursor: req.query.cursor || undefined,
      },
    );

    const withPreviews = await Promise.all(
      parsed.map(async (item) => ({
        ...item,
        preview: item.url ? await unfurl(item.url) : null,
      })),
    );

    const { html, markdown } = generateContent(withPreviews, "tech-snippet");

    const cleanedData = withPreviews.map((item) => {
      return _.pick(item, [
        "title",
        "url",
        "description",
        "L0",
        "L1",
        "tags",
        "social media id",
        "rank",
        "preview",
      ]);
    });

    const response = {
      parsed: cleanedData,
      html,
      markdown: req.query.markdown ? markdown : undefined,
      apiParams: {
        cursor: next_cursor,
        lastUpdatedAt: new Date().toISOString(),
      },
    };

    res.send(response);
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
}

export { getLiquidTech, getVocab, getKeybindings, getTechSnippets };
