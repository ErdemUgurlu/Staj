import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import BroadcastForm from './components/BroadcastForm';
import ActivityLogs from './components/ActivityLogs';
import RadarDisplay from './components/RadarDisplay';

function App() {
  const [broadcasts, setBroadcasts] = useState([]);
  const activityLogsRef = useRef(null);

  const fetchBroadcasts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/forms/type/Broadcast');
      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data);
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    
    // Refresh broadcasts every 5 seconds
    const interval = setInterval(fetchBroadcasts, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleFormSubmitted = () => {
    fetchBroadcasts();
    // Only refresh logs when a form is actually submitted
    if (activityLogsRef.current) {
      activityLogsRef.current();
    }
  };

  const handleRefreshRequest = (logsRefreshCallback) => {
    // Store the logs refresh callback but don't call it automatically
    activityLogsRef.current = logsRefreshCallback;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mesaj Yönetim Sistemi</h1>
      </header>

      <main className="app-main">
        <div className="form-section">
          <BroadcastForm onFormSubmitted={handleFormSubmitted} />
        </div>

        <div className="radar-section">
          <RadarDisplay broadcasts={broadcasts} onBroadcastUpdated={fetchBroadcasts} />
        </div>

        <div className="logs-section">
          <ActivityLogs onRefreshRequest={handleRefreshRequest} />
        </div>
      </main>
    </div>
  );
}

export default App;
