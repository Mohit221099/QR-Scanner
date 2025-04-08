import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { ScannerView } from './components/ScannerView';
import { AdminPanel } from './components/AdminPanel';
import { CSVUpload } from './components/CSVUpload';
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
              <Route path="/" element={<ScannerView />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/upload" element={<CSVUpload />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/registrations" element={<Registrations />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;