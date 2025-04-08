-- SQL script to create the necessary database and tables

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS majistic2k25;

-- Use the created database
USE majistic2k25;

-- Create the registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  jis_id VARCHAR(20) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  inhouse_competition ENUM('Yes', 'No') DEFAULT 'No',
  competition_name VARCHAR(100) NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
  receipt_number VARCHAR(50),
  payment_updated_by VARCHAR(50),
  payment_update_timestamp DATETIME,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  ticket_generated ENUM('Yes', 'No') DEFAULT 'No',
  checkin_1 ENUM('Yes', 'No') DEFAULT 'No',
  checkin_1_timestamp DATETIME,
  checkin_2 ENUM('Yes', 'No') DEFAULT 'No',
  checkin_2_timestamp DATETIME,
  edited_by VARCHAR(50),
  edited_timestamp DATETIME
);

-- Insert sample data into the registrations table
INSERT INTO registrations (
  student_name, gender, jis_id, mobile, email, department, 
  inhouse_competition, competition_name, registration_date, 
  payment_status, receipt_number, payment_updated_by, 
  payment_update_timestamp, paid_amount, ticket_generated, 
  checkin_1, checkin_1_timestamp, checkin_2, checkin_2_timestamp
) VALUES
('Sk Riyaz', 'male', 'JIS/2022/0857', '7029621489', 'skriyaz.dev@gmail.com', 'CSE', 
 'No', 'Hackathon', '2025-03-26 03:36:59', 'Paid', '1452', 'riyaz_control', 
 '2025-03-26 03:37:49', 500.00, 'Yes', 'No', '2025-03-26 03:38:40', 'No', NULL),

('John Smith', 'male', 'JIS/2022/0123', '9876543210', 'john.smith@example.com', 'ECE', 
 'Yes', 'Robotics', '2025-03-25 02:30:00', 'Unpaid', NULL, NULL, 
 NULL, 0.00, 'No', 'No', NULL, 'No', NULL),

('Sarah Johnson', 'female', 'JIS/2022/0456', '8765432109', 'sarah.j@example.com', 'CSE', 
 'No', 'Coding Contest', '2025-03-24 10:15:22', 'Paid', '1453', 'admin', 
 '2025-03-24 11:20:30', 300.00, 'Yes', 'Yes', '2025-03-26 09:30:00', 'No', NULL),

('Priya Patel', 'female', 'JIS/2022/0789', '9876123450', 'priya.p@example.com', 'IT', 
 'Yes', 'Web Design', '2025-03-23 14:20:10', 'Paid', '1454', 'admin', 
 '2025-03-23 15:30:45', 450.00, 'Yes', 'No', NULL, 'No', NULL),

('Michael Chen', 'male', 'JIS/2022/0234', '8765432198', 'michael.c@example.com', 'ECE', 
 'No', 'IoT Challenge', '2025-03-22 09:45:30', 'Unpaid', NULL, NULL, 
 NULL, 0.00, 'No', 'No', NULL, 'No', NULL);
