import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "d3-geo-projection";
import styles from "./worldMap.module.scss";
import { useAppSelector } from "../../app/hooks";
import { getSelectedSex, getSelectedYear } from "../../app/app-selectors";

// Типы для данных из CSV
interface DataEntry {
  year: number;
  country: string;
  code: string;
  sex: string;
  rate: number;
}

// Типы для GeoJSON
interface GeoJsonFeature {
  properties: {
    SOV_A3: string;
  };
  geometry: any;
  type: string;
}

interface GeoJson {
  features: GeoJsonFeature[];
}

export const WorldMap = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<DataEntry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // Новое состояние

  const year = useAppSelector(getSelectedYear);
  const sex = useAppSelector(getSelectedSex);

  useEffect(() => {
    d3.csv(
      "data/data.csv",
      (d) =>
        ({
          year: +d.Period,
          country: d.Location,
          code: d.SpatialDimValueCode,
          sex: d.Dim1,
          rate: +d.FactValueNumeric,
        } as DataEntry)
    )
      .then((loadedData) => {
        setData(loadedData);
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
      });
  }, []);

  const renderMap = () => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr("width", width).attr("height", height);

    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 3 / Math.PI)
      .translate([width / 3.2, height / 3.2]);

    const geoPath = d3.geoPath().projection(projection);

    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 30]);

    d3.json<GeoJson>("data/world_geojson_3.geojson").then((geoData) => {
      const filteredData = data.filter((d) => d.year === year && d.sex === sex);

      const countryRates = Object.fromEntries(
        filteredData.map((d) => [d.code, { rate: d.rate, country: d.country }])
      );

      svg.selectAll("g").remove();
      const mapGroup = svg.append("g");

      mapGroup
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("fill", (d) => {
          const rate = countryRates[d.properties.SOV_A3]?.rate;
          return rate ? colorScale(rate) : "#ccc";
        })
        .attr("d", geoPath)
        .style("stroke", "#fff")
        .on("mouseover", function (event, d) {
          const code = d.properties.SOV_A3;
          const country = countryRates[code]?.country || "Unknown";
          const rate = countryRates[code]?.rate || "No data";

          d3.select(this).style("stroke", "orange").style("stroke-width", 2);

          tooltip
            .style("visibility", "visible")
            .html(`<strong>${country}</strong><br>Rate: ${rate}`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", `${event.pageY}px`)
            .style("left", `${event.pageX}px`);
        })
        .on("mouseout", function () {
          d3.select(this).style("stroke", "#fff").style("stroke-width", 1);
          tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {
          const code = d.properties.SOV_A3;
          const country = countryRates[code]?.country || "Unknown";

          // Устанавливаем выбранную страну
          setSelectedCountry(country);
        });

      // Добавляем легенду
      const legendWidth = 200;
      const legendHeight = 20;

      const legend = svg
        .append("g")
        .attr("transform", `translate(20, ${height - 40})`);

      const legendScale = d3
        .scaleLinear()
        .domain([0, 30])
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale).ticks(6);

      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(0));

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(30));

      legend
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

      legend
        .append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
    });
  };

  useEffect(() => {
    renderMap();

    const handleResize = () => {
      renderMap();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [year, sex, data]);

  return (
    <div className={styles.map}>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          backgroundColor: "white",
          border: "1px solid black",
          padding: "5px",
          borderRadius: "5px",
          pointerEvents: "none",
          zIndex: 10,
        }}
      ></div>
      <div>
        <svg
          ref={svgRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        ></svg>
      </div>
      {/* {selectedCountry && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "white",
            border: "1px solid black",
            padding: "5px",
            borderRadius: "5px",
          }}
        >
          <strong>Selected Country:</strong> {selectedCountry}
        </div>
      )} */}
    </div>
  );
};
