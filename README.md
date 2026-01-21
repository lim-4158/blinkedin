# BlinkedIn - Student Profile Directory

A simple prototype web app for students to create and browse profiles with self-rated competencies and working style preferences.

## Features

- **Create Profile**: Submit a profile with identity, core competencies (0-10 with 50 point max), and working style preferences
- **Point Allocation**: Total of 50 points to distribute across 8 core competencies, forcing prioritization of strengths
- **Browse Directory**: View all student profiles in a card-based interface
- **Profile Details**: Click any card to view full profile information
- **Privacy First**: Real names are stored for record-keeping only and never displayed in the UI

---

## Hidden Pages (Teaching Team Only)

There are **3 hidden URLs** that are not linked in the main navigation. These are intended for the teaching team only.

| URL | Page | Purpose |
|-----|------|---------|
| `#radial` | Team Compatibility Chart | Compare up to 3 profiles on a radar chart to visualize competency overlap |
| `#allocate` | Auto Team Allocation | Automatically group all students into balanced teams of 3 using variance minimization |
| `#judge` | Team Formation Judge | Manually create teams and evaluate their complementarity with Coverage & Style Fit scores |

---

## Hidden Page Details

### 1. Team Compatibility Chart (`#radial`)

A visual comparison tool using a radar/spider chart to overlay multiple student profiles.

**Features:**
- Select up to 3 profiles from a sidebar list
- View all 8 competencies overlaid on a single radar chart
- Color-coded profiles for easy comparison
- Useful for students exploring potential team combinations

---

### 2. Auto Team Allocation (`#allocate`)

Automatically groups students into teams of 3 with balanced competency distribution using a **Variance Minimization** approach.

**Goal:** Ensure all teams have roughly equal total strength across all 8 competencies. No "super teams" or "weak teams" - every team should be competitive.

**How It Works:**

1. **Score & Sort** - Calculate each student's total competency score and sort from highest to lowest
2. **Serpentine Draft** - Allocate students using a snake pattern:
   - Round 1: Team 1 → Team 2 → Team 3
   - Round 2: Team 3 → Team 2 → Team 1
   - Round 3: Team 1 → Team 2 → Team 3
3. **Local Optimization** - Attempt pairwise swaps between teams; keep swaps that reduce variance
4. **Handle Remainders** - Extra students (if not divisible by 3) distributed to existing teams

**Output:** Team cards showing member names + table of average competency scores per team

---

### 3. Team Formation Judge (`#judge`)

A tool for manually creating teams and evaluating how well students found complementary co-founders.

**Features:**
- Student list with Real Name and BlinkedIn Name columns
- Manual team creation by selecting students
- Dual scoring system for each team
- Teams ranked by Coverage Score

**Scoring Algorithms:**

**A. Coverage Score (Competency Complementarity)**

Measures how well the team covers all 8 core competencies.

**Formula:**
```
Coverage Score = (Sum of max scores per competency across team) / 80 × 100%
```

Where 80 = 10 points × 8 competencies (perfect score if team has a 10 in every competency).

**Example:** Team of 2 students
- Student A: Technical=8, Persuasion=4, Strategy=6
- Student B: Technical=3, Persuasion=9, Strategy=5
- Team max per competency: Technical=8, Persuasion=9, Strategy=6
- Higher coverage = better complementarity (gaps filled by teammates)

**B. Style Fit Score (Working Style Compatibility)**

Measures how compatible team members' working styles are. Score ranges from **2.5 to 5.0**.

**Philosophy:** Some style dimensions benefit from similarity (reduces friction), while others benefit from diversity (broader perspective).

| Style Dimension | Compatibility Rule | Rationale |
|-----------------|-------------------|-----------|
| Timing | Similar is better | Early Bird + Last Minute causes scheduling friction |
| Communication | Similar is better | Direct + Diplomatic styles can cause misunderstandings |
| Work Rhythm | Similar is better | Sprints + Steady Pace causes pacing resentment |
| Decision Making | Diversity is better | Need both data-driven and intuitive perspectives |
| Conflict Approach | Similar is better | Confronter + Harmonizer clash on issue resolution |
| Planning Style | Diversity is better | Balance structure with adaptability |

