import React, { useState, useEffect } from 'react';

function Profile({ fetchWithAuth, user, setUser, setAlert }) {
  // Profile form details
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    timezone: 'UTC'
  });

  // Password update form details
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Fetch latest profile from backend on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchWithAuth('/auth/profile');
        const data = await res.json();
        
        setProfileData({
          name: data.name || '',
          email: data.profile?.contact?.email || '',
          phone: data.profile?.contact?.phone || '',
          city: data.profile?.address?.city || '',
          state: data.profile?.address?.location?.state || '',
          country: data.profile?.address?.location?.country || '',
          timezone: data.profile?.address?.timezone?.name || 'UTC'
        });
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    };
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await fetchWithAuth('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      // Update parent user state & localStorage
      setUser({
        ...user,
        name: data.name,
        email: data.email
      });
      
      setAlert({ message: 'Profile details updated successfully!', type: 'success' });
    } catch (err) {
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAlert({ message: 'New passwords do not match!', type: 'error' });
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await fetchWithAuth('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password update failed');

      setAlert({ message: 'Password updated successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setAlert({ message: err.message, type: 'error' });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Account Profile</h1>
          <p className="page-subtitle">Configure your personal preferences, details, and security keys</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Profile details form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-bright)' }}>
            Personal Details
          </h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={profileData.name} 
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={profileData.email} 
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={profileData.phone} 
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
                placeholder="+1-202-555-0143"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileData.city} 
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileData.state} 
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileData.country} 
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileData.timezone} 
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              disabled={loadingProfile}
            >
              {loadingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Security / Password form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-bright)' }}>
            Security Settings
          </h2>
          
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>

            <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
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

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-secondary" 
              style={{ marginTop: '1rem', borderColor: 'var(--color-primary)', color: 'var(--text-bright)' }}
              disabled={loadingPassword}
            >
              {loadingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Profile;
