import styles from "./panel.module.scss";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getCountryOptions,
  getSelectedCountry,
  getSelectedSex,
  getSelectedYear,
} from "../../app/app-selectors";
import {
  setSelectedYear,
  setSelectedSex,
  setSelectedCountry,
} from "../../app/app-actions";
import Select, { DefaultOptionType } from "antd/es/select";
import { TSex } from "../../app/types";
import LineChart from "./lineChart";
import Slider from "antd/es/slider";

export const Panel = () => {
  const dispatch = useAppDispatch();

  const year = useAppSelector(getSelectedYear);
  const sex = useAppSelector(getSelectedSex);
  const country = useAppSelector(getSelectedCountry);

  const countiresOptions = useAppSelector(getCountryOptions);

  const handleYearChange = (value: number) => {
    dispatch(setSelectedYear(value));
  };

  const handleSexChange = (value: TSex) => {
    dispatch(setSelectedSex(value));
  };

  const handleCountryChange = (value: string) => {
    dispatch(setSelectedCountry(value));
  };

  const SEX_OPTIONS: DefaultOptionType[] = [
    { value: "Both sexes", label: "Both sexes" },
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
    { value: "Ratio", label: "Male/Female Ratio" },
  ];

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        <h1>Suicide Rates</h1>

        <div className={styles.slider}>
          Year:
          <Slider
            className={styles.sliderEl}
            min={2000}
            max={2019}
            value={year as number}
            onChange={handleYearChange}
          />
          <span className={styles.year}>{year}</span>
        </div>

        <div className={styles.row}>
          <div className={styles.selectGroup}>
            <div>Sex:</div>
            <Select
              onChange={handleSexChange}
              className={styles.selector}
              options={SEX_OPTIONS}
              defaultValue={sex}
            />
          </div>

          <div className={styles.selectGroup}>
            <div>Statistics:</div>
            <Select
              onChange={handleCountryChange}
              className={styles.selector}
              options={countiresOptions}
              value={country}
            />
          </div>
        </div>
        <LineChart />
      </div>
    </div>
  );
};
