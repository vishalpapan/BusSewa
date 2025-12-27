import React, { useState, useEffect } from 'react';

interface Bus {
  id: number;
  bus_number: string;
  capacity: number;
  route_name: string;
  journey_details?: {
    id: number;
    journey_type: 'ONWARD' | 'RETURN';
    journey_date: string;
  };
}

interface Journey {
  id: number;
  journey_type: 'ONWARD' | 'RETURN';
  journey_date: string;
  is_active: boolean;
}

const BusManager: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [newBus, setNewBus] = useState({ bus_number: '', route_name: '', journey: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuses();
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/journeys/`, { credentials: 'include' });
      const data = await response.json();
      setJourneys(Array.isArray(data) ? data.filter((j: Journey) => j.is_active) : []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/buses/`, { credentials: 'include' });
      const data = await response.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setBuses([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBus.bus_number.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/buses/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          bus_number: newBus.bus_number,
          capacity: 42,
          route_name: newBus.route_name,
          journey: newBus.journey || null
        })
      });

      if (response.ok) {
        setNewBus({ bus_number: '', route_name: '', journey: '' });
        fetchBuses();
        alert('Bus added successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.bus_number?.[0] || 'Failed to add bus'));
      }
    } catch (error) {
      alert('Error adding bus');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, busNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete bus ${busNumber}? This will affect all seat assignments.`)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/buses/${id}/`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchBuses();
        alert('Bus deleted successfully!');
      }
    } catch (error) {
      alert('Error deleting bus');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>🚌 Bus Management</h2>
      
      <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Important</h3>
        <p style={{ margin: 0, color: '#856404' }}>
          Bus numbers are used for seat allocation. Only authorized personnel should manage buses. 
          Deleting a bus will affect all existing seat assignments.
        </p>
      </div>

      {/* Add New Bus */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Add New Bus</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Bus Number: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={newBus.bus_number}
              onChange={(e) => setNewBus({ ...newBus, bus_number: e.target.value })}
              placeholder="e.g., MH-12-AB-1234"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Route Name:</label>
            <input
              type="text"
              value={newBus.route_name}
              onChange={(e) => setNewBus({ ...newBus, route_name: e.target.value })}
              placeholder="e.g., Mumbai to Pune"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Journey: <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              value={newBus.journey}
              onChange={(e) => setNewBus({ ...newBus, journey: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Select a journey</option>
              {journeys.map((journey: Journey) => (
                <option key={journey.id} value={journey.id}>
                  {journey.journey_type} - {new Date(journey.journey_date).toLocaleDateString('en-IN')}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Adding...' : 'Add Bus'}
          </button>
        </form>
      </div>

      {/* Bus List */}
      <div>
        <h3>Existing Buses ({buses.length})</h3>
        {buses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No buses added yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {buses.map((bus) => (
              <div key={bus.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: 'white'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{bus.bus_number}</h4>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                  <strong>Capacity:</strong> {bus.capacity} seats
                </p>
                {bus.journey_details && (
                  <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                    <strong>Journey:</strong> {bus.journey_details.journey_type} - {new Date(bus.journey_details.journey_date).toLocaleDateString('en-IN')}
                  </p>
                )}
                {bus.route_name && (
                  <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                    <strong>Route:</strong> {bus.route_name}
                  </p>
                )}
                <button
                  onClick={() => handleDelete(bus.id, bus.bus_number)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusManager;