// pages/api/send-qr-email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, qrCode } = req.body;
    
    if (!email || !name || !qrCode) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        received: { 
          hasEmail: !!email, 
          hasName: !!name, 
          hasQrCode: !!qrCode 
        } 
      });
    }

    // Create a reusable transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ticket@majestic.org', // Your Gmail address
        pass: 'bewpfvoggziqjavl', // Your Gmail App Password
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      return res.status(500).json({ 
        error: `Email configuration error: ${verifyError.message}`,
        code: 'SMTP_CONFIG_ERROR'
      });
    }

    const mailOptions = {
      from: 'ticket@majestic.org',
      to: email,
      subject: `Your Event QR Code, ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hello ${name},</h1>
          <p>Here's your QR code for the event:</p>
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCode}" alt="Your QR Code" style="max-width: 250px; border: 1px solid #ddd;" />
          </div>
          <p>Show this QR code at the event entrance for quick check-in.</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
      // Adding the QR code as an attachment as well, in case email clients block the embedded image
      attachments: [
        {
          filename: 'qrcode.png',
          path: qrCode, // data:image/png;base64... will be converted to attachment by nodemailer
          cid: 'qrcode@event' // Content ID for embedding
        }
      ]
    };

    console.log('Attempting to send email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      messageId: info.messageId 
    });
    
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ 
      error: `Failed to send email: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}