const { getDb } = require('./client');

function getUserProfile() {
  const db = getDb();

  return db
    .prepare(`
      SELECT
        id,
        full_name AS fullName,
        email,
        avatar_url AS avatarUrl,
        joined_date AS joinedDate,
        bio,
        order_count AS orderCount,
        last_order_date AS lastOrderDate,
        lifetime_value_cents AS lifetimeValueCents
      FROM user_profile
      LIMIT 1;
    `)
    .get();
}

module.exports = {
  getUserProfile,
};
