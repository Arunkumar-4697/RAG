import React, { useState } from 'react';

function App() {
  const [healthResult, setHealthResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/health`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHealthResult(data);
    } catch (err) {
      console.error("Health check failed:", err);
      setError("Failed to reach backend.");
      setHealthResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Chat With Your Docs</h1>
      
      <button 
        onClick={checkHealth}
        disabled={loading}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
      >
        {loading ? 'Checking...' : 'Check Health'}
      </button>

      <div style={{ marginTop: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
        {error && (
          <div style={{ color: 'red' }}>
            <p>Backend : Unreachable</p>
            <p>Qdrant : Unknown</p>
          </div>
        )}
        
        {healthResult && (
          <div>
            <p>Backend : {healthResult.backend ? 'Healthy' : 'Unhealthy'}</p>
            <p>Qdrant : {healthResult.qdrant ? 'Healthy' : 'Unreachable'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
