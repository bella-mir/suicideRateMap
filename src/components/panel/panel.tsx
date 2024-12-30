import styles from "./panel.module.scss";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getSelectedSex, getSelectedYear } from "../../app/app-selectors";
import { setSelectedYear, setSelectedSex } from "../../app/app-actions";

export const Panel = () => {
  const dispatch = useAppDispatch();

  const year = useAppSelector(getSelectedYear);
  const sex = useAppSelector(getSelectedSex);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSelectedYear(+e.target.value));
  };

  const handleSexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      setSelectedSex(e.target.value as "Both sexes" | "Female" | "Male")
    );
  };

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        <h1>Suicide Rates</h1>
        <div>Select Year</div>
        <div>
          <label>
            Year:{" "}
            <input
              type="range"
              min="2000"
              max="2019"
              value={year as number}
              onChange={handleYearChange}
            />
            {year}
          </label>
          <br />
          <label>
            By Sex:{" "}
            <select value={sex} onChange={handleSexChange}>
              <option value="Both sexes">Total</option>
              <option value="Male">Men</option>
              <option value="Female">Women</option>
            </select>
          </label>
        </div>

        <div>Worldwide</div>
        <p>Тут будет график, но выделен отдельный год</p>
        <div>By Country</div>
        <p>
          Тут можно выбрать отдельную страну (а может стоит встроить в блок
          выше)
        </p>
      </div>
    </div>
  );
};
