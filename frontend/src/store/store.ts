import { configureStore } from '@reduxjs/toolkit';
import countriesReducer from './slices/countriesSlice';
import testReducer from './slices/testSlice';

export const store = configureStore({
  reducer: {
    test: testReducer,
    countries: countriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;