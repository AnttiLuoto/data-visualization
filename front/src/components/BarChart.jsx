import React, {useRef, useEffect, useState} from "react";
import * as d3 from 'd3';
import TooltipSeasonStats from "./TooltipSeasonStats.jsx";

const BarChart = ({data, playerAttribute}) => {
    console.log(data)

    const ref = useRef();

    useEffect(() => {

        const svgHeight = 400
        const svgWidth = 600
        const margin = {top: 30, right: 20, bottom: 50, left: 20};
        const tooltipSize = 100
        const barColor = "#020000"
        const barColorHighlight = "#072e48"
        const tooltipColor = "#4d4c4c"

        // Creating an svg to render to
        const svg = d3.select(ref.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight)

        // Clear previous elements
        svg.selectAll('*').remove();

        // Add title
        svg.append('text')
            .attr('x', svgWidth * 0.1)
            .attr('y', svgHeight * 0.05)
            .text(playerAttribute)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('fill', 'white')

        // Set the scales
        const xScale = d3.scaleBand() // For categories, discrete
            .domain(data.map((d, i) => d.season)) // Each season (str) gets its own value, which will be used later
            .range([margin.left, svgWidth - margin.right])
            .padding(0.1);

        const yScale = d3.scaleLinear() // For continuous variables
            .domain([0, d3.max(data, d => d[playerAttribute]) * 1.2])
            .range([svgHeight - margin.bottom, margin.top]);

        // Create gridlines generator function
        const yGridlines = d3.axisLeft(yScale)
            .tickSize(-svgWidth + margin.left + margin.right)
            .tickFormat('')

        // Append new group element g to the svg, assigning it a class called "grid".
        // Call the gridline generator function and append them to the svg
        const yGridGroup = svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yGridlines)

        // Select "line" -elements within yGridGroup
        yGridGroup.selectAll('line')
            .style('stroke', '#ccc') // Set the color of the gridlines
            .style('stroke-width', 0.1) // Set the width of the gridlines

        // Add bars. We are basically enumerating over the array provided
        svg.selectAll('rect') // selecting the rectangles that will be created
            .data(data) // binding data to the rectangles that will be created
            .enter() // Creating more rectangle elements if not enough exist
            .append('rect') // Appending the created rectangles to the svg
            .attr('x', (d, i) => xScale(d.season)) // Provide item season attribute, and let the xScale set the correct position
            .attr('y', d => yScale(d[playerAttribute]))
            .attr('height', (d) => svgHeight - margin.bottom - yScale(d[playerAttribute])) // Correct height
            .attr('width', xScale.bandwidth())
            .attr("rx", 6)
            .attr('fill', barColor)
            .on('mouseover', function (event, d) { // Attache evrent listenre to each rectancle. function is executed on mousover
                d3.select(this)
                    .attr('fill', barColorHighlight)

                // Calculate tooltip position
                let tooltipX = xScale(d.season) + xScale.bandwidth();
                let tooltipY = yScale(d[playerAttribute]) - 100;

                // Adjust if tooltip goes beyond the right edge of the SVG
                if (tooltipX + 100 > svgWidth) {
                    tooltipX = svgWidth - 100;
                }

                // Adjust if tooltip goes beyond the top edge of the SVG
                if (tooltipY < 0) {
                    tooltipY = 0;
                }
                svg.append('rect') // Append a rectangular tooltip base
                    .attr('id', 'tooltip')
                    .attr('x', tooltipX)
                    .attr('y', tooltipY)
                    .attr('width', tooltipSize)
                    .attr('height', tooltipSize*0.8)
                    .attr('fill', tooltipColor)
                    .attr('rx', 5)

                svg.append('text') // Append text over the tooltip
                    .attr('id', 'tooltip-text')
                    .attr('x', tooltipX + 10)
                    .attr('y', tooltipY + 25)
                    .attr('fill', 'white')
                    .style('font-size', '12px')
                    .call(text => {
                        text.append('tspan')
                            .attr('x', tooltipX + 10)
                            // .attr('dy', '1.2em')
                            .style('font-weight', 'bold')
                            .text(`Games: ${d.games}`);
                        text.append('tspan')
                            .attr('x', tooltipX + 10)
                            .attr('dy', '1.2em')
                            .text(`Goals: ${d.goals}`);
                        text.append('tspan')
                            .attr('x', tooltipX + 10)
                            .attr('dy', '1.2em')
                            .text(`Assists: ${d.assists}`);
                    });
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr('fill', barColor)
                svg.select('#tooltip').remove();
                svg.select('#tooltip-text').remove();
            })


        // Add data labels
        svg.selectAll('text.barchartlabel') // Select text elements with class barchartlabel (None in this case)
            .data(data) // Bind data to the these elememts
            .enter() // Create new elements if not enough exist. In this case, 0 exits initially
            .append('text') // Append text element for each item in data array
            .attr('class', 'barchartlabel') // Add class for future convenience (we can just use selectAll('barchartlabel')
            .attr('x', (d) => xScale(d.season) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d[playerAttribute]) - 5)
            .attr('text-anchor', 'middle')
            .text((d) => d[playerAttribute])
            .style('fill', 'white')
            .style('font-size', '12px');


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

    }, [data, playerAttribute]);

    return (
        <div style={{position: 'relative'}}>
            <svg ref={ref}></svg>
        </div>
    )
}

export default BarChart