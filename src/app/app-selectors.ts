import { createSelector } from "@reduxjs/toolkit";
import { APP_STATE_KEY } from "./app-constants";
import { RootState } from "./store";
import { DefaultOptionType } from "antd/es/select";
import * as d3 from "d3";

const getAppState = (state: RootState) => state[APP_STATE_KEY];

export const getSelectedYear = createSelector(
  getAppState,
  (state) => state.year
);

export const getSelectedSex = createSelector(getAppState, (state) => state.sex);

export const getSelectedCountry = createSelector(
  getAppState,
  (state) => state.country
);

export const getStatisticsFull = createSelector(
  getAppState,
  (state) => state.data
);

// export const getStatisticsYearSex = createSelector(
//   [getStatisticsFull, getSelectedYear, getSelectedSex],
//   (data, year, sex) => data?.filter((d) => d.year === year && d.sex === sex)
// );

export const getStatisticsYearSex = createSelector(
  [getStatisticsFull, getSelectedYear, getSelectedSex],
  (data, year, sex) => {
    if (!data || !year || !sex) return [];

    if (sex === "Ratio") {
      const groupedByYearCountry: Record<
        number,
        Record<string, { male?: number; female?: number; code?: string }>
      > = {};

      data.forEach((d) => {
        if (d.year === year) {
          if (!groupedByYearCountry[d.year]) {
            groupedByYearCountry[d.year] = {};
          }
          if (!groupedByYearCountry[d.year][d.country]) {
            groupedByYearCountry[d.year][d.country] = {};
          }
          if (d.sex === "Male")
            groupedByYearCountry[d.year][d.country].male = d.rate;
          if (d.sex === "Female")
            groupedByYearCountry[d.year][d.country].female = d.rate;
          groupedByYearCountry[d.year][d.country].code = d.code;
        }
      });

      const filteredRatioData = Object.entries(
        groupedByYearCountry[year] || {}
      ).map(([country, { male, female, code }]) => ({
        country,
        code, // Include countryCode here
        year,
        rate: female && male ? male / female : null, // Avoid division by zero
      }));
      return filteredRatioData;
    } else {
      // Filter data for a specific sex (e.g., "Male", "Female", etc.)
      const filteredData = data.filter((d) => d.year === year && d.sex === sex);
      return filteredData;
    }
  }
);

export const getUniqueCountries = createSelector(getStatisticsFull, (data) => {
  return Array.from(new Set(data?.map((d) => d.country)));
});

export const getCountryOptions = createSelector(
  getUniqueCountries,
  (countries) =>
    [
      { value: "World", label: "World" },
      ...countries
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map((country) => ({
          value: country,
          label: country,
        })),
    ] as DefaultOptionType[]
);

// export const getStatisticsbyCountry = createSelector(
//   [getStatisticsFull, getSelectedCountry],
//   (data, country) => data?.filter((d) => d.country === country)
// );

interface ProcessedData {
  year: number;
  male: number | null;
  female: number | null;
  both: number | null;
}

export const getStatisticsWorld = createSelector(getStatisticsFull, (data) => {
  if (!data) return [];

  const groupedByYear = data.reduce((acc, { year, sex, rate }) => {
    if (!acc[year]) acc[year] = { year, Male: [], Female: [], BothSexes: [] };
    if (sex === "Male") acc[year].Male.push(rate);
    if (sex === "Female") acc[year].Female.push(rate);
    if (sex === "Both sexes") acc[year].BothSexes.push(rate);
    return acc;
  }, {} as Record<number, { year: number; Male: number[]; Female: number[]; BothSexes: number[] }>);

  return Object.values(groupedByYear).map(
    ({ year, Male, Female, BothSexes }) => ({
      year,
      male: Male.length ? d3.mean(Male) : null,
      female: Female.length ? d3.mean(Female) : null,
      both: BothSexes.length ? d3.mean(BothSexes) : null,
    })
  );
});

export const getStatisticsByCountry = createSelector(
  [getStatisticsFull, getSelectedCountry],
  (data, country): ProcessedData[] => {
    if (!data || !country) return [];

    // Filter data by selected country
    const filteredData = data.filter((d) => d.country === country);

    // Group by year and map values for each sex
    const groupedData: Record<number, ProcessedData> = {};

    filteredData.forEach((d) => {
      if (!groupedData[d.year]) {
        groupedData[d.year] = {
          year: d.year,
          male: null,
          female: null,
          both: null,
        };
      }
      if (d.sex === "Male") groupedData[d.year].male = d.rate;
      if (d.sex === "Female") groupedData[d.year].female = d.rate;
      if (d.sex === "Both sexes") groupedData[d.year].both = d.rate;
    });

    // Convert object to array sorted by year
    return Object.values(groupedData).sort((a, b) => a.year - b.year);
  }
);
