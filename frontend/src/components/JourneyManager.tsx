import React, { useState, useEffect } from 'react';

interface Journey {
  id: number;
  journey_type: 'ONWARD' | 'RETURN';
  journey_date: string;
  is_active: boolean;
}

interface JourneyPricing {
  id: number;
  journey_type: 'ONWARD' | 'RETURN';
  age_criteria: string;
  amount: number;
  is_active: boolean;
}

const JourneyManager: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [pricing, setPricing] = useState<JourneyPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dates' | 'pricing'>('dates');

  // Journey Dates Management
  const [newJourney, setNewJourney] = useState({
    journey_type: 'ONWARD' as 'ONWARD' | 'RETURN',
    journey_date: '',
    is_active: true
  });

  // Pricing Management
  const [newPricing, setNewPricing] = useState({
    journey_type: 'ONWARD' as 'ONWARD' | 'RETURN',
    age_criteria: 'M-12 & Below',
    amount: 290,
    is_active: true
  });

  const ageCriteriaOptions = [
    'M-12 & Below',
    'F-12 & Below', 
    'M-Above 12 & Below 65',
    'M-65 & Above',
    'F-Above 12 & Below 75',
    'M&F-75 & Above'
  ];

  useEffect(() => {
    fetchJourneys();
    fetchPricing();
  }, []);

  const fetchJourneys = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/journeys/', { credentials: 'include' });
      const data = await response.json();
      setJourneys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setJourneys([]);
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/journey-pricing/', { credentials: 'include' });
      const data = await response.json();
      setPricing(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setPricing([]);
    }
  };

  const addJourney = async () => {
    if (!newJourney.journey_date) {
      alert('Please select a date');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending journey data:', newJourney);
      const response = await fetch('http://127.0.0.1:8000/api/journeys/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newJourney)
      });

      console.log('Response status:', response.status);
      const responseData = await response.text();
      console.log('Response data:', responseData);

      if (response.ok) {
        fetchJourneys();
        setNewJourney({ journey_type: 'ONWARD', journey_date: '', is_active: true });
        alert('Journey date added successfully!');
      } else {
        console.error('Error response:', responseData);
        alert(`Error adding journey date: ${responseData}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addPricing = async () => {
    setLoading(true);
    try {
      console.log('Sending pricing data:', newPricing);
      
      // Check if pricing already exists
      const existingPricing = pricing.find(p => 
        p.journey_type === newPricing.journey_type && 
        p.age_criteria === newPricing.age_criteria
      );
      
      let response;
      if (existingPricing) {
        // Update existing pricing
        response = await fetch(`http://127.0.0.1:8000/api/journey-pricing/${existingPricing.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ amount: newPricing.amount, is_active: newPricing.is_active })
        });
      } else {
        // Create new pricing
        response = await fetch('http://127.0.0.1:8000/api/journey-pricing/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newPricing)
        });
      }

      console.log('Pricing response status:', response.status);
      const responseData = await response.text();
      console.log('Pricing response data:', responseData);

      if (response.ok) {
        fetchPricing();
        alert(existingPricing ? 'Pricing updated successfully!' : 'Pricing added successfully!');
      } else {
        console.error('Error response:', responseData);
        alert(`Error ${existingPricing ? 'updating' : 'adding'} pricing: ${responseData}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteJourney = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this journey date? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/journeys/${id}/`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchJourneys();
        alert('Journey date deleted successfully!');
      } else {
        alert('Error deleting journey date');
      }
    } catch (error) {
      console.error('Error deleting journey:', error);
      alert('Network error while deleting journey date');
    }
  };

  const toggleJourneyStatus = async (id: number, is_active: boolean) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/journeys/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !is_active })
      });

      if (response.ok) {
        fetchJourneys();
      }
    } catch (error) {
      console.error('Error updating journey status:', error);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <h2>🗓️ Journey & Pricing Management</h2>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #dee2e6' }}>
        <button
          onClick={() => setActiveTab('dates')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'dates' ? '#007bff' : 'transparent',
            color: activeTab === 'dates' ? 'white' : '#007bff',
            border: 'none',
            borderBottom: activeTab === 'dates' ? '2px solid #007bff' : 'none',
            cursor: 'pointer'
          }}
        >
          Journey Dates
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'pricing' ? '#007bff' : 'transparent',
            color: activeTab === 'pricing' ? 'white' : '#007bff',
            border: 'none',
            borderBottom: activeTab === 'pricing' ? '2px solid #007bff' : 'none',
            cursor: 'pointer'
          }}
        >
          Journey Pricing
        </button>
      </div>

      {/* Journey Dates Tab */}
      {activeTab === 'dates' && (
        <div>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h3>Add New Journey Date</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Journey Type</label>
                <select
                  value={newJourney.journey_type}
                  onChange={(e) => setNewJourney({...newJourney, journey_type: e.target.value as 'ONWARD' | 'RETURN'})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="ONWARD">Onward Journey</option>
                  <option value="RETURN">Return Journey</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
                <input
                  type="date"
                  value={newJourney.journey_date}
                  onChange={(e) => setNewJourney({...newJourney, journey_date: e.target.value})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={newJourney.is_active}
                    onChange={(e) => setNewJourney({...newJourney, is_active: e.target.checked})}
                  />
                  Active
                </label>
              </div>
              
              <button
                onClick={addJourney}
                disabled={loading}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Add Date
              </button>
            </div>
          </div>

          {/* Journey Dates List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            <div>
              <h4 style={{ color: '#007bff' }}>📅 Onward Journey Dates</h4>
              {journeys.filter(j => j.journey_type === 'ONWARD').map(journey => (
                <div key={journey.id} style={{
                  padding: '10px',
                  backgroundColor: journey.is_active ? '#e8f5e8' : '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{new Date(journey.journey_date).toLocaleDateString('en-IN')}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => toggleJourneyStatus(journey.id, journey.is_active)}
                      style={{
                        backgroundColor: journey.is_active ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {journey.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteJourney(journey.id)}
                      style={{
                        backgroundColor: '#6c757d',
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

            <div>
              <h4 style={{ color: '#28a745' }}>📅 Return Journey Dates</h4>
              {journeys.filter(j => j.journey_type === 'RETURN').map(journey => (
                <div key={journey.id} style={{
                  padding: '10px',
                  backgroundColor: journey.is_active ? '#e8f5e8' : '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{new Date(journey.journey_date).toLocaleDateString('en-IN')}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => toggleJourneyStatus(journey.id, journey.is_active)}
                      style={{
                        backgroundColor: journey.is_active ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {journey.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteJourney(journey.id)}
                      style={{
                        backgroundColor: '#6c757d',
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
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h3>Add/Update Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Journey Type</label>
                <select
                  value={newPricing.journey_type}
                  onChange={(e) => setNewPricing({...newPricing, journey_type: e.target.value as 'ONWARD' | 'RETURN'})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="ONWARD">Onward Journey</option>
                  <option value="RETURN">Return Journey</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Age Criteria</label>
                <select
                  value={newPricing.age_criteria}
                  onChange={(e) => setNewPricing({...newPricing, age_criteria: e.target.value})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  {ageCriteriaOptions.map(criteria => (
                    <option key={criteria} value={criteria}>{criteria}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount (₹)</label>
                <input
                  type="number"
                  value={newPricing.amount}
                  onChange={(e) => setNewPricing({...newPricing, amount: parseFloat(e.target.value) || 0})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              
              <button
                onClick={addPricing}
                disabled={loading}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Add/Update
              </button>
            </div>
          </div>

          {/* Pricing Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#007bff' }}>💰 Onward Journey Pricing</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Age Criteria</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.filter(p => p.journey_type === 'ONWARD' && p.is_active).map(price => (
                    <tr key={price.id}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{price.age_criteria}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>₹{price.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 style={{ color: '#28a745' }}>💰 Return Journey Pricing</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Age Criteria</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.filter(p => p.journey_type === 'RETURN' && p.is_active).map(price => (
                    <tr key={price.id}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{price.age_criteria}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>₹{price.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyManager;