import nodemailer from 'nodemailer';

// Create a transporter using SMTP with support for different providers
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Special configuration for Office 365
  if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('outlook')) {
    config.secure = false;
    config.requireTLS = true;
    config.tls = {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    };
  }

  // Special configuration for Gmail
  if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
    config.secure = false;
    config.requireTLS = true;
  }

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

export async function sendPasswordResetEmail(to, resetUrl) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">This is an automated message from the Inventec website.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      if (error.response && error.response.includes('outlook')) {
        throw new Error('Office 365 SMTP authentication failed. Please check your credentials or enable SMTP authentication in your Office 365 admin center.');
      } else {
        throw new Error('SMTP authentication failed. Please check your email and password.');
      }
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Could not connect to SMTP server. Please check your SMTP settings.');
    } else {
      throw error;
    }
  }
}

export default transporter; 