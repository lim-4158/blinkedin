import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import RadialChart from './RadialChart';
import './RadialPage.css';

const PROFILE_COLORS = ['#0077b5', '#e74c3c', '#27ae60'];

const RadialPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError(err.message || 'Failed to load profiles.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProfileSelection = (profile) => {
    const isSelected = selectedProfiles.some(
      p => p['BlinkedIn Name'] === profile['BlinkedIn Name']
    );

    if (isSelected) {
      setSelectedProfiles(prev =>
        prev.filter(p => p['BlinkedIn Name'] !== profile['BlinkedIn Name'])
      );
    } else if (selectedProfiles.length < 3) {
      setSelectedProfiles(prev => [...prev, profile]);
    }
  };

  const isSelected = (profile) => {
    return selectedProfiles.some(
      p => p['BlinkedIn Name'] === profile['BlinkedIn Name']
    );
  };

  const getSelectionIndex = (profile) => {
    return selectedProfiles.findIndex(
      p => p['BlinkedIn Name'] === profile['BlinkedIn Name']
    );
  };

  const clearSelection = () => {
    setSelectedProfiles([]);
  };

  if (loading) {
    return (
      <div className="radial-page">
        <div className="loading">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="radial-page">
        <div className="error">{error}</div>
        <button onClick={fetchProfiles} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="radial-page">
      <header className="radial-header">
        <h1>Team Compatibility Chart</h1>
        <p className="subtitle">Compare up to 3 profiles to see how strengths complement each other</p>
      </header>

      <div className="radial-content">
        <aside className="profile-selector">
          <div className="selector-header">
            <h2>Select Profiles</h2>
            <span className="selection-count">{selectedProfiles.length}/3 selected</span>
          </div>

          {selectedProfiles.length > 0 && (
            <button onClick={clearSelection} className="clear-btn">
              Clear Selection
            </button>
          )}

          <div className="profile-list">
            {profiles.map(profile => {
              const selected = isSelected(profile);
              const selectionIdx = getSelectionIndex(profile);
              const disabled = !selected && selectedProfiles.length >= 3;

              return (
                <div
                  key={profile['BlinkedIn Name']}
                  className={`profile-item ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => !disabled && toggleProfileSelection(profile)}
                  style={selected ? { borderColor: PROFILE_COLORS[selectionIdx] } : {}}
                >
                  <div className="profile-info">
                    <span
                      className="color-indicator"
                      style={{ backgroundColor: selected ? PROFILE_COLORS[selectionIdx] : 'transparent' }}
                    />
                    <div className="profile-text">
                      <span className="profile-name">{profile['BlinkedIn Name']}</span>
                      <span className="profile-bio">{profile['One Line Bio']}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {}}
                    disabled={disabled}
                    className="profile-checkbox"
                  />
                </div>
              );
            })}
          </div>
        </aside>

        <main className="chart-area">
          {selectedProfiles.length === 0 ? (
            <div className="empty-chart">
              <p>Select profiles from the list to compare their competencies</p>
            </div>
          ) : (
            <>
              <RadialChart profiles={selectedProfiles} colors={PROFILE_COLORS} />
              <div className="chart-legend">
                {selectedProfiles.map((profile, idx) => (
                  <div key={profile['BlinkedIn Name']} className="legend-item">
                    <span
                      className="legend-color"
                      style={{ backgroundColor: PROFILE_COLORS[idx] }}
                    />
                    <span className="legend-name">{profile['BlinkedIn Name']}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RadialPage;
