import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UploadsSidebar from './components/UploadsSidebar';
import UploadTender from './components/UploadTender';
import TenderTable from './components/TenderTable';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SearchBar from './components/SearchBar';
import TenderDetail from './components/TenderDetail';
import TenderFormModal from './components/TenderFormModal';
import './index.css';

const STRICT_COLUMNS = [
  "area",
  "unit_project",
  "type_of_contract",
  "contract_period",
  "published_date",
  "bidders_participated",
  "qualified_bidder",
  "successful_bidder_name",
  "successful_bidder_address",
  "successful_bidder_contact",
  "successful_bidder_email"
];

function App() {
  const [uploads, setUploads] = useState([]);
  const [activeUploadId, setActiveUploadId] = useState('ALL');
  
  const [tableData, setTableData] = useState([]);
  const [tableTitle, setTableTitle] = useState('');
  const [tableSubtitle, setTableSubtitle] = useState('');

  const [searchParams, setSearchParams] = useState({ q: '', publishedDate: '' });
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeTender, setActiveTender] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTender, setEditingTender] = useState(null);

  const fetchUploads = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tenders/uploads');
      setUploads(res.data);
    } catch (error) {
      console.error("Failed to fetch uploads", error);
    }
  }, []);

  const fetchTableData = useCallback(async () => {
    try {
      const hasSearch = searchParams.q || searchParams.publishedDate;
      
      if (hasSearch) {
        setIsSearching(true);
        const params = new URLSearchParams();
        if (searchParams.q) params.append('q', searchParams.q);
        if (searchParams.publishedDate) params.append('publishedDate', searchParams.publishedDate);
        if (activeUploadId !== 'ALL') params.append('uploadId', activeUploadId);

        const res = await axios.get(`http://localhost:5000/api/tenders/search?${params.toString()}`);
        setTableData(res.data);
        setTableTitle('Search Results');
        setTableSubtitle(`Found ${res.data.length} rows matching your criteria`);
      } else {
        setIsSearching(false);
        if (activeUploadId === 'ALL') {
          const res = await axios.get('http://localhost:5000/api/tenders/rows');
          setTableData(res.data);
          setTableTitle('All Combined Data');
          setTableSubtitle(`${res.data.length} total rows from ${uploads.length} files`);
        } else {
          const uploadMeta = uploads.find(u => u.id === activeUploadId);
          if (!uploadMeta) return;

          const res = await axios.get(`http://localhost:5000/api/tenders/uploads/${activeUploadId}/rows`);
          setTableData(res.data);
          setTableTitle(uploadMeta.file_name);
          setTableSubtitle(`Uploaded ${new Date(uploadMeta.uploaded_at).toLocaleDateString()}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch table data", error);
    }
  }, [activeUploadId, uploads, searchParams]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  useEffect(() => {
    if (activeUploadId !== 'ALL' && uploads.length > 0 && !uploads.find(u => u.id === activeUploadId)) {
      setActiveUploadId('ALL');
    } else {
      fetchTableData();
    }
  }, [activeUploadId, uploads, fetchTableData]);

  const handleUploadSuccess = (newUpload) => {
    fetchUploads();
    setActiveUploadId(newUpload.id);
  };

  const handleSearch = (params) => {
    setSearchParams(params);
    setActiveTender(null);
  };
  
  const handleViewTender = (tender) => {
    setActiveTender(tender);
  };
  
  const handleBackToList = () => {
    setActiveTender(null);
  };

  const handleAddTender = () => {
    setEditingTender(null);
    setIsFormModalOpen(true);
  };

  const handleEditTender = (tender) => {
    setEditingTender(tender);
    setIsFormModalOpen(true);
  };

  const handleDeleteTender = async (tender) => {
    try {
      await axios.delete(`http://localhost:5000/api/tenders/rows/${tender.id}`);
      fetchTableData();
    } catch (error) {
      console.error("Failed to delete tender", error);
      alert("Failed to delete tender");
    }
  };

  const handleSaveTender = async (formData) => {
    try {
      if (editingTender) {
        await axios.put(`http://localhost:5000/api/tenders/rows/${editingTender.id}`, formData);
      } else {
        await axios.post(`http://localhost:5000/api/tenders/rows`, formData);
      }
      setIsFormModalOpen(false);
      setEditingTender(null);
      fetchTableData();
    } catch (error) {
      console.error("Failed to save tender", error);
      alert("Failed to save tender");
    }
  };

  return (
    <div className="app-layout">
      <UploadsSidebar 
        uploads={uploads} 
        activeUploadId={activeUploadId}
        onSelectUpload={(id) => {
          setActiveUploadId(id);
          setActiveTender(null);
        }}
        onUploadsChange={fetchUploads}
      />
      
      <main className="main-content">
        {activeTender ? (
          <TenderDetail tender={activeTender} onBack={handleBackToList} />
        ) : (
          <>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <UploadTender onUploadSuccess={handleUploadSuccess} />
              <button 
                onClick={handleAddTender}
                style={{
                  background: "#34d399",
                  color: "#1e1e2e",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  height: "fit-content"
                }}
              >
                + Add Tender Manually
              </button>
            </div>
            
            <SearchBar onSearch={handleSearch} />
            
            {tableData && tableData.length > 0 && !isSearching && (
              <AnalyticsDashboard data={tableData} />
            )}
            
            <TenderTable 
              data={tableData}
              columns={STRICT_COLUMNS}
              title={tableTitle}
              subtitle={tableSubtitle}
              showSourceFile={activeUploadId === 'ALL' || isSearching}
              onViewTender={handleViewTender}
              onEditTender={handleEditTender}
              onDeleteTender={handleDeleteTender}
            />
            {isFormModalOpen && (
              <TenderFormModal 
                tender={editingTender}
                onSave={handleSaveTender}
                onClose={() => setIsFormModalOpen(false)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
