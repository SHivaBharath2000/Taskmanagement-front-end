
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/auth-slice';
import tasksReducer from './features/tasks/tasks-slice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      tasks: tasksReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
