import { createSlice } from "@reduxjs/toolkit";
import { setSelectedYear, setSelectedSex } from "./app-actions";
import { APP_STATE_KEY } from "./app-constants";

interface AppState {
  year: number;
  sex: "Both sexes" | "Male" | "Female";
}

const initialState: AppState = {
  year: 2019,
  sex: "Both sexes",
};

export const appSlice = createSlice({
  name: APP_STATE_KEY,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setSelectedYear, (state, action) => ({
      ...state,
      year: action.payload,
    }));
    builder.addCase(setSelectedSex, (state, action) => ({
      ...state,
      sex: action.payload,
    }));
  },
});
