import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Search, CheckCircle, XCircle, LogOut } from 'lucide-react';

// Define admin PINs
const ADMIN_PINS = ['2025', '1234', '5678'];

// Define types
interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  isCheckedIn: boolean;
  checkInTime?: string;
}

export function AdminPanel() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinValues, setPinValues] = useState(['', '', '', '']);
  const [loginError, setLoginError] = useState('');
  
  // Attendee state (now managed locally)
  const [attendees, setAttendees] = useState<Attendee[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      ticketType: "VIP",
      isCheckedIn: false
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      ticketType: "Standard",
      isCheckedIn: true,
      checkInTime: new Date().toISOString()
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      ticketType: "Workshop",
      isCheckedIn: false
    }
  ]);
  
  // Refs for PIN inputs
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
    
    // Load attendees data
    const savedAttendees = localStorage.getItem('attendees');
    if (savedAttendees) {
      setAttendees(JSON.parse(savedAttendees));
    }
  }, []);

  // Save attendees data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('attendees', JSON.stringify(attendees));
  }, [attendees]);

  // Toggle check-in status for an attendee
  const toggleCheckIn = (id: string) => {
    setAttendees(currentAttendees => 
      currentAttendees.map(attendee => {
        if (attendee.id === id) {
          return {
            ...attendee,
            isCheckedIn: !attendee.isCheckedIn,
            checkInTime: !attendee.isCheckedIn ? new Date().toISOString() : attendee.checkInTime
          };
        }
        return attendee;
      })
    );
  };

  // Handle PIN input change
  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newPinValues = [...pinValues];
      newPinValues[index] = value;
      setPinValues(newPinValues);
      
      // Auto-focus next input if value is entered
      if (value !== '' && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  // Handle PIN verification
  const handlePinVerify = () => {
    const enteredPin = pinValues.join('');
    setLoginError('');

    if (ADMIN_PINS.includes(enteredPin)) {
      setIsAuthenticated(true);
      localStorage.setItem('adminLoggedIn', 'true');
      setPinValues(['', '', '', '']);
    } else {
      setLoginError('Invalid PIN');
      // Reset PIN values
      setPinValues(['', '', '', '']);
      // Focus first input
      inputRefs[0].current?.focus();
    }
  };

  // Handle key press on PIN inputs
  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    // If Enter key is pressed, verify PIN
    if (e.key === 'Enter') {
      handlePinVerify();
    }
    
    // If Backspace is pressed and current field is empty, focus previous field
    if (e.key === 'Backspace' && pinValues[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminLoggedIn');
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Add new attendee function
  const addAttendee = (newAttendee: Omit<Attendee, 'id' | 'isCheckedIn' | 'checkInTime'>) => {
    const attendee: Attendee = {
      id: Date.now().toString(), // Generate simple unique ID
      ...newAttendee,
      isCheckedIn: false
    };
    
    setAttendees(current => [...current, attendee]);
  };

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PIN entry form component
  const PinEntryForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            maJIStic 2025 Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your 4-digit PIN to access the attendee management system
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            {pinValues.map((value, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, index)}
                className="w-16 h-16 text-center text-2xl font-bold border-2 rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            ))}
          </div>

          {loginError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              onClick={handlePinVerify}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Verify PIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // If not authenticated, show PIN entry form
  if (!isAuthenticated) {
    return <PinEntryForm />;
  }

  // Otherwise, show admin panel
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{attendee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendee.ticketType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendee.checkInTime
                        ? format(new Date(attendee.checkInTime), 'PPp')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendee.isCheckedIn ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-5 h-5 mr-1" /> Checked In
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="w-5 h-5 mr-1" /> Not Checked In
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleCheckIn(attendee.id)}
                        className={`px-4 py-2 rounded-md ${
                          attendee.isCheckedIn
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {attendee.isCheckedIn ? 'Check Out' : 'Check In'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? "No matching attendees found" : "No attendees available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}