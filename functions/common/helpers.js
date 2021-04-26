const headers = {
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json",
  // "Access-Control-Allow-Credentials": "true",
  // "Access-Control-Max-Age": "2592000",
};

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

module.exports = {
  generateSlug,
  headers,
};
