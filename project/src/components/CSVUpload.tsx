import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import Papa from 'papaparse';
import QRCode from 'qrcode';

interface ParsedAttendee {
  name: string;
  email: string;
  sentStatus: 'pending' | 'sending' | 'sent' | 'failed';
  qrCode?: string;
  errorMessage?: string;
}

export function CSVUpload() {
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [attendees, setAttendees] = useState<ParsedAttendee[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        try {
          // Check if the CSV has the required columns
          const firstRow = results.data[0] as any;
          if (!firstRow || !('Student Name' in firstRow) || !('Email' in firstRow)) {
            throw new Error('CSV must contain "Student Name" and "Email" columns');
          }

          const parsedAttendees = results.data
            .filter((row: any) => row['Student Name'] && row['Email'])
            .map((row: any) => ({
              name: row['Student Name'],
              email: row['Email'],
              sentStatus: 'pending' as const,
            }));

          setAttendees(parsedAttendees);
          setUploadStatus({
            success: true,
            message: `Successfully processed ${parsedAttendees.length} entries`,
          });
        } catch (error: any) {
          setUploadStatus({
            success: false,
            message: `Error processing CSV file: ${
              error?.message || String(error) || 'Unknown error'
            }`,
          });
        }
      },
      header: true,
      error: (error) => {
        setUploadStatus({
          success: false,
          message: `Error parsing CSV file: ${error.message}`,
        });
      },
    });
  };

  const generateAndSendQRCode = async (attendee: ParsedAttendee, index: number) => {
    try {
      console.log('Starting email generation and send for:', attendee.name, attendee.email);
      setAttendees(prev => {
        const newAttendees = [...prev];
        newAttendees[index].sentStatus = 'sending';
        delete newAttendees[index].errorMessage;
        return newAttendees;
      });

      const qrData = JSON.stringify({
        name: attendee.name,
        email: attendee.email,
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'H'
      });

      setAttendees(prev => {
        const newAttendees = [...prev];
        newAttendees[index].qrCode = qrCodeDataUrl;
        return newAttendees;
      });

      // IMPORTANT: Use the correct API endpoint URL based on your setup
      // Option 1: If your backend is on the same server as your frontend
      // const apiUrl = '/api/send-qr-email';
      
      // Option 2: If using Vite or similar with a proxy
      // const apiUrl = '/api/send-qr-email';
      
      // Option 3: If your backend is on a separate server/port (match the port with your backend)
      const apiUrl = 'http://localhost:3000/api/send-qr-email';
      
      console.log('Sending request to', apiUrl, 'with:', { 
        email: attendee.email, 
        name: attendee.name 
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          email: attendee.email,
          name: attendee.name,
          qrCode: qrCodeDataUrl,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Response status:', response.status);
      
      // Fix: Parse the response properly
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let result;
      try {
        // Only try to parse as JSON if it looks like JSON
        result = responseText.trim().startsWith('{') ? JSON.parse(responseText) : { message: responseText };
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid server response');
      }

      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! Status: ${response.status}`);
      }

      setAttendees(prev => {
        const newAttendees = [...prev];
        newAttendees[index].sentStatus = 'sent';
        return newAttendees;
      });
    } catch (error) {
      console.error('Caught error:', error);
      setAttendees(prev => {
        const newAttendees = [...prev];
        newAttendees[index].sentStatus = 'failed';
        newAttendees[index].errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return newAttendees;
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6">Upload Attendee List</h2>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Upload your CSV file containing attendee information
            </p>
            <p className="mt-2 text-xs text-gray-500">
              CSV must include "Student Name" and "Email" columns
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Select CSV File
            </label>
          </div>

          {uploadStatus && (
            <div
              className={`p-4 rounded-lg flex items-center ${
                uploadStatus.success ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {uploadStatus.success ? (
                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
              )}
              <p
                className={`${
                  uploadStatus.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {uploadStatus.message}
              </p>
            </div>
          )}

          {attendees.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Attendees ({attendees.length})</h3>
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => {
                    // Send to all pending attendees
                    attendees.forEach((attendee, index) => {
                      if (attendee.sentStatus === 'pending') {
                        generateAndSendQRCode(attendee, index);
                      }
                    });
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Send All Pending
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-gray-600">{attendee.email}</p>
                        {attendee.errorMessage && (
                          <p className="text-xs text-red-600">{attendee.errorMessage}</p>
                        )}
                      </div>
                      {attendee.qrCode && (
                        <img
                          src={attendee.qrCode}
                          alt="QR Code"
                          className="w-12 h-12"
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm ${
                          attendee.sentStatus === 'sent'
                            ? 'text-green-600'
                            : attendee.sentStatus === 'failed'
                            ? 'text-red-600'
                            : attendee.sentStatus === 'sending'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {attendee.sentStatus}
                      </span>
                      {attendee.sentStatus === 'pending' && (
                        <button
                          onClick={() => generateAndSendQRCode(attendee, index)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Generate & Send QR Code"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                      )}
                      {attendee.sentStatus === 'failed' && (
                        <button
                          onClick={() => generateAndSendQRCode(attendee, index)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Retry"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2v6h-6"></path>
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                            <path d="M3 22v-6h6"></path>
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}