import React, {useRef, useEffect, useState} from "react";
import * as d3 from 'd3';
// import TooltipSeasonStats from "./TooltipSeasonStats.jsx";

const PriceHistoryLine = ({data, selectedProduct}) => {
    // console.log(data)

    const ref = useRef();

    useEffect(() => {
        // console.log(data)

        if (!data || data.length === 0) {
            return;
        }

        const svgHeight = 400
        const svgWidth = 600
        const margin = {top: 30, right: 20, bottom: 50, left: 40};
        const tooltipSize = 100
        const lineColor = "#80da20"
        const barColorHighlight = "#072e48"
        const tooltipColor = "#4d4c4c"

        // Creating an svg to render to
        const svg = d3.select(ref.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight)

        // Clear any existing content
        svg.selectAll('*').remove();

        // Add or update title
        const title = svg.selectAll('.title').data([selectedProduct]);
        title.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', svgWidth * 0.1)
            .attr('y', svgHeight * 0.05)
            .merge(title)
            .text("Price over time: " + selectedProduct)
            .attr('text-anchor', 'left')
            .style('font-weight', 'bold')
            .style('fill', 'white');

        title.exit().remove();

        // Set the scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date)))
            .range([margin.left, svgWidth - margin.right]);

        const yScale = d3.scaleLinear() // For continuous variables
            .domain([0, d3.max(data, d => d.unitPrice) * 1.2])
            .range([svgHeight - margin.bottom, margin.top]);

        // Add Y grid lines
        const yGridlines = d3.axisLeft(yScale)
            .tickSize(-svgWidth + margin.left + margin.right)
            .tickFormat('')

        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yGridlines);

        // Style Y grid lines
        svg.selectAll('.grid line')
            .style('stroke', '#ccc')
            .style('stroke-width', 0.1);  // Change color and width here

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${svgHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));

        // Create the line
        const line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.unitPrice))
            .curve(d3.curveMonotoneX); // Apply curve to the line

        // Append the path
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', 4)
            .attr('d', line);

    }, [data, selectedProduct]);

    return (
        <div style={{position: 'relative'}}>
            <svg ref={ref}></svg>
        </div>
    )
}

export default PriceHistoryLine