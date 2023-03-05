const _ = require("lodash");
const PRODUCTS_JSON = require("../../PRODUCTS.json");

// Keep this function in sync with 'lib'
const parseProducts = (products) =>
  _.map(products, (product) => {
    const { links } = product;
    const ctaUrl = _.get(links, "landing.url") || _.get(links, "product.url");
    const ctaLabel =
      _.get(links, "landing.label") || _.get(links, "product.label");
    return {
      ...product,
      ctaUrl,
      ctaLabel,
    };
  });

const products = parseProducts(PRODUCTS_JSON.products);

const getProducts = ({ visibilityKey = "" } = {}) => {
  return _.filter(products, (product) =>
    visibilityKey ? _.get(product, ["visibility", visibilityKey]) : true
  );
};

const PRODUCT_MAP = _.keyBy(getProducts({ visibilityKey: "active" }), "id");

const ACTIVE_PRODUCT_URLS = getProducts({ visibilityKey: "active" })
  .map((product) => _.get(product, "links.product.url"))
  .filter((url) => !!url);

const PRODUCT_LIST = Object.keys(PRODUCT_MAP);

const getKeysBasedOnSource = (source) =>
  _.get(PRODUCT_MAP, [source, "userKeys"], []);

const getProductById = (id) => {
  const match = _.find(products, { id });

  if (!match) throw new Error("Invalid product id");

  return match;
};

const getPromotionalProducts = ({ source }) => {
  const filteredList = _.filter(
    products,
    ({ visibility, id, links, tagline }) =>
      id !== source &&
      tagline &&
      _.get(visibility, "promotion") &&
      _.get(links, "product.url")
  );

  const promotionalProducts = _.map(
    filteredList,
    ({ name, tagline, ctaUrl }) => ({
      name,
      description: tagline,
      href: ctaUrl,
    })
  );

  return promotionalProducts;
};

module.exports = {
  getProductById,
  getProducts,
  getPromotionalProducts,
  getKeysBasedOnSource,
  PRODUCT_MAP,
  PRODUCT_LIST,
  ACTIVE_PRODUCT_URLS,
  products,
};
