import nodemailer from 'nodemailer';

/**
 * Send an OTP verification email
 * @param {string} to - recipient email
 * @param {string} otp - the OTP code
 */
export const sendOtpEmail = async (to, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in .env');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"UniMart" <${emailUser}>`,
    to,
    subject: 'Your UniMart OTP Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">UniMart</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Campus Marketplace</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1a1a2e; margin: 0 0 12px; font-size: 20px;">Verify Your Email</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Use the code below to complete your registration. This code is valid for <strong>10 minutes</strong>.
          </p>
          <div style="background: #f8f9ff; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0;">
            If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
          </p>
        </div>
        <div style="background: #f8f9fa; padding: 16px 24px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #aaa; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} UniMart. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
};
