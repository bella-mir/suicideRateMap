import { createAction } from "@reduxjs/toolkit";
import { APP_STATE_KEY } from "./app-constants";

export const setSelectedYear = createAction(
  `${APP_STATE_KEY}/setSelectedYear`,
  (payload: number) => ({
    payload,
  })
);

export const setSelectedSex = createAction(
  `${APP_STATE_KEY}/setSelectedSex`,
  (payload: "Both sexes" | "Male" | "Female") => ({
    payload,
  })
);
