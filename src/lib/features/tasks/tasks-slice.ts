import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, Task } from '@/lib/api-client';

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

export const loadTasks = createAsyncThunk('tasks/load', async (status: string | undefined) => {
  return await apiClient.tasks.list(status);
});

export const addTask = createAsyncThunk('tasks/add', async (payload: any) => {
  return await apiClient.tasks.create(payload);
});

export const patchTask = createAsyncThunk('tasks/patch', async ({ id, updates }: any) => {
  return await apiClient.tasks.update(id, updates);
});

export const removeTask = createAsyncThunk('tasks/remove', async (id: string) => {
  await apiClient.tasks.delete(id);
  return id;
});

export const toggleTaskStatus = createAsyncThunk('tasks/toggle', async (id: string) => {
  return await apiClient.tasks.toggle(id);
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Flexible extraction: handles array or object with items/tasks/data property
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.items = payload;
        } else if (payload && typeof payload === 'object') {
          state.items = payload.tasks || payload.items || payload.data || [];
        } else {
          state.items = [];
        }
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load tasks';
      })
      .addCase(addTask.fulfilled, (state, action) => {
        if (!Array.isArray(state.items)) {
          state.items = [];
        }
        state.items.unshift(action.payload);
      })
      .addCase(patchTask.fulfilled, (state, action) => {
        const i = state.items.findIndex(t => t.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const i = state.items.findIndex(t => t.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
