import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

export const createReservation = (data) => api.post('/api/reservations', data);
export const getReservation = (id) => api.get(`/api/reservations/${id}`);
export const getReservations = (status) =>
  api.get('/api/reservations', { params: status ? { status } : {} });
export const updateStatus = (id, status) =>
  api.put(`/api/reservations/${id}/status`, { status });
