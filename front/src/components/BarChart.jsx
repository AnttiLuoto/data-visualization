import React, {useRef, useEffect, useState} from "react";
import * as d3 from 'd3';
import TooltipSeasonStats from "./TooltipSeasonStats.jsx";

const BarChart = ({data, playerAttribute}) => {
    // console.log(data)

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

        // Add or update title
        const title = svg.selectAll('.title').data([playerAttribute]);
        title.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', svgWidth * 0.1)
            .attr('y', svgHeight * 0.05)
            .merge(title)
            .text(playerAttribute)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('fill', 'white');

        title.exit().remove();

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

        const yGridGroup = svg.selectAll('.grid').data([null]);

        yGridGroup.enter()
            .append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left}, 0)`)
            .merge(yGridGroup)
            .call(yGridlines);

        yGridGroup.exit().remove();

        yGridGroup.selectAll('line')
            .style('stroke', '#ccc')
            .style('stroke-width', 0.1);



        // Add bars. We are basically enumerating over the array provided
        const bars = svg.selectAll('rect').data(data);

        // svg.selectAll('rect').remove();

        const barsEnter = bars.enter()
            .append('rect') // Appending the created rectangles to the svg
            .attr('x', (d, i) => xScale(d.season)) // Provide item season attribute, and let the xScale set the correct position
            .attr('width', xScale.bandwidth())
            .attr('y', yScale(0)) // Start from y = 0
            .attr('height', 0) // Start with height 0
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


        // Apply the initial transition to the entering bars
        barsEnter.transition()
            .duration(800)
            .attr('y', d => yScale(d[playerAttribute]))
            .attr('height', d => svgHeight - margin.bottom - yScale(d[playerAttribute]));


        // Merge enter and update selections
        barsEnter.merge(bars)
            .transition()
            .duration(800)
            .attr('x', d => xScale(d.season))
            .attr('width', xScale.bandwidth())
            .attr('y', d => yScale(d[playerAttribute]))
            .attr('height', d => svgHeight - margin.bottom - yScale(d[playerAttribute]))
            .attr('fill', barColor);

        // Add exit transition
        bars.exit().transition()
            .duration(800)
            .attr('x', svgWidth) // Move bars out to the right
            .attr('width', 0)
            .remove();

        // Add data labels
        const labels = svg.selectAll('.barchartlabel').data(data);

        labels.enter()
            .append('text')
            .attr('class', 'barchartlabel')
            .merge(labels)
            .attr('x', d => xScale(d.season) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d[playerAttribute]) - 5)
            .attr('text-anchor', 'middle')
            .text(d => d[playerAttribute])
            .style('fill', 'white')
            .style('font-size', '12px');

        labels.exit().remove();


        // Create an x-axis generator
        const xAxis = d3.axisBottom(xScale);

        // Clear any existing x-axis
        svg.selectAll('.x-axis').remove()

        // Append new x-axis group or delsef if already exists
        const xAxisGroup = svg.selectAll('.x-axis').data([null])

        // Handle the enter selection for the x-axis
        xAxisGroup.enter()
            .append('g') // Append a new group element if one doesn't exist
            .attr('class', 'x-axis') // Assign class for easy selection later
            .merge(xAxisGroup) // Merge enter and update selections
            .attr('transform', `translate(0, ${svgHeight - margin.bottom})`) // Transform the axis to the bottom
            .call(xAxis) // Generate the x-axis with the axis generator
            .selectAll('text') // Selecting the text elements (labels)
            .attr('transform', 'rotate(-45)') // Rotate labels
            .style('text-anchor', 'end');

// Handle the exit selection
        xAxisGroup.exit().remove();


        // Create a y-axis generator
        const yAxis = d3.axisLeft(yScale).ticks(10);

        // Clear any existing y-axis
        svg.selectAll('.y-axis').remove();

        // Select the y-axis group and bind data to it
        const yAxisGroup = svg.selectAll('.y-axis').data([null]);

        // Handle the enter selection
        yAxisGroup.enter()
            .append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${margin.left}, 0)`)
            .merge(yAxisGroup)
            .call(yAxis);

        // Handle the exit selection
        yAxisGroup.exit().remove();

    }, [data, playerAttribute]);

    return (
        <div style={{position: 'relative'}}>
            <svg ref={ref}></svg>
        </div>
    )
}

export default BarChart