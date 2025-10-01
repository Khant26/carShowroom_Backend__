import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Banners from './Banners';
import Brands from './Brands';
import Cars from './Cars';
import Rentals from './Rentals';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/banners" replace />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/rentals" element={<Rentals />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;