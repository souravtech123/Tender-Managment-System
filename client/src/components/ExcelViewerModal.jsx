import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X, FileSpreadsheet, Search, Download, Loader2, AlertCircle, TableProperties } from 'lucide-react';

const ExcelViewerModal = ({ upload, onClose }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchRawRows = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(
          `http://localhost:5000/api/tenders/uploads/${upload.id}/raw-rows`
        );
        setRows(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load Excel data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRawRows();
  }, [upload.id]);

  // Derive columns dynamically from all rows (union of all keys)
  const columns = useMemo(() => {
    if (!rows.length) return [];
    const keySet = new Set();
    rows.forEach(row => Object.keys(row).forEach(k => keySet.add(k)));
    return Array.from(keySet);
  }, [rows]);

  // Filter rows by search
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(row =>
      Object.values(row).some(
        v => v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!columns.length || !filteredRows.length) return;
    const header = columns.join(',');
    const body = filteredRows.map(row =>
      columns.map(col => {
        const val = row[col] ?? '';
        const s = String(val).replace(/"/g, '""');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
      }).join(',')
    ).join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${upload.file_name.replace(/\.[^.]+$/, '')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.99) 0%, rgba(20,30,55,0.99) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexShrink: 0,
        }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(99,102,241,0.15))',
            borderRadius: '12px',
            border: '1px solid rgba(52,211,153,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileSpreadsheet size={22} color="#34d399" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {upload.file_name}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
              {loading ? 'Loading…' : `${rows.length} rows · ${columns.length} columns`}
              {' · '}Uploaded {new Date(upload.uploaded_at).toLocaleDateString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search rows…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  padding: '0.55rem 1rem 0.55rem 2.25rem',
                  fontSize: '0.88rem',
                  outline: 'none',
                  width: '200px',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={!filteredRows.length}
              title="Export to CSV"
              style={{
                background: 'rgba(52,211,153,0.12)',
                border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: '8px',
                color: '#34d399',
                padding: '0.55rem 1rem',
                cursor: filteredRows.length ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.85rem', fontWeight: 500,
                opacity: filteredRows.length ? 1 : 0.4,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(52,211,153,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(52,211,153,0.12)'}
            >
              <Download size={15} />
              CSV
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#94a3b8',
                width: '36px', height: '36px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem', color: '#64748b' }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
              <p>Loading Excel data…</p>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem', color: '#f87171' }}>
              <AlertCircle size={40} />
              <p>{error}</p>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Note: Only files uploaded after this update will have raw Excel data available.
              </p>
            </div>
          ) : !rows.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1rem', color: '#64748b' }}>
              <TableProperties size={40} />
              <p>No data found in this file.</p>
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  {columns.map(col => (
                    <th key={col} style={thStyle} title={col}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <Search size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                      <p>No rows match your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdStyle, color: '#475569', fontSize: '0.8rem', width: '48px', textAlign: 'center' }}>
                        {idx + 1}
                      </td>
                      {columns.map(col => {
                        const val = row[col];
                        const display = val === null || val === undefined || val === '' ? '—' : String(val);
                        return (
                          <td
                            key={col}
                            style={{ ...tdStyle, color: display === '—' ? '#334155' : '#cbd5e1', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            title={display !== '—' ? display : undefined}
                          >
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && !error && rows.length > 0 && (
          <div style={{
            padding: '0.75rem 2rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#475569',
            fontSize: '0.82rem',
            flexShrink: 0,
          }}>
            <span>
              {search ? `${filteredRows.length} of ${rows.length} rows` : `${rows.length} rows`} · {columns.length} columns
            </span>
            <span style={{ color: '#334155' }}>Raw Excel View — all original columns preserved</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
};

const thStyle = {
  background: 'rgba(15,23,42,0.95)',
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontWeight: 600,
  color: '#64748b',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  maxWidth: '220px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const tdStyle = {
  padding: '0.65rem 1rem',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
};

export default ExcelViewerModal;
