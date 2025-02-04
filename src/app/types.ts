export interface DataEntry {
  year: number;
  country: string;
  code: string;
  sex: string;
  rate: number;
}

export type TSex = "Both sexes" | "Male" | "Female" | "Ratio";
