import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  useEffect(() => {
    fetchData(activeTab);
    // Reset filters when switching tabs
    resetFilters();
  }, [activeTab]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setTargetTypeFilter('');
  };

  const fetchData = async (tab) => {
    setLoading(true);
    setError('');
    setData([]);
    let url = '';
    
    if (tab === 'users') url = 'http://localhost:5000/api/admin/users';
    else if (tab === 'products') url = 'http://localhost:5000/api/admin/products';
    else if (tab === 'orders') url = 'http://localhost:5000/api/admin/orders';
    else if (tab === 'reports') url = 'http://localhost:5000/api/admin/reports';

    try {
      const res = await axios.get(url, config);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch ${tab}`);
    }
    setLoading(false);
  };

  // Derived filtered data
  const getFilteredData = () => {
    if (activeTab === 'users') {
      return data.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeTab === 'products') {
      return data.filter(product => {
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        const matchesType = typeFilter ? product.type === typeFilter : true;
        return matchesCategory && matchesType;
      });
    } else if (activeTab === 'orders') {
      return data.filter(order => 
        statusFilter ? order.status === statusFilter : true
      );
    } else if (activeTab === 'reports') {
      return data.filter(report => 
        targetTypeFilter ? report.targetType === targetTypeFilter : true
      );
    }
    return data;
  };

  const filteredData = getFilteredData();
  const uniqueCategories = activeTab === 'products' ? [...new Set(data.map(p => p.category))] : [];

  const handleBlockUser = async (id, isBlocked) => {
    if (!window.confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) return;
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${id}/block`, {}, config);
      fetchData('users');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
      fetchData('users');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, config);
      fetchData('products');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

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
            </tr>
          ))}
          {filteredData.length === 0 && !loading && <tr><td colSpan="6">No reports found.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="admin-container">
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
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-section">
        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
        {loading ? (
          <div className="loading-container">Loading data...</div>
        ) : (
          <>
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'reports' && renderReports()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
