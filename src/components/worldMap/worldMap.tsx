import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "d3-geo-projection";
import styles from "./worldMap.module.scss";
import { useAppSelector } from "../../app/hooks";
import { getStatisticsYearSex } from "../../app/app-selectors";

interface GeoJsonFeature {
  properties: {
    SOV_A3: string;
  };
  geometry: GeoJSON.Geometry;
  type: string;
}

interface GeoJson {
  features: GeoJsonFeature[];
}

export const WorldMap = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const legendRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const data = useAppSelector(getStatisticsYearSex);

  const [width, setWidth] = useState<number>(window.innerWidth * 0.8);
  const [height, setHeight] = useState<number>(window.innerWidth * 0.5);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerWidth * 0.5);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!data) return;

    const rates = data.map((d) => d.rate);
    //@ts-expect-error xxx
    const minRate = Math.min(...rates);
    //@ts-expect-error xxx
    const maxRate = Math.max(...rates);

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    svg.attr("width", width).attr("height", height);

    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 2]);

    const geoPathMap = d3.geoPath().projection(projection);

    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlBu) // Красный -> Желтый -> Синий
      .domain([maxRate, minRate]); // Обратный порядок, чтобы красный был высоким значением

    d3.json<GeoJson>("data/world_geojson_3.geojson").then((geoData) => {
      if (!geoData) return;

      const countryRates: Record<string, { rate: number; country: string }> =
        Object.fromEntries(
          data.map((d) => [d.code, { rate: d.rate, country: d.country }])
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
        //@ts-expect-error weird
        .attr("d", geoPathMap)
        .style("stroke", "#fff")
        .on("mouseover", function (_event, d) {
          const code = d.properties.SOV_A3;
          const country = countryRates[code]?.country || "Unknown";
          const rate = countryRates[code]?.rate || "No data";

          d3.select(this)
            .style("stroke-width", "3")
            .style("cursor", "pointer")
            .transition()
            .duration(200)
            .attr("transform", "scale(1.0005)");

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
          d3.select(this)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("cursor", "default")
            .transition()
            .duration(200)
            .attr("transform", "scale(1)");
          tooltip.style("visibility", "hidden");
        });

      // Добавляем легенду
      const legendWidth = 300;
      const legendHeight = 10;
      const legendSvg = d3.select(legendRef.current);

      legendSvg.selectAll("*").remove(); // Удаляем старую легенду

      const defs = legendSvg.append("defs");
      const linearGradient = defs
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

      const numStops = 10;
      const stopScale = d3
        .scaleLinear()
        .domain([0, numStops - 1])
        .range([minRate, maxRate]);

      Array.from({ length: numStops }).forEach((_, i) => {
        linearGradient
          .append("stop")
          .attr("offset", `${(i / (numStops - 1)) * 100}%`)
          .attr("stop-color", colorScale(stopScale(i)));
      });

      legendSvg
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

      // Подписи к шкале
      legendSvg
        .append("text")
        .attr("x", 0)
        .attr("y", 25)
        .attr("font-size", "12px")
        .text(`Low (${minRate.toFixed(1)})`);

      legendSvg
        .append("text")
        .attr("x", legendWidth)
        .attr("y", 25)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .text(`High (${maxRate.toFixed(1)})`);
    });
  }, [data, width, height]);

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

      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      ></svg>

      <svg
        ref={legendRef}
        width={300}
        height={30}
        style={{ marginTop: "10px" }}
      ></svg>
    </div>
  );
};
