import { useState, useEffect } from 'react';
import { fetchUserProfile } from './api/profileApi';
import { fetchOrderHistory, fetchOrderDetail } from './api/ordersApi';
import { OrderLandingPage } from './components/OrderLandingPage';
import { UserProfilePage } from './components/UserProfilePage';
import { SettingsPage } from './components/SettingsPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('orders');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const pageTitleByView = {
    orders: 'Orders',
    profile: 'User Profile',
    settings: 'Settings',
  };

  const pageDescriptionByView = {
    orders: 'Browse all orders, sort columns, and open full order details.',
    profile: 'Snapshot of account information and order activity.',
    settings: 'Manage your preferences and app settings.',
  };

  return (
    <main className="app-shell">
      <header>
        <h1>{pageTitleByView[currentView]}</h1>
        <p>{pageDescriptionByView[currentView]}</p>
        <nav className="app-nav">
          <button
            className={`nav-button ${currentView === 'orders' ? 'active' : ''}`}
            onClick={() => setCurrentView('orders')}
          >
            Orders
          </button>
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

      {currentView === 'orders' ? (
        <OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />
      ) : null}
      {currentView === 'profile' && <UserProfilePage fetchProfile={fetchUserProfile} />}
      {currentView === 'settings' && <SettingsPage />}
    </main>
  );
}

export default App;
