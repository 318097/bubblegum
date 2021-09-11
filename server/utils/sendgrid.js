const sgMail = require("@sendgrid/mail");
const config = require("../config");

sgMail.setApiKey(config.SENDGRID_API_KEY);

const getContent = ({ type, url, resetToken, name, product } = {}) => {
  switch (type) {
    case "RESET": {
      return {
        subject: "Reset password",
        content: `
      Reset Password: ${url}?reset_token=${resetToken}
      `,
      };
    }
    case "REGISTER":
      return {
        template_id: "d-3027f9e5aef346328b5b1ca7054e261a",
        dynamic_template_data: {
          name,
          product,
          other_products: [],
        },
      };
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

  try {
    const result = await sgMail.send(msg);
    console.log("Email sent:", result);
  } catch (error) {
    console.log("Email error:", error);
    if (error.response) console.error(error.response.body);
  }
};

module.exports = sendMail;
