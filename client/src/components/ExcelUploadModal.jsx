import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

const ExcelUploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [dragging, setDragging] = useState(false);
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
    setDragging(false);
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
      if (onUploadSuccess) onUploadSuccess(data.upload);
      setTimeout(() => onClose(), 1800);
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

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '20px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
          position: 'relative',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.2))',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem',
            border: '1px solid rgba(99,102,241,0.25)',
          }}>
            <UploadCloud size={26} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Import Excel File
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Upload any <strong style={{ color: '#94a3b8' }}>.xlsx</strong> or <strong style={{ color: '#94a3b8' }}>.xls</strong> file — any format, any columns. Data is permanently stored.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? '#818cf8' : file ? '#34d399' : 'rgba(99,102,241,0.4)'}`,
            borderRadius: '14px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging
              ? 'rgba(99,102,241,0.1)'
              : file
              ? 'rgba(52,211,153,0.05)'
              : 'rgba(99,102,241,0.04)',
            transition: 'all 0.3s ease',
            transform: dragging ? 'scale(1.01)' : 'scale(1)',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />

          {status.type === 'success' ? (
            <>
              <CheckCircle2 size={48} color="#34d399" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: '#34d399', fontWeight: 600, fontSize: '1rem' }}>Upload Successful!</p>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.3rem' }}>Closing window…</p>
            </>
          ) : file ? (
            <>
              <FileSpreadsheet size={48} color="#818cf8" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.3rem' }}>{file.name}</p>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {(file.size / 1024).toFixed(1)} KB — ready to upload
              </p>
            </>
          ) : (
            <>
              <UploadCloud size={48} color="#4f5887" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.3rem' }}>
                Click or drag & drop your Excel file
              </p>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Supports any Excel format — .xlsx · .xls
              </p>
            </>
          )}
        </div>

        {/* Error status */}
        {status.type === 'error' && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(239,68,68,0.1)',
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.88rem',
          }}>
            <AlertCircle size={16} />
            {status.message}
          </div>
        )}

        {/* Actions */}
        {status.type !== 'success' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={file ? handleReset : onClose}
              disabled={loading}
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: '9px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {file ? 'Clear' : 'Cancel'}
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              style={{
                padding: '0.7rem 1.6rem',
                borderRadius: '9px',
                border: 'none',
                background: !file || loading
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                cursor: !file || loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: file && !loading ? '0 4px 15px rgba(99,102,241,0.35)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Uploading…
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Upload & Store
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
};

export default ExcelUploadModal;
