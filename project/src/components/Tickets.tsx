import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Mail, Database, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import axios from 'axios';

interface ParsedAttendee {
  id?: number;
  student_name: string;
  alumni_name?: string; // Add alumni name field
  email: string;
  jis_id?: string;
  mobile?: string;
  department?: string;
  gender?: string;
  passout_year?: string; // Add alumni-specific field
  current_organization?: string; // Add alumni-specific field
  registration_date?: string;
  payment_status?: string;
  receipt_number?: string;
  paid_amount?: string;
  ticket_generated?: string;
  checkin_1?: string;
  checkin_2?: string;
  sentStatus: 'pending' | 'sending' | 'sent' | 'failed';
  qrCode?: string;
  errorMessage?: string;
  registration_type?: 'student' | 'alumni'; // Add type field to differentiate
}

export function Tickets() {
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [attendees, setAttendees] = useState<ParsedAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredAttendees, setFilteredAttendees] = useState<ParsedAttendee[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('');
  const [filterTicket, setFilterTicket] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // Fetch attendees from database
  const fetchAttendees = async () => {
    setIsLoading(true);
    setStatus(null);
    
    try {
      const currentUrl = window.location.origin;
      const apiBaseUrl = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1') 
        ? 'http://localhost:3000' 
        : currentUrl;
      
      console.log('Fetching registrations from:', `${apiBaseUrl}/api/registrations`);
      console.log('Please ensure your server is running at:', apiBaseUrl);
      
      // Test server connection first
      try {
        const testResponse = await axios.get(`${apiBaseUrl}/api/test`, { timeout: 2000 });
        console.log('Server connection test:', testResponse.data);
      } catch (testError) {
        console.error('Server connection test failed:', testError);
        throw new Error(`Server connection failed. Make sure the server is running at ${apiBaseUrl}`);
      }
      
      // Check database tables first (optional debug endpoint)
      try {
        const dbInfoResponse = await axios.get(`${apiBaseUrl}/api/dbinfo`);
        console.log('Database information:', dbInfoResponse.data);
      } catch (dbInfoError) {
        console.log('Database info endpoint not available (optional)');
      }
      
      const response = await axios.get(`${apiBaseUrl}/api/registrations`);
      console.log('Registration data retrieved successfully');
      console.log('Total records received:', response.data.length);
      
      // Examine raw data to debug
      console.log('First few records:', response.data.slice(0, 2).map((r: any) => ({
        id: r.id,
        name: r.alumni_name || r.student_name,
        type: r.registration_type,
        table: r.table,
        email: r.email
      })));
      
      // Log the breakdown of registration types
      if (Array.isArray(response.data)) {
        const studentCount = response.data.filter((r: any) => r.registration_type === 'student').length;
        const alumniCount = response.data.filter((r: any) => r.registration_type === 'alumni').length;
        console.log(`Registration breakdown: ${studentCount} students, ${alumniCount} alumni`);
      }
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Map database records to attendee format
        const parsedAttendees: ParsedAttendee[] = response.data.map((record: any) => {
          // Determine if this is an alumni record by checking multiple indicators
          const isAlumni = record.registration_type === 'alumni' || 
                          record.table === 'alumni_registrations' ||
                          record.alumni_name != null;
          
          // Get the name based on the record type
          const name = isAlumni ? 
            (record.alumni_name || record.student_name) : 
            record.student_name;
          
          return {
            id: record.id,
            student_name: name, // Use student_name as the common name field
            alumni_name: isAlumni ? (record.alumni_name || record.student_name) : undefined,
            email: record.email,
            jis_id: record.jis_id,
            mobile: record.mobile,
            department: record.department,
            gender: record.gender,
            passout_year: isAlumni ? record.passout_year : undefined,
            current_organization: isAlumni ? record.current_organization : undefined,
            registration_date: record.registration_date,
            payment_status: record.payment_status,
            receipt_number: record.receipt_number,
            paid_amount: record.paid_amount,
            ticket_generated: record.ticket_generated,
            checkin_1: record.checkin_1,
            checkin_2: record.checkin_2,
            sentStatus: record.ticket_generated === 'Yes' ? 'sent' : 'pending' as const,
            registration_type: isAlumni ? 'alumni' : 'student'
          };
        });

        // Re-check for alumni registrations after parsing
        const studentAttendees = parsedAttendees.filter(a => a.registration_type === 'student').length;
        const alumniAttendees = parsedAttendees.filter(a => a.registration_type === 'alumni').length;
        console.log(`Parsed attendees: ${studentAttendees} students, ${alumniAttendees} alumni`);

        setAttendees(parsedAttendees);
        setFilteredAttendees(parsedAttendees);
        setStatus({
          success: true,
          message: `Successfully loaded ${parsedAttendees.length} attendees (${studentAttendees} students, ${alumniAttendees} alumni)`,
        });
      } else {
        setStatus({
          success: true,
          message: 'No records found in the database.',
        });
      }
    } catch (error: any) {
      console.error('Error fetching attendees:', error);
      const errorMessage = error.response ? 
        `Server error: ${error.response.status} - ${error.response.statusText}` : 
        `Network error: ${error.message}`;
        
      setStatus({
        success: false,
        message: `Failed to fetch attendees: ${errorMessage}. Make sure the server is running at http://localhost:3000.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to attendees
  useEffect(() => {
    let result = [...attendees];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (att) =>
          att.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (att.jis_id && att.jis_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          att.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (att.mobile && att.mobile.includes(searchTerm))
      );
    }
    
    // Filter by payment status
    if (filterPayment) {
      result = result.filter((att) => att.payment_status === filterPayment);
    }
    
    // Filter by ticket status
    if (filterTicket) {
      if (filterTicket === 'Yes') {
        result = result.filter((att) => att.ticket_generated === 'Yes');
      } else if (filterTicket === 'No') {
        result = result.filter((att) => att.ticket_generated === 'No' || !att.ticket_generated);
      }
    }
    
    // Filter by registration type
    if (filterType) {
      result = result.filter((att) => att.registration_type === filterType);
    }
    
    setFilteredAttendees(result);
  }, [searchTerm, filterPayment, filterTicket, filterType, attendees]);

  // Load attendees on initial component mount
  useEffect(() => {
    fetchAttendees();
  }, []);

  // Generate QR code with previous layout/style
  const generateAndSendQRCode = async (attendee: ParsedAttendee, index: number) => {
    try {
      console.log('Starting email generation and send for:', attendee.student_name, attendee.email);
      
      // Update status to sending
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].sentStatus = 'sending';
          delete newAttendees[attendeeIndex].errorMessage;
        }
        return newAttendees;
      });

      // Generate QR code data - reverting to original format
      const qrData = JSON.stringify({
        id: attendee.id,
        name: attendee.student_name,
        email: attendee.email,
        jis_id: attendee.jis_id || 'N/A'
      });
      
      // Generate QR code with the same parameters as before
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      // Update QR code in state
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].qrCode = qrCodeDataUrl;
        }
        return newAttendees;
      });

      // Get API base URL
      const currentUrl = window.location.origin;
      const apiBaseUrl = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1') 
        ? 'http://localhost:3000' 
        : currentUrl;

      // Send email with QR code
      const emailResponse = await axios.post(`${apiBaseUrl}/api/send-qr-email`, {
        email: attendee.email,
        name: attendee.student_name,
        qrCode: qrCodeDataUrl,
      });

      console.log('Email response:', emailResponse.data);

      // Update status to sent
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].sentStatus = 'sent';
          newAttendees[attendeeIndex].ticket_generated = 'Yes';
        }
        return newAttendees;
      });

      // Update ticket status in database
      await axios.post(`${apiBaseUrl}/api/update-ticket-status`, {
        id: attendee.id,
        registrationType: attendee.registration_type || 'student',
        dbConfig: {
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: '',
          database: 'majistic2k25',
          table: attendee.registration_type === 'alumni' ? 'alumni_registrations' : 'registrations'
        }
      });

      // Show success message
      setStatus({
        success: true,
        message: `Successfully sent ticket to ${attendee.student_name} (${attendee.email})`,
      });
      
    } catch (error: any) {
      console.error('Error sending ticket:', error);
      
      // Update status to failed
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].sentStatus = 'failed';
          newAttendees[attendeeIndex].errorMessage = error.message || 'Unknown error';
        }
        return newAttendees;
      });

      // Show error message
      setStatus({
        success: false,
        message: `Failed to send ticket: ${error.message || 'Unknown error'}`,
      });
    }
  };

  // Handle sending tickets to all pending attendees
  const sendAllPendingTickets = async () => {
    const pendingAttendees = filteredAttendees.filter(
      att => att.sentStatus === 'pending' && att.payment_status === 'Paid'
    );
    
    if (pendingAttendees.length === 0) {
      setStatus({
        success: false,
        message: 'No pending paid attendees found to send tickets to',
      });
      return;
    }
    
    setStatus({
      success: true,
      message: `Sending tickets to ${pendingAttendees.length} attendees...`,
    });
    
    // Send tickets sequentially to prevent overwhelming the server
    for (const [index, attendee] of pendingAttendees.entries()) {
      await generateAndSendQRCode(attendee, index);
      // Small delay between sends
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setStatus({
      success: true,
      message: `Finished sending tickets to ${pendingAttendees.length} attendees`,
    });
  };

  // Function to resend a ticket that has already been generated
  const resendTicket = async (attendee: ParsedAttendee, index: number) => {
    try {
      console.log('Resending ticket to:', attendee.student_name, attendee.email);
      
      // Update status to sending
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].sentStatus = 'sending';
          delete newAttendees[attendeeIndex].errorMessage;
        }
        return newAttendees;
      });

      // Generate QR code data - reverting to original format
      const qrData = JSON.stringify({
        id: attendee.id,
        name: attendee.student_name,
        email: attendee.email,
        jis_id: attendee.jis_id || 'N/A'
      });
      
      // Generate QR code with the same parameters as before
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      // Update QR code in state
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].qrCode = qrCodeDataUrl;
        }
        return newAttendees;
      });

      // Get API base URL
      const currentUrl = window.location.origin;
      const apiBaseUrl = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1') 
        ? 'http://localhost:3000' 
        : currentUrl;

      // Send email with QR code
      const emailResponse = await axios.post(`${apiBaseUrl}/api/send-qr-email`, {
        email: attendee.email,
        name: attendee.student_name,
        qrCode: qrCodeDataUrl,
      });

      console.log('Email response:', emailResponse.data);

      // Update status to sent
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].sentStatus = 'sent';
        }
        return newAttendees;
      });

      // Show success message
      setStatus({
        success: true,
        message: `Successfully resent ticket to ${attendee.student_name} (${attendee.email})`,
      });
      
    } catch (error: any) {
      console.error('Error resending ticket:', error);
      
      // Update status to failed
      setAttendees(prev => {
        const newAttendees = [...prev];
        const attendeeIndex = newAttendees.findIndex(a => a.id === attendee.id);
        if (attendeeIndex !== -1) {
          newAttendees[attendeeIndex].sentStatus = 'failed';
          newAttendees[attendeeIndex].errorMessage = error.message || 'Unknown error';
        }
        return newAttendees;
      });

      // Show error message
      setStatus({
        success: false,
        message: `Failed to resend ticket: ${error.message || 'Unknown error'}`,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Attendee Tickets</h2>
          <div className="flex space-x-2">
            <button
              onClick={fetchAttendees}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {status && (
          <div
            className={`p-4 rounded-lg flex items-center mb-4 ${
              status.success ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {status.success ? (
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            )}
            <p
              className={`${
                status.success ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {status.message}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, ID, email, or mobile"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="min-w-[150px]">
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <select
              value={filterTicket}
              onChange={(e) => setFilterTicket(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Ticket Status</option>
              <option value="Yes">Ticket Generated</option>
              <option value="No">Ticket Not Generated</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="student">Students</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600">Loading attendees...</p>
          </div>
        ) : filteredAttendees.length > 0 ? (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Attendees ({filteredAttendees.length})</h3>
              <button 
                onClick={sendAllPendingTickets}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
              >
                <Mail className="w-4 h-4 mr-1" />
                Send All Pending
              </button>
            </div>
            
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredAttendees.map((attendee, index) => (
                <div
                  // Use a more reliable unique key - combination of id and index to ensure uniqueness
                  key={`attendee-${attendee.id ?? ''}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        {attendee.student_name}
                        {attendee.registration_type === 'alumni' && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Alumni
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{attendee.email}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {attendee.jis_id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {attendee.jis_id}
                          </span>
                        )}
                        {attendee.department && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {attendee.department}
                          </span>
                        )}
                        {attendee.registration_type === 'alumni' && attendee.passout_year && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            {attendee.passout_year}
                          </span>
                        )}
                        {attendee.payment_status && (
                          <span className={`text-xs ${
                            attendee.payment_status === 'Paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          } px-2 py-0.5 rounded-full`}>
                            {attendee.payment_status}
                          </span>
                        )}
                      </div>
                      {attendee.registration_date && (
                        <p className="text-xs text-gray-500 mt-1">Registered: {new Date(attendee.registration_date).toLocaleString()}</p>
                      )}
                      {attendee.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{attendee.errorMessage}</p>
                      )}
                    </div>
                    {attendee.qrCode && (
                      <img
                        src={attendee.qrCode}
                        alt="QR Code"
                        className="w-24 h-24 border border-gray-300 p-1 rounded"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        attendee.sentStatus === 'sent' || attendee.ticket_generated === 'Yes'
                          ? 'text-green-600'
                          : attendee.sentStatus === 'failed'
                          ? 'text-red-600'
                          : attendee.sentStatus === 'sending'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {attendee.ticket_generated === 'Yes' ? 'Ticket Sent' : attendee.sentStatus}
                    </span>
                    
                    {/* Send new ticket button */}
                    {attendee.payment_status === 'Paid' && attendee.sentStatus === 'pending' && (
                      <button
                        onClick={() => generateAndSendQRCode(attendee, index)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Generate & Send QR Code"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    )}
                    
                    {/* Resend ticket button */}
                    {attendee.payment_status === 'Paid' && attendee.ticket_generated === 'Yes' && (
                      <button
                        onClick={() => resendTicket(attendee, index)}
                        className="p-1 text-blue-600 hover:text-blue-800 flex items-center"
                        title="Resend Ticket"
                      >
                        <Mail className="w-5 h-5 mr-1" />
                        <span className="text-xs">Resend</span>
                      </button>
                    )}
                    
                    {/* Retry button for failed attempts */}
                    {attendee.sentStatus === 'failed' && (
                      <button
                        onClick={() => generateAndSendQRCode(attendee, index)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Retry"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600">No attendees found. Please check your filters or refresh the data.</p>
          </div>
        )}
      </div>
    </div>
  );
}