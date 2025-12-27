import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
<<<<<<< HEAD
  groups: string[];
=======
  date_joined: string;
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
=======
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
<<<<<<< HEAD
    role: 'volunteer'
=======
    role: 'volunteer',
    department: ''
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/users/', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
<<<<<<< HEAD
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/create_user/', {
=======
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/create-user/', {
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUser)
      });
<<<<<<< HEAD
      
      if (response.ok) {
        alert('User created successfully!');
        setShowAddUser(false);
        setNewUser({ username: '', password: '', full_name: '', role: 'volunteer' });
        fetchUsers();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to create user'));
      }
    } catch (error) {
      alert('Error creating user');
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/users/${userId}/toggle_status/`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        alert('Error updating user status');
=======

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        alert('User created successfully!');
        setNewUser({ username: '', password: '', full_name: '', role: 'volunteer', department: '' });
        setShowCreateForm(false);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      alert('Failed to create user: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/toggle-user/${userId}/`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        fetchUsers();
        alert(`User ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
      }
    } catch (error) {
      alert('Error updating user status');
    }
  };

<<<<<<< HEAD
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading users...</div>;
  }
=======
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'volunteer': return '#007bff';
      case 'viewer': return '#6c757d';
      default: return '#6c757d';
    }
  };
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 User Management</h2>
        <button
<<<<<<< HEAD
          onClick={() => setShowAddUser(true)}
=======
          onClick={() => setShowCreateForm(!showCreateForm)}
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
<<<<<<< HEAD
            cursor: 'pointer'
          }}
        >
          ➕ Add User
        </button>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 User Roles</h3>
        <ul style={{ margin: 0, color: '#856404' }}>
          <li><strong>Admin:</strong> Full access - can manage users, modify seats, cancel bookings</li>
          <li><strong>Volunteer:</strong> Can modify seats, record payments, but cannot cancel bookings</li>
          <li><strong>Viewer:</strong> Read-only access to all data</li>
        </ul>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Username</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Full Name</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.username}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.full_name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 
                      user.role === 'admin' ? '#dc3545' : 
                      user.role === 'volunteer' ? '#28a745' : '#6c757d',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: user.is_active ? '#28a745' : '#dc3545',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    style={{
                      backgroundColor: user.is_active ? '#dc3545' : '#28a745',
                      color: 'white',
=======
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showCreateForm ? '❌ Cancel' : '➕ Add User'}
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3>Create New User</h3>
          <form onSubmit={createUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Username: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Full Name: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Role: <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Department:
                </label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="e.g., IT, Operations"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Password: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <small style={{ color: '#666' }}>Minimum 6 characters</small>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Creating...' : '✅ Create User'}
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>User</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Joined</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  <div style={{ fontWeight: 'bold' }}>{user.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>@{user.username}</div>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: getRoleBadgeColor(user.role),
                    color: 'white'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: user.is_active ? '#28a745' : '#dc3545',
                    color: 'white'
                  }}>
                    {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontSize: '12px' }}>
                  {new Date(user.date_joined).toLocaleDateString('en-IN')}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                  <button
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    style={{
                      backgroundColor: user.is_active ? '#ffc107' : '#28a745',
                      color: user.is_active ? 'black' : 'white',
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
<<<<<<< HEAD
                    {user.is_active ? 'Deactivate' : 'Activate'}
=======
                    {user.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
<<<<<<< HEAD
      </div>

      {/* Add User Modal */}
      {showAddUser && (
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
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto'
          }}>
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '15px' }}>
                <label>Username:</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Password:</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Full Name:</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label>Role:</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
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
                  type="submit"
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
=======

        {users.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No users found. Create the first user above.
          </div>
        )}
      </div>

      {/* Role Descriptions */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3>👤 Role Permissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <strong style={{ color: '#dc3545' }}>🔴 Admin:</strong>
            <ul style={{ fontSize: '14px', margin: '5px 0 0 20px' }}>
              <li>Full system access</li>
              <li>Create/manage users</li>
              <li>Delete passengers</li>
              <li>Manage buses</li>
              <li>All export features</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#007bff' }}>🔵 Volunteer:</strong>
            <ul style={{ fontSize: '14px', margin: '5px 0 0 20px' }}>
              <li>Add/edit passengers</li>
              <li>Create bookings</li>
              <li>Seat allocation</li>
              <li>Export data</li>
              <li>Import passengers</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#6c757d' }}>⚫ Viewer:</strong>
            <ul style={{ fontSize: '14px', margin: '5px 0 0 20px' }}>
              <li>View all data</li>
              <li>Export reports</li>
              <li>Read-only access</li>
              <li>No modifications</li>
            </ul>
          </div>
        </div>
      </div>
>>>>>>> 9b2160aff06b2f4bae5dc4f518d19142922e4498
    </div>
  );
};

export default UserManagement;