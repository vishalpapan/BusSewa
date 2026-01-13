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

const AttendanceManager: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [selectedBus, setSelectedBus] = useState<number | null>(null);
    const [selectedJourney, setSelectedJourney] = useState<'ONWARD' | 'RETURN'>('ONWARD');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

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
        // For notes, we don't want to API call on every keystroke. 
        // User must explicitly save or onBlur.
        // Here we just update state, and maybe have a save button?
        // Or easy way: text area onBlur.

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

    const currentBusDetails = buses.find(b => b.id === selectedBus);
    const busBookings = getBusBookings();
    const presentCount = busBookings.filter(b => selectedJourney === 'ONWARD' ? b.onward_attendance : b.return_attendance).length;
    const volunteerCount = busBookings.filter(b => b.is_volunteer).length;

    return (
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
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
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '16px' }}>
                <div style={{ padding: '10px 20px', backgroundColor: '#e9ecef', borderRadius: '20px' }}>
                    <strong>Total Passengers:</strong> {busBookings.length} / {currentBusDetails?.capacity || 40}
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
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Seat</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Passenger</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Attendance</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Volunteer</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Notes</th>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {busBookings.map(booking => {
                            const isPresent = selectedJourney === 'ONWARD' ? booking.onward_attendance : booking.return_attendance;
                            const seatNum = selectedJourney === 'ONWARD' ? booking.onward_seat_number : booking.return_seat_number;

                            return (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                                        {seatNum || <span style={{ color: 'red' }}>NA</span>}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{booking.passenger_details.name}</div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                            {booking.passenger_details.age} yrs | {booking.passenger_details.gender} | {booking.passenger_details.mobile_no}
                                        </div>
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
                                        <button
                                            onClick={() => handleVolunteerToggle(booking.id, booking.is_volunteer)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
                                                opacity: booking.is_volunteer ? 1 : 0.2
                                            }}
                                            title="Toggle Volunteer"
                                        >
                                            ⭐
                                        </button>
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
                                    <td style={{ padding: '12px' }}>
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
                                <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#6c757d' }}>
                                    No passengers found for this bus/journey.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceManager;
