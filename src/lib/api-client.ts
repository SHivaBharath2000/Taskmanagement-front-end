const BASE_URL = 'http://localhost:3000';

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

export const apiClient = {
  auth: {
    login: async (email: string, pass: string) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!res.ok) throw new Error('Invalid login credentials');
      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      return data;
    },

    register: async (name: string, email: string, pass: string) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      return data;
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
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
      
      const res = await fetch(url.toString(), { headers: getHeaders() });
      if (!res.ok) throw new Error('Could not load tasks');
      const data = await res.json();
      return Array.isArray(data) ? data : data.tasks || [];
    },

    create: async (task: { title: string; description?: string }) => {
      const res = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...task, status: 'TODO' }),
      });
      if (!res.ok) throw new Error('Task creation failed');
      return res.json();
    },

    update: async (id: string, updates: Partial<Task>) => {
      const res = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Task update failed');
      return res.json();
    },

    delete: async (id: string) => {
      const res = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Task deletion failed');
    },

    toggle: async (id: string) => {
      const res = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to toggle task');
      return res.json();
    },
  },
};
