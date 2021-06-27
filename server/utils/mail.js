const nodemailer = require("nodemailer");
const config = require("../config");

const getContent = (user, data = {}) => {
  let subject, content;

  switch (data.type) {
    case "RESET": {
      subject = "Reset password";
      content = `
      Reset Password: ${data.url}?reset_token=${data.resetToken}
      `;
    }
  }

  const body = `
  <html>
    <body>
      <p>
        ${content}
      </p>
    </body>
  </html>
`;

  return { subject, body };
};

const sendMail = async (user, data = {}) => {
  if (!config.ENABLE_EMAIL) return;

  const { email: to } = user;
  const { subject, body } = getContent(user, data);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.EMAIL_ID,
      pass: config.EMAIL_PASSWORD,
    },
  });

  try {
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
