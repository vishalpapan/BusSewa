import React, { useState } from 'react';
import { passengerAPI, bookingAPI, paymentAPI } from '../services/api';

const GoogleSheetsIntegration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);

  const formatDataForSheets = async () => {
    try {
      const [passengersRes, bookingsRes, paymentsRes] = await Promise.all([
        passengerAPI.getAll(),
        bookingAPI.getAll(),
        paymentAPI.getAll()
      ]);

      // Create comprehensive data for Google Sheets
      const sheetsData = passengersRes.data.map((passenger: any, index: number) => {
        const booking = bookingsRes.data.find((b: any) => b.passenger === passenger.id);
        const payment = paymentsRes.data.find((p: any) => p.booking === booking?.id);
        
        const calculatedPrice = booking ? parseFloat(booking.calculated_price) : 0;
        const amountReceived = payment ? parseFloat(payment.amount) : 0;
        const balance = amountReceived - calculatedPrice;

        return [
          index + 1, // S.No.
          passenger.name || '',
          passenger.gender === 'M' ? 'Male' : passenger.gender === 'F' ? 'Female' : '',
          passenger.age_criteria || '',
          passenger.category || '',
          passenger.mobile_no || '',
          passenger.aadhar_number || '',
          passenger.aadhar_received ? 'Yes' : 'No',
          booking?.onwards_date || '',
          booking?.return_date || '',
          booking?.pickup_point_name || '',
          booking?.seat_number || '',
          booking?.bus_details?.bus_number || '',
          calculatedPrice > 0 ? calculatedPrice.toFixed(2) : '',
          amountReceived > 0 ? amountReceived.toFixed(2) : '',
          balance !== 0 ? balance.toFixed(2) : '',
          payment?.payment_method || '',
          payment?.collected_by || '',
          booking?.status || '',
          booking?.remarks || '',
          new Date(passenger.created_at).toLocaleDateString('en-IN')
        ];
      });

      // Add headers
      const headers = [
        'S.No.', 'Name', 'Gender', 'Age Criteria', 'Category', 'Mobile No', 
        'Aadhar Number', 'Aadhar Received', 'Onwards Date', 'Return Date', 
        'Pickup Point', 'Seat Number', 'Bus Number', 'Calculated Price', 'Amount Received', 
        'Balance', 'Payment Method', 'Collected By', 'Booking Status', 
        'Remarks', 'Created Date'
      ];

      return [headers, ...sheetsData];
    } catch (error) {
      throw new Error('Failed to format data for Google Sheets');
    }
  };

  const generateGoogleSheetsUrl = (data: any[][]) => {
    // Create a CSV string
    const csvContent = data.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    // Encode for URL
    const encodedCsv = encodeURIComponent(csvContent);
    
    // Google Sheets import URL
    const baseUrl = 'https://docs.google.com/spreadsheets/create';
    const params = new URLSearchParams({
      'usp': 'sheets_web_ug',
      'authuser': '0'
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const syncToGoogleSheets = async () => {
    setLoading(true);
    try {
      const data = await formatDataForSheets();
      const url = generateGoogleSheetsUrl(data);
      setSheetsUrl(url);
      setLastSync(new Date().toLocaleString('en-IN'));
      
      // Open Google Sheets in new tab
      window.open(url, '_blank');
      
      alert('Google Sheets opened! You can now copy the data and paste it into your sheet.');
    } catch (error) {
      alert('Error preparing data for Google Sheets: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyDataToClipboard = async () => {
    setLoading(true);
    try {
      const data = await formatDataForSheets();
      const csvContent = data.map(row => row.join('\t')).join('\n'); // Use tabs for better Excel/Sheets compatibility
      
      await navigator.clipboard.writeText(csvContent);
      alert('Data copied to clipboard! You can now paste it directly into Google Sheets.');
      setLastSync(new Date().toLocaleString('en-IN'));
    } catch (error) {
      alert('Error copying data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleSheetsTemplate = () => {
    // Create a template Google Sheet with headers
    const templateUrl = 'https://docs.google.com/spreadsheets/create?usp=sheets_web_ug';
    window.open(templateUrl, '_blank');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>📊 Google Sheets Integration</h2>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>🔗 Sync Options</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Choose how you want to sync your bus booking data with Google Sheets:
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <button
            onClick={copyDataToClipboard}
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
            📋 Copy to Clipboard
          </button>

          <button
            onClick={syncToGoogleSheets}
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
            🚀 Open Google Sheets
          </button>

          <button
            onClick={openGoogleSheetsTemplate}
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
            📝 Create New Sheet
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>📋 How to Use</h3>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          <li><strong>Copy to Clipboard:</strong> Copies all data to clipboard. Open Google Sheets and paste (Ctrl+V).</li>
          <li><strong>Open Google Sheets:</strong> Opens a new Google Sheets tab where you can paste the data.</li>
          <li><strong>Create New Sheet:</strong> Opens a blank Google Sheets template.</li>
        </ol>
      </div>

      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h3>⚠️ Important Notes</h3>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>Data includes all passengers with their booking and payment details</li>
          <li>Aadhar numbers are included for privacy-compliant record keeping</li>
          <li>Seat numbers reflect the 40-seat bus configuration</li>
          <li>Currency amounts are formatted in Indian Rupees (₹)</li>
          <li>For automatic sync, you'll need Google Sheets API integration (advanced feature)</li>
        </ul>
        
        {lastSync && (
          <p style={{ marginTop: '15px', color: '#856404', fontWeight: 'bold' }}>
            Last sync: {lastSync}
          </p>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#007bff' }}>
          <strong>⏳ Preparing data...</strong>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsIntegration;