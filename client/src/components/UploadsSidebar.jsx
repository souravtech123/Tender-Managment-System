import React from 'react';
import { Database, FileSpreadsheet, Trash2, CalendarDays, Hash, Eye } from 'lucide-react';
import axios from 'axios';

const UploadsSidebar = ({ uploads, activeUploadId, onSelectUpload, onUploadsChange, onViewExcel }) => {
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this file and all its data?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/tenders/uploads/${id}`);
      onUploadsChange();
    } catch (error) {
      alert("Failed to delete upload");
      console.error(error);
    }
  };

  const totalRows = uploads.reduce((sum, u) => sum + u.row_count, 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Tender Hub</h1>
        <p>Permanent Data Storage</p>
      </div>

      <div className="uploads-list">
        {/* All Data Option */}
        <div
          className={`upload-item ${activeUploadId === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectUpload('ALL')}
        >
          <div className="upload-item-title" style={{ color: activeUploadId === 'ALL' ? '#818cf8' : 'white' }}>
            <Database size={18} /> All Combined Data
          </div>
          <div className="upload-item-meta">
            <span><Hash size={12} /> {totalRows} total rows</span>
            <span>{uploads.length} files</span>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

        {/* Individual Uploads */}
        {uploads.length === 0 ? (
          <p style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
            No files uploaded yet.
          </p>
        ) : (
          uploads.map((upload) => (
            <div
              key={upload.id}
              className={`upload-item ${activeUploadId === upload.id ? 'active' : ''}`}
              onClick={() => onSelectUpload(upload.id)}
            >
              <div className="upload-item-title">
                <FileSpreadsheet size={16} style={{ minWidth: 16 }} />
                {upload.file_name}
              </div>
              <div className="upload-item-meta">
                <span title="Row Count"><Hash size={12} /> {upload.row_count}</span>
                <span title="Upload Date">
                  <CalendarDays size={12} />
                  {new Date(upload.uploaded_at).toLocaleDateString()}
                </span>
              </div>

              {/* View Raw Excel button */}
              <button
                className="view-excel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewExcel) onViewExcel(upload);
                }}
                title="View Raw Excel"
              >
                <Eye size={13} />
                View Excel
              </button>

              <button
                className="delete-btn"
                onClick={(e) => handleDelete(e, upload.id)}
                title="Delete File"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default UploadsSidebar;
