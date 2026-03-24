const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

const clientModulePath = require.resolve('./client');
const repositoryModulePath = require.resolve('./orders-repository');
const originalClientModule = require.cache[clientModulePath];

function loadRepositoryWithDb(db) {
  delete require.cache[repositoryModulePath];

  const mockedClientModule = new Module(clientModulePath);
  mockedClientModule.exports = {
    getDb: () => db,
  };
  mockedClientModule.loaded = true;
  require.cache[clientModulePath] = mockedClientModule;

  return require('./orders-repository');
}

function restoreModules() {
  delete require.cache[repositoryModulePath];

  if (originalClientModule) {
    require.cache[clientModulePath] = originalClientModule;
    return;
  }

  delete require.cache[clientModulePath];
}

test.afterEach(() => {
  restoreModules();
});

test('listOrders returns rows from repository query', () => {
  const expectedRows = [
    {
      id: 'ord-1002',
      orderNumber: '1002',
      orderDate: '2026-03-18',
      status: 'Shipped',
      totalCents: 7300,
    },
  ];

  const db = {
    prepare(sql) {
      assert.match(sql, /ORDER BY order_date DESC/);
      return {
        all() {
          return expectedRows;
        },
      };
    },
  };

  const { listOrders } = loadRepositoryWithDb(db);
  const rows = listOrders();

  assert.deepEqual(rows, expectedRows);
});

test('getOrderById returns null when order does not exist', () => {
  let prepareCallCount = 0;
  const db = {
    prepare() {
      prepareCallCount += 1;
      return {
        get(orderId) {
          assert.equal(orderId, 'ord-missing');
          return undefined;
        },
      };
    },
  };

  const { getOrderById } = loadRepositoryWithDb(db);
  const result = getOrderById('ord-missing');

  assert.equal(result, null);
  assert.equal(prepareCallCount, 1);
});

test('getOrderById returns order with item list when found', () => {
  const calls = [];
  const db = {
    prepare(sql) {
      calls.push(sql);

      if (calls.length === 1) {
        return {
          get(orderId) {
            assert.equal(orderId, 'ord-5001');
            return {
              id: 'ord-5001',
              orderNumber: '5001',
              orderDate: '2026-03-24',
              status: 'Processing',
              totalCents: 1099,
            };
          },
        };
      }

      return {
        all(orderId) {
          assert.equal(orderId, 'ord-5001');
          return [{ id: 1, productName: 'USB Cable', quantity: 1, unitPriceCents: 1099 }];
        },
      };
    },
  };

  const { getOrderById } = loadRepositoryWithDb(db);
  const order = getOrderById('ord-5001');

  assert.deepEqual(order, {
    id: 'ord-5001',
    orderNumber: '5001',
    orderDate: '2026-03-24',
    status: 'Processing',
    totalCents: 1099,
    items: [{ id: 1, productName: 'USB Cable', quantity: 1, unitPriceCents: 1099 }],
  });
  assert.equal(calls.length, 2);
  assert.match(calls[1], /FROM order_items/);
});
