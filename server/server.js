// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for QR code images
app.use(express.json());

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ticket@majistic.org', // Your Gmail address
    pass: 'wgvf wjbu xgip mtxc', // Your Gmail App Password
  },
});

// Email sending endpoint
app.post(['/api/send-qr-email', '/send-qr-email'], async (req, res) => {
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
      from: '"maJIStic 2k25" <noreply@majistic.org>',
      to: email,
      subject: 'Your maJIStic 2k25 Event Ticket',
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
            <img src="cid:majistic-logo" alt="maJIStic 2k25 Logo">
        </div>
        
        <div class="content">
            <h2>Your Event Ticket <span class="badge">CONFIRMED</span></h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Get ready for an unforgettable experience at maJIStic 2k25!🥳 <br>Below is your virtual ticket QR code that grants you access to all the amazing events and performances.</p>
            
            <div class="ticket-container">
                <h3>e-Ticket for maJIStic 2k25</h3>
                
                <div class="qr-code">
                    <img src="cid:ticket-qrcode" alt="Ticket QR Code">
                    <div class="ticket-id">${ticketId}</div>
                    <p style="margin-top: 10px; color: #3498db; font-weight: medium;">This single QR code is valid for check-ins on both event days.</p>
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
            
            <p>We look forward to seeing you at maJIStic 2025!🎉</p>
            
            <p>Warm Regards,<br><strong>maJIStic Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© ${currentYear} maJIStic. All rights reserved.</p>
            <p>JIS College of Engineering, Kalyani, Nadia - 741235, West Bengal, India</p>
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

// Add MySQL support
const mysql = require('mysql2/promise');

// Database configuration - updating to use online hosting
const dbConfig = {
  host: 'srv1834.hstgr.io',     // Hostinger server hostname
  port: 3306,                    // MySQL default port
  user: 'u901957751_majistic',   // Database username
  password: '#4Szt|/DYj',        // Database password
  database: 'u901957751_majistic2025', // Database name
};

// Add a test endpoint to check if server is responsive
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running correctly',
    time: new Date().toISOString(),
    clientIp: req.ip,
    cors: {
      origin: req.headers.origin,
      allowed: true
    }
  });
});

