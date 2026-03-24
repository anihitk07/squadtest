const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

function formatCurrency(cents) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(dateValue, fallback = '-') {
  if (!dateValue) {
    return fallback;
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return dateFormatter.format(parsedDate);
}

function getInitials(fullName) {
  const nameParts = fullName.split(' ').filter(Boolean);

  if (nameParts.length === 0) {
    return '?';
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 1).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
}

export function UserProfileCard({ profile }) {
  return (
    <article className="profile-card" aria-label="User profile card">
      <header className="profile-header">
        {profile.avatarUrl ? (
          <img className="profile-avatar" src={profile.avatarUrl} alt={`${profile.fullName} avatar`} />
        ) : (
          <div className="profile-avatar profile-avatar-fallback" aria-hidden="true">
            {getInitials(profile.fullName)}
          </div>
        )}

        <div className="profile-meta">
          <h2>{profile.fullName}</h2>
          <p>{profile.email}</p>
          <p>Joined {formatDate(profile.joinedDate)}</p>
        </div>
      </header>

      <p className="profile-bio">{profile.bio}</p>

      <dl className="profile-stats" aria-label="User profile statistics">
        <div className="stat-tile">
          <dt>Orders</dt>
          <dd>{profile.stats.orderCount}</dd>
        </div>
        <div className="stat-tile">
          <dt>Last order</dt>
          <dd>{formatDate(profile.stats.lastOrderDate, 'No orders yet')}</dd>
        </div>
        <div className="stat-tile">
          <dt>Lifetime value</dt>
          <dd>{formatCurrency(profile.stats.lifetimeValueCents)}</dd>
        </div>
      </dl>

      <p className="profile-id">Profile ID: {profile.id}</p>
    </article>
  );
}
