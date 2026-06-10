import React, { useState, useMemo } from "react";
import { Search, Database, MapPin, Users, Calendar } from "lucide-react";

const TenderTable = ({ data, columns, title, subtitle, showSourceFile = false }) => {
  const [globalSearch, setGlobalSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [contractorFilter, setContractorFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const areaCol = 'area';
  const contractorCol = 'successful_bidder_name';
  const dateCol = 'published_date';

  const uniqueAreas = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(r => r[areaCol]).filter(Boolean))].sort();
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    
    return data.filter((row) => {
      // 1. Global Search
      const q = globalSearch.toLowerCase();
      const matchGlobal = !q || Object.values(row).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      );

      // 2. Specific Filters
      const matchArea = !areaFilter || (String(row[areaCol] || '') === areaFilter);
      const matchContractor = !contractorFilter || (String(row[contractorCol] || '').toLowerCase().includes(contractorFilter.toLowerCase()));
      
      let matchDate = true;
      if (startDateFilter || endDateFilter) {
        const dateVal = row[dateCol];
        if (dateVal) {
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) {
             const rowDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
             
             let afterStart = true;
             if (startDateFilter) {
               const [sY, sM, sD] = startDateFilter.split('-');
               const start = new Date(sY, sM - 1, sD);
               afterStart = rowDate >= start;
             }

             let beforeEnd = true;
             if (endDateFilter) {
               const [eY, eM, eD] = endDateFilter.split('-');
               const end = new Date(eY, eM - 1, eD);
               beforeEnd = rowDate <= end;
             }
             
             matchDate = afterStart && beforeEnd;
          } else {
             matchDate = true; 
          }
        } else {
          matchDate = false;
        }
      }

      return matchGlobal && matchArea && matchContractor && matchDate;
    });
  }, [data, globalSearch, areaFilter, contractorFilter, startDateFilter, endDateFilter]);

  const hasData = data && data.length > 0;

  const displayColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    if (showSourceFile && !columns.includes('_sourceFile')) {
      return ['_sourceFile', ...columns];
    }
    return columns;
  }, [columns, showSourceFile]);

  // Map database column names to human-readable headers
  const getHeaderName = (col) => {
    if (col === '_sourceFile') return 'Source File';
    const names = {
      area: 'Area',
      unit_project: 'Unit/Project',
      type_of_contract: 'Contract Type',
      contract_period: 'Contract Period',
      published_date: 'Published Date',
      bidders_participated: 'Bidders Participated',
      qualified_bidder: 'Qualified Bidders',
      successful_bidder_name: 'Successful Bidder Name',
      successful_bidder_address: 'Bidder Address',
      successful_bidder_contact: 'Bidder Contact',
      successful_bidder_email: 'Bidder Email'
    };
    return names[col] || col;
  };

  return (
    <div className="glass-panel" style={{ padding: 0 }}>
      <div style={{ padding: "2rem 2rem 1.25rem" }}>
        
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontWeight: 600, marginBottom: "0.3rem" }}>
              {title}
            </h2>
            <p style={{ color: "#888", fontSize: "0.88rem" }}>
              {subtitle || (hasData ? `${filteredRows.length} rows` : "No data to display")}
            </p>
          </div>
        </div>

        {hasData && (
          <div className="filters-container">
            <div className="filter-group">
              <Search className="filter-icon" size={16} />
              <input
                type="text"
                placeholder="Search all columns…"
                className="filter-input"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <MapPin className="filter-icon" size={16} />
              <select 
                className="filter-input" 
                value={areaFilter} 
                onChange={(e) => setAreaFilter(e.target.value)}
                style={{ paddingLeft: '2.5rem', appearance: 'none' }}
              >
                <option value="">All Areas</option>
                {uniqueAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Users className="filter-icon" size={16} />
              <input
                type="text"
                placeholder="Filter by Contractor…"
                className="filter-input"
                value={contractorFilter}
                onChange={(e) => setContractorFilter(e.target.value)}
              />
            </div>

            <div className="filter-group" style={{ display: 'flex', gap: '0.5rem', minWidth: '300px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', top: '-18px', fontSize: '0.75rem', color: '#888' }}>From</span>
                <input
                  type="date"
                  className="filter-input"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', top: '-18px', fontSize: '0.75rem', color: '#888' }}>To</span>
                <input
                  type="date"
                  className="filter-input"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="tender-table">
          {hasData && displayColumns.length > 0 && (
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: "center", color: "#666" }}>#</th>
                {displayColumns.map((col) => (
                  <th key={col}>
                    {getHeaderName(col)}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {!hasData ? (
              <tr>
                <td colSpan={displayColumns.length + 1 || 1} className="empty-state">
                  <Database size={52} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                  <p style={{ fontSize: "1rem", marginBottom: "0.3rem" }}>No data selected</p>
                  <p style={{ color: "#666", fontSize: "0.85rem" }}>
                    Upload a file or select one from the sidebar.
                  </p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length + 1} className="empty-state">
                  <Search size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                  <p>No rows match your search.</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr key={`${row._sourceFile || ''}-${row.id}-${idx}`}>
                  <td style={{ textAlign: "center", color: "#555", fontSize: "0.8rem" }}>
                    {idx + 1}
                  </td>
                  {displayColumns.map((col) => {
                    let val = row[col];
                    let display = val === null || val === undefined || val === "" ? "—" : String(val);
                    
                    if (val && typeof val === 'string' && val.includes('T')) {
                      const d = new Date(val);
                      if (!isNaN(d.getTime())) {
                        display = d.toLocaleDateString();
                      }
                    }

                    return (
                      <td
                        key={col}
                        title={display !== "—" ? display : undefined}
                        style={display === "—" ? { color: "#444" } : undefined}
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
      </div>

      {hasData && filteredRows.length > 0 && (
        <div style={{
          padding: "0.75rem 2rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "#555",
          fontSize: "0.8rem",
          textAlign: "right",
        }}>
          Showing {filteredRows.length} of {data.length} rows
        </div>
      )}
    </div>
  );
};

export default TenderTable;