import { useState, useEffect } from 'react';
import { API_URL, CORE_COMPETENCIES } from '../config/api';
import './JudgePage.css';

// Working Style Compatibility Rules
// 'similarity' = team works better when everyone has the same style
// 'diversity' = team works better when both styles are represented
const STYLE_COMPATIBILITY_RULES = {
  'Style Timing': { rule: 'similarity', label: 'Timing' },
  'Style Communication': { rule: 'similarity', label: 'Communication' },
  'Style Work Rhythm': { rule: 'similarity', label: 'Work Rhythm' },
  'Style Decision Making': { rule: 'diversity', label: 'Decision Making' },
  'Style Conflict Approach': { rule: 'similarity', label: 'Conflict' },
  'Style Planning Style': { rule: 'diversity', label: 'Planning' }
};

const JudgePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

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

  // Calculate coverage score for a team
  const calculateCoverageScore = (teamMembers) => {
    if (teamMembers.length === 0) return 0;

    const maxPerCompetency = CORE_COMPETENCIES.map(comp => {
      return Math.max(...teamMembers.map(member => member[comp] || 0));
    });

    const totalMax = maxPerCompetency.reduce((sum, val) => sum + val, 0);
    const maxPossible = 10 * CORE_COMPETENCIES.length; // 10 points × 8 competencies = 80

    return ((totalMax / maxPossible) * 100).toFixed(1);
  };

  // Get the max scores per competency for a team
  const getTeamMaxCompetencies = (teamMembers) => {
    return CORE_COMPETENCIES.map(comp => ({
      name: comp.replace('Core ', ''),
      max: Math.max(...teamMembers.map(member => member[comp] || 0))
    }));
  };

  // Calculate working style compatibility score for a team
  const calculateStyleCompatibility = (teamMembers) => {
    if (teamMembers.length < 2) return { score: 100, breakdown: [] };

    const breakdown = [];
    let totalScore = 0;
    const styleKeys = Object.keys(STYLE_COMPATIBILITY_RULES);

    styleKeys.forEach(styleKey => {
      const { rule, label } = STYLE_COMPATIBILITY_RULES[styleKey];
      const styles = teamMembers.map(m => m[styleKey]);
      const uniqueStyles = [...new Set(styles)];

      let dimensionScore;

      if (rule === 'similarity') {
        // Similar is better: score based on how uniform the team is
        // Count the most common style
        const styleCounts = {};
        styles.forEach(s => {
          styleCounts[s] = (styleCounts[s] || 0) + 1;
        });
        const maxCount = Math.max(...Object.values(styleCounts));
        dimensionScore = (maxCount / styles.length) * 100;
      } else {
        // Diversity is better: score based on having both styles represented
        if (uniqueStyles.length >= 2) {
          dimensionScore = 100; // Both styles present
        } else {
          // All same style - partial credit based on team size
          // Larger teams with all same style get lower scores
          dimensionScore = Math.max(50, 100 - (teamMembers.length - 1) * 15);
        }
      }

      breakdown.push({
        label,
        rule,
        score: dimensionScore,
        styles: styles
      });

      totalScore += dimensionScore;
    });

    // Convert percentage (0-100) to scale of 2.5-5.0
    const percentageScore = totalScore / styleKeys.length;
    const scaledScore = 2.5 + (percentageScore / 100) * 2.5;

    return {
      score: scaledScore.toFixed(1),
      breakdown
    };
  };

  // Check if a student is already in a team
  const isStudentInTeam = (studentName) => {
    return teams.some(team =>
      team.members.some(m => m['BlinkedIn Name'] === studentName)
    );
  };

  // Toggle student selection
  const toggleStudentSelection = (profile) => {
    if (isStudentInTeam(profile['BlinkedIn Name'])) return;

    const isSelected = selectedStudents.some(
      s => s['BlinkedIn Name'] === profile['BlinkedIn Name']
    );

    if (isSelected) {
      setSelectedStudents(prev =>
        prev.filter(s => s['BlinkedIn Name'] !== profile['BlinkedIn Name'])
      );
    } else {
      setSelectedStudents(prev => [...prev, profile]);
    }
  };

  // Create a new team from selected students
  const createTeam = () => {
    if (selectedStudents.length < 2) {
      alert('Please select at least 2 students to form a team');
      return;
    }

    const newTeam = {
      id: Date.now(),
      name: `Team ${teams.length + 1}`,
      members: [...selectedStudents]
    };

    setTeams(prev => [...prev, newTeam]);
    setSelectedStudents([]);
  };

  // Remove a team
  const removeTeam = (teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  // Get teams sorted by coverage score
  const getSortedTeams = () => {
    return [...teams].sort((a, b) => {
      const scoreA = parseFloat(calculateCoverageScore(a.members));
      const scoreB = parseFloat(calculateCoverageScore(b.members));
      return scoreB - scoreA;
    });
  };

  // Get available students (not in any team)
  const getAvailableStudents = () => {
    return profiles.filter(p => !isStudentInTeam(p['BlinkedIn Name']));
  };

  if (loading) {
    return (
      <div className="judge-page">
        <div className="loading">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="judge-page">
        <div className="error">{error}</div>
        <button onClick={fetchProfiles} className="retry-btn">Retry</button>
      </div>
    );
  }

  const availableStudents = getAvailableStudents();
  const sortedTeams = getSortedTeams();

  return (
    <div className="judge-page">
      <header className="judge-header">
        <h1>Team Formation Judge</h1>
        <p className="subtitle">Manually assign students to teams and evaluate their complementarity</p>
      </header>

      <div className="judge-content">
        <div className="students-panel">
          <div className="panel-header">
            <h2>Available Students</h2>
            <span className="count">{availableStudents.length} remaining</span>
          </div>

          <table className="students-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Real Name</th>
                <th>BlinkedIn Name</th>
              </tr>
            </thead>
            <tbody>
              {availableStudents.map(profile => {
                const isSelected = selectedStudents.some(
                  s => s['BlinkedIn Name'] === profile['BlinkedIn Name']
                );
                return (
                  <tr
                    key={profile['BlinkedIn Name']}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => toggleStudentSelection(profile)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                      />
                    </td>
                    <td>{profile['Real Name']}</td>
                    <td>{profile['BlinkedIn Name']}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {selectedStudents.length > 0 && (
            <div className="selection-actions">
              <p>{selectedStudents.length} student(s) selected</p>
              <button onClick={createTeam} className="create-team-btn">
                Create Team
              </button>
              <button
                onClick={() => setSelectedStudents([])}
                className="clear-selection-btn"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        <div className="teams-panel">
          <div className="panel-header">
            <h2>Teams Ranking</h2>
            <span className="count">{teams.length} team(s)</span>
          </div>

          {teams.length === 0 ? (
            <div className="empty-teams">
              <p>No teams created yet.</p>
              <p>Select students from the table and click "Create Team".</p>
            </div>
          ) : (
            <div className="teams-list">
              {sortedTeams.map((team, index) => {
                const coverageScore = calculateCoverageScore(team.members);
                const competencies = getTeamMaxCompetencies(team.members);
                const styleCompat = calculateStyleCompatibility(team.members);

                return (
                  <div key={team.id} className="team-card">
                    <div className="team-header">
                      <div className="team-rank">#{index + 1}</div>
                      <div className="team-info">
                        <h3>{team.name}</h3>
                        <span className="member-count">
                          {team.members.length} members
                        </span>
                      </div>
                      <div className="team-scores">
                        <div className="team-score coverage">
                          <span className="score-value">{coverageScore}%</span>
                          <span className="score-label">Coverage</span>
                        </div>
                        <div className="team-score style">
                          <span className="score-value">{styleCompat.score}</span>
                          <span className="score-label">Style Fit</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTeam(team.id)}
                        className="remove-team-btn"
                        title="Remove team"
                      >
                        ×
                      </button>
                    </div>

                    <div className="team-members">
                      <h4>Members:</h4>
                      <ul>
                        {team.members.map(member => (
                          <li key={member['BlinkedIn Name']}>
                            <span className="member-real">{member['Real Name']}</span>
                            <span className="member-blinked">({member['BlinkedIn Name']})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="team-details-grid">
                      <div className="team-competencies">
                        <h4>Team Max Competencies:</h4>
                        <div className="competency-bars">
                          {competencies.map(comp => (
                            <div key={comp.name} className="competency-row">
                              <span className="comp-name">{comp.name}</span>
                              <div className="comp-bar-container">
                                <div
                                  className="comp-bar-fill"
                                  style={{ width: `${comp.max * 10}%` }}
                                />
                              </div>
                              <span className="comp-value">{comp.max}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="team-styles">
                        <h4>Working Style Compatibility:</h4>
                        <div className="style-breakdown">
                          {styleCompat.breakdown.map(item => (
                            <div key={item.label} className="style-row">
                              <span className="style-label">
                                {item.label}
                                <span className={`style-rule ${item.rule}`}>
                                  {item.rule === 'similarity' ? '≈' : '≠'}
                                </span>
                              </span>
                              <div className="style-bar-container">
                                <div
                                  className={`style-bar-fill ${item.score >= 80 ? 'good' : item.score >= 50 ? 'moderate' : 'poor'}`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <span className="style-score">{item.score.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                        <div className="style-legend">
                          <span><span className="style-rule similarity">≈</span> Similar is better</span>
                          <span><span className="style-rule diversity">≠</span> Diversity is better</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgePage;
