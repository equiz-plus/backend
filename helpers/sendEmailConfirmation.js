const nodemailer = require("nodemailer");
const sendEmailConfirmation = (email, token) => {
    const mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailOptions = {
        from: 'noreply@ujian-online.com',
        to: email,
        subject: 'Email verification - ujian-online.com',
        html: `<p>You requested for email verification, kindly use this <a href="http://localhost:3000/verify-email?token=${token}"> link </a> to verify your email address </p><p>Or using key bellow</p><h1>${token}</h1>`

    };

    mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            return 1
        } else {
            return 0
        }
    });
}

module.exports = sendEmailConfirmation