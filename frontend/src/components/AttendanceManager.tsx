import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

interface Booking {
    id: number;
    passenger_details: {
        id: number;
        name: string;
        age: number;
        gender: string;
        mobile_no: string;
        category?: string;
    };
    journey_type: string;
    onward_seat_number: string;
    return_seat_number: string;
    onward_bus_details?: { id: number; bus_number: string; };
    return_bus_details?: { id: number; bus_number: string; };
    is_volunteer?: boolean;
    onward_attendance?: boolean;
    return_attendance?: boolean;
    attendance_notes?: string;
    payment_status: string;
}

interface Bus {
    id: number;
    bus_number: string;
    capacity: number;
    route_name: string;
    journey_details?: {
        id: number;
        journey_type: string;
        journey_date: string;
    };
}

interface OnSpotPassenger {
    id?: number;
    name: string;
    age: number;
    gender: string;
    mobile_no: string;
    bus: number;
    journey_type: string;
    calculated_price: number;
    payment_status: string;
    attendance: boolean;
    notes: string;
    age_criteria?: string;
}

const AttendanceManager: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [selectedBus, setSelectedBus] = useState<number | null>(null);
    const [selectedJourney, setSelectedJourney] = useState<'ONWARD' | 'RETURN'>('ONWARD');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // On-spot passengers state
    const [onSpotPassengers, setOnSpotPassengers] = useState<OnSpotPassenger[]>([]);
    const [showOnSpotForm, setShowOnSpotForm] = useState(false);
    const [newOnSpot, setNewOnSpot] = useState<Partial<OnSpotPassenger>>({
        name: '',
        age: 0,
        gender: 'M',
        mobile_no: '',
        payment_status: 'Pending',
        notes: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedBus) {
            fetchOnSpotPassengers();
        }
    }, [selectedBus, selectedJourney]);

    const fetchInitialData = async () => {
        try {
            const busesRes = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/buses/`).then(r => r.json());
            setBuses(busesRes);
            if (busesRes.length > 0) {
                setSelectedBus(busesRes[0].id);
            }
            fetchBookings();
        } catch (error) {
            console.error('Error loading data', error);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await bookingAPI.getAll();
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOnSpotPassengers = async () => {
        if (!selectedBus) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/onspot-passengers/by_bus/?bus_id=${selectedBus}&journey_type=${selectedJourney}`);
            if (res.ok) {
                const data = await res.json();
                setOnSpotPassengers(data);
            }
        } catch (error) {
            console.error('Error fetching on-spot passengers', error);
        }
    };

    const getBusBookings = () => {
        if (!selectedBus) return [];

        return bookings.filter(b => {
            const busMatch = selectedJourney === 'ONWARD'
                ? b.onward_bus_details?.id === selectedBus
                : b.return_bus_details?.id === selectedBus;

            if (!busMatch) return false;

            // Filter by search term
            if (searchTerm) {
                return b.passenger_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.passenger_details.mobile_no.includes(searchTerm);
            }
            return true;
        }).sort((a, b) => {
            // Sort by seat number
            const seatA = parseInt(selectedJourney === 'ONWARD' ? a.onward_seat_number : a.return_seat_number) || 999;
            const seatB = parseInt(selectedJourney === 'ONWARD' ? b.onward_seat_number : b.return_seat_number) || 999;
            return seatA - seatB;
        });
    };

    const handleAttendanceChange = async (bookingId: number, isPresent: boolean) => {
        // Optimistic update
        const updatedBookings = bookings.map(b => {
            if (b.id === bookingId) {
                return selectedJourney === 'ONWARD'
                    ? { ...b, onward_attendance: isPresent }
                    : { ...b, return_attendance: isPresent };
            }
            return b;
        });
        setBookings(updatedBookings);

        try {
            const updateData = selectedJourney === 'ONWARD'
                ? { onward_attendance: isPresent }
                : { return_attendance: isPresent };
            await bookingAPI.update(bookingId, updateData);
        } catch (error) {
            alert('Failed to update attendance');
            fetchBookings(); // Revert
        }
    };

    const handleVolunteerToggle = async (bookingId: number, currentStatus: boolean | undefined) => {
        const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, is_volunteer: !currentStatus } : b);
        setBookings(updatedBookings);

        try {
            await bookingAPI.update(bookingId, { is_volunteer: !currentStatus });
        } catch (error) {
            alert('Failed to update volunteer status');
            fetchBookings();
        }
    };

    const handleNoteChange = async (bookingId: number, note: string) => {
        const updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, attendance_notes: note } : b);
        setBookings(updatedBookings);
    };

    const saveNote = async (bookingId: number, note: string) => {
        try {
            await bookingAPI.update(bookingId, { attendance_notes: note });
        } catch (error) {
            alert('Failed to save note');
        }
    };

    const handleMoveBus = async (bookingId: number, newBusId: number) => {
        if (!window.confirm('Are you sure you want to move this passenger? Seat assignment will be cleared.')) return;

        try {
            const updateData = selectedJourney === 'ONWARD'
                ? { onward_bus: newBusId, onward_seat_number: '' } // Clear seat when moving
                : { return_bus: newBusId, return_seat_number: '' };

            await bookingAPI.update(bookingId, updateData);
            fetchBookings();
        } catch (error) {
            alert('Failed to move passenger');
        }
    };

    // On-spot passenger handlers
    const handleAddOnSpot = async () => {
        if (!newOnSpot.name || !newOnSpot.age || !selectedBus) {
            alert('Name and Age are required');
            return;
        }

        try {
            const payload = {
                ...newOnSpot,
                bus: selectedBus,
                journey_type: selectedJourney,
                attendance: true
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/onspot-passengers/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setOnSpotPassengers([...onSpotPassengers, data]);
                setNewOnSpot({ name: '', age: 0, gender: 'M', mobile_no: '', payment_status: 'Pending', notes: '' });
                setShowOnSpotForm(false);
            } else {
                alert('Failed to add on-spot passenger');
            }
        } catch (error) {
            alert('Error adding on-spot passenger');
        }
    };

    const handleOnSpotPaymentChange = async (passengerId: number, status: string) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/onspot-passengers/${passengerId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_status: status })
            });

            if (res.ok) {
                setOnSpotPassengers(prev => prev.map(p =>
                    p.id === passengerId ? { ...p, payment_status: status } : p
                ));
            }
        } catch (error) {
            alert('Failed to update payment status');
        }
    };

    const handleDeleteOnSpot = async (passengerId: number) => {
        if (!window.confirm('Delete this on-spot passenger?')) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/onspot-passengers/${passengerId}/`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setOnSpotPassengers(prev => prev.filter(p => p.id !== passengerId));
            }
        } catch (error) {
            alert('Failed to delete passenger');
        }
    };

    const currentBusDetails = buses.find(b => b.id === selectedBus);
    const busBookings = getBusBookings();
    const presentCount = busBookings.filter(b => selectedJourney === 'ONWARD' ? b.onward_attendance : b.return_attendance).length;
    const volunteerCount = busBookings.filter(b => b.is_volunteer).length;
    const onSpotCount = onSpotPassengers.length;
    const onSpotPaid = onSpotPassengers.filter(p => p.payment_status === 'Paid').length;

    return (
        <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '20px' }}>
            <h2>📋 Attendance & Journey Manager</h2>

            {/* Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Journey:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setSelectedJourney('ONWARD')}
                            style={{
                                flex: 1, padding: '8px',
                                backgroundColor: selectedJourney === 'ONWARD' ? '#007bff' : '#fff',
                                color: selectedJourney === 'ONWARD' ? '#fff' : '#000',
                                border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer'
                            }}
                        >Onward</button>
                        <button
                            onClick={() => setSelectedJourney('RETURN')}
                            style={{
                                flex: 1, padding: '8px',
                                backgroundColor: selectedJourney === 'RETURN' ? '#007bff' : '#fff',
                                color: selectedJourney === 'RETURN' ? '#fff' : '#000',
                                border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer'
                            }}
                        >Return</button>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Select Bus:</label>
                    <select
                        value={selectedBus || ''}
                        onChange={(e) => setSelectedBus(Number(e.target.value))}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                    >
                        {buses.map(bus => (
                            <option key={bus.id} value={bus.id}>
                                {bus.bus_number} {bus.route_name ? `(${bus.route_name})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Search Passenger:</label>
                    <input
                        type="text"
                        placeholder="Name or Mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        onClick={() => window.print()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%'
                        }}
                    >
                        🖨️ Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '14px', flexWrap: 'wrap' }}>
                <div style={{ padding: '10px 20px', backgroundColor: '#e9ecef', borderRadius: '20px' }}>
                    <strong>Reserved:</strong> {busBookings.length} / {currentBusDetails?.capacity || 40}
                </div>
                <div style={{ padding: '10px 20px', backgroundColor: '#d1e7dd', color: '#0f5132', borderRadius: '20px' }}>
                    <strong>Present:</strong> {presentCount}
                </div>
                <div style={{ padding: '10px 20px', backgroundColor: '#e2e3e5', borderRadius: '20px' }}>
                    <strong>Absent:</strong> {busBookings.length - presentCount}
                </div>
                <div style={{ padding: '10px 20px', backgroundColor: '#f8d7da', color: '#842029', borderRadius: '20px' }}>
                    <strong>Volunteers:</strong> {volunteerCount}
                </div>
                <div style={{ padding: '10px 20px', backgroundColor: '#fff3cd', color: '#664d03', borderRadius: '20px' }}>
                    <strong>On-Spot:</strong> {onSpotCount} ({onSpotPaid} paid)
                </div>
            </div>

            {/* Reserved Passengers Table */}
            <h3 style={{ marginBottom: '10px' }}>🎫 Reserved Passengers</h3>
            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Seat</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Passenger</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>📞 Phone</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Attendance</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Category</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Notes</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }} className="no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {busBookings.map(booking => {
                            const isPresent = selectedJourney === 'ONWARD' ? booking.onward_attendance : booking.return_attendance;
                            const seatNum = selectedJourney === 'ONWARD' ? booking.onward_seat_number : booking.return_seat_number;
                            // Helper to get category safely
                            const category = (booking.passenger_details as any).category || 'N/A';

                            return (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                                        {seatNum || <span style={{ color: 'red' }}>NA</span>}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{booking.passenger_details.name}</div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                            {booking.passenger_details.age} yrs | {booking.passenger_details.gender === 'M' ? 'Male' : 'Female'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {booking.passenger_details.mobile_no ? (
                                            <a
                                                href={`tel:${booking.passenger_details.mobile_no}`}
                                                style={{
                                                    color: '#007bff',
                                                    textDecoration: 'none',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                📞 {booking.passenger_details.mobile_no}
                                            </a>
                                        ) : (
                                            <span style={{ color: '#999' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                            backgroundColor: booking.payment_status === 'Paid' ? '#d1e7dd' : '#f8d7da',
                                            color: booking.payment_status === 'Paid' ? '#0f5132' : '#842029'
                                        }}>
                                            {booking.payment_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!isPresent}
                                            onChange={(e) => handleAttendanceChange(booking.id, e.target.checked)}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            backgroundColor: '#e9ecef',
                                            color: '#495057',
                                            fontWeight: 'bold'
                                        }}>
                                            {category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="text"
                                            value={booking.attendance_notes || ''}
                                            onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                                            onBlur={(e) => saveNote(booking.id, e.target.value)}
                                            placeholder="Add note..."
                                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }} className="no-print">
                                        <select
                                            onChange={(e) => handleMoveBus(booking.id, Number(e.target.value))}
                                            value=""
                                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ced4da', maxWidth: '100px' }}
                                        >
                                            <option value="">Move to...</option>
                                            {buses.filter(b => b.id !== selectedBus).map(b => (
                                                <option key={b.id} value={b.id}>{b.bus_number}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                        {busBookings.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#6c757d' }}>
                                    No passengers found for this bus/journey.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* On-Spot Passengers Section */}
            <div style={{ backgroundColor: '#fff3cd', borderRadius: '8px', padding: '20px', border: '2px solid #ffc107' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#664d03' }}>🎟️ On-Spot Passengers (Standing)</h3>
                    <button
                        onClick={() => setShowOnSpotForm(!showOnSpotForm)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ffc107',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {showOnSpotForm ? '✕ Cancel' : '+ Add On-Spot Passenger'}
                    </button>
                </div>

                {/* Add On-Spot Form */}
                {showOnSpotForm && (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '10px'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Name *</label>
                            <input
                                type="text"
                                value={newOnSpot.name || ''}
                                onChange={(e) => setNewOnSpot({ ...newOnSpot, name: e.target.value })}
                                placeholder="Full Name"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Age *</label>
                            <input
                                type="number"
                                value={newOnSpot.age || ''}
                                onChange={(e) => setNewOnSpot({ ...newOnSpot, age: parseInt(e.target.value) || 0 })}
                                placeholder="Age"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Gender</label>
                            <select
                                value={newOnSpot.gender || 'M'}
                                onChange={(e) => setNewOnSpot({ ...newOnSpot, gender: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Phone</label>
                            <input
                                type="tel"
                                value={newOnSpot.mobile_no || ''}
                                onChange={(e) => setNewOnSpot({ ...newOnSpot, mobile_no: e.target.value })}
                                placeholder="Phone Number"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Payment</label>
                            <select
                                value={newOnSpot.payment_status || 'Pending'}
                                onChange={(e) => setNewOnSpot({ ...newOnSpot, payment_status: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                onClick={handleAddOnSpot}
                                style={{
                                    padding: '8px 20px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ✓ Add Passenger
                            </button>
                        </div>
                    </div>
                )}

                {/* On-Spot Passengers List */}
                {onSpotPassengers.length > 0 ? (
                    <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#ffeeba' }}>
                                <tr>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ffc107' }}>Name</th>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ffc107' }}>Age/Gender</th>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ffc107' }}>📞 Phone</th>
                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ffc107' }}>Price</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ffc107' }}>Payment</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ffc107' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {onSpotPassengers.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name}</td>
                                        <td style={{ padding: '10px' }}>
                                            {p.age} yrs | {p.gender === 'M' ? 'Male' : 'Female'}
                                            <div style={{ fontSize: '11px', color: '#666' }}>{p.age_criteria}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {p.mobile_no ? (
                                                <a href={`tel:${p.mobile_no}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                                                    📞 {p.mobile_no}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                                            ₹{parseFloat(String(p.calculated_price)).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <select
                                                value={p.payment_status}
                                                onChange={(e) => handleOnSpotPaymentChange(p.id!, e.target.value)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ced4da',
                                                    backgroundColor: p.payment_status === 'Paid' ? '#d1e7dd' : '#f8d7da',
                                                    color: p.payment_status === 'Paid' ? '#0f5132' : '#842029'
                                                }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDeleteOnSpot(p.id!)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#dc3545',
                                                    fontSize: '16px'
                                                }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#664d03', backgroundColor: 'white', borderRadius: '8px' }}>
                        No on-spot passengers for this bus/journey yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceManager;
