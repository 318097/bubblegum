const sgMail = require("@sendgrid/mail");
const _ = require("lodash");
const config = require("../config");
const { getProductById, getPromotionalProducts } = require("./products");
const EmailLogModel = require("../models/email.model");

sgMail.setApiKey(config.SENDGRID_API_KEY);

const from = {
  name: "Mehul Lakhanpal",
  email: "mehullakhanpal@gmail.com",
  // email: "codedrops.tech@gmail.com",
};

const getContent = ({ type, token, name, source } = {}) => {
  const product = getProductById(source);
  const productName = _.get(product, "name");
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
          product: _.capitalize(productName),
          other_products,
        },
      };
    }
  }
};

const sendMail = async (data = {}) => {
  if (!config.ENABLE_EMAIL) return;

  const { email: to, source, type } = data;

  const emailContent = getContent(data);

  const msgObj = {
    from,
    to,
    ...emailContent,
  };

  const emailObj = { to, source, emailType: type, body: emailContent };
  try {
    console.log("Msg:", JSON.stringify(msgObj, undefined, 2));
    const result = await sgMail.send(msgObj);
    emailObj["response"] = result;
  } catch (error) {
    console.log("Email error:", error);
    // if (error.response) console.error(error.response.body);
    emailObj["error"] = error;
  } finally {
    await EmailLogModel.create(emailObj);
  }
};

module.exports = sendMail;
