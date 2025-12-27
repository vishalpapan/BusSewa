import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
  can_modify_seat_allocation: boolean;
  can_cancel_seats: boolean;
  profile: {
    full_name: string;
    department: string;
  };
}

const VolunteerManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/users/', {
        credentials: 'include'
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPermissions = async (userId: number, permissions: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/users/${userId}/update_permissions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(permissions)
      });
      
      if (response.ok) {
        alert('Permissions updated successfully!');
        fetchUsers();
        setEditingUser(null);
      } else {
        alert('Error updating permissions');
      }
    } catch (error) {
      alert('Error updating permissions');
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/users/${userId}/toggle_status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !isActive })
      });
      
      if (response.ok) {
        alert(`User ${!isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      } else {
        alert('Error updating user status');
      }
    } catch (error) {
      alert('Error updating user status');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading volunteers...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h2>👥 Volunteer Management</h2>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h4>📋 Instructions:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Seat Allocation Permission:</strong> Allows volunteer to assign/modify seat allocations</li>
          <li><strong>Seat Cancellation Permission:</strong> Allows volunteer to cancel seat bookings</li>
          <li><strong>Active/Inactive:</strong> Controls whether volunteer can login to the system</li>
          <li><strong>Role:</strong> Admin has all permissions automatically</li>
        </ul>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Volunteer</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Seat Permissions</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <strong>{user.profile?.full_name || user.username}</strong>
                  <br />
                  <small style={{ color: '#666' }}>@{user.username}</small>
                  {user.profile?.department && (
                    <><br /><small style={{ color: '#666' }}>{user.profile.department}</small></>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: user.role === 'admin' ? '#dc3545' : user.role === 'volunteer' ? '#28a745' : '#6c757d',
                    color: 'white'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: user.is_active ? '#28a745' : '#dc3545',
                    color: 'white'
                  }}>
                    {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {user.role === 'admin' ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>All Permissions</span>
                  ) : (
                    <div style={{ fontSize: '12px' }}>
                      <div>Seat Allocation: {user.can_modify_seat_allocation ? '✅' : '❌'}</div>
                      <div>Seat Cancellation: {user.can_cancel_seats ? '✅' : '❌'}</div>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => setEditingUser(user)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        ⚙️ Permissions
                      </button>
                    )}
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      style={{
                        backgroundColor: user.is_active ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      {user.is_active ? '🚫 Deactivate' : '✅ Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No volunteers found. Create volunteers through Django Admin first.
        </div>
      )}

      {/* Permission Edit Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3>Edit Permissions</h3>
            <p><strong>Volunteer:</strong> {editingUser.profile?.full_name || editingUser.username}</p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editingUser.can_modify_seat_allocation}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    can_modify_seat_allocation: e.target.checked
                  })}
                  style={{ marginRight: '8px' }}
                />
                Can modify seat allocations
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editingUser.can_cancel_seats}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    can_cancel_seats: e.target.checked
                  })}
                  style={{ marginRight: '8px' }}
                />
                Can cancel seat bookings
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => updateUserPermissions(editingUser.id, {
                  can_modify_seat_allocation: editingUser.can_modify_seat_allocation,
                  can_cancel_seats: editingUser.can_cancel_seats
                })}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h4>📝 How to Add New Volunteers:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Go to Django Admin: <code>http://127.0.0.1:8000/admin/</code></li>
          <li>Navigate to <strong>Authentication → Users</strong></li>
          <li>Click <strong>"Add User"</strong></li>
          <li>Set username, password, and role (volunteer/admin)</li>
          <li>Fill in profile information (full name, department)</li>
          <li>Save the user</li>
          <li>Return here to set specific permissions</li>
        </ol>
      </div>
    </div>
  );
};

export default VolunteerManagement;