import { useEffect } from "react";
import "./App.css";
import { Panel, WorldMap } from "./components";
import { DataEntry } from "./app/types";
import { useAppDispatch } from "./app/hooks";
import { setStatisticData } from "./app/app-actions";
import * as d3 from "d3";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    d3.csv("data/data.csv", (d) => ({
      year: +d.Period,
      country: d.Location,
      code: d.SpatialDimValueCode,
      sex: d.Dim1,
      rate: +d.FactValueNumeric,
    }))
      .then((loadedData: DataEntry[]) => {
        dispatch(setStatisticData(loadedData));
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
      });
  }, [dispatch]);

  return (
    <div className="layout">
      <Panel />
      <WorldMap />
    </div>
  );
}

export default App;
