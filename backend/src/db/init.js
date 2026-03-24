const fs = require('node:fs');
const path = require('node:path');
const { config } = require('../config/env');
const { getDb } = require('./client');

function initializeDatabase() {
  const db = getDb();
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

function seedDatabase() {
  const db = getDb();
  const existingOrders = db.prepare('SELECT COUNT(*) AS count FROM orders;').get();
  const existingProfile = db.prepare('SELECT COUNT(*) AS count FROM user_profile;').get();

  if (existingOrders.count > 0 && existingProfile.count > 0) {
    return {
      seeded: false,
      orders: existingOrders.count,
      profile: existingProfile.count > 0,
    };
  }

  const ordersSeedRaw = fs.readFileSync(config.seedFile, 'utf8');
  const seedOrders = JSON.parse(ordersSeedRaw);
  const profileSeedPath = path.resolve(path.dirname(config.seedFile), 'profile.json');
  const profileSeedRaw = fs.readFileSync(profileSeedPath, 'utf8');
  const seedProfile = JSON.parse(profileSeedRaw);
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, order_number, order_date, status, total_cents)
    VALUES (?, ?, ?, ?, ?);
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_name, quantity, unit_price_cents)
    VALUES (?, ?, ?, ?);
  `);
  const insertProfile = db.prepare(`
    INSERT INTO user_profile (
      id,
      full_name,
      email,
      avatar_url,
      joined_date,
      bio,
      order_count,
      last_order_date,
      lifetime_value_cents
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  db.exec('BEGIN;');
  try {
    if (existingOrders.count === 0) {
      for (const order of seedOrders) {
        insertOrder.run(
          order.id,
          order.orderNumber,
          order.orderDate,
          order.status,
          order.totalCents,
        );

        for (const item of order.items) {
          insertItem.run(order.id, item.productName, item.quantity, item.unitPriceCents);
        }
      }
    }

    if (existingProfile.count === 0) {
      insertProfile.run(
        seedProfile.id,
        seedProfile.fullName,
        seedProfile.email,
        seedProfile.avatarUrl,
        seedProfile.joinedDate,
        seedProfile.bio,
        seedProfile.stats.orderCount,
        seedProfile.stats.lastOrderDate,
        seedProfile.stats.lifetimeValueCents,
      );
    }

    db.exec('COMMIT;');
    return {
      seeded: true,
      orders: existingOrders.count === 0 ? seedOrders.length : existingOrders.count,
      profile: true,
    };
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  seedDatabase,
};
