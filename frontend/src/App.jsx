import { useState, useEffect } from 'react';
import { fetchUserProfile } from './api/profileApi';
import { UserProfilePage } from './components/UserProfilePage';
import { SettingsPage } from './components/SettingsPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('profile');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <main className="app-shell">
      <header>
        <h1>{currentView === 'profile' ? 'User Profile' : 'Settings'}</h1>
        <p>
          {currentView === 'profile' 
            ? 'Snapshot of account information and order activity.'
            : 'Manage your preferences and app settings.'}
        </p>
        <nav className="app-nav">
          <button 
            className={`nav-button ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            Profile
          </button>
          <button 
            className={`nav-button ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            Settings
          </button>
        </nav>
      </header>

      {currentView === 'profile' && <UserProfilePage fetchProfile={fetchUserProfile} />}
      {currentView === 'settings' && <SettingsPage />}
    </main>
  );
}

export default App;
