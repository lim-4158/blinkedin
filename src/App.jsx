import { useState, useEffect } from 'react';
import CreateProfile from './components/CreateProfile';
import ProfileDirectory from './components/ProfileDirectory';
import RadialPage from './components/RadialPage';
import AllocatePage from './components/AllocatePage';
import JudgePage from './components/JudgePage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.slice(1);
    if (hash === 'radial') return 'radial';
    if (hash === 'allocate') return 'allocate';
    if (hash === 'judge') return 'judge';
    if (hash === 'create') return 'create';
    return 'directory';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'radial') {
        setCurrentView('radial');
      } else if (hash === 'allocate') {
        setCurrentView('allocate');
      } else if (hash === 'judge') {
        setCurrentView('judge');
      } else if (hash === 'create') {
        setCurrentView('create');
      } else {
        setCurrentView('directory');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view) => {
    setCurrentView(view);
    window.location.hash = view === 'directory' ? '' : view;
  };

  const handleProfileCreated = () => {
    navigate('directory');
  };

  // Hidden radial page - no navigation links
  if (currentView === 'radial') {
    return <RadialPage />;
  }

  // Hidden allocate page - no navigation links
  if (currentView === 'allocate') {
    return <AllocatePage />;
  }

  // Hidden judge page - for teaching team only
  if (currentView === 'judge') {
    return <JudgePage />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">BlinkedIn</div>
        <div className="nav-links">
          <button
            className={currentView === 'directory' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navigate('directory')}
          >
            Directory
          </button>
          <button
            className={currentView === 'create' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => navigate('create')}
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
