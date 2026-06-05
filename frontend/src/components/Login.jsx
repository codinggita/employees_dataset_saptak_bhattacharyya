import React, { useState } from 'react';

function Login({ setToken, setUser, setAlert, apiBase }) {
  // Mode can be: 'login', 'register', 'forgot-password', 'reset-password'
  const [mode, setMode] = useState('login');
  
  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('Employee');
  const [department, setDepartment] = useState('Engineering');
  const [salary, setSalary] = useState(80000);
  const [primarySkill, setPrimarySkill] = useState('');
  const [domain, setDomain] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  // Password reset fields
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        
        setToken(data.token);
        setUser(data);
        setAlert({ message: `Welcome back, ${data.name}!`, type: 'success' });
      } 
      
      else if (mode === 'register') {
        const payload = {
          name,
          email,
          password,
          role,
          department,
          salary: Number(salary),
          primarySkill,
          domain,
          city,
          state,
          country,
          timezone
        };
        const res = await fetch(`${apiBase}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        
        setToken(data.token);
        setUser(data);
        setAlert({ message: `Successfully registered! Welcome, ${data.name}!`, type: 'success' });
      } 
      
      else if (mode === 'forgot-password') {
        const res = await fetch(`${apiBase}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error requesting OTP');
        
        setAlert({ message: `OTP sent to your email! (Simulated OTP: ${data.otp})`, type: 'success' });
        setMode('reset-password');
      } 
      
      else if (mode === 'reset-password') {
        const res = await fetch(`${apiBase}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error resetting password');
        
        setAlert({ message: 'Password reset successful! Please login with your new password.', type: 'success' });
        setMode('login');
        setPassword('');
        setOtp('');
        setNewPassword('');
      }
    } catch (err) {
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-header">
        <div className="auth-logo">EH</div>
        <h2 className="auth-title">
          {mode === 'login' && 'Sign in to Employee Hub'}
          {mode === 'register' && 'Create standard account'}
          {mode === 'forgot-password' && 'Forgot password'}
          {mode === 'reset-password' && 'Reset your password'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'login' && 'Access employee profiles, analytics and statistics'}
          {mode === 'register' && 'Fill details below to register on the platform'}
          {mode === 'forgot-password' && 'Enter your email to receive a dynamic OTP'}
          {mode === 'reset-password' && 'Enter the OTP and your new secret password'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Registration Form Only fields */}
        {mode === 'register' && (
          <>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="John Doe"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select 
                  className="form-control" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Skill</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={primarySkill} 
                  onChange={(e) => setPrimarySkill(e.target.value)} 
                  placeholder="e.g. React"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  placeholder="Engineering"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Salary (USD/yr)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={salary} 
                  onChange={(e) => setSalary(e.target.value)} 
                  placeholder="80000"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Domain</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)} 
                  placeholder="e.g. Healthcare"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={timezone} 
                  onChange={(e) => setTimezone(e.target.value)} 
                  placeholder="e.g. America/New_York"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Boston"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  placeholder="MA"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  placeholder="USA"
                  required
                />
              </div>
            </div>
          </>
        )}

        {/* Universal Email input */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-control" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="name@company.com"
          />
        </div>

        {/* Login and Register Password Input */}
        {(mode === 'login' || mode === 'register') && (
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              {mode === 'login' && (
                <button 
                  type="button" 
                  className="auth-toggle-btn" 
                  style={{ fontSize: '0.75rem' }} 
                  onClick={() => setMode('forgot-password')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
        )}

        {/* OTP Input for Reset Password */}
        {mode === 'reset-password' && (
          <>
            <div className="form-group">
              <label className="form-label">One-Time Password (OTP)</label>
              <input 
                type="text" 
                className="form-control" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                placeholder="6-digit verification code"
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
          </>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : (
            <>
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && 'Register Account'}
              {mode === 'forgot-password' && 'Send Verification Code'}
              {mode === 'reset-password' && 'Submit New Password'}
            </>
          )}
        </button>
      </form>

      <div className="auth-toggle">
        {mode === 'login' && (
          <>
            Don't have an account?{' '}
            <button type="button" className="auth-toggle-btn" onClick={() => setMode('register')}>
              Sign up
            </button>
          </>
        )}
        {mode === 'register' && (
          <>
            Already have an account?{' '}
            <button type="button" className="auth-toggle-btn" onClick={() => setMode('login')}>
              Sign in
            </button>
          </>
        )}
        {(mode === 'forgot-password' || mode === 'reset-password') && (
          <button type="button" className="auth-toggle-btn" onClick={() => setMode('login')}>
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;
