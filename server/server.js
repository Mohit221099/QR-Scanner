// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for QR code images
app.use(express.json());

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'drita254@gmail.com', // Your Gmail address
    pass: 'umkk ibcp vltb eish', // Your Gmail App Password
  },
});

// Email sending endpoint
app.post('/api/send-qr-email', async (req, res) => {
  try {
    const { email, name, qrCode } = req.body;
    
    if (!email || !name || !qrCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }
    
    console.log(`Preparing to send ticket email to: ${name} <${email}>`);
    
    // Generate a unique ticket ID
    const ticketId = generateTicketId();
    const currentDate = new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const currentTime = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    // Process the QR code data
    // If the qrCode is a base64 data URL, extract the base64 part for attachment
    let qrCodeData = qrCode;
    let qrCodeContentType = 'image/png';
    
    if (qrCode.startsWith('data:')) {
      const matches = qrCode.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        qrCodeContentType = matches[1];
        qrCodeData = matches[2];
      }
    }
    
    // Email content
    const mailOptions = {
      from: '"maJIStic 2025" <noreply@majistic.org>',
      to: email,
      subject: 'Your maJIStic 2025 Event Ticket',
      html: generateTicketEmailTemplate(name, email, ticketId, currentDate, currentTime),
      attachments: [
        {
          filename: 'majistic-logo.png',
          path: 'https://cdn.emailacademy.com/user/fecdcd5176d5ee6a27e1962040645abfa28cce551d682738efd2fc3e158c65e3/majisticlogo2025_03_18_22_18_20.png',
          cid: 'majistic-logo'
        },
        {
          filename: 'qrcode.png',
          content: qrCodeData.startsWith('data:') ? qrCodeData.split(',')[1] : qrCodeData,
          encoding: 'base64',
          cid: 'ticket-qrcode'
        }
      ]
    };
    
    // Send email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    res.status(200).json({ 
      success: true, 
      message: 'Ticket email sent successfully', 
      emailId: info.messageId 
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to send email: ${error.message}` 
    });
  }
});

// Helper to generate a ticket ID
function generateTicketId() {
  const prefix = 'MJ25-';
  const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit number
  return `${prefix}${randomPart}`;
}

// Email template generator function
function generateTicketEmailTemplate(name, email, ticketId, date, time) {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your maJIStic 2025 Ticket</title>
    <style>
        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f9f9f9;
        }
        .email-container {
            border: 1px solid #dddddd;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #000000 0%, #242424 100%);
            padding: 25px;
            text-align: center;
        }
        .header img {
            max-width: 250px;
            height: auto;
        }
        .content {
            padding: 35px;
            background-color: #ffffff;
        }
        h2 {
            color: #2b2d42;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .ticket-container {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }
        .ticket-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 7px;
            background: linear-gradient(90deg, #3498db, #9b59b6);
        }
        .ticket-container h3 {
            color: #3498db;
            margin-top: 0;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
        }
        .ticket-info {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
        }
        .ticket-details {
            flex: 1;
            min-width: 200px;
        }
        .qr-code {
            text-align: center;
            margin: 15px 0;
        }
        .qr-code img {
            max-width: 200px;
            height: auto;
            border: 1px solid #ddd;
            padding: 10px;
            background-color: white;
            border-radius: 8px;
        }
        .ticket-id {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 10px;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 12px 0;
            border-bottom: 1px solid #eeeeee;
        }
        td:first-child {
            font-weight: bold;
            width: 40%;
            color: #555;
        }
        .footer {
            background: linear-gradient(135deg, #f0f0f0 0%, #e6e6e6 100%);
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666666;
            border-top: 3px solid #3498db;
        }
        .social-links {
            margin-top: 15px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #3498db;
            text-decoration: none;
            font-weight: bold;
            transition: color 0.3s;
        }
        .important-notice {
            background-color: #ffeeee;
            border: 1px solid #ff6b6b;
            padding: 15px;
            color: #cc0000;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .instructions {
            background-color: #e8f4fd;
            border: 1px solid #cce5ff;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            color: #0c5460;
        }
        .instructions h4 {
            margin-top: 0;
            color: #0c5460;
            border-bottom: 1px solid #bee5eb;
            padding-bottom: 10px;
        }
        .badge {
            background-color: #28a745;
            color: white;
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 14px;
            margin-left: 10px;
            display: inline-block;
        }
        .event-details {
            background-color: #fff8e6;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .event-details h4 {
            margin-top: 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="cid:majistic-logo" alt="maJIStic 2025 Logo">
        </div>
        
        <div class="content">
            <h2>Your Event Ticket <span class="badge">CONFIRMED</span></h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for registering for maJIStic 2025! Please find your e-ticket attached below. This ticket confirms your participation in the event.</p>
            
            <div class="ticket-container">
                <h3>e-Ticket for maJIStic 2025</h3>
                <div class="ticket-info">
                    <div class="ticket-details">
                        <table>
                            <tr>
                                <td>Name</td>
                                <td><strong>${name}</strong></td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>${email}</td>
                            </tr>
                            <tr>
                                <td>Ticket Number</td>
                                <td><strong>${ticketId}</strong></td>
                            </tr>
                            <tr>
                                <td>Issue Date</td>
                                <td>${date} at ${time}</td>
                            </tr>
                            <tr>
                                <td>Ticket Status</td>
                                <td><strong style="color: #28a745">CONFIRMED</strong></td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="qr-code">
                    <img src="cid:ticket-qrcode" alt="Ticket QR Code">
                    <div class="ticket-id">${ticketId}</div>
                </div>
            </div>
            
            <div class="event-details">
                <h4>Event Information</h4>
                <p><strong>Event:</strong> maJIStic 2025</p>
                <p><strong>Date:</strong> April 11th-12th, 2025</p>
                <p><strong>Venue:</strong> JIS College of Engineering, Kalyani</p>
                <p><strong>Time:</strong> 10:00 AM - 8:00 PM</p>
            </div>
            
            <div class="instructions">
                <h4>Instructions</h4>
                <ul>
                    <li>Please arrive at least 30 minutes before the event starts.</li>
                    <li>Keep this ticket (digital or printed) with you for entry.</li>
                    <li>Present the QR code at the registration desk for check-in.</li>
                    <li>College ID card is MANDATORY for entry.</li>
                    <li>This ticket is non-transferable and valid for one person only.</li>
                </ul>
            </div>
            
            <div class="important-notice">
                <p><strong>IMPORTANT:</strong> College ID is MANDATORY for check-in on event day. No entry without ID.</p>
            </div>
            
            <p>We look forward to seeing you at maJIStic 2025!</p>
            
            <p>Warm Regards,<br><strong>maJIStic Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© ${currentYear} maJIStic 2025. All rights reserved.</p>
            <p>College Ground,JIS College of Engineering, Kalyani, Nadia - 741235, West Bengal, India</p>
            <div class="social-links">
                <a href="https://www.facebook.com/profile.php?id=100090087469753" target="_blank">Facebook</a> |
                <a href="https://www.instagram.com/majistic_jisce" target="_blank">Instagram</a> |
                <a href="https://www.linkedin.com/company/majistic-jisce/" target="_blank">LinkedIn</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});