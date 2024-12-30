import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { appSlice } from "./app-slices";

const rootReducer = combineReducers({
  [appSlice.name]: appSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
