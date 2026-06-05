import React, { useState, useEffect } from 'react';
import EmployeeForm from './EmployeeForm';

function EmployeeList({ fetchWithAuth, user, setAlert }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and filtering states
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // 3x3 layout
  const [totalCount, setTotalCount] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSort, setSelectedSort] = useState('');

  // Stats summary states
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    avgExp: 0,
    verifiedCount: 0
  });

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Fetch summary metrics on mount & when database changes
  const fetchSummaryStats = async () => {
    try {
      const [countRes, expRes, verifiedRes] = await Promise.all([
        fetchWithAuth('/stats/employees/count'),
        fetchWithAuth('/stats/employees/experience-average'),
        fetchWithAuth('/stats/employees/verified-count')
      ]);

      const countData = await countRes.json();
      const expData = await expRes.json();
      const verifiedData = await verifiedRes.json();

      setSummaryStats({
        total: countData.count || 0,
        avgExp: expData.averageExperience || 0,
        verifiedCount: verifiedData.count || verifiedData.verifiedCount || 0
      });
      setTotalCount(countData.count || 0);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  // Main fetch call for employees list
  const fetchEmployeesList = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      
      // If there's an active search query, call the dedicated search endpoint
      if (searchQuery.trim()) {
        endpoint = `/search/employees?q=${encodeURIComponent(searchQuery)}`;
      } else {
        // Build dynamic query parameters for standard paginated directory
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });

        if (selectedDomain) params.append('domain', selectedDomain);
        if (selectedSkill) params.append('primarySkill', selectedSkill);
        if (selectedSort) params.append('sort', selectedSort);

        endpoint = `/employees?${params.toString()}`;
      }

      const res = await fetchWithAuth(endpoint);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setAlert({ message: 'Error loading employee directory', type: 'error' });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger loading details
  useEffect(() => {
    fetchSummaryStats();
  }, []);

  useEffect(() => {
    fetchEmployeesList();
  }, [page, searchQuery, selectedDomain, selectedSkill, selectedSort]);

  // Handle Delete Employee
  const handleDelete = async (empId, empName) => {
    if (!window.confirm(`Are you sure you want to offboard ${empName}? This action is permanent.`)) {
      return;
    }

    try {
      const res = await fetchWithAuth(`/employees/${empId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      setAlert({ message: `${empName} offboarded successfully!`, type: 'success' });
      
      // Reload stats and current view
      fetchSummaryStats();
      fetchEmployeesList();
    } catch (err) {
      setAlert({ message: err.message, type: 'error' });
    }
  };

  // Helper function to extract skills/experience info from nested JSON response
  const getNestedSkills = (emp) => {
    // Attempt to drill down into the first project task assignment
    const nestedSkills = emp.profile?.projects?.[0]?.tasks?.[0]?.assignedTo?.skills;
    return {
      primary: nestedSkills?.primary || 'Generalist',
      secondary: nestedSkills?.secondary || [],
      experience: nestedSkills?.experience?.years ?? 0,
      verified: nestedSkills?.experience?.certifications?.meta?.verified ?? false
    };
  };

  const getInitials = (name) => {
    if (!name) return 'EE';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Callback after Add/Edit save is complete
  const handleSaveComplete = (savedData, actionType) => {
    fetchSummaryStats();
    fetchEmployeesList();
    setAlert({
      message: actionType === 'update' 
        ? 'Employee profile updated successfully!' 
        : 'New employee onboarded successfully!',
      type: 'success'
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('');
    setSelectedSkill('');
    setSelectedSort('');
    setPage(1);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">Manage, filter, and review team members across the organization</p>
        </div>
        
        {user?.role === 'Admin' && (
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              setEditingEmployee(null);
              setIsFormOpen(true);
            }}
          >
            <span>+</span> Onboard Employee
          </button>
        )}
      </div>

      {/* Metrics Summary Panels */}
      <div className="grid-3">
        <div className="stat-card glass-panel">
          <div>
            <span className="stat-label">Total Staff</span>
            <div className="stat-val">{summaryStats.total}</div>
          </div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card glass-panel">
          <div>
            <span className="stat-label">Average Experience</span>
            <div className="stat-val">{summaryStats.avgExp} Yrs</div>
          </div>
          <div className="stat-icon">📈</div>
        </div>

        <div className="stat-card glass-panel">
          <div>
            <span className="stat-label">Verified Certifications</span>
            <div className="stat-val">{summaryStats.verifiedCount}</div>
          </div>
          <div className="stat-icon">🏅</div>
        </div>
      </div>

      {/* Filtering & Searching Controls */}
      <div className="filter-bar glass-panel">
        <input 
          type="text" 
          className="form-control search-input" 
          placeholder="Search by name, skill, domain, city, country..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // Reset page on new search
          }}
        />

        <select 
          className="form-control filter-select"
          value={selectedDomain}
          onChange={(e) => {
            setSelectedDomain(e.target.value);
            setPage(1);
          }}
          disabled={!!searchQuery} // Backend handles custom searches or filters separately
        >
          <option value="">All Domains</option>
          <option value="Cloud">Cloud</option>
          <option value="DevOps">DevOps</option>
          <option value="AI">Artificial Intelligence</option>
          <option value="Fullstack">Fullstack</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
        </select>

        <select 
          className="form-control filter-select"
          value={selectedSkill}
          onChange={(e) => {
            setSelectedSkill(e.target.value);
            setPage(1);
          }}
          disabled={!!searchQuery}
        >
          <option value="">All Skills</option>
          <option value="React">React</option>
          <option value="NodeJS">NodeJS</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
          <option value="Kubernetes">Kubernetes</option>
          <option value="AWS">AWS</option>
        </select>

        <select 
          className="form-control filter-select"
          value={selectedSort}
          onChange={(e) => {
            setSelectedSort(e.target.value);
            setPage(1);
          }}
          disabled={!!searchQuery}
        >
          <option value="">Sort By</option>
          <option value="name">Name (A-Z)</option>
          <option value="experience">Experience (Low-High)</option>
          <option value="country">Country (A-Z)</option>
        </select>

        {(searchQuery || selectedDomain || selectedSkill || selectedSort) && (
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Staff Catalog */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
          <p>Loading database directory records...</p>
        </div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }} className="glass-panel">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: 'var(--text-bright)', marginBottom: '0.5rem' }}>No Employee Records Found</h3>
          <p>Try refining your search keyword or clearing the filters.</p>
        </div>
      ) : (
        <>
          <div className="grid-3">
            {employees.map((emp) => {
              const skillsInfo = getNestedSkills(emp);
              return (
                <div key={emp._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar" style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
                      {getInitials(emp.name)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-bright)', fontWeight: 600 }}>{emp.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span className="profile-role">ID: {emp.id || 'N/A'}</span>
                        <span className={`badge badge-role-${emp.role?.toLowerCase() === 'admin' ? 'admin' : 'employee'}`}>
                          {emp.role || 'Employee'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span>✉️</span> <a href={`mailto:${emp.profile?.contact?.email}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{emp.profile?.contact?.email}</a>
                    </div>
                    {emp.profile?.contact?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📞</span> <span>{emp.profile.contact.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills Grid */}
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>SKILLS & DOMAIN:</div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="skill-tag primary" title="Primary Skill">{skillsInfo.primary}</span>
                      {skillsInfo.secondary.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="skill-tag">{s}</span>
                      ))}
                      {skillsInfo.secondary.length > 3 && (
                        <span className="skill-tag" style={{ opacity: 0.7 }}>+{skillsInfo.secondary.length - 3} more</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Domain: <strong style={{ color: 'var(--text-main)' }}>{emp.profile?.projects?.[0]?.name || 'General'}</strong></span>
                      <span>Exp: <strong style={{ color: 'var(--text-main)' }}>{skillsInfo.experience} Years</strong></span>
                    </div>
                  </div>

                  {/* Location & Timezone info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 {emp.profile?.address?.city || 'N/A'}, {emp.profile?.address?.location?.state || 'N/A'} ({emp.profile?.address?.location?.country || 'N/A'})</span>
                      {emp.profile?.address?.timezone?.name && (
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>🕒 {emp.profile.address.timezone.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons for Admins */}
                  {user?.role === 'Admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.5rem' }}
                        onClick={() => handleDelete(emp._id, emp.name)}
                        title="Delete Employee"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Simple Pagination controls - hide pagination during search because search doesn't support pagination on backend */}
          {!searchQuery.trim() && (
            <div className="pagination">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              
              <span className="page-info">
                Page <strong>{page}</strong> of <strong>{Math.ceil(totalCount / limit) || 1}</strong>
              </span>

              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(p => (p * limit < totalCount ? p + 1 : p))}
                disabled={page * limit >= totalCount}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Add / Edit modal */}
      {isFormOpen && (
        <EmployeeForm 
          employee={editingEmployee}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveComplete}
          fetchWithAuth={fetchWithAuth}
        />
      )}
    </>
  );
}

export default EmployeeList;
