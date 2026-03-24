import { useState, useEffect } from 'react';

export function SettingsPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="settings-page">
      <div className="panel">
        <h2>Settings</h2>
        
        <div className="settings-section">
          <div className="setting-row">
            <div className="setting-info">
              <h3>Dark Mode</h3>
              <p className="setting-description">Switch between light and dark theme</p>
            </div>
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
