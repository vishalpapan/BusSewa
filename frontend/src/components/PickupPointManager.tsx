import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

interface PickupPoint {
  id?: number;
  name: string;
  location: string;
}

const PickupPointManager: React.FC = () => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [newPoint, setNewPoint] = useState<PickupPoint>({ name: '', location: '' });
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  const fetchPickupPoints = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup-points/`);
      if (response.ok) {
        const data = await response.json();
        setPickupPoints(data);
      }
    } catch (error) {
      console.error('Error fetching pickup points:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoint.name.trim() || !newPoint.location.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup-points/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPoint),
      });

      if (response.ok) {
        setNewPoint({ name: '', location: '' });
        fetchPickupPoints();
      }
    } catch (error) {
      console.error('Error adding pickup point:', error);
    }
    setLoading(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint || !editingPoint.name.trim() || !editingPoint.location.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup-points/${editingPoint.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPoint),
      });

      if (response.ok) {
        setEditingPoint(null);
        fetchPickupPoints();
      }
    } catch (error) {
      console.error('Error updating pickup point:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this pickup point?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/pickup-points/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPickupPoints();
      }
    } catch (error) {
      console.error('Error deleting pickup point:', error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Manage Pickup Points</h2>
      
      {/* Add New Pickup Point */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Add New Pickup Point</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
            <input
              type="text"
              value={newPoint.name}
              onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
              placeholder="e.g., Central Bus Station"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location:</label>
            <input
              type="text"
              value={newPoint.location}
              onChange={(e) => setNewPoint({ ...newPoint, location: e.target.value })}
              placeholder="e.g., Near City Mall, Main Road"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Adding...' : 'Add Pickup Point'}
          </button>
        </form>
      </div>

      {/* Edit Form */}
      {editingPoint && (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3>Edit Pickup Point</h3>
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
              <input
                type="text"
                value={editingPoint.name}
                onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location:</label>
              <input
                type="text"
                value={editingPoint.location}
                onChange={(e) => setEditingPoint({ ...editingPoint, location: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '10px'
              }}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
            <button 
              type="button" 
              onClick={() => setEditingPoint(null)}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Pickup Points List */}
      <div>
        <h3>Existing Pickup Points</h3>
        {pickupPoints.length === 0 ? (
          <p>No pickup points added yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {pickupPoints.map((point) => (
              <div key={point.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', background: 'white' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{point.name}</h4>
                <p style={{ margin: '0 0 15px 0', color: '#666' }}>{point.location}</p>
                <div>
                  <button 
                    onClick={() => setEditingPoint(point)}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '10px',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(point.id!)}
                    style={{
                      background: '#dc3545',
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupPointManager;