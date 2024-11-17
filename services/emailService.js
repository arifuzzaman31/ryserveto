const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { NODE_MAILER_USERNAME, NODE_MAILER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: NODE_MAILER_USERNAME,
    pass: NODE_MAILER_PASSWORD,
  },
});

transporter.use('compile', hbs({
  viewEngine: {
    extname: '.hbs',
    partialsDir: path.join(__dirname, 'views'),
    layoutsDir: path.join(__dirname, 'views'),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, 'views'),
  extName: '.hbs',
}));

async function sendEmail(details) {
    const response = await transporter.sendMail({
        from: NODE_MAILER_USERNAME,
        to: details.email,
        subject: details.subject,
        template: 'email',
        context: {
          name: details.username,
          company: details.company,
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