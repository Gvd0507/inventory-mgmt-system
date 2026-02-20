const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || data.message || 'API call failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Items API
export const itemsAPI = {
  getAll: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiCall(`/items${query}`);
  },
  
  getById: (id) => apiCall(`/items/${id}`),
  
  create: (itemData) => apiCall('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),
  
  update: (id, itemData) => apiCall(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  }),
  
  delete: (id) => apiCall(`/items/${id}`, {
    method: 'DELETE',
  }),
};

// Sales API
export const salesAPI = {
  getAll: () => apiCall('/sales'),
  
  create: (saleData) => apiCall('/sales', {
    method: 'POST',
    body: JSON.stringify(saleData),
  }),
  
  getStats: () => apiCall('/sales/stats'),
};

// Purchases API
export const purchasesAPI = {
  getAll: () => apiCall('/purchases'),
  
  create: (purchaseData) => apiCall('/purchases', {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  }),
  
  getStats: () => apiCall('/purchases/stats'),
  
  getSuppliers: () => apiCall('/purchases/suppliers'),
};

// Utility functions
export const formatCurrency = (amount) => {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
};

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};
