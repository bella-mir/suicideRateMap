import { createSlice } from "@reduxjs/toolkit";
import {
  setSelectedYear,
  setSelectedSex,
  setStatisticData,
  setSelectedCountry,
} from "./app-actions";
import { APP_STATE_KEY } from "./app-constants";
import { DataEntry, TSex } from "./types";

interface AppState {
  year: number;
  sex: TSex;
  data?: DataEntry[];
  country?: string;
}

const initialState: AppState = {
  year: 2019,
  sex: "Both sexes",
  country: "World",
};

export const appSlice = createSlice({
  name: APP_STATE_KEY,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setStatisticData, (state, action) => ({
      ...state,
      data: action.payload,
    }));
    builder.addCase(setSelectedYear, (state, action) => ({
      ...state,
      year: action.payload,
    }));
    builder.addCase(setSelectedSex, (state, action) => ({
      ...state,
      sex: action.payload,
    }));
    builder.addCase(setSelectedCountry, (state, action) => ({
      ...state,
      country: action.payload,
    }));
  },
});
