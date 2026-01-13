import React, { useState, useEffect } from 'react';
import { passengerAPI } from '../services/api';

interface PassengerFormProps {
  onSuccess?: () => void;
  passengerId?: number | null;
}

const PassengerForm: React.FC<PassengerFormProps> = ({ onSuccess, passengerId }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    age_criteria: '',
    category: '',
    mobile_no: '',
    aadhar_number: '',
    aadhar_received: false,
    related_to: '',
    relationship: '',
  });
  const [passengers, setPassengers] = useState<any[]>([]);
  const [showFamilyOptions, setShowFamilyOptions] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // Fetch passenger data if in edit mode
  useEffect(() => {
    if (passengerId) {
      fetchPassengerDetails(passengerId);
    } else {
      // Reset form if no passengerId (Add mode)
      setFormData({
        name: '',
        gender: '',
        age: '',
        age_criteria: '',
        category: '',
        mobile_no: '',
        aadhar_number: '',
        aadhar_received: false,
        related_to: '',
        relationship: '',
      });
      setAadharFile(null);
      setShowFamilyOptions(false);
    }
  }, [passengerId]);

  const fetchPassengerDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await passengerAPI.getById(id);
      const data = response.data;
      setFormData({
        name: data.name,
        gender: data.gender,
        age: data.age?.toString() || '',
        age_criteria: data.age_criteria,
        category: data.category,
        mobile_no: data.mobile_no || '',
        aadhar_number: data.aadhar_number || '',
        aadhar_received: data.aadhar_received || false,
        related_to: data.related_to || '',
        relationship: data.relationship || '',
      });
      if (data.related_to) setShowFamilyOptions(true);
    } catch (error) {
      console.error('Error fetching passenger details:', error);
      alert('Error loading passenger data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeCriteria = (age: number, gender: string) => {
    if (!age || !gender) return '';

    if (gender === 'M') {
      if (age <= 12) return 'M-12 & Below';
      if (age >= 75) return 'M&F-75 & Above';
      if (age >= 65) return 'M-65 & Above';
      return 'M-Above 12 & Below 65';
    } else {
      if (age <= 12) return 'F-12 & Below';
      if (age >= 75) return 'M&F-75 & Above';
      return 'F-Above 12 & Below 75';
    }
  };

  const isAadharRequired = (ageCriteria: string) => {
    const requiredCategories = ['M-65 & Above', 'M&F-75 & Above'];
    return requiredCategories.includes(ageCriteria);
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      const response = await passengerAPI.getAll();
      setPassengers(response.data);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const newValue = type === 'checkbox' ? checked : value;
    const updatedData = { ...formData, [name]: newValue };

    // Auto-calculate age criteria when age or gender changes
    if (name === 'age' || name === 'gender') {
      const age = name === 'age' ? parseInt(value) : parseInt(formData.age);
      const gender = name === 'gender' ? value : formData.gender;
      updatedData.age_criteria = calculateAgeCriteria(age, gender);
    }

    setFormData(updatedData);
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

      if (passengerId) {
        await passengerAPI.update(passengerId, submitData);
        alert('Passenger updated successfully!');
      } else {
        await passengerAPI.create(submitData);
        alert('Passenger added successfully!');
      }

      setFormData({
        name: '',
        gender: '',
        age: '',
        age_criteria: '',
        category: '',
        mobile_no: '',
        aadhar_number: '',
        aadhar_received: false,
        related_to: '',
        relationship: '',
      });
      setShowFamilyOptions(false);
      fetchPassengers(); // Refresh passenger list
      setAadharFile(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      alert(`Error ${passengerId ? 'updating' : 'adding'} passenger: ` + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2>{passengerId ? 'Edit Passenger' : 'Add New Passenger'}</h2>
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
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="120"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Age Criteria (Auto-calculated):</label>
          <input
            type="text"
            value={formData.age_criteria}
            readOnly
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Automatically calculated based on age and gender
          </small>
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
          <label>Aadhar Number {isAadharRequired(formData.age_criteria) ? '(Required)' : '(Optional)'}:</label>
          <input
            type="text"
            name="aadhar_number"
            value={formData.aadhar_number}
            onChange={handleChange}
            placeholder="Enter 12-digit Aadhar number"
            maxLength={12}
            required={isAadharRequired(formData.age_criteria)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderColor: isAadharRequired(formData.age_criteria) ? '#dc3545' : '#ddd'
            }}
          />
          <small style={{ color: isAadharRequired(formData.age_criteria) ? '#dc3545' : '#666', fontSize: '12px' }}>
            {isAadharRequired(formData.age_criteria)
              ? '⚠️ Aadhar number is mandatory for this age category'
              : 'Optional: 12-digit Aadhar number (numbers only)'
            }
          </small>
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

        {/* Family Grouping */}
        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={showFamilyOptions}
              onChange={(e) => setShowFamilyOptions(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            This passenger is related to another passenger
          </label>
        </div>

        {showFamilyOptions && (
          <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label>Related to:</label>
              <select
                name="related_to"
                value={formData.related_to}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select a passenger</option>
                {passengers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.mobile_no} ({p.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Relationship:</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Grandchild">Grandchild</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
              Family members will be seated together when possible
            </small>
          </div>
        )}

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
          {loading ? 'Saving...' : (passengerId ? 'Update Passenger' : 'Add Passenger')}
        </button>
      </form>
    </div>
  );
};

export default PassengerForm;