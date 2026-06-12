import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileSearch, BarChart, ArrowRight } from 'lucide-react';
import '../index.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ animation: "fadeIn 0.5s ease", padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "4rem 2rem", marginBottom: "3rem" }}>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          background: "rgba(59, 130, 246, 0.1)", 
          border: "1px solid rgba(59, 130, 246, 0.2)",
          color: "#60a5fa",
          padding: "0.4rem 1rem",
          borderRadius: "50px",
          fontSize: "0.9rem",
          fontWeight: 500,
          marginBottom: "1.5rem"
        }}>
          <Shield size={16} /> Secure & Reliable
        </div>
        
        <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "1.5rem", lineHeight: 1.2 }}>
          Central Coalfields Limited <br />
          <span style={{ background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Contract Management Cell
          </span>
        </h1>
        
        <p style={{ color: "#aaa", fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>
          A unified, modern platform to seamlessly manage tender uploads, evaluate bids, and extract powerful insights from your contracting data.
        </p>

        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
          <button 
            onClick={() => navigate('/tenders')}
            className="btn-primary"
            style={{ padding: "1rem 2rem", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            Manage Tenders <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => navigate('/analytics')}
            style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#eee",
              padding: "1rem 2rem", 
              borderRadius: "8px",
              fontSize: "1.1rem",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            View Analytics <BarChart size={20} />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", transition: "transform 0.3s", cursor: "default" }}
             onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
             onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
          <div style={{ background: "rgba(59, 130, 246, 0.15)", width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "#60a5fa" }}>
            <FileSearch size={32} />
          </div>
          <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#fff" }}>Smart Tender Tracking</h3>
          <p style={{ color: "#888", lineHeight: 1.5 }}>
            Upload complex Excel files, automatically parse data into structured tables, and securely attach PDF or Word documents to individual tenders.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", transition: "transform 0.3s", cursor: "default" }}
             onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
             onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
          <div style={{ background: "rgba(192, 132, 252, 0.15)", width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "#c084fc" }}>
            <BarChart size={32} />
          </div>
          <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#fff" }}>Data-Driven Analytics</h3>
          <p style={{ color: "#888", lineHeight: 1.5 }}>
            Visualize contract trends, evaluate bidder participation rates, and make informed decisions with an interactive analytics dashboard.
          </p>
        </div>

      </section>

    </div>
  );
};

export default LandingPage;
