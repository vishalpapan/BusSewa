import React, { useState } from 'react';
import { passengerAPI } from '../services/api';

const ImportData: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResults(null);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    return data;
  };

  const mapToPassengerData = (row: any) => {
    return {
      name: row['Name'] || row['name'] || '',
      gender: (row['Gender'] || row['gender'] || '').charAt(0).toUpperCase(), // M or F
      age_criteria: row['Age Criteria'] || row['age_criteria'] || '',
      category: row['Category'] || row['category'] || 'Satsang',
      mobile_no: row['Mobile No'] || row['mobile_no'] || row['Mobile'] || '',
      aadhar_number: row['Aadhar Number'] || row['aadhar_number'] || row['Aadhar'] || '',
      aadhar_received: (row['Aadhar Received'] || row['aadhar_received'] || '').toLowerCase() === 'yes'
    };
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const text = await file.text();
      const csvData = parseCSV(text);
      
      if (csvData.length === 0) {
        alert('No valid data found in the file');
        setLoading(false);
        return;
      }

      const importResults = {
        total: csvData.length,
        success: 0,
        errors: [] as string[]
      };

      for (let i = 0; i < csvData.length; i++) {
        try {
          const passengerData = mapToPassengerData(csvData[i]);
          
          // Validate required fields
          if (!passengerData.name || !passengerData.gender || !passengerData.age_criteria) {
            importResults.errors.push(`Row ${i + 2}: Missing required fields (Name, Gender, Age Criteria)`);
            continue;
          }

          await passengerAPI.create(passengerData);
          importResults.success++;
        } catch (error: any) {
          const errorMsg = error.response?.data ? 
            Object.values(error.response.data).flat().join(', ') : 
            error.message;
          importResults.errors.push(`Row ${i + 2}: ${errorMsg}`);
        }
      }

      setResults(importResults);
    } catch (error) {
      alert('Error reading file: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Name,Gender,Age Criteria,Category,Mobile No,Aadhar Number,Aadhar Received
Rajesh Kumar,Male,M-Above 12 & Below 65,Satsang,9876543210,123456789012,Yes
Priya Sharma,Female,F-Above 12 & Below 75,Sewadal,9876543211,123456789013,No
Arjun Patel,Male,M-12 & Below,Bal Sewadal,9876543212,,Yes
Sunita Devi,Female,M&F-75 & Above,Satsang,9876543213,123456789015,No
Ravi Singh,Male,M-65 & Above,Satsang,9876543214,123456789016,Yes`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'passenger_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>📥 Import Passengers</h2>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>📋 Import Instructions</h3>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          <li>Download the template CSV file below</li>
          <li>Fill in your passenger data following the format</li>
          <li>Save as CSV file (UTF-8 encoding recommended)</li>
          <li>Upload the file using the import button</li>
        </ol>
      </div>

      {/* Required Format */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>📝 Required CSV Format & Valid Values</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ backgroundColor: '#e9ecef' }}>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Column Name</th>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Required</th>
              <th style={{ padding: '8px', border: '1px solid #dee2e6' }}>Valid Values / Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>Name</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', color: 'red' }}>✅ Required</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>Any text (e.g., "John Doe", "Priya Sharma")</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>Gender</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', color: 'red' }}>✅ Required</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6' }}><strong>Male</strong> or <strong>Female</strong> (case insensitive)</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>Age Criteria</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', color: 'red' }}>✅ Required</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>
                <strong>Exact values only:</strong><br/>
                • M-12 & Below<br/>
                • M-Above 12 & Below 65<br/>
                • M-65 & Above<br/>
                • F-12 & Below<br/>
                • F-Above 12 & Below 75<br/>
                • M&F-75 & Above
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>Category</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', color: 'green' }}>❌ Optional</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6' }}><strong>Satsang</strong> (default), <strong>Sewadal</strong>, or <strong>Bal Sewadal</strong></td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>Mobile No</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', color: 'green' }}>❌ Optional</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>10-digit number (e.g., 9876543210)</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>Aadhar Number</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', color: 'green' }}>❌ Optional</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6' }}>12-digit number (e.g., 123456789012)</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>Aadhar Received</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6', color: 'green' }}>❌ Optional</td>
              <td style={{ padding: '8px', border: '1px solid #dee2e6' }}><strong>Yes</strong> or <strong>No</strong> (default: No)</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Sample Data */}
      <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>📋 Sample CSV Data</h3>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '4px', 
          fontFamily: 'monospace', 
          fontSize: '12px',
          border: '1px solid #dee2e6',
          overflowX: 'auto'
        }}>
          Name,Gender,Age Criteria,Category,Mobile No,Aadhar Number,Aadhar Received<br/>
          Rajesh Kumar,Male,M-Above 12 & Below 65,Satsang,9876543210,123456789012,Yes<br/>
          Priya Sharma,Female,F-Above 12 & Below 75,Sewadal,9876543211,123456789013,No<br/>
          Arjun Patel,Male,M-12 & Below,Bal Sewadal,9876543212,,Yes<br/>
          Sunita Devi,Female,M&F-75 & Above,Satsang,9876543213,123456789015,No
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={downloadTemplate}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📥 Download Template
        </button>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          style={{ padding: '12px' }}
        />

        <button
          onClick={handleImport}
          disabled={!file || loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Importing...' : '📤 Import Data'}
        </button>
      </div>

      {/* File Info */}
      {file && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <strong>Selected File:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{
          backgroundColor: results.errors.length > 0 ? '#fff3cd' : '#d4edda',
          border: `1px solid ${results.errors.length > 0 ? '#ffeaa7' : '#c3e6cb'}`,
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3>📊 Import Results</h3>
          <p><strong>Total Records:</strong> {results.total}</p>
          <p><strong>Successfully Imported:</strong> {results.success}</p>
          <p><strong>Errors:</strong> {results.errors.length}</p>
          
          {results.errors.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4>❌ Error Details:</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {results.errors.map((error: string, index: number) => (
                  <li key={index} style={{ color: '#856404', fontSize: '14px' }}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Warning */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Important Notes</h3>
        <ul style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
          <li>Duplicate entries will be created if the same data is imported multiple times</li>
          <li>Invalid data will be skipped with error messages</li>
          <li>Large files may take time to process</li>
          <li>Always backup your data before importing</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportData;