import React, { useState, useEffect } from 'react';

function EmployeeForm({ employee, onClose, onSave, fetchWithAuth }) {
  // Local states for all required validation fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Employee');
  const [department, setDepartment] = useState('Engineering');
  const [salary, setSalary] = useState(80000);
  const [primarySkill, setPrimarySkill] = useState('');
  const [secondarySkills, setSecondarySkills] = useState('');
  const [experience, setExperience] = useState(2);
  const [domain, setDomain] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to load employee data when editing
  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.profile?.contact?.email || '');
      setPhone(employee.profile?.contact?.phone || '');
      setRole(employee.role || 'Employee');
      
      // Handle skills nested object
      // Find the primary assignment task / skills
      const nestedSkills = employee.profile?.projects?.[0]?.tasks?.[0]?.assignedTo?.skills;
      setPrimarySkill(nestedSkills?.primary || '');
      
      // Secondary skills can be string array or comma separated
      if (Array.isArray(nestedSkills?.secondary)) {
        setSecondarySkills(nestedSkills.secondary.join(', '));
      } else {
        setSecondarySkills('');
      }

      setExperience(nestedSkills?.experience?.years ?? 0);
      
      // Domain (e.g. from domains list or project)
      setDomain(nestedSkills?.experience?.domains?.[0] || employee.profile?.projects?.[0]?.name || '');
      
      // Location
      setCity(employee.profile?.address?.city || '');
      setState(employee.profile?.address?.location?.state || '');
      setCountry(employee.profile?.address?.location?.country || '');
      setTimezone(employee.profile?.address?.timezone?.name || 'UTC');

      // Let's set defaults for backend practice-only fields: department and salary
      setDepartment(employee.department || 'Engineering');
      setSalary(employee.salary || 80000);
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Split secondary skills
    const secondaryList = secondarySkills
      ? secondarySkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Construct backend nested payload structure to pass validation and schema rules
    const payload = {
      name,
      email,
      phone,
      role,
      department,
      salary: Number(salary),
      primarySkill,
      secondarySkills: secondaryList,
      experience: Number(experience),
      domain,
      city,
      state,
      country,
      timezone
    };

    try {
      let url = '/employees';
      let method = 'POST';

      if (employee?._id) {
        url = `/employees/${employee._id}`;
        method = 'PUT'; // PUT replaces, which runs validateEmployee
      }

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');

      onSave(data, employee ? 'update' : 'create');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>
            {employee ? 'Edit Employee Profile' : 'Onboard New Employee'}
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="alert-box alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="john.doe@company.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+1-202-555-0143"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select 
                className="form-control" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input 
                type="text" 
                className="form-control" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                required 
                placeholder="Engineering"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Salary (USD/year) *</label>
              <input 
                type="number" 
                className="form-control" 
                value={salary} 
                onChange={(e) => setSalary(e.target.value)} 
                required 
                placeholder="80000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Primary Skill *</label>
              <input 
                type="text" 
                className="form-control" 
                value={primarySkill} 
                onChange={(e) => setPrimarySkill(e.target.value)} 
                required 
                placeholder="e.g. React"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secondary Skills (comma-separated)</label>
              <input 
                type="text" 
                className="form-control" 
                value={secondarySkills} 
                onChange={(e) => setSecondarySkills(e.target.value)} 
                placeholder="NodeJS, Express, MongoDB, Docker"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Years of Experience *</label>
              <input 
                type="number" 
                className="form-control" 
                value={experience} 
                onChange={(e) => setExperience(e.target.value)} 
                required 
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Industry Domain *</label>
              <input 
                type="text" 
                className="form-control" 
                value={domain} 
                onChange={(e) => setDomain(e.target.value)} 
                required 
                placeholder="e.g. Healthcare"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input 
                type="text" 
                className="form-control" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                required 
                placeholder="Boston"
              />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input 
                type="text" 
                className="form-control" 
                value={state} 
                onChange={(e) => setState(e.target.value)} 
                required 
                placeholder="MA"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input 
                type="text" 
                className="form-control" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                required 
                placeholder="USA"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Timezone *</label>
            <input 
              type="text" 
              className="form-control" 
              value={timezone} 
              onChange={(e) => setTimezone(e.target.value)} 
              required 
              placeholder="America/New_York"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;
