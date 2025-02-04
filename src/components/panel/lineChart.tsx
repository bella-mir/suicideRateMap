import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import {
  getSelectedCountry,
  getSelectedYear,
  getStatisticsByCountry,
  getStatisticsWorld,
} from "../../app/app-selectors";

const LineChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const countryData = useSelector(getStatisticsByCountry);
  const worldData = useSelector(getStatisticsWorld);
  const selectedCountry = useSelector(getSelectedCountry);
  const selectedYear = useSelector(getSelectedYear);

  const [showWorldData, setShowWorldData] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !worldData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };

    const xScale = d3
      .scaleTime()
      .domain(
        d3.extent(
          [...countryData, ...worldData],
          (d) => new Date(d.year, 0, 1)
        ) as [Date, Date]
      )
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max([...countryData, ...worldData], (d) =>
          Math.max(d.male ?? 0, d.female ?? 0, d.both ?? 0)
        ) as number,
      ])
      .range([height - margin.bottom, margin.top]);

    const colorMap = {
      // male: "#425B8C",
      // female: "#D9669B",
      // both: "#D9B566",
      male: "#3A4B6D",
      female: "#F03D99",
      both: "#F1D054",
      maleWorld: "#567BB8",
      femaleWorld: "#B95D8D",
      bothWorld: "#B7A25E",
    };
    //@ts-expect-error xxx
    const drawLine = (data, key, strokeDasharray = "0") => {
      const line = d3
        .line()
        //@ts-expect-error xxx
        .x((d) => xScale(new Date(d.year, 0, 1)))
        .y((d) => yScale(d[key] as number))
        .defined((d) => d[key] !== null) // Игнорируем null
        .curve(d3.curveMonotoneX);

      const color =
        //@ts-expect-error xxx
        selectedCountry == "World" ? colorMap[`${key}World`] : colorMap[key];

      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", strokeDasharray)
        //@ts-expect-error xxx
        .attr("d", line as unknown);
    };

    if (selectedCountry !== "World") {
      ["male", "female", "both"].forEach((key) => drawLine(countryData, key));
    }

    if (showWorldData || selectedCountry == "World") {
      ["male", "female", "both"].forEach((key) =>
        drawLine(worldData, key, "5,5")
      );
    }

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      //@ts-expect-error xxx
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Добавляем точки и tooltips
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid black")
      .style("border-radius", "5px")
      .style("visibility", "hidden");

    //@ts-expect-error xxx
    const addPoints = (data, key) => {
      svg
        .selectAll(`.dot-${key}`)
        //@ts-expect-error xxx
        .data(data.filter((d) => d[key] !== null))
        .enter()
        .append("circle")
        //@ts-expect-error xxx
        .attr("cx", (d) => xScale(new Date(d.year, 0, 1)))
        //@ts-expect-error xxx
        .attr("cy", (d) => yScale(d[key] as number))
        .attr("r", 4)
        //@ts-expect-error xxx
        .attr("fill", colorMap[key])
        .on("mouseover", (event, d) => {
          tooltip
            //@ts-expect-error xxx
            .html(`Year: ${d.year} <br> ${key}: ${d[key]}`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px")
            .style("visibility", "visible");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    };

    if (selectedCountry !== "World") {
      ["male", "female", "both"].forEach((key) => addPoints(countryData, key));
    }
    if (selectedCountry == "World") {
      ["male", "female", "both"].forEach((key) => addPoints(worldData, key));
    }
    if (selectedYear) {
      svg
        .append("line")
        .attr("x1", xScale(new Date(selectedYear, 0, 1)))
        .attr("x2", xScale(new Date(selectedYear, 0, 1)))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,2");
    }
  }, [countryData, worldData, selectedCountry, showWorldData, selectedYear]);

  return (
    <div>
      {selectedCountry !== "World" && (
        <label>
          <input
            type="checkbox"
            checked={showWorldData}
            onChange={() => setShowWorldData((prev) => !prev)}
          />
          Show world average
        </label>
      )}

      <svg ref={svgRef} width={450} height={400}></svg>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
      >
        {[
          { label: "Male", color: "#3A4B6D" },
          { label: "Female", color: "#F03D99" },
          { label: "Both", color: "#F1D054" },
        ].map(({ label, color }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: color,
                marginRight: "5px",
              }}
            ></div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
