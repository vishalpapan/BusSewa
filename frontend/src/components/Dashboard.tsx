import React, { useState, useEffect } from 'react';
import { passengerAPI, bookingAPI, paymentAPI } from '../services/api';

interface DashboardStats {
  totalPassengers: number;
  totalBookings: number;
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
  pendingAmount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPassengers: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [passengersRes, bookingsRes, paymentsRes] = await Promise.all([
        passengerAPI.getAll(),
        bookingAPI.getAll(),
        paymentAPI.getAll(),
      ]);

      const passengers = passengersRes.data;
      const bookings = bookingsRes.data;
      const payments = paymentsRes.data;

      // Calculate stats
      const totalRevenue = payments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0);
      const totalBookingAmount = bookings.reduce((sum: number, booking: any) => sum + parseFloat(booking.calculated_price), 0);
      const pendingAmount = totalBookingAmount - totalRevenue;
      const pendingPayments = bookings.length - payments.length;

      setStats({
        totalPassengers: passengers.length,
        totalBookings: bookings.length,
        totalPayments: payments.length,
        totalRevenue,
        pendingPayments: Math.max(0, pendingPayments),
        pendingAmount: Math.max(0, pendingAmount),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; color: string; icon: string }> = ({ title, value, color, icon }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: `3px solid ${color}`,
      textAlign: 'center',
      minWidth: '200px'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', color: color }}>{title}</h3>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{value}</div>
    </div>
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>BusSewa Dashboard</h2>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <StatCard
          title="Total Passengers"
          value={stats.totalPassengers}
          color="#007bff"
          icon="👥"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          color="#28a745"
          icon="🎫"
        />
        <StatCard
          title="Payments Received"
          value={stats.totalPayments}
          color="#17a2b8"
          icon="💰"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          color="#28a745"
          icon="💵"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          color="#ffc107"
          icon="⏳"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          color="#dc3545"
          icon="📋"
        />
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Quick Summary</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#007bff', marginBottom: '10px' }}>Registration Status</h4>
            <p>📊 <strong>{stats.totalPassengers}</strong> passengers registered</p>
            <p>🎫 <strong>{stats.totalBookings}</strong> bookings created</p>
            <p>📈 <strong>{((stats.totalBookings / Math.max(stats.totalPassengers, 1)) * 100).toFixed(1)}%</strong> booking rate</p>
          </div>
          
          <div>
            <h4 style={{ color: '#28a745', marginBottom: '10px' }}>Payment Status</h4>
            <p>💰 <strong>₹{stats.totalRevenue.toLocaleString()}</strong> collected</p>
            <p>⏳ <strong>₹{stats.pendingAmount.toLocaleString()}</strong> pending</p>
            <p>📊 <strong>{stats.totalPayments > 0 ? ((stats.totalRevenue / (stats.totalRevenue + stats.pendingAmount)) * 100).toFixed(1) : 0}%</strong> collection rate</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        marginTop: '30px', 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => window.open('/api/passengers/', '_blank')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📋 View All Data (API)
        </button>
        <button
          onClick={fetchDashboardData}
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Dashboard;