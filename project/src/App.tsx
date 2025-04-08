import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Tickets } from './components/Tickets';
import Registrations from './components/Registrations';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              {/* Redirect from home to tickets page */}
              <Route path="/" element={<Navigate to="/tickets" replace />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/registrations" element={<Registrations />} />
              
              {/* Fallback for any other routes */}
              <Route path="*" element={<Navigate to="/tickets" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;