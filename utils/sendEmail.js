const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            // host: process.env.HOST,
            // // service: process.env.SERVICE,
            // port: 587,
            // secure: true,
            // auth: {
            //     user: process.env.USER,
            //     pass: process.env.PASS,
            // },
            host: "smtp.sendgrid.net",
            port: 587,
            secure: false, // use TLS
            auth: {
              user: "apikey",
              pass: "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"
            },
            tls: {
              // do not fail on invalid certs
              rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: 'aks3555@gmail.com',
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;