const nodemailer = require('nodemailer');

// Function to send an email
const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email has been sent!');
  } catch (error) {
    console.error(error);
  }
};

module.exports = { sendMail };
