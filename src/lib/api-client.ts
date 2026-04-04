
const API_BASE_URL = 'http://localhost:3000';
const STORAGE_KEY_ACCESS_TOKEN = 'nexus_access_token';
const STORAGE_KEY_REFRESH_TOKEN = 'nexus_refresh_token';

export type TaskStatus = 'pending' | 'completed';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN) : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiClient = {
  // Auth
  register: async (name: string, email: string, pass: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass }),
    });
    if (!res.ok) throw new Error('Registration failed');
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, data.refreshToken);
    return data;
  },

  login: async (email: string, pass: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, data.refreshToken);
    return data;
  },

  refresh: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, data.refreshToken);
    return data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
  },

  isAuthenticated: () => {
    return typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
  },

  // Tasks
  getTasks: async (filters: { page?: number; limit?: number; status?: string; priority?: string } = {}): Promise<Task[]> => {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`${API_BASE_URL}/tasks?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    // Assuming the backend returns an array or an object with a data property
    return Array.isArray(data) ? data : data.tasks || [];
  },

  createTask: async (taskData: Omit<Task, 'id' | 'status'>): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...taskData, status: 'pending' }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  toggleTaskStatus: async (id: string): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle status');
    return res.json();
  }
};
