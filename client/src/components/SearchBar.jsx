import React, { useState } from 'react';
import { Search, Calendar } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [publishedDate, setPublishedDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ q: query, publishedDate });
  };

  const handleClear = () => {
    setQuery('');
    setPublishedDate('');
    onSearch({ q: '', publishedDate: '' });
  };

  return (
    <div style={{
      margin: '1.5rem 0',
      background: 'rgba(30, 30, 30, 0.6)',
      backdropFilter: 'blur(10px)',
      padding: '1.2rem',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 2, 
          minWidth: '250px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px', 
          padding: '0.6rem 1rem',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'border-color 0.2s ease'
        }}>
          <Search size={20} style={{ color: '#818cf8', marginRight: '0.75rem' }} />
          <input 
            type="text" 
            placeholder="Search by keywords (e.g., area, project, bidder)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              color: '#f3f4f6', 
              outline: 'none', 
              width: '100%', 
              fontSize: '0.95rem' 
            }}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flex: 1,
          minWidth: '180px',
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '8px', 
          padding: '0.6rem 1rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Calendar size={20} style={{ color: '#818cf8', marginRight: '0.75rem' }} />
          <input 
            type="date" 
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            title="Published Date"
            style={{ 
              border: 'none', 
              background: 'transparent', 
              color: '#f3f4f6', 
              outline: 'none', 
              width: '100%',
              colorScheme: 'dark',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" style={{ 
            padding: '0.6rem 1.5rem', 
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Search
          </button>
          <button type="button" onClick={handleClear} style={{ 
            padding: '0.6rem 1.2rem', 
            background: 'rgba(255,255,255,0.05)', 
            color: '#d1d5db', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
