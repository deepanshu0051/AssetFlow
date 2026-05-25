const nodemailer = require('nodemailer');
const https = require('https');
const { logger } = require('../middleware/logger');

/**
 * Send an email via SMTP or Resend HTTP API
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    logger.info('RESEND_API_KEY detected. Routing email delivery via Resend HTTP API...');
    return sendViaResend(options, resendApiKey);
  }

  // Fallback to standard Nodemailer SMTP
  logger.info(`Configuring email transport for ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
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
    logger.info('Verifying transporter connection...');
    await transporter.verify();
    
    // Send mail
    const info = await transporter.sendMail(message);
    logger.info(`Email sent successfully via SMTP: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`SMTP delivery error: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Helper to dispatch email via Resend HTTP API
 */
const sendViaResend = (options, apiKey) => {
  return new Promise((resolve, reject) => {
    // Resend requires a registered domain sender.
    // In free tier, users can use "onboarding@resend.dev" to send to their own verified email.
    // If FROM_EMAIL is provided and contains a custom domain, use it; otherwise fallback to onboarding address.
    let fromField = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    
    // If the from field doesn't look like a verified sender, or is a standard gmail address,
    // Resend will reject it unless it's onboarding@resend.dev or a verified domain on their account.
    if (fromField.includes('@gmail.com') || fromField === 'deepubhati000x@gmail.com') {
      fromField = 'onboarding@resend.dev';
    }

    const fromName = process.env.FROM_NAME || 'AssetFlow';
    const formattedFrom = `${fromName} <${fromField}>`;

    const postData = JSON.stringify({
      from: formattedFrom,
      to: [options.to],
      subject: options.subject,
      text: options.text || '',
      html: options.html
    });

    const reqOptions = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const responseData = JSON.parse(body);
            logger.info(`Email sent successfully via Resend API: ${responseData.id}`);
            resolve({
              messageId: responseData.id,
              response: `250 OK (Resend HTTP: ${res.statusCode})`
            });
          } catch (e) {
            logger.info(`Email sent successfully via Resend API (unparsed): ${res.statusCode}`);
            resolve({
              messageId: 'resend-ok-unparsed',
              response: `250 OK (Resend HTTP: ${res.statusCode})`
            });
          }
        } else {
          logger.error(`Resend HTTP API Error (HTTP ${res.statusCode}): ${body}`);
          reject(new Error(`Resend API Error (HTTP ${res.statusCode}): ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      logger.error(`Network error calling Resend API: ${e.message}`, { stack: e.stack });
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

module.exports = sendEmail;
