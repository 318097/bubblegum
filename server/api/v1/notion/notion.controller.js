import _ from "lodash";
import config from "../../../config.js";
import logger from "../../../utils/logger.js";
import { addToRedis, getFromRedis } from "../../../redis.js";
import { fetchDataFromNotion, generateContent } from "./helpers.js";
import unfurl from "../../../utils/unfurl.js";

async function getCode404SiteDump(req, res) {
  try {
    const query = {
      filter: {
        property: "is live",
        formula: {
          checkbox: { equals: true },
        },
      },
      sorts: [
        {
          property: "title",
          direction: "ascending",
        },
      ],
    };

    const { parsed } = await fetchDataFromNotion(
      config.NOTION_DB.CODE404,
      query,
      true,
    );

    const parsedContent = parsed.map(
      ({ _id, title, url, tags, description, L0, L1, favourite }) => {
        return {
          _id,
          title,
          url,
          description,
          tags,
          type: L0.toLowerCase(),
          subType: L1,
          priority: favourite ? "high" : "normal",
        };
      },
    );

    res.send({ data: _.groupBy(_.sortBy(parsedContent, "subType"), "type") });
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
}

// Fetches one cursor-paginated page of a Notion db and renders it via generateContent.
// `notionKey` is a key of config.NOTION_DB and `params` is req.query ({ cursor, markdown }).
// Pass `cacheKey` to cache each page in Redis. The cache is shared across users.
// `transform` can enrich rows before rendering, and `fields` limits what `parsed` returns.
async function getNotionPage({
  notionKey,
  query,
  key,
  params = {},
  pageSize = 1,
  transform = (parsed) => parsed,
  fields,
}) {
  const { cursor, markdown } = params;
  const pageCacheKey = `${key}:${cursor || "default"}`;

  let response = pageCacheKey && (await getFromRedis(pageCacheKey));
  if (!response) {
    const { parsed, next_cursor } = await fetchDataFromNotion(
      config.NOTION_DB[notionKey],
      {
        ...query,
        page_size: pageSize,
        start_cursor: cursor || undefined,
      },
    );

    const items = await transform(parsed);
    const content = generateContent(items, key);

    response = {
      parsed: fields ? items.map((item) => _.pick(item, fields)) : items,
      html: content.html,
      markdown: content.markdown,
      apiParams: { cursor: next_cursor },
    };

    if (pageCacheKey) await addToRedis(pageCacheKey, response);
  }

  return {
    ...response,
    markdown: markdown ? response.markdown : undefined,
    apiParams: {
      ...response.apiParams,
      lastUpdatedAt: new Date().toISOString(),
    },
  };
}

async function getKeybindings(req, res) {
  try {
    const response = await getNotionPage({
      notionKey: "KEYBINDINGS",
      key: "keybindings",
      params: req.query,
      query: {
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
            property: "group",
            direction: "ascending",
          },
        ],
      },
    });

    res.send(response);
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
}

async function getVocab(req, res) {
  try {
    const response = await getNotionPage({
      notionKey: "VOCAB",
      key: "vocab",
      params: req.query,
      query: {
        filter: {
          property: "is live",
          formula: {
            checkbox: { equals: true },
          },
        },
        sorts: [
          {
            property: "posted on social media",
            direction: "ascending",
          },
        ],
      },
    });

    res.send(response);
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
}

async function getCode404(req, res) {
  try {
    const response = await getNotionPage({
      notionKey: "CODE404",
      key: "code404",
      params: req.query,
      query: {
        filter: {
          property: "is db",
          formula: {
            checkbox: { equals: true },
          },
        },
        sorts: [
          {
            property: "posted on social media",
            direction: "ascending",
          },
        ],
      },
      transform: (parsed) =>
        Promise.all(
          parsed.map(async (item) => ({
            ...item,
            preview: item.url ? await unfurl(item.url) : null,
          })),
        ),
      fields: [
        "title",
        "url",
        "description",
        "L0",
        "L1",
        "tags",
        "social media id",
        "rank",
        "preview",
      ],
    });

    res.send(response);
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
}

export { getCode404SiteDump, getVocab, getKeybindings, getCode404 };
