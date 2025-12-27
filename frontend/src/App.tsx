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
import DeleteManagement from './components/DeleteManagement';
import JourneyManager from './components/JourneyManager';
import { APP_CONFIG } from './config/app.config';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set page title
    document.title = APP_CONFIG.PAGE_TITLE;
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/current-user/', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log('User authenticated:', userData);
      } else {
        console.log('Not authenticated, status:', response.status);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/auth/logout/', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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
            }}>{APP_CONFIG.APP_NAME}</h1>
            <p style={{ 
              margin: 0, 
              fontSize: '1.1em', 
              opacity: 0.9,
              fontWeight: '300'
            }}>{APP_CONFIG.APP_SUBTITLE}</p>
          </div>
          <div style={{ color: 'white', textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Welcome, {user.username}</div>
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
          <button 
            onClick={() => setActiveTab('journey-manager')}
            style={navButtonStyle('journey-manager')}
          >
            🗓️ Journey Manager
          </button>
          <button 
            onClick={() => setActiveTab('delete-management')}
            style={navButtonStyle('delete-management')}
          >
            🗑️ Delete Management
          </button>

        </nav>
      </header>
      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'add' && <PassengerForm onSuccess={() => setActiveTab('list')} />}
        {activeTab === 'import' && <ImportData />}
        {activeTab === 'list' && <PassengerList onNavigate={(tab, passengerId) => setActiveTab(tab)} />}
        {activeTab === 'live-list' && <LivePassengerList />}
        {activeTab === 'booking' && <BookingForm />}
        {activeTab === 'bookings' && <BookingList />}
        {activeTab === 'seats' && <SeatAllocation />}
        {activeTab === 'export' && <ExportData />}
        {activeTab === 'pickup-points' && <PickupPointManager />}
        {activeTab === 'bus-manager' && <BusManager />}

        {activeTab === 'google-sheets' && <GoogleSheetsIntegration />}
        {activeTab === 'journey-manager' && <JourneyManager />}
        {activeTab === 'delete-management' && <DeleteManagement />}


      </main>
    </div>
  );
}

export default App;
