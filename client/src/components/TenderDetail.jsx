import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, UploadCloud, FileText, Trash2, Calendar, MapPin, Briefcase, Users, Phone, Mail, Building } from 'lucide-react';
import '../index.css';

const TenderDetail = ({ tender, onBack }) => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [docName, setDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    if (tender && tender.id) {
      fetchDocuments();
    }
  }, [tender]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tenders/${tender.id}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setErrorMsg('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      setErrorMsg("Please enter a document name.");
      return;
    }
    if (!selectedFile) {
      setErrorMsg("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("document_name", docName);
    formData.append("file", selectedFile);

    setIsUploading(true);
    setErrorMsg('');

    try {
      await axios.post(`http://localhost:5000/api/tenders/${tender.id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setDocName('');
      setSelectedFile(null);
      // Reset file input
      document.getElementById('file-upload-input').value = "";
      fetchDocuments();
    } catch (err) {
      console.error("Upload error", err);
      setErrorMsg(err.response?.data?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  if (!tender) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString();
  };

  return (
    <div className="tender-detail-container" style={{ animation: "fadeIn 0.3s ease", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Header section */}
      <div className="glass-panel" style={{ padding: "1.5rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button 
          onClick={onBack}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#eee",
            padding: "0.5rem",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
          onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, margin: 0, color: "#fff" }}>
            {tender.unit_project || "Tender Details"}
          </h2>
          <p style={{ color: "#aaa", fontSize: "0.9rem", margin: "0.2rem 0 0 0" }}>
            ID: {tender.id} | Upload Source: {tender._sourceFile || 'Unknown'}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        
        {/* Tender Information */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Briefcase size={18} /> Basic Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", color: "#ddd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}><MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />Area:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.area || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}><Briefcase size={14} style={{ display: "inline", marginRight: "4px" }} />Contract Type:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.type_of_contract || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}><Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />Contract Period:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.contract_period || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}><Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />Published Date:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{formatDate(tender.published_date)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}><Users size={14} style={{ display: "inline", marginRight: "4px" }} />Participated / Qualified:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.bidders_participated || 0} / {tender.qualified_bidder || 0}</span>
            </div>
          </div>

          <h3 style={{ fontSize: "1.1rem", marginTop: "1.5rem", marginBottom: "1rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building size={18} /> Successful Bidder
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", color: "#ddd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}>Name:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.successful_bidder_name || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}>Address:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.successful_bidder_address || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}><Phone size={14} style={{ display: "inline", marginRight: "4px" }} />Contact:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.successful_bidder_contact || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#888" }}><Mail size={14} style={{ display: "inline", marginRight: "4px" }} />Email:</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{tender.successful_bidder_email || "—"}</span>
            </div>
          </div>
        </div>

        {/* Document Upload & List Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#c084fc", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UploadCloud size={18} /> Upload New Document
            </h3>
            
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.3rem" }}>Document Name</label>
                <input 
                  type="text" 
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g., Notice Inviting Tender, Contract Agreement"
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.3rem" }}>Document File (PDF / Word)</label>
                <input 
                  id="file-upload-input"
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px dashed rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    outline: "none",
                    cursor: "pointer"
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit"
                disabled={isUploading}
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.6rem",
                  marginTop: "0.5rem",
                  opacity: isUploading ? 0.7 : 1
                }}
              >
                <UploadCloud size={18} />
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", flexGrow: 1 }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#f87171", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={18} /> Uploaded Documents ({documents.length})
            </h3>
            
            {documents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "#666" }}>
                <FileText size={40} style={{ opacity: 0.3, margin: "0 auto 1rem" }} />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {documents.map((doc) => (
                  <div key={doc.id} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    padding: "0.8rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <FileText size={20} color="#f87171" />
                      <div>
                        <div style={{ fontWeight: 500, color: "#eee" }}>{doc.document_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>
                          {doc.file_name} • {formatDate(doc.uploaded_at)}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setViewingDoc(doc)}
                      style={{
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#60a5fa",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "2rem"
        }}>
          <div style={{
            background: "#1e1e2e",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "1000px",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ margin: 0, color: "#eee", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={18} color="#60a5fa" />
                {viewingDoc.document_name}
              </h3>
              <button 
                onClick={() => setViewingDoc(null)}
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  border: "none",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
              >
                Close
              </button>
            </div>
            <div style={{ flexGrow: 1, backgroundColor: "#fff", position: "relative" }}>
              <iframe 
                src={`http://localhost:5000${viewingDoc.file_path}`} 
                title={viewingDoc.document_name}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderDetail;
