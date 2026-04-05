const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const getHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'An unexpected error occurred');
  return data;
};

export const apiClient = {
  auth: {
    login: async (email: string, pass: string) => {
      const data = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      }).then(handleResponse);
      
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },

    register: async (name: string, email: string, pass: string) => {
      return await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      }).then(handleResponse);
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },

    isLoggedIn: () => {
      if (typeof window === 'undefined') return false;
      return !!localStorage.getItem('token');
    },
  },

  tasks: {
    list: async (status?: string) => {
      const url = new URL(`${BASE_URL}/tasks`);
      if (status && status !== 'all') {
        url.searchParams.append('status', status);
      }
      return fetch(url.toString(), { headers: getHeaders() }).then(handleResponse);
    },

    create: async (task: { title: string; description?: string }) => {
      return fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...task, status: 'TODO' }),
      }).then(handleResponse);
    },

    update: async (id: string, updates: Partial<Task>) => {
      return fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      }).then(handleResponse);
    },

    delete: async (id: string) => {
      return fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    toggle: async (id: string) => {
      return fetch(`${BASE_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      }).then(handleResponse);
    },
  },
};