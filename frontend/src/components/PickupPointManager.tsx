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
    <div className="pickup-point-manager">
      <h2>Manage Pickup Points</h2>
      
      {/* Add New Pickup Point */}
      <div className="add-pickup-point">
        <h3>Add New Pickup Point</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={newPoint.name}
              onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
              placeholder="e.g., Central Bus Station"
              required
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              value={newPoint.location}
              onChange={(e) => setNewPoint({ ...newPoint, location: e.target.value })}
              placeholder="e.g., Near City Mall, Main Road"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Pickup Point'}
          </button>
        </form>
      </div>

      {/* Edit Form */}
      {editingPoint && (
        <div className="edit-pickup-point">
          <h3>Edit Pickup Point</h3>
          <form onSubmit={handleEdit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editingPoint.name}
                onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={editingPoint.location}
                onChange={(e) => setEditingPoint({ ...editingPoint, location: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </button>
            <button type="button" onClick={() => setEditingPoint(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Pickup Points List */}
      <div className="pickup-points-list">
        <h3>Existing Pickup Points</h3>
        {pickupPoints.length === 0 ? (
          <p>No pickup points added yet.</p>
        ) : (
          <div className="pickup-points-grid">
            {pickupPoints.map((point) => (
              <div key={point.id} className="pickup-point-card">
                <h4>{point.name}</h4>
                <p>{point.location}</p>
                <div className="actions">
                  <button onClick={() => setEditingPoint(point)}>Edit</button>
                  <button onClick={() => handleDelete(point.id!)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .pickup-point-manager {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .add-pickup-point, .edit-pickup-point {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }

        button:hover {
          background: #0056b3;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .pickup-points-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .pickup-point-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
        }

        .pickup-point-card h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .pickup-point-card p {
          margin: 0 0 15px 0;
          color: #666;
        }

        .actions button {
          font-size: 12px;
          padding: 5px 10px;
        }

        .actions button:first-child {
          background: #28a745;
        }

        .actions button:last-child {
          background: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default PickupPointManager;