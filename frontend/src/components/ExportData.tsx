import React, { useState, useEffect } from 'react';
import { passengerAPI, bookingAPI, paymentAPI } from '../services/api';

const ExportData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const availableColumns = [
    'S.No.', 'Name', 'Gender', 'Age', 'Age Criteria', 'Category', 'Mobile No', 'Aadhar Number',
    'Journey Type', 'Onward Date', 'Return Date', 'Onward Seat', 'Return Seat', 'Onward Bus', 'Return Bus',
    'Onward Price', 'Return Price', 'Total Price', 'Assigned Volunteer', 'Is Passenger Volunteer',
    'Attendance (Onward)', 'Attendance (Return)', 'Attendance Notes',
    'Payment Status', 'Payment Method', 'Collected By', 'Payment Date', 'Booking Status', 'Created Date'
  ];

  useEffect(() => {
    fetchBusesAndVolunteers();
    setSelectedColumns(availableColumns); // Select all by default
  }, []);

  const fetchBusesAndVolunteers = async () => {
    try {
      const [busesRes, volunteersRes] = await Promise.all([
        fetch('/api/buses/', { credentials: 'include' }),
        fetch('/api/auth/users/', { credentials: 'include' })
      ]);

      if (!busesRes.ok || !volunteersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const busesData = await busesRes.json();
      const volunteersData = await volunteersRes.json();
      setBuses(Array.isArray(busesData) ? busesData : []);
      setVolunteers(Array.isArray(volunteersData) ? volunteersData : []);
    } catch (error) {
      console.error('Error fetching buses/volunteers:', error);
      setBuses([]);
      setVolunteers([]);
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // Handle values with commas, quotes, or newlines by wrapping in quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Escape quotes by doubling them
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }

    return stringValue;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content with proper formatting
    const csvContent = [
      headers.map(header => formatCellValue(header)).join(','), // Header row
      ...data.map(row =>
        headers.map(header => formatCellValue(row[header])).join(',')
      )
    ].join('\r\n'); // Use Windows line endings for better Excel compatibility

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create and download file
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
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
      const passengers = response.data.map((p: any, index: number) => ({
        'S.No.': index + 1,
        'Name': p.name || '',
        'Gender': p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : '',
        'Age': p.age || '',
        'Age Criteria': p.age_criteria || '',
        'Category': p.category || '',
        'Mobile No': p.mobile_no || '',
        'Aadhar Number': p.aadhar_number || '',
        'Aadhar Required': p.aadhar_required ? 'Yes' : 'No',
        'Aadhar Received': p.aadhar_received ? 'Yes' : 'No',
        'Verification Status': p.verification_status || 'Not Required',
        'Created Date': new Date(p.created_at).toLocaleDateString('en-IN')
      }));

      exportToCSV(passengers, 'passengers_list');
      alert('Passengers data exported successfully!');
    } catch (error) {
      console.error('Export passengers error:', error);
      alert(`Error exporting passengers data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        const totalPrice = parseFloat(b.total_price || 0);
        const balance = amountReceived - totalPrice;

        return {
          'Booking ID': b.id,
          'Passenger Name': b.passenger_details?.name || '',
          'Mobile': b.passenger_details?.mobile_no || '',
          'Age': b.passenger_details?.age || '',
          'Age Criteria': b.passenger_details?.age_criteria || '',
          'Category': b.passenger_details?.category || '',
          'Journey Type': b.journey_type || '',
          'Onward Date': b.onward_journey_details?.journey_date || '',
          'Return Date': b.return_journey_details?.journey_date || '',
          'Pickup Point': b.pickup_point_name || '',
          'Onward Seat': b.onward_seat_number || '',
          'Return Seat': b.return_seat_number || '',
          'Return Bus': b.return_bus_details?.bus_number || '',
          'Onward Price': parseFloat(b.onward_price || 0).toFixed(2),
          'Return Price': parseFloat(b.return_price || 0).toFixed(2),
          'Total Price': totalPrice.toFixed(2),
          'Amount Received': amountReceived.toFixed(2),
          'Balance': balance.toFixed(2),
          'Is Passenger Volunteer': b.is_volunteer ? 'Yes' : 'No',
          'Attendance (Onward)': b.onward_attendance === true ? 'Present' : b.onward_attendance === false ? 'Absent' : '',
          'Attendance (Return)': b.return_attendance === true ? 'Present' : b.return_attendance === false ? 'Absent' : '',
          'Attendance Notes': b.attendance_notes || '',
          'Status': b.status || '',
          'Remarks': b.remarks || '',
          'Created Date': new Date(b.created_at).toLocaleDateString('en-IN')
        };
      });

      exportToCSV(bookings, 'bookings_list');
      alert('Bookings data exported successfully!');
    } catch (error) {
      console.error('Export bookings error:', error);
      alert(`Error exporting bookings data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getAll();
      const payments = response.data.map((p: any, index: number) => ({
        'S.No.': index + 1,
        'Payment ID': p.id,
        'Passenger Name': p.booking_details?.passenger_details?.name || '',
        'Amount': parseFloat(p.amount).toFixed(2),
        'Payment Method': p.payment_method || '',
        'Collected By': p.collected_by || '',
        'Payment Date': new Date(p.payment_date).toLocaleDateString('en-IN'),
        'Created Date': new Date(p.created_at).toLocaleDateString('en-IN')
      }));

      exportToCSV(payments, 'payments_list');
      alert('Payments data exported successfully!');
    } catch (error) {
      console.error('Export payments error:', error);
      alert(`Error exporting payments data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportByVolunteer = async (volunteerId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/by_volunteer/?volunteer_id=${volunteerId}`, { credentials: 'include' });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const bookings = await response.json();

      const volunteerData = bookings.map((b: any, index: number) => {
        const finalAmount = b.custom_amount || b.calculated_price;
        return {
          'S.No.': index + 1,
          'Name': b.passenger_details?.name || '',
          'Mobile': b.passenger_details?.mobile_no || '',
          'Seat Number': b.seat_number || '',
          'Bus Number': b.bus_details?.bus_number || '',
          'Amount': finalAmount.toFixed(2),
          'Payment Status': b.payment_status || 'Pending',
          'Volunteer': b.assigned_volunteer_details?.username || ''
        };
      });

      const volunteer = volunteers.find(v => v.id === volunteerId);
      exportToCSV(volunteerData, `volunteer_${volunteer?.username || volunteerId}_passengers`);
      alert('Volunteer passenger list exported successfully!');
    } catch (error) {
      console.error('Export volunteer error:', error);
      alert(`Error exporting volunteer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportByBus = async (busId: number) => {
    setLoading(true);
    try {
      // Fetch both regular passengers and on-spot passengers
      const [passengersRes, onSpotRes] = await Promise.all([
        fetch(`/api/buses/${busId}/passenger_list/`, { credentials: 'include' }),
        fetch(`/api/onspot-passengers/by_bus/?bus_id=${busId}`, { credentials: 'include' })
      ]);

      if (!passengersRes.ok) {
        throw new Error(`HTTP error! status: ${passengersRes.status}`);
      }

      const data = await passengersRes.json();
      const onSpotData = onSpotRes.ok ? await onSpotRes.json() : [];

      // Map regular passengers
      const busData = data.passengers.map((b: any, index: number) => {
        const finalAmount = b.custom_amount || b.calculated_price || b.total_price || 0;
        return {
          'S.No.': index + 1,
          'Type': 'Reserved',
          'Name': b.passenger_details?.name || '',
          'Age': b.passenger_details?.age || '',
          'Mobile': b.passenger_details?.mobile_no || '',
          'Seat Number': b.onward_seat_number || b.return_seat_number || b.seat_number || '',
          'Amount': parseFloat(finalAmount).toFixed(2),
          'Payment Status': b.payment_status || 'Pending',
          'Volunteer': b.is_volunteer ? 'Yes' : 'No',
          'Attendance': b.onward_attendance === true ? 'Present' : b.onward_attendance === false ? 'Absent' : ''
        };
      });

      // Add on-spot passengers
      const onSpotExport = onSpotData.map((p: any, index: number) => ({
        'S.No.': busData.length + index + 1,
        'Type': 'On-Spot',
        'Name': p.name || '',
        'Age': p.age || '',
        'Mobile': p.mobile_no || '',
        'Seat Number': 'Standing',
        'Amount': parseFloat(p.calculated_price || 0).toFixed(2),
        'Payment Status': p.payment_status || 'Pending',
        'Volunteer': 'No',
        'Attendance': 'Present'
      }));

      const combinedData = [...busData, ...onSpotExport];

      exportToCSV(combinedData, `bus_${data.bus.bus_number || busId}_passengers`);
      alert(`Bus passenger list exported successfully! (${busData.length} reserved + ${onSpotExport.length} on-spot)`);
    } catch (error) {
      console.error('Export bus error:', error);
      alert(`Error exporting bus data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportCustomColumns = async () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column to export');
      return;
    }

    setLoading(true);
    console.log('🔍 Starting custom export with columns:', selectedColumns);

    try {
      console.log('📡 Fetching data from APIs...');
      const [passengersRes, bookingsRes, paymentsRes] = await Promise.all([
        passengerAPI.getAll(),
        bookingAPI.getAll(),
        paymentAPI.getAll()
      ]);

      console.log('✅ API responses received:', {
        passengers: passengersRes?.data?.length || 0,
        bookings: bookingsRes?.data?.length || 0,
        payments: paymentsRes?.data?.length || 0
      });

      const allData = passengersRes.data.map((passenger: any, index: number) => {
        const booking = bookingsRes.data.find((b: any) => b.passenger_details?.id === passenger.id || b.passenger === passenger.id);
        const payment = paymentsRes.data.find((p: any) => p.booking === booking?.id);
        const totalPrice = booking ? parseFloat(booking.total_price || 0) : 0;
        const amountReceived = payment ? parseFloat(payment.amount) : 0;

        const fullData = {
          'S.No.': index + 1,
          'Name': passenger.name || '',
          'Gender': passenger.gender === 'M' ? 'Male' : passenger.gender === 'F' ? 'Female' : '',
          'Age': passenger.age || '',
          'Age Criteria': passenger.age_criteria || '',
          'Category': passenger.category || '',
          'Mobile No': passenger.mobile_no || '',
          'Aadhar Number': passenger.aadhar_number || '',
          'Journey Type': booking?.journey_type || '',
          'Onward Date': booking?.onward_journey_details?.journey_date || '',
          'Return Date': booking?.return_journey_details?.journey_date || '',
          'Onward Seat': booking?.onward_seat_number || '',
          'Return Seat': booking?.return_seat_number || '',
          'Onward Bus': booking?.onward_bus_details?.bus_number || '',
          'Return Bus': booking?.return_bus_details?.bus_number || '',
          'Onward Price': booking ? parseFloat(booking.onward_price || 0).toFixed(2) : '',
          'Return Price': booking ? parseFloat(booking.return_price || 0).toFixed(2) : '',
          'Total Price': totalPrice > 0 ? totalPrice.toFixed(2) : '',
          'Assigned Volunteer': booking?.assigned_volunteer_details?.username || '',
          'Is Passenger Volunteer': booking?.is_volunteer ? 'Yes' : 'No',
          'Attendance (Onward)': booking?.onward_attendance === true ? 'Present' : booking?.onward_attendance === false ? 'Absent' : '',
          'Attendance (Return)': booking?.return_attendance === true ? 'Present' : booking?.return_attendance === false ? 'Absent' : '',
          'Attendance Notes': booking?.attendance_notes || '',
          'Payment Status': booking?.payment_status || 'Pending',
          'Payment Method': payment?.payment_method || '',
          'Collected By': payment?.collected_by || '',
          'Payment Date': payment?.payment_received_date ? new Date(payment.payment_received_date).toLocaleDateString('en-IN') : '',
          'Booking Status': booking?.status || '',
          'Created Date': new Date(passenger.created_at).toLocaleDateString('en-IN')
        };

        // Filter to only selected columns
        const filteredData: any = {};
        selectedColumns.forEach(col => {
          if (fullData.hasOwnProperty(col)) {
            filteredData[col] = fullData[col as keyof typeof fullData];
          }
        });

        return filteredData;
      });

      console.log('📊 Generated data rows:', allData.length);

      if (allData.length === 0) {
        alert('No data available to export');
        return;
      }

      exportToCSV(allData, 'custom_export');
      alert('Custom export completed successfully!');
    } catch (error) {
      console.error('Export custom error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        selectedColumns: selectedColumns
      });
      alert(`Error exporting custom data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const selectAllColumns = () => setSelectedColumns(availableColumns);
  const clearAllColumns = () => setSelectedColumns([]);

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
          onClick={() => setShowColumnSelector(!showColumnSelector)}
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
          🎯 Custom Export
        </button>

        <button
          onClick={() => {
            setSelectedColumns([...availableColumns]);
            setTimeout(() => exportCustomColumns(), 200);
          }}
          disabled={loading}
          style={{
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            padding: '15px 20px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📋 Export All Data
        </button>

        {volunteers.length > 0 && (
          <select
            onChange={(e) => e.target.value && exportByVolunteer(parseInt(e.target.value))}
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
            <option value="">👥 Export by Volunteer</option>
            {volunteers.filter(v => v?.role === 'volunteer' || v?.role === 'admin').map(volunteer => (
              <option key={volunteer.id} value={volunteer.id}>
                {volunteer.username}
              </option>
            ))}
          </select>
        )}

        {buses.length > 0 && (
          <select
            onChange={(e) => e.target.value && exportByBus(parseInt(e.target.value))}
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
            <option value="">🚌 Export by Bus</option>
            {buses.map(bus => (
              <option key={bus.id} value={bus.id}>
                Bus {bus.bus_number || bus.id}
              </option>
            ))}
          </select>
        )}
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

      {/* Custom Column Selector */}
      {showColumnSelector && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #6f42c1'
        }}>
          <h3>🎯 Select Columns to Export</h3>
          <div style={{ marginBottom: '15px' }}>
            <button onClick={selectAllColumns} style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Select All</button>
            <button onClick={clearAllColumns} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Clear All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            {availableColumns.map(column => (
              <label key={column} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  style={{ marginRight: '8px' }}
                />
                {column}
              </label>
            ))}
          </div>
          <button
            onClick={exportCustomColumns}
            disabled={loading || selectedColumns.length === 0}
            style={{
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: (loading || selectedColumns.length === 0) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📥 Export Selected Columns ({selectedColumns.length})
          </button>
        </div>
      )}



      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#007bff' }}>
          <strong>⏳ Exporting data...</strong>
        </div>
      )}
    </div>
  );
};

export default ExportData;