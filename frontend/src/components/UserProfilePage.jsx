import { useEffect, useState } from 'react';
import { UserProfileCard } from './UserProfileCard';

const VIEW_STATES = {
  loading: 'loading',
  success: 'success',
  notFound: 'not-found',
  error: 'error',
};

export function UserProfilePage({ fetchProfile }) {
  const [viewState, setViewState] = useState(VIEW_STATES.loading);
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setViewState(VIEW_STATES.loading);
      setErrorMessage('');

      try {
        const profileData = await fetchProfile();

        if (cancelled) {
          return;
        }

        setProfile(profileData);
        setViewState(VIEW_STATES.success);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setProfile(null);

        if (error.status === 404) {
          setViewState(VIEW_STATES.notFound);
          return;
        }

        setViewState(VIEW_STATES.error);
        setErrorMessage(error.message || 'Unable to load user profile.');
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [fetchProfile]);

  return (
    <section className="panel profile-page" aria-label="User profile">
      <h2>Profile</h2>

      {viewState === VIEW_STATES.loading ? (
        <p className="panel-message">Loading user profile...</p>
      ) : null}

      {viewState === VIEW_STATES.notFound ? (
        <p className="panel-message">User profile not found.</p>
      ) : null}

      {viewState === VIEW_STATES.error ? <p className="error-banner">{errorMessage}</p> : null}

      {viewState === VIEW_STATES.success && profile ? <UserProfileCard profile={profile} /> : null}
    </section>
  );
}
