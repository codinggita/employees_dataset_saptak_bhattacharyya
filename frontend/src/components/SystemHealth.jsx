import React, { useState, useEffect } from 'react';

function SystemHealth({ fetchWithAuth, user, setAlert }) {
  const [healthData, setHealthData] = useState(null);
  const [version, setVersion] = useState('');
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);

  const fetchSystemMetrics = async () => {
    try {
      const [healthRes, versionRes, configRes] = await Promise.all([
        fetchWithAuth('/employees/system/health'),
        fetchWithAuth('/employees/system/version'),
        fetchWithAuth('/employees/system/config')
      ]);

      const health = await healthRes.json();
      const ver = await versionRes.json();
      const conf = await configRes.json();

      setHealthData(health);
      setVersion(ver.version || '1.0.0');
      setConfig(conf);

      // Fetch logs if user is an Admin
      if (user?.role === 'Admin') {
        const logsRes = await fetchWithAuth('/employees/logs');
        const logsData = await logsRes.json();
        setLogs(Array.isArray(logsData) ? logsData : []);
      }
    } catch (err) {
      console.error('Failed to load system diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
  }, []);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const res = await fetchWithAuth('/employees/cache/clear', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cache clear failed');

      setAlert({ message: data.message || 'Cache cleared successfully!', type: 'success' });
    } catch (err) {
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setClearingCache(false);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚙️</div>
        <p>Polling system health and version configs...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Diagnostics</h1>
          <p className="page-subtitle">Real-time status check and server operational dashboards</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Diagnostics Summary */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-bright)' }}>
              Operational Health Status
            </h2>
            <div className="health-indicator">
              <span className="pulse-dot ok" />
              <span style={{ color: 'var(--color-success)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                {healthData?.status || 'ONLINE'}
              </span>
            </div>
          </div>

          <div className="health-list">
            <div className="health-item">
              <span className="health-label">System Uptime</span>
              <strong style={{ color: 'var(--text-bright)' }}>{formatUptime(healthData?.uptime)}</strong>
            </div>
            <div className="health-item">
              <span className="health-label">API Version</span>
              <strong style={{ color: 'var(--text-bright)' }}>v{version}</strong>
            </div>
            <div className="health-item">
              <span className="health-label">Environment Mode</span>
              <strong style={{ color: 'var(--text-bright)', textTransform: 'capitalize' }}>
                {config?.env || 'development'}
              </strong>
            </div>
            <div className="health-item">
              <span className="health-label">Timestamp</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : new Date().toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-bright)', marginBottom: '0.5rem', fontWeight: 600 }}>
              System Administration Action
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Clear compiled system indexes, file cache, and temporary in-memory collections.
            </p>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClearCache}
              disabled={clearingCache}
              style={{ borderColor: 'var(--color-primary)', color: 'var(--text-bright)' }}
            >
              {clearingCache ? 'Flushing cache...' : 'Flush System Cache'}
            </button>
          </div>
        </div>

        {/* Server Logs Console */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-bright)', marginBottom: '0.5rem' }}>
            System Audit Logging
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {user?.role === 'Admin' 
              ? 'Live tail logs of HTTP queries, JWT validations, and MVC schema changes'
              : 'Security clearance required to view audit logging channels.'}
          </p>

          {user?.role === 'Admin' ? (
            <>
              <div className="logs-viewer">
                {logs.length === 0 ? (
                  'No system logs generated yet.'
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#60a5fa' }}>[{new Date(log.time).toLocaleTimeString()}]</span>{' '}
                      <span style={{ color: '#9ca3af' }}>INFO:</span> {log.log || JSON.stringify(log)}
                    </div>
                  ))
                )}
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={fetchSystemMetrics}
                style={{ marginTop: '1rem', alignSelf: 'flex-start' }}
              >
                Refresh Log Console
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-bright)' }}>Access Restricted</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Only accounts with administrative role clearance are authorized to inspect the system log console.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SystemHealth;
