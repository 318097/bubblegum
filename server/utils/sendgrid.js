const sgMail = require("@sendgrid/mail");
const _ = require("lodash");
const config = require("../config");
const { getProductById, getPromotionalProducts } = require("./products");

sgMail.setApiKey(config.SENDGRID_API_KEY);

const getContent = ({ type, token, name, source } = {}) => {
  const product = getProductById(source);
  const productURL = config.IS_PROD
    ? _.get(product, "links.product.url", "")
    : `http://localhost:${product.devPort || 3000}`;

  const baseAppURL = productURL.endsWith("/")
    ? productURL.slice(0, -1)
    : productURL;

  switch (type) {
    case "FORGOT_PASSWORD": {
      return {
        template_id: "d-f72d2edaf4bb4329b173310587ef6728",
        dynamic_template_data: {
          name,
          url: `${baseAppURL}/reset-password?reset_token=${token}`,
        },
      };
    }
    case "RESET_PASSWORD": {
      return {
        template_id: "d-3027f9e5aef346328b5b1ca7054e261a",
        dynamic_template_data: {
          name,
        },
      };
    }
    case "VERIFY_ACCOUNT": {
      return {
        template_id: "d-ea5eed3ec1f24e0e98197473bdda6ae7",
        dynamic_template_data: {
          name,
          url: `${baseAppURL}/verify-account?verification_token=${token}`,
        },
      };
    }
    case "WELCOME": {
      const other_products = getPromotionalProducts({ source });
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
      email: "mehullakhanpal@gmail.com",
      // email: "codedrops.tech@gmail.com",
    },
    to,
    ...getContent(data),
  };

  try {
    console.log("Msg:", JSON.stringify(msg, undefined, 2));
    const result = await sgMail.send(msg);
    console.log("Email sent:", result);
  } catch (error) {
    console.log("Email error:", error);
    if (error.response) console.error(error.response.body);
  }
};

module.exports = sendMail;
