const _ = require("lodash");
const PRODUCTS_JSON = require("../../PRODUCTS.json");

const { products } = PRODUCTS_JSON;

const getProducts = ({ visibilityKey = "" } = {}) => {
  return _.filter(products, (product) =>
    visibilityKey ? _.get(product, ["visibility", visibilityKey]) : true
  );
};

const PRODUCT_MAP = _.keyBy(getProducts({ visibilityKey: "active" }), "id");

const ORIGIN_LIST = getProducts({ visibilityKey: "active" })
  .map((product) => _.get(product, "links.product.url"))
  .filter((origin) => !!origin);

const PRODUCT_LIST = Object.keys(PRODUCT_MAP);

const getKeysBasedOnSource = (source) =>
  _.get(PRODUCT_MAP, [source, "userKeys"], []);

const getProductById = (id) => {
  const match = _.find(products, { id });

  if (!match) throw new Error("Invalid product id.");

  return match;
};

const getPromotionalProducts = ({ source }) => {
  const filteredList = _.filter(
    products,
    ({ visibility, id, links, tagline }) =>
      _.get(visibility, "promotion") &&
      id !== source &&
      tagline &&
      _.get(links, "product.url")
  );
  const promotionalProducts = _.map(
    filteredList,
    ({ name, tagline, links }) => ({
      name,
      description: tagline,
      href: _.get(links, "product.url"),
    })
  );

  return promotionalProducts;
};

// console.log("PRODUCT_MAP::-", PRODUCT_MAP, PRODUCT_LIST);

module.exports = {
  getProductById,
  getProducts,
  getPromotionalProducts,
  getKeysBasedOnSource,
  PRODUCT_MAP,
  PRODUCT_LIST,
  ORIGIN_LIST,
  products,
};
