const nodemailer = require('nodemailer');

//Details for Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
      user: 'appointmentsserver@gmail.com',
      pass: 'vflm pnvr dkbs xxmh'
  },
  tls: {
      rejectUnauthorized: false
  }
});

// Function to send an email
const sendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email has been sent!');
  } catch (error) {
    console.error(error);
  }
};

module.exports = { sendMail };
