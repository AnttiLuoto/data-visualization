import React, {useRef, useEffect, useState} from "react";
import * as d3 from 'd3';

const BarChart = ({data, playerAttribute}) => {
    console.log(data)

    const ref = useRef();

    useEffect(() => {

        const svgHeight = 300
        const svgWidth = 500
        const margin = { top: 20, right: 20, bottom: 50, left: 20 };


        // Creating an svg to render to
        const svg = d3.select(ref.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight)

        // Clear previous elements
        svg.selectAll('*').remove();

        // Set the scales
        const xScale = d3.scaleBand() // For categories, discrete
            .domain(data.map((d, i) => d.season)) // Each season (str) gets its own value, which will be used later
            .range([margin.left, svgWidth - margin.right])
            .padding(0.1);

        const yScale = d3.scaleLinear() // For continuous variables
            .domain([0, d3.max(data, d => d[playerAttribute])])
            .range([svgHeight - margin.bottom, margin.top]);

        // We are basically enumerating over the array provided
        svg.selectAll('rect') // selecting the rectangles that will be created
            .data(data) // binding data to the rectangles that will be created
            .enter() // Creating more rectangle elements if not enough exist
            .append('rect') // Appending the created rectangles to the svg
            .attr('x', (d, i) => xScale(d.season)) // Provide item season attribute, and let the xScale set the correct position
            .attr('y', d => svgHeight - margin.bottom - yScale(d[playerAttribute]))
            .attr('height', d => yScale(d[playerAttribute]))
            .attr('width', xScale.bandwidth())
            .attr("rx", 6)
            .attr('fill', '#dfbbb6')

        // Create an x-axis generator
        const xAxis = d3.axisBottom(xScale);

        svg.append('g') // Appending a "group" -element to the svg
            .call(xAxis) // populating the g-element with the axis generator
            .attr('transform', `translate(0, ${svgHeight - margin.bottom})`)// Transform whole axis to the bottom of the graph
            .selectAll('text') // Selecting the text element which are the labels
            .attr('transform', 'rotate(-45)') // Rorating labels
            .style('text-anchor', 'end')

        const yAxis = d3.axisLeft(yScale).ticks(10);

        svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yAxis)

    }, [data]);
    return (
        <svg ref={ref}></svg>
    )

}

export default BarChart