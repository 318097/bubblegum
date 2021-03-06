const _ = require("lodash");
const moment = require("moment");

const getKey = (id) =>
  /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(id) ? "_id" : "slug";

const generateSlug = ({ title = "", seperator = "-", prevSlug }) => {
  const slug = title
    .trim()
    .replace(/-/, " ")
    .replace(/\//, "-")
    .replace(/&/, "and")
    .replace(/[^a-zA-Z0-9\-\s]/gi, "")
    .replace(/\s+/gi, seperator)
    .toLowerCase();
  const timestamp = prevSlug
    ? prevSlug.split(seperator).pop()
    : new Date().getTime();

  return slug ? `${slug}${seperator}${timestamp}` : "";
};

const generateNewResourceId = (note, index) =>
  `R${note.index || index}-${note.slug}-${
    _.get(note, "resources.length", 0) + 1
  }`;

const isSearchId = (search) => /^\d+$/.test(search.trim());

module.exports = { getKey, generateNewResourceId, generateSlug, isSearchId };
