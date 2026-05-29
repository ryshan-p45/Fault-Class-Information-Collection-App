import axios from 'axios';
import type { FaultClass, FaultClassAnswers, GlobalAnswers } from './types';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to /login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function login(username: string, password: string): Promise<void> {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.token);
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export async function getFaultClasses(): Promise<FaultClass[]> {
  const response = await api.get('/fault-classes');
  return response.data;
}

export async function updateFaultClass(
  id: number,
  data: { engineer_validated: boolean; priority_to_improve: string | null }
): Promise<FaultClass> {
  const response = await api.put(`/fault-classes/${id}`, data);
  return response.data;
}

export async function getAnswers(faultClassId: number): Promise<FaultClassAnswers> {
  const response = await api.get(`/answers/${faultClassId}`);
  return response.data;
}

export async function saveAnswers(
  faultClassId: number,
  answers: Partial<FaultClassAnswers>
): Promise<FaultClassAnswers> {
  const response = await api.put(`/answers/${faultClassId}`, answers);
  return response.data;
}

export async function getGlobalAnswers(): Promise<GlobalAnswers> {
  const response = await api.get('/global-answers');
  return response.data;
}

export async function saveGlobalAnswers(answers: Partial<GlobalAnswers>): Promise<GlobalAnswers> {
  const response = await api.put('/global-answers', answers);
  return response.data;
}

export async function exportCsv(): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/export/csv', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fault_classes_rubric.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default api;
