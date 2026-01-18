import { useState } from 'react';
import { API_URL, CORE_COMPETENCIES, CORE_COMPETENCIES_INFO, STYLE_OPTIONS, STYLE_DESCRIPTIONS } from '../config/api';
import './CreateProfile.css';

const CreateProfile = ({ onProfileCreated }) => {
  const [formData, setFormData] = useState({
    'Real Name': '',
    'BlinkedIn Name': '',
    'One Line Bio': '',
    'Core Technical': 0,
    'Core Persuasion': 0,
    'Core Adaptability': 0,
    'Core Strategy': 0,
    'Core Design': 0,
    'Core Resilience': 0,
    'Core Execution': 0,
    'Core Empathy': 0,
    'Style Timing': 'Early Bird',
    'Style Communication': 'Direct',
    'Style Work Rhythm': 'Focused Sprints',
    'Style Decision Making': 'Data-Driven',
    'Style Conflict Approach': 'Confronter',
    'Style Planning Style': 'Structured'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const MAX_TOTAL_POINTS = 50;

  const getTotalPoints = () => {
    return CORE_COMPETENCIES.reduce((sum, comp) => {
      return sum + parseInt(formData[comp] || 0);
    }, 0);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData['Real Name'].trim()) {
      return 'Real Name is required';
    }
    if (!formData['BlinkedIn Name'].trim()) {
      return 'BlinkedIn Name is required';
    }
    if (!formData['One Line Bio'].trim()) {
      return 'One Line Bio is required';
    }

    for (const comp of CORE_COMPETENCIES) {
      const value = parseInt(formData[comp]);
      if (isNaN(value) || value < 0 || value > 10) {
        return `${comp} must be between 0 and 10`;
      }
    }

    const totalPoints = getTotalPoints();
    if (totalPoints > MAX_TOTAL_POINTS) {
      return `Total competency points (${totalPoints}) exceeds maximum of ${MAX_TOTAL_POINTS}`;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      await response.json();

      setSuccess(true);
      setTimeout(() => {
        if (onProfileCreated) {
          onProfileCreated();
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>Profile Created Successfully!</h2>
        <p>Redirecting to directory...</p>
      </div>
    );
  }

  return (
    <div className="create-profile">
      <h1>Create Your BlinkedIn Profile</h1>

      <form onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Identity</h2>
          <div className="identity-grid">
            <div className="form-group">
              <label htmlFor="realName">Real Name</label>
              <input
                id="realName"
                type="text"
                value={formData['Real Name']}
                onChange={(e) => handleInputChange('Real Name', e.target.value)}
                placeholder="Your real name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="blinkedInName">BlinkedIn Name</label>
              <input
                id="blinkedInName"
                type="text"
                value={formData['BlinkedIn Name']}
                onChange={(e) => handleInputChange('BlinkedIn Name', e.target.value)}
                placeholder="An adjective + an animal (e.g Happy Capybara)"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="bio">One Line Bio</label>
              <input
                id="bio"
                type="text"
                value={formData['One Line Bio']}
                onChange={(e) => handleInputChange('One Line Bio', e.target.value)}
                placeholder="Describe yourself in one line"
                required
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-header">
            <h2>Core Competencies (0-10)</h2>
            <div className={`points-tracker ${getTotalPoints() > MAX_TOTAL_POINTS ? 'over-limit' : ''}`}>
              <span className="points-used">{getTotalPoints()}</span>
              <span className="points-separator">/</span>
              <span className="points-max">{MAX_TOTAL_POINTS}</span>
              <span className="points-label">points</span>
            </div>
          </div>
          <div className="competencies-grid">
            {CORE_COMPETENCIES.map(comp => (
              <div key={comp} className="form-group competency-item">
                <div className="competency-header">
                  <label htmlFor={comp}>
                    {comp.replace('Core ', '')}
                    <span className="score">{formData[comp]}</span>
                  </label>
                  <p className="competency-description">{CORE_COMPETENCIES_INFO[comp]}</p>
                </div>
                <input
                  id={comp}
                  type="range"
                  min="0"
                  max="10"
                  value={formData[comp]}
                  onChange={(e) => handleInputChange(comp, parseInt(e.target.value))}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Working Style</h2>
          <div className="styles-grid">
            {Object.entries(STYLE_OPTIONS).map(([style, options]) => (
              <div key={style} className="style-group">
                <label className="style-label">{style.replace('Style ', '')}</label>
                <div className="button-group">
                  {options.map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`style-button ${formData[style] === option ? 'active' : ''}`}
                      onClick={() => handleInputChange(style, option)}
                    >
                      <span className="option-name">{option}</span>
                      <span className="option-description">{STYLE_DESCRIPTIONS[option]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;
