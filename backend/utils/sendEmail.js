const nodemailer = require('nodemailer');

/**
 * Send an email via SMTP
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
  // Create transporter
  console.log(`Configuring email transport for ${process.env.EMAIL_HOST || 'smtp.gmail.com'} as ${process.env.EMAIL_USER}`);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Often needed for Gmail on certain hosts
    }
  });

  // Define message
  const message = {
    from: `${process.env.FROM_NAME || 'AssetFlow'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    // Send mail
    const info = await transporter.sendMail(message);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Nodemailer Error Details:', error);
    throw error;
  }
};

module.exports = sendEmail;
