import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const STAT_CARDS_CONFIG = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: 'payments', format: 'currency', accent: 'revenue' },
  { key: 'activeUsers', label: 'Active Users', icon: 'group', format: 'number', accent: 'users' },
  { key: 'totalProducts', label: 'Total Products', icon: 'inventory_2', format: 'number', accent: 'products' },
  { key: 'totalOrders', label: 'Total Orders', icon: 'shopping_cart', format: 'number', accent: 'orders' },
  { key: 'totalReports', label: 'Total Reports', icon: 'assessment', format: 'number', accent: 'reports' },
  { key: 'pendingReports', label: 'Pending Reports', icon: 'pending_actions', format: 'number', accent: 'pending' },
  { key: 'resolvedReports', label: 'Resolved Reports', icon: 'check_circle', format: 'number', accent: 'resolved' },
];

const formatStatValue = (value, format) => {
  if (format === 'currency') {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  }
  return Number(value).toLocaleString('en-IN');
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');

  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'reports') fetchReports();
    // Reset filters when switching tabs
    resetFilters();
  }, [activeTab]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, config);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
    setStatsLoading(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setTargetTypeFilter('');
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/products`, config);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders`, config);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reports`, config);
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    }
    setLoading(false);
  };

  // Derived filtered data
  const getFilteredData = () => {
    if (activeTab === 'users') {
      return (Array.isArray(users) ? users : []).filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeTab === 'products') {
      return (Array.isArray(products) ? products : []).filter(product => {
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        const matchesType = typeFilter ? product.type === typeFilter : true;
        const matchesSearch = searchTerm ? (
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product._id.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;
        return matchesCategory && matchesType && matchesSearch;
      });
    } else if (activeTab === 'orders') {
      return (Array.isArray(orders) ? orders : []).filter(order => 
        statusFilter ? order.status === statusFilter : true
      );
    } else if (activeTab === 'reports') {
      return (Array.isArray(reports) ? reports : []).filter(report => 
        targetTypeFilter ? report.targetType === targetTypeFilter : true
      );
    }
    return [];
  };

  const filteredData = getFilteredData();
  const uniqueCategories = activeTab === 'products' ? [...new Set((Array.isArray(products) ? products : []).map(p => p.category))] : [];

  const handleBlockUser = async (id, isBlocked) => {
    if (!window.confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/block`, {}, config);
      showToast(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, config);
      showToast('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`, config);
      showToast('Product deleted successfully');
      fetchProducts();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const handleResolveReport = async (id) => {
    if (!window.confirm('Mark this report as resolved?')) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/reports/${id}/resolve`, {}, config);
      showToast('Report marked as resolved');
      fetchReports();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve report', 'error');
    }
  };

  const renderStats = () => (
    <div className="stats-section" id="admin-stats-section">
      <div className="stats-header">
        <div className="stats-header-text">
          <span className="stats-overline">OVERVIEW</span>
          <h2 className="stats-title">Marketplace Vitals</h2>
        </div>
        <button className="stats-refresh-btn" onClick={fetchStats} disabled={statsLoading} id="stats-refresh-btn">
          <span className="material-icons">{statsLoading ? 'sync' : 'refresh'}</span>
          {statsLoading ? 'Syncing...' : 'Refresh'}
        </button>
      </div>
      <div className="stats-grid">
        {STAT_CARDS_CONFIG.map((card) => (
          <div className={`stat-card stat-card--${card.accent}`} key={card.key} id={`stat-card-${card.key}`}>
            <div className="stat-card__icon-wrap">
              <span className="material-icons stat-card__icon">{card.icon}</span>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label">{card.label}</span>
              <span className="stat-card__value">
                {statsLoading ? (
                  <span className="stat-card__skeleton" />
                ) : (
                  formatStatValue(stats?.[card.key] ?? 0, card.format)
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-table-container">
      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
          id="user-search-input"
        />
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(user => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td>
                {user.role !== 'admin' && (
                  <>
                    <button 
                      className={`admin-btn ${user.isBlocked ? 'unblock' : 'block'}`}
                      id={`block-btn-${user._id}`}
                      onClick={() => handleBlockUser(user._id, user.isBlocked)}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button 
                      className="admin-btn delete"
                      id={`delete-user-btn-${user._id}`}
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && !loading && <tr><td colSpan="6">No users found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderProducts = () => (
    <div className="admin-table-container">
      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search by ID or Title..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
          id="product-search-input"
        />
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
          id="product-category-filter"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
          id="product-type-filter"
        >
          <option value="">All Types</option>
          <option value="sell">Sell</option>
          <option value="rent">Rent</option>
        </select>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Category</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(product => (
            <tr key={product._id}>
              <td>{product._id}</td>
              <td>{product.title}</td>
              <td>₹{product.price}</td>
              <td>{product.category}</td>
              <td>{product.user?.name || 'Unknown'}</td>
              <td>
                <button 
                  className="admin-btn delete"
                  id={`delete-product-btn-${product._id}`}
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && !loading && <tr><td colSpan="6">No products found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderOrders = () => (
    <div className="admin-table-container">
      <div className="filter-bar">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
          id="order-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Type</th>
            <th>Buyer</th>
            <th>Product</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.type?.toUpperCase() || 'BUY'}</td>
              <td>{order.user?.name || 'Unknown'}</td>
              <td>{order.product?.title || 'Deleted Product'}</td>
              <td>₹{order.totalAmount}</td>
              <td>{order.status || 'N/A'}</td>
            </tr>
          ))}
          {filteredData.length === 0 && !loading && <tr><td colSpan="6">No orders found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderReports = () => (
    <div className="admin-table-container">
      <div className="filter-bar">
        <select 
          value={targetTypeFilter} 
          onChange={(e) => setTargetTypeFilter(e.target.value)}
          className="filter-select"
          id="report-target-filter"
        >
          <option value="">All Target Types</option>
          <option value="user">User</option>
          <option value="product">Product</option>
        </select>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Reported By</th>
            <th>Target Type</th>
            <th>Target ID</th>
            <th>Reason</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(report => (
            <tr key={report._id}>
              <td>{report._id}</td>
              <td>{report.reportedBy?.name || 'Unknown'}</td>
              <td style={{ textTransform: 'capitalize' }}>{report.targetType}</td>
              <td>{report.targetId}</td>
              <td>{report.reason}</td>
              <td>{new Date(report.createdAt).toLocaleDateString()}</td>
              <td>
                <span className={`status-badge ${report.status === 'resolved' ? 'resolved' : 'pending'}`}>
                  {report.status || 'pending'}
                </span>
              </td>
              <td>
                {(report.status === 'pending' || !report.status) && (
                  <button 
                    className="admin-btn resolve"
                    id={`resolve-btn-${report._id}`}
                    onClick={() => handleResolveReport(report._id)}
                  >
                    Resolve
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && !loading && <tr><td colSpan="6">No reports found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-container">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {toast.message && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
      <div className="admin-header">
        <h1>Admin Control Panel</h1>
        <div className="admin-nav">
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''} 
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''} 
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button 
            className={activeTab === 'stats' ? 'active' : ''} 
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'stats' ? (
        renderStats()
      ) : (
        <div className="admin-section">
          <div className="section-header-row">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
            {loading && <span className="loading-indicator">Refreshing...</span>}
          </div>
          
          {activeTab === 'users' && users.length === 0 && loading ? (
            <div className="loading-container">Loading Users...</div>
          ) : activeTab === 'products' && products.length === 0 && loading ? (
            <div className="loading-container">Loading Products...</div>
          ) : activeTab === 'orders' && orders.length === 0 && loading ? (
            <div className="loading-container">Loading Orders...</div>
          ) : activeTab === 'reports' && reports.length === 0 && loading ? (
            <div className="loading-container">Loading Reports...</div>
          ) : (
            <>
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'products' && renderProducts()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'reports' && renderReports()}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
