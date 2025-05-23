import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer API
export const customerApi = {
  getAll: () => api.get('/customers/'),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers/', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Product API
export const productApi = {
  getAll: () => api.get('/products/'),
  getById: (code: string) => api.get(`/products/${code}`),
  create: (data: any) => api.post('/products/', data),
  update: (code: string, data: any) => api.put(`/products/${code}`, data),
  delete: (code: string) => api.delete(`/products/${code}`),
};

// Account API
export const accountApi = {
  getAll: () => api.get('/accounts/'),
  getById: (number: string) => api.get(`/accounts/${number}`),
  create: (data: any) => api.post('/accounts/', data),
  update: (number: string, data: any) => api.put(`/accounts/${number}`, data),
  delete: (number: string) => api.delete(`/accounts/${number}`),
  getTransactions: (number: string) => api.get(`/accounts/${number}/transactions/`),
};

// Transaction API
export const transactionApi = {
  getAll: () => api.get('/transactions/'),
  create: (data: any) => api.post('/transactions/', data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

export default api; 