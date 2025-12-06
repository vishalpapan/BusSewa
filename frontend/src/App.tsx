import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import PassengerForm from './components/PassengerForm';
import PassengerList from './components/PassengerList';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import ExportData from './components/ExportData';
import SeatAllocation from './components/SeatAllocation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const navButtonStyle = (tabName: string) => ({
    padding: '8px 16px', 
    marginRight: '10px',
    backgroundColor: activeTab === tabName ? '#007bff' : '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  });

  return (
    <div className="App">
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '25px 20px', 
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h1 style={{ 
            margin: '0 0 5px 0', 
            fontSize: '2.2em', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>BusSewa</h1>
          <p style={{ 
            margin: 0, 
            fontSize: '1.1em', 
            opacity: 0.9,
            fontWeight: '300'
          }}>Bus Booking Application for MSS 2025</p>
        </div>
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={navButtonStyle('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            style={navButtonStyle('add')}
          >
            Add Passenger
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            style={navButtonStyle('list')}
          >
            View Passengers
          </button>
          <button 
            onClick={() => setActiveTab('booking')}
            style={navButtonStyle('booking')}
          >
            Create Booking
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            style={navButtonStyle('bookings')}
          >
            View Bookings
          </button>
          <button 
            onClick={() => setActiveTab('seats')}
            style={navButtonStyle('seats')}
          >
            🚌 Seat Allocation
          </button>
          <button 
            onClick={() => setActiveTab('export')}
            style={navButtonStyle('export')}
          >
            📊 Export Data
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'add' && <PassengerForm onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'list' && <PassengerList />}
        {activeTab === 'booking' && <BookingForm />}
        {activeTab === 'bookings' && <BookingList />}
        {activeTab === 'seats' && <SeatAllocation />}
        {activeTab === 'export' && <ExportData />}
      </main>
    </div>
  );
}

export default App;
