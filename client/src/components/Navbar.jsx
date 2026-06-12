import React from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, BarChart2, Home } from 'lucide-react';
import '../index.css';

const Navbar = () => {
  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      marginBottom: '2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          C
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CCL CMC
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Contract Management Cell</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#aaa', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
        >
          <Home size={18} /> Home
        </NavLink>
        <NavLink 
          to="/tenders" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#aaa', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
        >
          <Briefcase size={18} /> Manage Tenders
        </NavLink>
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#aaa', fontWeight: 500, padding: '0.5rem 1rem', borderRadius: '8px', transition: 'all 0.2s' }}
        >
          <BarChart2 size={18} /> Analytics
        </NavLink>
      </div>
      
      {/* Dynamic styles injected for nav links */}
      <style>{`
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff !important;
        }
        .nav-link.active {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa !important;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
