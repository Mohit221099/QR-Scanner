import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Users, Upload } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              College Fest Entry
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scanner
            </Link>
            <Link
              to="/admin"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <Users className="w-5 h-5 mr-2" />
              Admin
            </Link>
            <Link
              to="/upload"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload CSV
            </Link>
            <Link
              to="/tickets"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <Upload className="w-5 h-5 mr-2" />
              Tickets
            </Link>
            <Link
              to="/registrations"
              className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <Upload className="w-5 h-5 mr-2" />
              Reg
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}