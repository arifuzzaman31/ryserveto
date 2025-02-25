const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { NODE_MAILER_USERNAME, NODE_MAILER_PASSWORD } = process.env;

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.NODE_MAILER_USERNAME,
//     pass: process.env.NODE_MAILER_PASSWORD,
//   },
// });

var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "96c12009ac2a03",
    pass: "77ed9ebf0d175b"
  }
});

transporter.use('compile', hbs({
  viewEngine: {
    extname: '.hbs',
    partialsDir: path.join(__dirname, '../views'),
    layoutsDir: path.join(__dirname, '../views'),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, '../views'),
  extName: '.hbs',
}));

async function sendEmail(details) {
    const response = transporter.sendMail({
        from: NODE_MAILER_USERNAME,
        to: details.email,
        subject: details.subject,
        template: 'email',
        context: {
          username: details.username,
          date: details.date,
          slot: details.date,
          address: details.address
        }
    });
    return response;
  }
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.log('Error sending email:', error);
//   } else {
//     console.log('Email sent successfully:', info.response);
//   }
// });

module.exports = {
    sendEmail
}