// Add a debug endpoint to get database structure information
app.get('/api/dbinfo', async (req, res) => {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database for dbinfo');
    
    const dbInfo = {
      tables: [],
      alumni_table: null,
      students_table: null
    };
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    dbInfo.tables = tables.map(t => Object.values(t)[0]);
    
    // Check for alumni table
    const alumniTables = dbInfo.tables.filter(t => t.toLowerCase().includes('alumni'));
    if (alumniTables.length > 0) {
      dbInfo.alumni_table = alumniTables[0];
      
      // Get alumni table structure
      const [alumniColumns] = await connection.execute(`DESCRIBE ${dbInfo.alumni_table}`);
      dbInfo.alumni_columns = alumniColumns.map(c => c.Field);
      
      // Get count of alumni records
      const [alumniCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${dbInfo.alumni_table}`);
      dbInfo.alumni_count = alumniCount[0].count;
      
      // Get sample alumni record
      const [alumniSample] = await connection.execute(`SELECT * FROM ${dbInfo.alumni_table} LIMIT 1`);
      dbInfo.alumni_sample = alumniSample.length > 0 ? alumniSample[0] : null;
    }
    
    // Check for student table
    const studentTables = dbInfo.tables.filter(t => 
      t.toLowerCase().includes('student') || 
      t.toLowerCase() === 'registrations'
    );
    if (studentTables.length > 0) {
      dbInfo.students_table = studentTables[0];
      
      // Get student table structure
      const [studentColumns] = await connection.execute(`DESCRIBE ${dbInfo.students_table}`);
      dbInfo.student_columns = studentColumns.map(c => c.Field);
      
      // Get count of student records
      const [studentCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${dbInfo.students_table}`);
      dbInfo.student_count = studentCount[0].count;
      
      // Get sample student record
      const [studentSample] = await connection.execute(`SELECT * FROM ${dbInfo.students_table} LIMIT 1`);
      dbInfo.student_sample = studentSample.length > 0 ? studentSample[0] : null;
    }
    
    res.json(dbInfo);
  } catch (error) {
    console.error('Error fetching database info:', error);
    res.status(500).json({ 
      error: `Failed to fetch database information: ${error.message}`
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// New endpoint to fetch both regular registrations and alumni
app.get('/api/registrations', async (req, res) => {
  console.log('Received request for /api/registrations');
  let connection;
  
  try {
    // Create MySQL connection using the server config
    console.log('Attempting to connect to database with config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful');
    
    // Get tables in the database
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('Available tables in database:', tableNames);
    
    let allRegistrations = [];
    
    // SIMPLIFIED SOLUTION: Fetch data directly from both tables
    
    // Step 1: Fetch student registrations with explicit student type
    console.log('Executing query: SELECT *, "student" AS registration_type FROM registrations');
    const [studentRows] = await connection.execute('SELECT *, "student" AS registration_type FROM registrations');
    console.log(`Successfully fetched ${studentRows.length} student registrations`);
    allRegistrations = [...studentRows];
    
    // Step 2: Fetch alumni registrations with explicit alumni type
    console.log('Executing query: SELECT *, "alumni" AS registration_type FROM alumni_registrations');
    const [alumniRows] = await connection.execute('SELECT *, "alumni" AS registration_type FROM alumni_registrations');
    console.log(`Successfully fetched ${alumniRows.length} alumni registrations`);
    
    // Process alumni data to ensure proper naming and structure
    const processedAlumniRows = alumniRows.map(row => {
      // Make sure all alumni have a student_name field for compatibility
      return {
        ...row,
        student_name: row.alumni_name || row.student_name || row.name || 'Unknown Alumni'
      };
    });
    
    // Add alumni to the combined results
    allRegistrations = [...allRegistrations, ...processedAlumniRows];
    
    // Count and log the breakdown
    const studentCount = allRegistrations.filter(r => r.registration_type === 'student').length;
    const alumniCount = allRegistrations.filter(r => r.registration_type === 'alumni').length;
    console.log(`Total: ${allRegistrations.length} registrations (${studentCount} students, ${alumniCount} alumni)`);
    
    // Return the combined results
    return res.json(allRegistrations);
    
  } catch (error) {
    console.error('Error fetching registrations:', error.message);
    return res.status(500).json({ 
      error: `Error fetching registrations: ${error.message}`,
      details: error.stack
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// New endpoint to fetch attendees from MySQL database
app.post(['/api/attendees', '/attendees'], async (req, res) => {
  const { host, port, user, password, database, table } = req.body;
  
  console.log('Received database request for table:', table, 'in database:', database);
  
  let connection;
  
  try {
    // Create MySQL connection
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });
    
    // Query to fetch attendees/tickets with proper error handling
    try {
      const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 100`);
      console.log(`Successfully fetched ${rows.length} rows from ${database}.${table}`);
      
      // Return the data as JSON
      res.json(rows);
    } catch (queryError) {
      console.error('Query error:', queryError);
      res.status(400).json({ 
        error: `Query error: ${queryError.message}`,
        details: queryError.stack,
        sqlState: queryError.sqlState,
        sqlCode: queryError.code
      });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: `Database error: ${error.message}`,
      details: error.stack
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Endpoint to update ticket_generated status in database
app.post(['/api/update-ticket-status', '/update-ticket-status'], async (req, res) => {
  const { id, dbConfig, registrationType = 'student' } = req.body;
  
  if (!id || !dbConfig) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required parameters' 
    });
  }
  
  let connection;
  
  try {
    // Create MySQL connection
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });
    
    // Determine the correct table based on registration type
    const tableName = registrationType === 'alumni' ? 'alumni_registrations' : dbConfig.table || 'registrations';
    
    console.log(`Updating ticket status for ID ${id} in table ${tableName}`);
    
    // Update ticket_generated status to 'Yes'
    const [result] = await connection.execute(
      `UPDATE ${tableName} SET ticket_generated = 'Yes' WHERE id = ?`, 
      [id]
    );
    
    if (result.affectedRows > 0) {
      console.log(`Successfully updated ticket status for ID ${id} in ${tableName}`);
      res.json({ 
        success: true, 
        message: 'Ticket status updated successfully',
        table: tableName,
        id: id
      });
    } else {
      console.log(`No record found with ID ${id} in table ${tableName}`);
      res.status(404).json({ 
        success: false, 
        error: 'No record found with the given ID',
        table: tableName,
        id: id
      });
    }
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Database update error: ${error.message}`,
      details: error.stack
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Add an informational GET endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send({
    status: 'Server is running',
    endpoints: [
      '/api/attendees (POST)',
      '/attendees (POST)',
      '/api/send-qr-email (POST)',
      '/send-qr-email (POST)',
      '/api/update-ticket-status (POST)',
      '/update-ticket-status (POST)'
    ]
  });
});

// Start server with better logging
app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   QR Scanner Server is running successfully!   ║
║                                                ║
╚════════════════════════════════════════════════╝

► Server URL:    http://localhost:${port}
► Test endpoint: http://localhost:${port}/api/test
► Debug endpoint: http://localhost:${port}/api/dbinfo
► API endpoints: http://localhost:${port}/api/registrations
                http://localhost:${port}/api/send-qr-email
                http://localhost:${port}/api/update-ticket-status

If you see connectivity issues from the frontend, ensure:
1. This server window remains open
2. The frontend is trying to connect to http://localhost:${port}
3. No firewall is blocking connections
`);
});