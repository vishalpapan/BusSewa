import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PassengerForm from './components/PassengerForm';
import PassengerList from './components/PassengerList';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import ExportData from './components/ExportData';
import SeatAllocation from './components/SeatAllocation';
import PickupPointManager from './components/PickupPointManager';
import GoogleSheetsIntegration from './components/GoogleSheetsIntegration';
import LivePassengerList from './components/LivePassengerList';
import BusManager from './components/BusManager';
import ImportData from './components/ImportData';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first for faster loading
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    // Always verify with server
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/current-user/', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Only clear if we don't have stored user data
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setUser(null);
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      // Don't clear user on network errors
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Refresh session periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        checkAuthStatus();
      }, 300000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/auth/logout/', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '24px' }}>🔄 Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
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
          <div style={{ color: 'white', textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Welcome, {user.full_name}</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Role: {user.role}</div>
            <button
              onClick={handleLogout}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🚪 Logout
            </button>
          </div>
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
            onClick={() => setActiveTab('import')}
            style={navButtonStyle('import')}
          >
            📥 Import Data
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
          <button 
            onClick={() => setActiveTab('pickup-points')}
            style={navButtonStyle('pickup-points')}
          >
            📍 Pickup Points
          </button>
          <button 
            onClick={() => setActiveTab('bus-manager')}
            style={navButtonStyle('bus-manager')}
          >
            🚌 Manage Buses
          </button>

          <button 
            onClick={() => setActiveTab('google-sheets')}
            style={navButtonStyle('google-sheets')}
          >
            📊 Google Sheets
          </button>
          <button 
            onClick={() => setActiveTab('live-list')}
            style={navButtonStyle('live-list')}
          >
            📋 Live List
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'add' && <PassengerForm onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'import' && <ImportData />}
        {activeTab === 'list' && <PassengerList />}
        {activeTab === 'live-list' && <LivePassengerList />}
        {activeTab === 'booking' && <BookingForm />}
        {activeTab === 'bookings' && <BookingList />}
        {activeTab === 'seats' && <SeatAllocation />}
        {activeTab === 'export' && <ExportData />}
        {activeTab === 'pickup-points' && <PickupPointManager />}
        {activeTab === 'bus-manager' && <BusManager />}

        {activeTab === 'google-sheets' && <GoogleSheetsIntegration />}
      </main>
    </div>
  );
}

export default App;
