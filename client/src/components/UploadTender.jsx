import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadTender = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus({ type: '', message: '' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setStatus({ type: '', message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/tenders/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setStatus({ type: 'success', message: data.message });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadSuccess) {
        onUploadSuccess(data.upload);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Upload failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus({ type: '', message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="upload-container glass-panel" style={{ marginBottom: 0 }}>
      <h2 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Import Excel File</h2>
      <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Data will be permanently stored and added to your workspace.
      </p>

      {/* Drop zone */}
      <div
        className={`upload-area ${file ? 'active' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
        />
        {file ? (
          <>
            <FileSpreadsheet className="upload-icon" size={48} />
            <p className="upload-text">{file.name}</p>
            <p className="upload-subtext">{(file.size / 1024).toFixed(2)} KB — ready to store</p>
          </>
        ) : (
          <>
            <UploadCloud className="upload-icon" size={48} />
            <p className="upload-text">Click or drag Excel file here</p>
            <p className="upload-subtext">Supports .xlsx and .xls</p>
          </>
        )}
      </div>

      {/* Status */}
      {status.message && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: status.type === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          fontSize: '0.9rem',
        }}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {status.message}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {file && (
          <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
            Cancel
          </button>
        )}
        <button
          className="btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? <span className="loader"></span> : 'Store Data'}
        </button>
      </div>
    </div>
  );
};

export default UploadTender;
