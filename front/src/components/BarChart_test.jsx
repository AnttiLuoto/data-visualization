// import React, {useRef, useEffect, useState} from "react";
// import * as d3 from 'd3';
// import TooltipSeasonStats from "./TooltipSeasonStats.jsx";
//
// const BarChart_test = ({data, playerAttribute}) => {
//
//     const ref = useRef();
//
//     useEffect(() => {
//
//         const svgHeight = 400
//         const svgWidth = 600
//         const margin = {top: 30, right: 20, bottom: 50, left: 20};
//         const tooltipSize = 100
//         const barColor = "#6cb71f"
//
//         // Creating an svg to render to
//         const svg = d3.select(ref.current)
//             .attr('width', svgWidth)
//             .attr('height', svgHeight)
//
//         // Set the scales
//         const xScale = d3.scaleBand() // For categories, discrete
//             // eslint-disable-next-line react/prop-types
//             .domain(data.map((d, i) => d.season)) // Each season (str) gets its own value, which will be used later
//             .range([margin.left, svgWidth - margin.right])
//             .padding(0.1);
//
//         const yScale = d3.scaleLinear() // For continuous variables
//             .domain([0, d3.max(data, d => d[playerAttribute]) * 1.2])
//             .range([svgHeight - margin.bottom, margin.top]);
//
//         // Add bars. We are basically enumerating over the array provided
//         const bars = svg.selectAll('rect').data(data);
//
//         const barsEnter = bars.enter()
//             .append('rect') // Appending the created rectangles to the svg
//             .attr('x', (d, i) => xScale(d.season)) // Provide item season attribute, and let the xScale set the correct position
//             .attr('width', xScale.bandwidth())
//             .attr('y', yScale(0)) // Start from y = 0
//             .attr('height', 0) // Start with height 0
//             .attr("rx", 6)
//             .attr('fill', barColor)
//
//         // Apply the initial transition to the entering bars
//         barsEnter.transition()
//             .duration(800)
//             .attr('y', d => yScale(d[playerAttribute]))
//             .attr('height', d => svgHeight - margin.bottom - yScale(d[playerAttribute]));
//
//
//         // Merge enter and update selections
//         barsEnter.merge(bars)
//             .transition()
//             .duration(800)
//             .attr('x', d => xScale(d.season))
//             .attr('width', xScale.bandwidth())
//             .attr('y', d => yScale(d[playerAttribute]))
//             .attr('height', d => svgHeight - margin.bottom - yScale(d[playerAttribute]))
//             .attr('fill', barColor);
//
//         // Add exit transition
//         bars.exit().transition()
//             .duration(800)
//             .attr('x', svgWidth) // Move bars out to the right
//             .attr('width', 0)
//             .remove();
//
//     }, [data, playerAttribute]);
//
//     return (
//         <div style={{position: 'relative'}}>
//             <svg ref={ref}></svg>
//         </div>
//     )
// }
//
// export default BarChart_test


import React, { useRef, useEffect } from "react";
import * as d3 from 'd3';

const BarChart_test = ({ data, playerAttribute }) => {
    const ref = useRef();

    useEffect(() => {
        const svgHeight = 400;
        const svgWidth = 600;
        const margin = { top: 30, right: 20, bottom: 50, left: 20 };
        const barColor = "#6cb71f";

        // Clear previous SVG contents
        const svg = d3.select(ref.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .selectAll("*").remove(); // Remove all child elements

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.season))
            .range([margin.left, svgWidth - margin.right])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[playerAttribute]) * 1.2])
            .range([svgHeight - margin.bottom, margin.top]);

        // Now render the bars with new data
        renderBars(data);

        function renderBars(data) {
            // Bind data to bars
            const bars = svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', d => xScale(d.season))
                .attr('width', xScale.bandwidth())
                .attr('y', d => yScale(d[playerAttribute]))
                .attr('height', d => svgHeight - margin.bottom - yScale(d[playerAttribute]))
                .attr('fill', barColor);

            // Animate bars if needed
            bars.transition()
                .duration(800)
                .attr('y', d => yScale(d[playerAttribute]))
                .attr('height', d => svgHeight - margin.bottom - yScale(d[playerAttribute]));
        }

    }, [data, playerAttribute]); // Effect runs when either data or playerAttribute changes

    return (
        <div style={{ position: 'relative' }}>
            <svg ref={ref}></svg>
        </div>
    );
}

export default BarChart_test;
