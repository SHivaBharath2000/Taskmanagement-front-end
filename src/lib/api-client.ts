
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY_ACCESS_TOKEN = 'nexus_access_token';
const STORAGE_KEY_REFRESH_TOKEN = 'nexus_refresh_token';

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
};

// Initial mock data
let mockTasks: Task[] = [
  { id: '1', title: 'Finish project proposal', description: 'Review the latest specs and update the draft.', completed: false, priority: 'high', category: 'Work', dueDate: '2024-05-20' },
  { id: '2', title: 'Grocery shopping', description: 'Buy milk, eggs, bread, and fruits.', completed: true, priority: 'low', category: 'Personal', dueDate: '2024-05-18' },
  { id: '3', title: 'Gym workout', description: 'Leg day routine with high intensity.', completed: false, priority: 'medium', category: 'Health', dueDate: '2024-05-19' },
  { id: '4', title: 'Call with client', description: 'Discuss the Q3 roadmap.', completed: false, priority: 'high', category: 'Work', dueDate: '2024-05-21' },
];

export const apiClient = {
  // Auth
  login: async (email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 800));
    if (email && pass) {
      localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, 'mock_access_token_' + Date.now());
      localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, 'mock_refresh_token_' + Date.now());
      return { success: true };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (name: string, email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, 'mock_access_token_' + Date.now());
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, 'mock_refresh_token_' + Date.now());
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
  },

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    await new Promise(r => setTimeout(r, 500));
    return [...mockTasks];
  },

  createTask: async (taskData: Omit<Task, 'id' | 'completed'>): Promise<Task> => {
    await new Promise(r => setTimeout(r, 500));
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
    };
    mockTasks = [newTask, ...mockTasks];
    return newTask;
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    await new Promise(r => setTimeout(r, 500));
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    mockTasks[index] = { ...mockTasks[index], ...updates };
    return mockTasks[index];
  },

  deleteTask: async (id: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 500));
    mockTasks = mockTasks.filter(t => t.id !== id);
  },

  toggleTaskStatus: async (id: string): Promise<Task> => {
    await new Promise(r => setTimeout(r, 300));
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    mockTasks[index] = { ...mockTasks[index], completed: !mockTasks[index].completed };
    return mockTasks[index];
  }
};
