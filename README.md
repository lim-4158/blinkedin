# BlinkedIn - Student Profile Directory

A simple prototype web app for students to create and browse profiles with self-rated competencies and working style preferences.

## Features

- **Create Profile**: Submit a profile with identity, core competencies (0-10 with 50 point max), and working style preferences
- **Point Allocation**: Total of 50 points to distribute across 8 core competencies, forcing prioritization of strengths
- **Browse Directory**: View all student profiles in a card-based interface
- **Profile Details**: Click any card to view full profile information
- **Privacy First**: Real names are stored for record-keeping only and never displayed in the UI

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
│   │   └── ProfileDetail.css
│   ├── config/
│   │   └── api.js                  # API configuration
│   ├── App.jsx                     # Main app component
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
