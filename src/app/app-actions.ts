import { createAction } from "@reduxjs/toolkit";
import { APP_STATE_KEY } from "./app-constants";
import { DataEntry, TSex } from "./types";

export const setSelectedYear = createAction(
  `${APP_STATE_KEY}/setSelectedYear`,
  (payload: number) => ({
    payload,
  })
);

export const setSelectedSex = createAction(
  `${APP_STATE_KEY}/setSelectedSex`,
  (payload: TSex) => ({
    payload,
  })
);

export const setSelectedCountry = createAction(
  `${APP_STATE_KEY}/setSelectedCountry`,
  (payload: string) => ({
    payload,
  })
);

export const setStatisticData = createAction(
  `${APP_STATE_KEY}/setStatisticData`,
  (payload: DataEntry[]) => ({
    payload,
  })
);
