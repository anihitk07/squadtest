import { useEffect, useMemo, useState } from 'react';
import { OrderDetail } from './OrderDetail';

const PAGE_SIZE = 5;

const VIEW_STATES = {
  loading: 'loading',
  success: 'success',
  empty: 'empty',
  error: 'error',
};

const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
};

const DEFAULT_SORT = {
  key: 'orderDate',
  direction: SORT_DIRECTIONS.desc,
};

const SORTABLE_COLUMNS = [
  { key: 'id', label: 'Order ID', numeric: false },
  { key: 'orderDate', label: 'Order Date', numeric: false },
  { key: 'status', label: 'Status', numeric: false },
  { key: 'totalCents', label: 'Total', numeric: true },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function compareValues(aValue, bValue, isNumeric) {
  if (isNumeric) {
    return Number(aValue) - Number(bValue);
  }

  return String(aValue).localeCompare(String(bValue));
}

function sortOrders(orders, sortConfig) {
  const column = SORTABLE_COLUMNS.find((item) => item.key === sortConfig.key);
  const directionMultiplier = sortConfig.direction === SORT_DIRECTIONS.asc ? 1 : -1;

  return [...orders].sort((left, right) => {
    const comparison = compareValues(left[sortConfig.key], right[sortConfig.key], column?.numeric);

    if (comparison !== 0) {
      return comparison * directionMultiplier;
    }

    return String(left.id).localeCompare(String(right.id));
  });
}

function getStatusTone(status) {
  const value = String(status || '').toLowerCase();
  if (['delivered', 'shipped', 'complete', 'completed'].includes(value)) {
    return 'status-success';
  }

  if (['processing', 'pending', 'in transit'].includes(value)) {
    return 'status-progress';
  }

  return 'status-neutral';
}

export function OrderLandingPage({ fetchOrderHistory, fetchOrderDetail }) {
  const [ordersState, setOrdersState] = useState(VIEW_STATES.loading);
  const [ordersError, setOrdersError] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setOrdersState(VIEW_STATES.loading);
      setOrdersError('');
      setOrders([]);
      setSelectedOrder(null);
      setSelectedOrderId(null);
      setDetailError('');

      try {
        const orderHistory = await fetchOrderHistory();

        if (cancelled) {
          return;
        }

        if (!orderHistory.length) {
          setOrdersState(VIEW_STATES.empty);
          return;
        }

        setOrders(orderHistory);
        setOrdersState(VIEW_STATES.success);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setOrdersState(VIEW_STATES.error);
        setOrdersError(error.message || 'Unable to load order history.');
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [fetchOrderHistory]);

  useEffect(() => {
    if (ordersState !== VIEW_STATES.success || !selectedOrderId) {
      setSelectedOrder(null);
      setIsDetailLoading(false);
      setDetailError('');
      return;
    }

    let cancelled = false;

    async function loadOrderDetail() {
      setIsDetailLoading(true);
      setDetailError('');

      try {
        const orderDetail = await fetchOrderDetail(selectedOrderId);
        if (!cancelled) {
          setSelectedOrder(orderDetail);
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedOrder(null);
          setDetailError(error.message || 'Unable to load order details.');
        }
      } finally {
        if (!cancelled) {
          setIsDetailLoading(false);
        }
      }
    }

    loadOrderDetail();

    return () => {
      cancelled = true;
    };
  }, [fetchOrderDetail, ordersState, selectedOrderId]);

  const sortedOrders = useMemo(() => {
    if (ordersState !== VIEW_STATES.success) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? orders.filter(
          (order) =>
            order.id.toLowerCase().includes(query) ||
            order.orderDate.toLowerCase().includes(query) ||
            order.status.toLowerCase().includes(query),
        )
      : orders;

    return sortOrders(filtered, sortConfig);
  }, [orders, ordersState, sortConfig, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedOrders.slice(start, start + PAGE_SIZE);
  }, [sortedOrders, currentPage]);

  function handleSort(columnKey) {
    setSortConfig((previousSort) => {
      if (previousSort.key === columnKey) {
        return {
          key: columnKey,
          direction:
            previousSort.direction === SORT_DIRECTIONS.asc ? SORT_DIRECTIONS.desc : SORT_DIRECTIONS.asc,
        };
      }

      return {
        key: columnKey,
        direction: SORT_DIRECTIONS.asc,
      };
    });
    setCurrentPage(1);
  }

  function handleSearch(event) {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  }

  function getSortAria(columnKey) {
    if (sortConfig.key !== columnKey) {
      return 'none';
    }

    return sortConfig.direction === SORT_DIRECTIONS.asc ? 'ascending' : 'descending';
  }

  function getSortIndicator(columnKey) {
    if (sortConfig.key !== columnKey) {
      return '';
    }

    return sortConfig.direction === SORT_DIRECTIONS.asc ? '↑' : '↓';
  }

  return (
    <section className="layout-grid orders-layout" aria-label="Order landing page">
      <section className="panel" aria-label="Order history">
        <h2>Order history</h2>

        {ordersState === VIEW_STATES.error ? <p className="error-banner">{ordersError}</p> : null}

        {ordersState === VIEW_STATES.empty ? <p className="panel-message">No orders found.</p> : null}

        {ordersState === VIEW_STATES.loading ? (
          <p className="panel-message">Loading order history...</p>
        ) : null}

        {ordersState === VIEW_STATES.success ? (
          <div className="order-grid-wrapper">
            <div className="order-grid-toolbar">
              <input
                type="search"
                className="order-search-input"
                placeholder="Search by order ID, date, or status…"
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search orders"
              />
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  {SORTABLE_COLUMNS.map((column) => (
                    <th key={column.key} scope="col" aria-sort={getSortAria(column.key)}>
                      <button
                        className="sort-button"
                        onClick={() => handleSort(column.key)}
                        type="button"
                        aria-label={`Sort by ${column.label}`}
                      >
                        {column.label}
                        <span className="sort-indicator" aria-hidden="true">
                          {getSortIndicator(column.key)}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={SORTABLE_COLUMNS.length} className="order-grid-no-results">
                      No orders match your search.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const isSelected = order.id === selectedOrderId;
                    return (
                      <tr key={order.id} className={isSelected ? 'is-selected' : ''}>
                        <td>
                          <button
                            type="button"
                            className="order-id-link"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            {order.id}
                          </button>
                        </td>
                        <td>{order.orderDate}</td>
                        <td>
                          <span className={`status-chip ${getStatusTone(order.status)}`}>{order.status}</span>
                        </td>
                        <td>{currencyFormatter.format(order.totalCents / 100)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="order-grid-pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ‹ Prev
                </button>
                <span className="pagination-info" aria-live="polite">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <section className="panel" aria-label="Order details panel">
        <h2>Order details</h2>
        {ordersState === VIEW_STATES.error ? (
          <p className="panel-message">Order details unavailable while order history failed to load.</p>
        ) : (
          <>
            {detailError ? <p className="error-banner">{detailError}</p> : null}
            <OrderDetail order={selectedOrder} isLoading={isDetailLoading} />
          </>
        )}
      </section>
    </section>
  );
}
