import React, { useState, useEffect } from 'react';

function Analytics({ fetchWithAuth, setAlert }) {
  const [skills, setSkills] = useState([]);
  const [domains, setDomains] = useState([]);
  const [certs, setCerts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [skillsRes, domainsRes, certsRes, locationsRes] = await Promise.all([
          fetchWithAuth('/analytics/employees/top-skills'),
          fetchWithAuth('/analytics/employees/top-domains'),
          fetchWithAuth('/analytics/employees/top-certifications'),
          fetchWithAuth('/analytics/employees/location-analysis')
        ]);

        const skillsData = await skillsRes.json();
        const domainsData = await domainsRes.json();
        const certsData = await certsRes.json();
        const locationsData = await locationsRes.json();

        // Take top 6 for clean visual presentation
        setSkills(Array.isArray(skillsData) ? skillsData.slice(0, 6) : []);
        setDomains(Array.isArray(domainsData) ? domainsData.slice(0, 6) : []);
        setCerts(Array.isArray(certsData) ? certsData.slice(0, 6) : []);
        
        // Locations returns `{ _id: { country, state, city }, count }`
        setLocations(Array.isArray(locationsData) ? locationsData.slice(0, 6) : []);
      } catch (err) {
        setAlert({ message: 'Error loading analytical distribution reports', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Calculate highest count to scale charts
  const getMaxVal = (arr) => {
    if (!arr.length) return 1;
    return Math.max(...arr.map(item => item.count || item.projectCount || 0));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
        <p>Running MongoDB aggregation pipelines...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Reports</h1>
          <p className="page-subtitle">Real-time statistics compiled via MongoDB aggregation framework</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Top Skills Chart */}
        <div className="glass-panel chart-container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-bright)' }}>
            Top Technical Skills
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {skills.map((item, idx) => {
              const max = getMaxVal(skills);
              const percentage = ((item.count / max) * 100).toFixed(0);
              return (
                <div key={idx} className="bar-chart-row">
                  <span className="bar-label">{item._id || 'Unknown'}</span>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${percentage}%`, 
                        background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)' 
                      }} 
                    />
                  </div>
                  <span className="bar-value">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Domains Chart */}
        <div className="glass-panel chart-container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-bright)' }}>
            Top Industry Domains
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {domains.map((item, idx) => {
              const max = getMaxVal(domains);
              const percentage = ((item.count / max) * 100).toFixed(0);
              return (
                <div key={idx} className="bar-chart-row">
                  <span className="bar-label">{item._id || 'General'}</span>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${percentage}%`, 
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)' 
                      }} 
                    />
                  </div>
                  <span className="bar-value">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Certifications Chart */}
        <div className="glass-panel chart-container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-bright)' }}>
            Most Popular Certifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {certs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No active certifications recorded</p>
            ) : (
              certs.map((item, idx) => {
                const max = getMaxVal(certs);
                const percentage = ((item.count / max) * 100).toFixed(0);
                return (
                  <div key={idx} className="bar-chart-row">
                    <span className="bar-label" title={item._id}>{item._id || 'General'}</span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${percentage}%`, 
                          background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)' 
                        }} 
                      />
                    </div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Location Hotspots */}
        <div className="glass-panel chart-container">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--text-bright)' }}>
            Staff Location Density
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {locations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No location coordinates registered</p>
            ) : (
              locations.map((item, idx) => {
                const max = getMaxVal(locations);
                const percentage = ((item.count / max) * 100).toFixed(0);
                const locStr = `${item._id?.city || 'N/A'}, ${item._id?.state || 'N/A'} (${item._id?.country || 'N/A'})`;
                return (
                  <div key={idx} className="bar-chart-row">
                    <span className="bar-label" style={{ width: '180px' }} title={locStr}>{locStr}</span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${percentage}%`, 
                          background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)' 
                        }} 
                      />
                    </div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Analytics;
