import { useState } from 'react';
import CreateProfile from './components/CreateProfile';
import ProfileDirectory from './components/ProfileDirectory';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('directory');

  const handleProfileCreated = () => {
    setCurrentView('directory');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">BlinkedIn</div>
        <div className="nav-links">
          <button
            className={currentView === 'directory' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('directory')}
          >
            Directory
          </button>
          <button
            className={currentView === 'create' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setCurrentView('create')}
          >
            Create Profile
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'directory' ? (
          <ProfileDirectory />
        ) : (
          <CreateProfile onProfileCreated={handleProfileCreated} />
        )}
      </main>
    </div>
  );
}

export default App;
