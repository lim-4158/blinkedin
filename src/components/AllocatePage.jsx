import { useState, useEffect } from 'react';
import { API_URL, CORE_COMPETENCIES } from '../config/api';
import RadialChart from './RadialChart';
import './AllocatePage.css';

const TEAM_MEMBER_COLORS = ['#0077b5', '#e74c3c', '#27ae60'];

const AllocatePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allocating, setAllocating] = useState(false);

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

  // Calculate team's total score per competency
  const calculateTeamScores = (teamMembers) => {
    const scores = {};
    CORE_COMPETENCIES.forEach(comp => {
      scores[comp] = teamMembers.reduce((sum, member) => sum + (Number(member[comp]) || 0), 0);
    });
    return scores;
  };

  // Calculate team's average score per competency
  const calculateTeamAverages = (teamMembers) => {
    const averages = {};
    CORE_COMPETENCIES.forEach(comp => {
      const total = teamMembers.reduce((sum, member) => sum + (Number(member[comp]) || 0), 0);
      averages[comp] = total / teamMembers.length;
    });
    return averages;
  };

  // Calculate variance across all teams for a given competency
  const calculateVariance = (teamsArray, competency) => {
    const scores = teamsArray.map(team =>
      team.reduce((sum, member) => sum + (Number(member[competency]) || 0), 0)
    );
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  };

  // Calculate total variance across all competencies
  const calculateTotalVariance = (teamsArray) => {
    return CORE_COMPETENCIES.reduce((total, comp) => total + calculateVariance(teamsArray, comp), 0);
  };

  // Variance minimization algorithm using greedy + local optimization
  const allocateTeams = () => {
    setAllocating(true);

    // Clone profiles array
    const students = [...profiles];
    const teamSize = 3;
    const numTeams = Math.floor(students.length / teamSize);
    const remainder = students.length % teamSize;

    if (students.length < teamSize) {
      setError('Not enough students to form teams of 3');
      setAllocating(false);
      return;
    }

    // Calculate total competency score for each student
    const studentsWithTotal = students.map(student => ({
      ...student,
      totalScore: CORE_COMPETENCIES.reduce((sum, comp) => sum + (Number(student[comp]) || 0), 0)
    }));

    // Sort by total score (descending)
    studentsWithTotal.sort((a, b) => b.totalScore - a.totalScore);

    // Initial allocation using serpentine/snake draft
    // This helps balance total scores across teams
    const teamsArray = Array.from({ length: numTeams }, () => []);

    let studentIndex = 0;
    let round = 0;

    while (studentIndex < numTeams * teamSize) {
      const isForward = round % 2 === 0;

      for (let i = 0; i < numTeams && studentIndex < numTeams * teamSize; i++) {
        const teamIndex = isForward ? i : numTeams - 1 - i;
        if (teamsArray[teamIndex].length < teamSize) {
          teamsArray[teamIndex].push(studentsWithTotal[studentIndex]);
          studentIndex++;
        }
      }
      round++;
    }

    // Handle remainder students (distribute to existing teams)
    const remainingStudents = studentsWithTotal.slice(numTeams * teamSize);
    remainingStudents.forEach((student, idx) => {
      teamsArray[idx % numTeams].push(student);
    });

    // Local optimization: try swapping members between teams to reduce variance
    let improved = true;
    let iterations = 0;
    const maxIterations = 1000;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let t1 = 0; t1 < teamsArray.length; t1++) {
        for (let t2 = t1 + 1; t2 < teamsArray.length; t2++) {
          for (let m1 = 0; m1 < teamsArray[t1].length; m1++) {
            for (let m2 = 0; m2 < teamsArray[t2].length; m2++) {
              // Calculate current variance
              const currentVariance = calculateTotalVariance(teamsArray);

              // Try swap
              const temp = teamsArray[t1][m1];
              teamsArray[t1][m1] = teamsArray[t2][m2];
              teamsArray[t2][m2] = temp;

              const newVariance = calculateTotalVariance(teamsArray);

              if (newVariance < currentVariance) {
                // Keep the swap
                improved = true;
              } else {
                // Revert the swap
                teamsArray[t2][m2] = teamsArray[t1][m1];
                teamsArray[t1][m1] = temp;
              }
            }
          }
        }
      }
    }

    // Create final teams with metadata
    const finalTeams = teamsArray.map((members, index) => ({
      id: index + 1,
      members,
      averages: calculateTeamAverages(members),
      totals: calculateTeamScores(members)
    }));

    setTeams(finalTeams);
    setAllocating(false);
  };

  const formatCompetencyName = (comp) => {
    return comp.replace('Core ', '');
  };

  if (loading) {
    return (
      <div className="allocate-page">
        <div className="loading">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="allocate-page">
        <div className="error">{error}</div>
        <button onClick={fetchProfiles} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="allocate-page">
      <header className="allocate-header">
        <h1>Team Allocation</h1>
        <p className="subtitle">
          Variance Minimization Algorithm - Creates balanced teams of 3 with equal strength across competencies
        </p>
      </header>

      <div className="allocate-controls">
        <div className="profile-count">
          <strong>{profiles.length}</strong> students available
        </div>
        <button
          onClick={allocateTeams}
          className="allocate-btn"
          disabled={allocating || profiles.length < 3}
        >
          {allocating ? 'Allocating...' : 'Generate Teams'}
        </button>
      </div>

      {teams.length > 0 && (
        <div className="results-section">
          <h2>Team Assignments</h2>

          <div className="teams-grid">
            {teams.map(team => (
              <div
                key={team.id}
                className={`team-card ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
              >
                <h3>Team {team.id}</h3>
                <ul className="team-members">
                  {team.members.map((member, idx) => (
                    <li key={member['BlinkedIn Name']}>
                      <span
                        className="member-color"
                        style={{ backgroundColor: TEAM_MEMBER_COLORS[idx] }}
                      />
                      <span className="member-name">{member['BlinkedIn Name']}</span>
                      <span className="member-real-name">({member['Real Name']})</span>
                    </li>
                  ))}
                </ul>
                <div className="card-hint">Click to view radar chart</div>
              </div>
            ))}
          </div>

          {selectedTeam && (
            <div className="radial-section">
              <h2>Team {selectedTeam.id} Competency Chart</h2>
              <div className="radial-container">
                <RadialChart profiles={selectedTeam.members} colors={TEAM_MEMBER_COLORS} />
                <div className="chart-legend">
                  {selectedTeam.members.map((member, idx) => (
                    <div key={member['BlinkedIn Name']} className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: TEAM_MEMBER_COLORS[idx] }}
                      />
                      <span className="legend-name">{member['BlinkedIn Name']}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <h2>Average Competency Scores by Team</h2>
          <div className="table-container">
            <table className="scores-table">
              <thead>
                <tr>
                  <th>Team</th>
                  {CORE_COMPETENCIES.map(comp => (
                    <th key={comp}>{formatCompetencyName(comp)}</th>
                  ))}
                  <th>Total Avg</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => {
                  const totalAvg = CORE_COMPETENCIES.reduce(
                    (sum, comp) => sum + team.averages[comp], 0
                  ) / CORE_COMPETENCIES.length;

                  return (
                    <tr key={team.id}>
                      <td className="team-label">Team {team.id}</td>
                      {CORE_COMPETENCIES.map(comp => (
                        <td key={comp} className="score-cell">
                          {team.averages[comp].toFixed(1)}
                        </td>
                      ))}
                      <td className="total-cell">{totalAvg.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="variance-info">
            <p>
              <strong>Algorithm:</strong> Serpentine draft based on total scores,
              followed by local optimization swaps to minimize variance across all competencies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocatePage;