**Scoring:**
- For "similar is better" dimensions: Higher score when all team members share the same style
- For "diversity is better" dimensions: Higher score when both style options are represented in the team

**Scale:**
- **2.5** = Worst compatibility
- **3.75** = Average compatibility
- **5.0** = Perfect compatibility

**How to Use:**
1. Navigate to `#judge`
2. Click on students in the table to select them (checkboxes appear)
3. Click "Create Team" when you've selected 2+ students
4. Teams appear on the right panel, automatically ranked by Coverage Score
5. Each team card shows:
   - Coverage Score (blue) - competency complementarity
   - Style Fit Score (purple) - working style compatibility
   - Member list with both Real Name and BlinkedIn Name
   - Visual breakdown of team competencies and style compatibility
6. Click × to remove a team and return those students to the available pool

---

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Google Sheets + Google Apps Script
- **Deployment**: Vercel/Netlify

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd blinkedin
```

2. Install dependencies:
```bash
npm install
```

3. The Google Apps Script URL is already configured in `src/config/api.js`.

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Google Sheets Backend

The app uses a Google Apps Script web app as the backend. The script should:

1. Have a Google Sheet with a tab named `profile`
2. Contains 17 columns:
   - Real Name
   - BlinkedIn Name
   - One Line Bio
   - Core Technical, Core Persuasion, Core Adaptability, Core Strategy, Core Design, Core Resilience, Core Execution, Core Empathy (0-10)
   - Style Timing, Style Communication, Style Work Rhythm, Style Decision Making, Style Conflict Approach, Style Planning Style

3. Endpoints:
   - **POST**: Create a new profile (accepts JSON with all fields)
   - **GET with ?action=list**: Returns all profiles WITHOUT the "Real Name" field

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

Follow the prompts to complete deployment.

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify:
   - Drag and drop the `dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

## Project Structure

```
blinkedin/
├── src/
│   ├── components/
│   │   ├── CreateProfile.jsx       # Profile creation form
│   │   ├── CreateProfile.css
│   │   ├── ProfileDirectory.jsx    # Directory listing
│   │   ├── ProfileDirectory.css
│   │   ├── ProfileCard.jsx         # Individual profile card
│   │   ├── ProfileCard.css
│   │   ├── ProfileDetail.jsx       # Profile detail modal
│   │   ├── ProfileDetail.css
│   │   ├── RadialChart.jsx         # SVG radar chart component
│   │   ├── RadialPage.jsx          # Team comparison page (#radial)
│   │   ├── RadialPage.css
│   │   ├── AllocatePage.jsx        # Team allocation page (#allocate)
│   │   ├── AllocatePage.css
│   │   ├── JudgePage.jsx           # Team formation judge (#judge)
│   │   └── JudgePage.css
│   ├── config/
│   │   └── api.js                  # API configuration & competency definitions
│   ├── App.jsx                     # Main app with hash-based routing
│   ├── App.css
│   ├── index.css                   # Global styles
│   └── main.jsx                    # App entry point
├── public/
├── package.json
└── README.md
```

## Data Privacy

**IMPORTANT**: The "Real Name" field is stored in Google Sheets for record-keeping purposes only. It is:
- ✅ Accepted when creating a profile (POST)
- ❌ Never returned by the directory API (GET)
- ❌ Never displayed anywhere in the UI

This ensures student privacy while maintaining accurate records.

## Form Validation

- All identity fields are required
- Core competencies must be integers between 0-10
- **Total core competency points cannot exceed 50** (forces prioritization)
- Working style fields must match predefined options
- Client-side validation with clear error messages
- Real-time points tracker shows remaining allocation

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design

## License

MIT
