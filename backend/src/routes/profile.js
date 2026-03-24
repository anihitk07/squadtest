const express = require('express');
const { getUserProfile } = require('../db/profile-repository');

const router = express.Router();

function respondWithDbFailure(res, error) {
  console.error('Database operation failed: retrieve profile', error);
  return res.status(500).json({ error: 'Failed to retrieve profile.' });
}

router.get('/profile', (req, res) => {
  try {
    const profile = getUserProfile();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json({
      data: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        joinedDate: profile.joinedDate,
        bio: profile.bio,
        stats: {
          orderCount: profile.orderCount,
          lastOrderDate: profile.lastOrderDate,
          lifetimeValueCents: profile.lifetimeValueCents,
        },
      },
    });
  } catch (error) {
    return respondWithDbFailure(res, error);
  }
});

module.exports = {
  profileRouter: router,
};
