const nodemailer = require("nodemailer");
const config = require("../config");

const welcomeTemplate = (user, data) => `
<html>
  <body>
   Hi ${user.name},
   Welcome to ${data.productName}
  </body>
</html>
`;

const sendMail = async (user, data = {}) => {
  const { subject = "" } = data;
  const to = user.email;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.EMAIL_ID,
      pass: config.EMAIL_PASSWORD,
    },
  });

  try {
    let body = welcomeTemplate(user, data);

    const mailOptions = {
      from: '"Codedrops.tech" <codedrops.tech@gmail.com>',
      to,
      subject,
      html: body,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("mail sent:", result);
  } catch (err) {
    console.log("Email error", err);
  }
};

module.exports = sendMail;
