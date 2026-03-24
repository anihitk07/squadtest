function createProfileError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function fetchUserProfile() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/profile`);

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fallbackMessage =
      response.status === 404
        ? 'User profile not found.'
        : `Failed to fetch user profile (${response.status})`;

    throw createProfileError(response.status, payload?.error ?? fallbackMessage);
  }

  if (!payload?.data) {
    throw createProfileError(response.status, 'Profile payload is missing data.');
  }

  return payload.data;
}
