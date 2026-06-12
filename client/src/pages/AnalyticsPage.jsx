import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import '../index.css';

const AnalyticsPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tenders/rows');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "1rem", animation: "fadeIn 0.3s ease", maxWidth: "1600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 0.5rem 0", background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Data Analytics
        </h2>
        <p style={{ color: "#aaa", margin: 0 }}>
          Gain insights from across all {data.length} tender records in your system.
        </p>
      </div>
      
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "5rem", color: "#666" }}>Loading analytics data...</div>
      ) : data.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "5rem", color: "#aaa" }}>
          No tender data available for analysis. Go to the Tenders page to add data.
        </div>
      ) : (
        <AnalyticsDashboard data={data} />
      )}
    </div>
  );
};

export default AnalyticsPage;
