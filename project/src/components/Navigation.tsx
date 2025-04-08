import React from 'react';
import { NavLink } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">maJIStic 2025</span>
          </div>
          <div className="flex space-x-4">
            <NavLink 
              to="/tickets" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Tickets
            </NavLink>
            <NavLink 
              to="/registrations" 
              className={({ isActive }) => 
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Registrations
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}