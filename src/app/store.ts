import { configureStore } from '@reduxjs/toolkit';
import { ticketsApi } from '../entities/ticket/api.ts';

export const createAppStore = () =>
  configureStore({
    reducer: { [ticketsApi.reducerPath]: ticketsApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ticketsApi.middleware),
  });
export const store = createAppStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
