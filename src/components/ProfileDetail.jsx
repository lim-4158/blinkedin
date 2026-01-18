import { CORE_COMPETENCIES } from '../config/api';
import './ProfileDetail.css';

const ProfileDetail = ({ profile, onClose }) => {
  if (!profile) return null;

  const coreCompetencies = CORE_COMPETENCIES.map(comp => ({
    name: comp.replace('Core ', ''),
    value: profile[comp]
  }));

  const workingStyles = Object.entries(profile)
    .filter(([key]) => key.startsWith('Style '))
    .map(([key, value]) => ({
      category: key.replace('Style ', ''),
      value
    }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="profile-header">
          <h1>{profile['BlinkedIn Name']}</h1>
          <p className="bio">{profile['One Line Bio']}</p>
        </div>

        <div className="profile-section">
          <h2>Core Competencies</h2>
          <div className="competencies-detail">
            {coreCompetencies.map(comp => (
              <div key={comp.name} className="competency-detail-item">
                <div className="competency-label">
                  <span className="competency-name">{comp.name}</span>
                  <span className="competency-score">{comp.value}/10</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${comp.value * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2>Working Style</h2>
          <div className="styles-detail">
            {workingStyles.map(style => (
              <div key={style.category} className="style-detail-item">
                <div className="style-category">{style.category}</div>
                <div className="style-value">{style.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
