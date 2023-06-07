const nodemailer = require("nodemailer");
const sendEmailConfirmation = (email, token) => {
  const mail = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: "noreply@e-quiz.xyz",
    to: email,
    subject: "Email Verification - e-quiz.xyz",
    html: `<p>You requested for email verification, kindly use the code below to verify your email address </p><h1>${token}</h1>`,
  };

  mail.sendMail(mailOptions, function (error, info) {
    if (error) {
      return 1;
    } else {
      return 0;
    }
  });
};

module.exports = sendEmailConfirmation;
