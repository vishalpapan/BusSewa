import React, { useState } from 'react';
import { passengerAPI, bookingAPI, paymentAPI } from '../services/api';

const ExportData: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values with commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPassengers = async () => {
    setLoading(true);
    try {
      const response = await passengerAPI.getAll();
      const passengers = response.data.map((p: any) => ({
        'Serial No': p.id,
        'Name': p.name,
        'Gender': p.gender,
        'Age Criteria': p.age_criteria,
        'Category': p.category,
        'Mobile No': p.mobile_no,
        'Aadhar Received': p.aadhar_received ? 'Yes' : 'No',
        'Verification Status': p.verification_status || 'Not Required',
        'Created Date': new Date(p.created_at).toLocaleDateString()
      }));
      
      exportToCSV(passengers, 'passengers_list');
      alert('Passengers data exported successfully!');
    } catch (error) {
      alert('Error exporting passengers data');
    } finally {
      setLoading(false);
    }
  };

  const exportBookings = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        bookingAPI.getAll(),
        paymentAPI.getAll()
      ]);
      
      const bookings = bookingsRes.data.map((b: any) => {
        const payment = paymentsRes.data.find((p: any) => p.booking === b.id);
        const amountReceived = payment ? parseFloat(payment.amount) : 0;
        const calculatedPrice = parseFloat(b.calculated_price);
        const balance = amountReceived - calculatedPrice;
        
        return {
          'Booking ID': b.id,
          'Passenger Name': b.passenger_details?.name || 'N/A',
          'Mobile': b.passenger_details?.mobile_no || 'N/A',
          'Age Criteria': b.passenger_details?.age_criteria || 'N/A',
          'Category': b.passenger_details?.category || 'N/A',
          'Onwards Date': b.onwards_date || 'Not Set',
          'Return Date': b.return_date || 'Not Set',
          'Pickup Point': b.pickup_point_name || 'Not Assigned',
          'Seat Number': b.seat_number || 'Not Assigned',
          'Calculated Price': calculatedPrice,
          'Amount Received': amountReceived,
          'Balance': balance,
          'Status': b.status,
          'Remarks': b.remarks || '',
          'Created Date': new Date(b.created_at).toLocaleDateString()
        };
      });
      
      exportToCSV(bookings, 'bookings_list');
      alert('Bookings data exported successfully!');
    } catch (error) {
      alert('Error exporting bookings data');
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getAll();
      const payments = response.data.map((p: any) => ({
        'Payment ID': p.id,
        'Passenger Name': p.booking_details?.passenger_details?.name || 'N/A',
        'Amount': parseFloat(p.amount),
        'Payment Method': p.payment_method,
        'Collected By': p.collected_by,
        'Payment Date': new Date(p.payment_date).toLocaleDateString(),
        'Created Date': new Date(p.created_at).toLocaleDateString()
      }));
      
      exportToCSV(payments, 'payments_list');
      alert('Payments data exported successfully!');
    } catch (error) {
      alert('Error exporting payments data');
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    setLoading(true);
    try {
      const [passengersRes, bookingsRes, paymentsRes] = await Promise.all([
        passengerAPI.getAll(),
        bookingAPI.getAll(),
        paymentAPI.getAll()
      ]);

      // Create comprehensive report
      const allData = passengersRes.data.map((passenger: any) => {
        const booking = bookingsRes.data.find((b: any) => b.passenger === passenger.id);
        const payment = paymentsRes.data.find((p: any) => p.booking === booking?.id);
        
        const calculatedPrice = booking ? parseFloat(booking.calculated_price) : 0;
        const amountReceived = payment ? parseFloat(payment.amount) : 0;
        const balance = amountReceived - calculatedPrice;

        return {
          'SR': passenger.id,
          'Name': passenger.name,
          'Gender': passenger.gender,
          'Age Criteria': passenger.age_criteria,
          'Category': passenger.category,
          'Mobile No': passenger.mobile_no,
          'Aadhar Received': passenger.aadhar_received ? 'Yes' : 'No',
          'Onwards Date': booking?.onwards_date || 'No Booking',
          'Return Date': booking?.return_date || 'No Booking',
          'Pickup Point': booking?.pickup_point_name || 'Not Assigned',
          'Seat Number': booking?.seat_number || 'Not Assigned',
          'Calculated Price': calculatedPrice,
          'Amount Received': amountReceived,
          'Balance': balance,
          'Payment Method': payment?.payment_method || 'Not Paid',
          'Collected By': payment?.collected_by || 'Not Paid',
          'Booking Status': booking?.status || 'No Booking',
          'Remarks': booking?.remarks || '',
          'Created Date': new Date(passenger.created_at).toLocaleDateString()
        };
      });

      exportToCSV(allData, 'complete_bus_sewa_report');
      alert('Complete report exported successfully!');
    } catch (error) {
      alert('Error exporting complete report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>📊 Export Data to Excel/CSV</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '20px'
      }}>
        <button
          onClick={exportPassengers}
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '15px 20px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          👥 Export Passengers
        </button>

        <button
          onClick={exportBookings}
          disabled={loading}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '15px 20px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🎫 Export Bookings
        </button>

        <button
          onClick={exportPayments}
          disabled={loading}
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            padding: '15px 20px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          💰 Export Payments
        </button>

        <button
          onClick={exportAllData}
          disabled={loading}
          style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            padding: '15px 20px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📋 Complete Report
        </button>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>📝 Export Information</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Passengers:</strong> Basic passenger information with verification status</li>
          <li><strong>Bookings:</strong> Journey details with pricing and pickup points</li>
          <li><strong>Payments:</strong> Payment records with collection details</li>
          <li><strong>Complete Report:</strong> All data combined (matches your Excel format)</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
          Files are downloaded as CSV format which can be opened in Excel, Google Sheets, or any spreadsheet application.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#007bff' }}>
          <strong>⏳ Exporting data...</strong>
        </div>
      )}
    </div>
  );
};

export default ExportData;