import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import ProfileCard from './ProfileCard';
import ProfileDetail from './ProfileDetail';
import './ProfileDirectory.css';

const ProfileDirectory = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}?action=list`);

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      setError(err.message || 'Failed to load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-directory">
        <div className="loading">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-directory">
        <div className="error">{error}</div>
        <button onClick={fetchProfiles} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="profile-directory">
      <div className="directory-header">
        <h1>BlinkedIn Directory</h1>
        <p className="directory-subtitle">
          {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} found
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="empty-state">
          <p>No profiles yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="profiles-grid">
          {profiles.map((profile, index) => (
            <ProfileCard
              key={index}
              profile={profile}
              onClick={() => setSelectedProfile(profile)}
            />
          ))}
        </div>
      )}

      {selectedProfile && (
        <ProfileDetail
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};

export default ProfileDirectory;
