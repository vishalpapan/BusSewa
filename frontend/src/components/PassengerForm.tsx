import React, { useState } from 'react';
import { passengerAPI } from '../services/api';

interface PassengerFormProps {
  onSuccess?: () => void;
}

const PassengerForm: React.FC<PassengerFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age_criteria: '',
    category: '',
    mobile_no: '',
    aadhar_received: false,
  });
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAadharFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });
      
      // Add file if selected
      if (aadharFile) {
        submitData.append('aadhar_document', aadharFile);
      }
      
      await passengerAPI.create(submitData);
      alert('Passenger added successfully!');
      setFormData({
        name: '',
        gender: '',
        age_criteria: '',
        category: '',
        mobile_no: '',
        aadhar_received: false,
      });
      setAadharFile(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      alert('Error adding passenger: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2>Add New Passenger</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Age Criteria:</label>
          <select
            name="age_criteria"
            value={formData.age_criteria}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Age Criteria</option>
            <option value="M-12 & Below">Male - 12 & Below</option>
            <option value="M-Above 12 & Below 65">Male - Above 12 & Below 65</option>
            <option value="M-65 & Above">Male - 65 & Above</option>
            <option value="F-12 & Below">Female - 12 & Below</option>
            <option value="F-Above 12 & Below 75">Female - Above 12 & Below 75</option>
            <option value="M&F-75 & Above">Male & Female - 75 & Above</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Category</option>
            <option value="Satsang">Satsang</option>
            <option value="Sewadal">Sewadal</option>
            <option value="Bal Sewadal">Bal Sewadal</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Mobile Number:</label>
          <input
            type="tel"
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              name="aadhar_received"
              checked={formData.aadhar_received}
              onChange={handleChange}
              style={{ marginRight: '8px' }}
            />
            Aadhar Card Received (Physical Copy)
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Upload Aadhar Document (Optional):</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Accepted formats: PDF, JPG, PNG, WEBP (Max 5MB)
            {aadharFile && (
              <span style={{ color: '#28a745', display: 'block' }}>
                ✅ Selected: {aadharFile.name} ({(aadharFile.size / 1024 / 1024).toFixed(1)}MB)
              </span>
            )}
          </small>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding...' : 'Add Passenger'}
        </button>
      </form>
    </div>
  );
};

export default PassengerForm;