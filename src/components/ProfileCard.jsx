import './ProfileCard.css';

const ProfileCard = ({ profile, onClick }) => {
  const topCompetencies = Object.entries(profile)
    .filter(([key]) => key.startsWith('Core '))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, value]) => ({ name: key.replace('Core ', ''), value }));

  return (
    <div className="profile-card" onClick={onClick}>
      <div className="card-header">
        <h3>{profile['BlinkedIn Name']}</h3>
      </div>

      <div className="card-bio">
        <p>{profile['One Line Bio']}</p>
      </div>

      <div className="card-competencies">
        <h4>Top Competencies</h4>
        <div className="competency-bars">
          {topCompetencies.map(comp => (
            <div key={comp.name} className="competency-bar">
              <span className="comp-name">{comp.name}</span>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${comp.value * 10}%` }}
                />
              </div>
              <span className="comp-value">{comp.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <button className="view-profile-btn">View Full Profile</button>
      </div>
    </div>
  );
};

export default ProfileCard;
