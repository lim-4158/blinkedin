import { CORE_COMPETENCIES } from '../config/api';
import './RadialChart.css';

const RadialChart = ({ profiles, colors }) => {
  const padding = 80; // Extra space for labels
  const chartSize = 400;
  const size = chartSize + padding * 2;
  const center = size / 2;
  const maxRadius = 160;
  const levels = 5;
  const competencies = CORE_COMPETENCIES.map(c => c.replace('Core ', ''));
  const angleStep = (2 * Math.PI) / competencies.length;

  // Calculate point position for a given value and angle
  const getPoint = (value, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const radius = (value / 10) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  // Generate polygon points for a profile
  const getPolygonPoints = (profile) => {
    return CORE_COMPETENCIES.map((comp, i) => {
      const value = profile[comp] || 0;
      const point = getPoint(value, i);
      return `${point.x},${point.y}`;
    }).join(' ');
  };

  // Generate grid lines
  const gridLines = [];
  for (let i = 1; i <= levels; i++) {
    const radius = (i / levels) * maxRadius;
    const points = competencies.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
    }).join(' ');
    gridLines.push(
      <polygon
        key={`grid-${i}`}
        points={points}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth="1"
      />
    );
  }

  // Generate axis lines
  const axisLines = competencies.map((_, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const endX = center + maxRadius * Math.cos(angle);
    const endY = center + maxRadius * Math.sin(angle);
    return (
      <line
        key={`axis-${index}`}
        x1={center}
        y1={center}
        x2={endX}
        y2={endY}
        stroke="#e0e0e0"
        strokeWidth="1"
      />
    );
  });

  // Generate labels
  const labels = competencies.map((comp, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = maxRadius + 45;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);

    // Adjust text anchor based on position
    let textAnchor = 'middle';
    if (x < center - 20) textAnchor = 'end';
    else if (x > center + 20) textAnchor = 'start';

    return (
      <text
        key={`label-${index}`}
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        className="chart-label"
      >
        {comp}
      </text>
    );
  });

  // Generate scale labels (0, 2, 4, 6, 8, 10)
  const scaleLabels = [];
  for (let i = 0; i <= levels; i++) {
    const value = (i / levels) * 10;
    const radius = (i / levels) * maxRadius;
    scaleLabels.push(
      <text
        key={`scale-${i}`}
        x={center + 8}
        y={center - radius - 2}
        className="scale-label"
        textAnchor="start"
      >
        {value}
      </text>
    );
  }

  return (
    <div className="radial-chart-container">
      <svg viewBox={`0 0 ${size} ${size}`} className="radial-chart">
        {/* Grid */}
        {gridLines}
        {axisLines}

        {/* Data polygons */}
        {profiles.map((profile, idx) => (
          <polygon
            key={profile['BlinkedIn Name']}
            points={getPolygonPoints(profile)}
            fill={colors[idx]}
            fillOpacity="0.25"
            stroke={colors[idx]}
            strokeWidth="2.5"
            className="data-polygon"
          />
        ))}

        {/* Data points */}
        {profiles.map((profile, profileIdx) => (
          CORE_COMPETENCIES.map((comp, i) => {
            const value = profile[comp] || 0;
            const point = getPoint(value, i);
            return (
              <circle
                key={`${profile['BlinkedIn Name']}-${comp}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={colors[profileIdx]}
                stroke="white"
                strokeWidth="2"
                className="data-point"
              />
            );
          })
        ))}

        {/* Labels */}
        {labels}
        {scaleLabels}
      </svg>
    </div>
  );
};

export default RadialChart;
