import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const TenderFormModal = ({ tender, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    area: '',
    unit_project: '',
    type_of_contract: '',
    contract_period: '',
    published_date: '',
    bidders_participated: 0,
    qualified_bidder: 0,
    successful_bidder_name: '',
    successful_bidder_address: '',
    successful_bidder_contact: '',
    successful_bidder_email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tender) {
      setFormData({
        area: tender.area || '',
        unit_project: tender.unit_project || '',
        type_of_contract: tender.type_of_contract || '',
        contract_period: tender.contract_period || '',
        published_date: tender.published_date ? new Date(tender.published_date).toISOString().split('T')[0] : '',
        bidders_participated: tender.bidders_participated || 0,
        qualified_bidder: tender.qualified_bidder || 0,
        successful_bidder_name: tender.successful_bidder_name || '',
        successful_bidder_address: tender.successful_bidder_address || '',
        successful_bidder_contact: tender.successful_bidder_contact || '',
        successful_bidder_email: tender.successful_bidder_email || ''
      });
    }
  }, [tender]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'bidders_participated' || name === 'qualified_bidder') ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    padding: "0.6rem",
    borderRadius: "6px",
    outline: "none",
    marginBottom: "1rem"
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    color: "#888",
    marginBottom: "0.3rem"
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "2rem"
    }}>
      <div style={{
        background: "#1e1e2e", borderRadius: "12px", width: "100%", maxWidth: "800px",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden"
      }}>
        <div style={{
          padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ margin: 0, color: "#eee", fontSize: "1.1rem" }}>
            {tender ? 'Edit Tender' : 'Add Tender Manually'}
          </h3>
          <button onClick={onClose} style={{
            background: "transparent", color: "#aaa", border: "none", cursor: "pointer"
          }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "1.5rem", overflowY: "auto", flexGrow: 1 }}>
          <form id="tender-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Unit / Project Name</label>
              <input type="text" name="unit_project" value={formData.unit_project} onChange={handleChange} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Area</label>
              <input type="text" name="area" value={formData.area} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Type of Contract</label>
              <input type="text" name="type_of_contract" value={formData.type_of_contract} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Contract Period</label>
              <input type="text" name="contract_period" value={formData.contract_period} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Published Date</label>
              <input type="date" name="published_date" value={formData.published_date} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Bidders Participated</label>
              <input type="number" name="bidders_participated" value={formData.bidders_participated} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Qualified Bidders</label>
              <input type="number" name="qualified_bidder" value={formData.qualified_bidder} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <h4 style={{ color: '#34d399', marginBottom: '1rem' }}>Successful Bidder Details</h4>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Name</label>
              <input type="text" name="successful_bidder_name" value={formData.successful_bidder_name} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Address</label>
              <input type="text" name="successful_bidder_address" value={formData.successful_bidder_address} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Contact</label>
              <input type="text" name="successful_bidder_contact" value={formData.successful_bidder_contact} onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" name="successful_bidder_email" value={formData.successful_bidder_email} onChange={handleChange} style={inputStyle} />
            </div>

          </form>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button type="button" onClick={onClose} style={{
            background: "rgba(255, 255, 255, 0.05)", color: "#eee", padding: "0.6rem 1.2rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer"
          }}>
            Cancel
          </button>
          <button type="submit" form="tender-form" disabled={isSubmitting} style={{
            background: "#60a5fa", color: "#1e1e2e", padding: "0.6rem 1.2rem", borderRadius: "6px", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Tender'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenderFormModal;
