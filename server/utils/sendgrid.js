const sgMail = require("@sendgrid/mail");
const _ = require("lodash");
const config = require("../config");
const PRODUCTS_LIST = require("../../PRODUCTS.json");

const { products } = PRODUCTS_LIST;

sgMail.setApiKey(config.SENDGRID_API_KEY);

const getContent = ({ type, url, resetToken, name, source } = {}) => {
  switch (type) {
    case "RESET": {
      return {
        subject: "Reset password",
        content: `
      Reset Password: ${url}?reset_token=${resetToken}
      `,
      };
    }
    case "REGISTER": {
      const filteredList = _.filter(
        products,
        ({ visibility, id, links, tagline }) =>
          _.get(visibility, "promotion") &&
          id !== source &&
          tagline &&
          _.get(links, "product.url")
      );
      const other_products = _.map(
        filteredList,
        ({ name, tagline, links }) => ({
          name,
          description: tagline,
          href: _.get(links, "product.url"),
        })
      );
      return {
        template_id: "d-3027f9e5aef346328b5b1ca7054e261a",
        dynamic_template_data: {
          name,
          product: _.capitalize(source),
          other_products,
        },
      };
    }
  }
};

const sendMail = async (data = {}) => {
  if (!config.ENABLE_EMAIL) return;

  const { email: to } = data;

  const msg = {
    from: {
      name: "Mehul Lakhanpal",
      email: "codedrops.tech@gmail.com",
    },
    to,
    ...getContent(data),
  };

  // console.log("msg::-", JSON.stringify(msg, undefined, 2));

  try {
    const result = await sgMail.send(msg);
    console.log("Email sent:", result);
  } catch (error) {
    console.log("Email error:", error);
    if (error.response) console.error(error.response.body);
  }
};

module.exports = sendMail;
