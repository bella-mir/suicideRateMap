import { createSelector } from "@reduxjs/toolkit";
import { APP_STATE_KEY } from "./app-constants";
import { RootState } from "./store";

const getAppState = (state: RootState) => state[APP_STATE_KEY];

export const getSelectedYear = createSelector(
  getAppState,
  (state) => state.year
);

export const getSelectedSex = createSelector(getAppState, (state) => state.sex);
