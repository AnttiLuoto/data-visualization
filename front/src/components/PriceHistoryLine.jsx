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

        const svgHeight = 500;
        const svgWidth = 800;
        const margin = { top: 30, right: 120, bottom: 70, left: 60 };
        const tooltipSize = 100
        const lineColor = "#252a34"
        const crosshairsColor = "#21174a"
        const fontColor = "#252a34"
        const barColorHighlight = "#072e48"
        const tooltipColor = "#4d4c4c"
        const positiveShadeColor = "#ff2e63";
        const negativeShadeColor = "#08d9d6";
        const yTickFontSize = '15px'
        const xTickFontSize = '15px'

        const firstPrice = data[0].unitPrice;
        const lastPrice = data[data.length -1 ].unitPrice;
        const priceChange = lastPrice - firstPrice
        const maxValue = d3.max(data, d => d.unitPrice);
        const minValue = d3.min(data, d => d.unitPrice);

        const formatDecimal = d3.format(".2f");

        // Creating an svg to render to
        const svg = d3.select(ref.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight)

        // Clear any existing non-path content
        svg.selectAll('g').remove();
        svg.selectAll('.title').remove();

        // Define a linear gradients
        const defs = svg.append("defs");

        const linearGradientUp = defs.append("linearGradient")
            .attr("id", "gradientUp")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        // Define the gradient stops
        linearGradientUp.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", positiveShadeColor)
            .attr("stop-opacity", 0.1);  // Bottom opacity

        linearGradientUp.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", positiveShadeColor)
            .attr("stop-opacity", 0.4);  // Top opacity

        const linearGradientDown = defs.append("linearGradient")
            .attr("id", "gradientDown")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        // Define the gradient stops
        linearGradientDown.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", negativeShadeColor)
            .attr("stop-opacity", 0.4);  // Bottom opacity

        linearGradientDown.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", negativeShadeColor)
            .attr("stop-opacity", 0.1);  // Top opacity

        // Add or update title
        const title = svg.selectAll('.title').data([selectedProduct]);
        title.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', margin.left)
            .attr('y', svgHeight * 0.05)
            .merge(title)
            .text("Price over time: " + selectedProduct)
            .attr('text-anchor', 'left')
            .style('font-weight', 'bold')
            .style('fill', 'black');

        title.exit().remove();

        // Set the scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date)))
            .range([margin.left, svgWidth - margin.right]);

        const yScale = d3.scaleLinear() // For continuous variables
            .domain([minValue * 0.8, maxValue * 1.2])
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
            .style('stroke', 'grey')
            .style('stroke-width', 0.1);  // Change color and width here

        // Add X axis
        svg.append('g')
            .style('font-size', xTickFontSize)
            .style('font-weight', 'bold')
            .style('color', fontColor)
            .attr('transform', `translate(0,${svgHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        svg.append('g')
            .style('font-size', '15px')
            .style('font-weight', 'bold')
            .style('color', fontColor)
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale)
                .tickFormat(d => d + ' €'));

        // Create the line
        const line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.unitPrice))
            .curve(d3.curveMonotoneX); // Apply curve to the line

        // Append the path if it doesn't exist
        let path = svg.selectAll('.line-path').data([data]);

        path.enter()
            .append('path')
            .attr('class', 'line-path')
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', 4)
            .merge(path)
            .transition()
            .duration(1000)
            .attr('d', line);

        path.exit().remove();

        // Remove old price lines
        svg.selectAll('.priceChangeLine').remove();

        // Constant firstPrice
        svg.append('line')
            .attr('class', 'priceChangeLine')
            .attr('x1', margin.left)
            .attr('x2', svgWidth - margin.right * 0.4)
            .attr('y1', yScale(firstPrice))
            .attr('y2', yScale(firstPrice))
            .attr('stroke', '#232222')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "4 4");

        // Constant lastPrice
        svg.append('line')
            .attr('class', 'priceChangeLine')
            .attr('x1', margin.left)
            .attr('x2', svgWidth - margin.right * 0.4)
            .attr('y1', yScale(lastPrice))
            .attr('y2', yScale(lastPrice))
            .attr('stroke', '#232222')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "4 4");

        // Add or update priceChange priceChangeLabel
        svg.selectAll('.priceChangeLabel').remove()

        const priceChangeLabel = svg.selectAll('.priceChangeLabel').data([selectedProduct]);

        priceChangeLabel.enter()
            .append('text')
            .attr('class', 'priceChangeLabel')
            .attr('x', svgWidth - margin.right)
            .attr('y', () => {
                const yFirstPrice = yScale(firstPrice);
                const yLastPrice = yScale(lastPrice);
                return (yFirstPrice + yLastPrice) / 2;
            })
            .merge(priceChangeLabel)
            .text( priceChange > 0 ? "↑ +" + formatDecimal(priceChange) + " €" : "↓ " + formatDecimal(priceChange) + " €" )
            .attr('text-anchor', 'left')
            .style('font-weight', 'bold')
            .style('fill', 'black');

        priceChangeLabel.exit().remove();

        // Adding priceChange indicator rectangles

        svg.selectAll('.price-change-rect').remove()

        const priceChangeRect = svg.append('rect')
            .attr('class', 'price-change-rect')
            .attr('x', margin.left)
            .attr('width', svgWidth - margin.right * 0.4 - margin.left)
            .attr('y', lastPrice > firstPrice ? yScale(lastPrice) : yScale(firstPrice))
            .attr('height', () => {
                // const priceDifference = Math.abs(lastPrice - firstPrice);
                const yFirstPrice = yScale(firstPrice);
                const yLastPrice = yScale(lastPrice);
                return Math.abs(yFirstPrice - yLastPrice);
            })
            .style("fill", priceChange > 0 ? "url(#gradientUp)" : "url(#gradientDown)");

        // Mouse crosshairs

        // Crosshairs setup
        const crosshairX = svg.append("line")
            .attr("class", "crosshair")
            .attr("y1", margin.top)
            .attr("y2", svgHeight - margin.bottom)
            .attr('stroke', crosshairsColor)
            .attr('stroke-width', '1px')
            .style("visibility", "hidden");

        const crosshairY = svg.append("line")
            .attr("class", "crosshair")
            .attr("x1", margin.left)
            .attr("x2", svgWidth - margin.right)
            .attr('stroke', crosshairsColor)
            .attr('stroke-width', '1px')
            .style("visibility", "hidden");

        // Add text element for y-axis label
        const yAxisLabel = svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", margin.left + 5) // position to the right of the chart
            .attr("y", margin.top)
            .attr("dy", "0.35em")
            .style("visibility", "hidden")
            .style("font-size", "12px")
            .style("fill", "black");

        const overlay = svg.append('rect')
            .attr('class', 'overlay')
            .attr('x', margin.left)
            .attr('width', svgWidth - margin.right - margin.left)
            .attr('y', margin.top)
            .attr('height', svgHeight - margin.top - margin.bottom)
            .attr('fill', 'none')
            .style('pointer-events', 'all')
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        function mousemove(event) {
            const [mouseX, mouseY] = d3.pointer(event);
            if (mouseX >= margin.left && mouseX <= svgWidth - margin.right &&
                mouseY >= margin.top && mouseY <= svgHeight - margin.bottom) {
                crosshairX.attr("x1", mouseX).attr("x2", mouseX).style("visibility", "visible");
                crosshairY.attr("y1", mouseY).attr("y2", mouseY).style("visibility", "visible");

                // Get the value corresponding to the mouseY position
                const yValue = yScale.invert(mouseY);

                // Update the y-axis label
                yAxisLabel
                    .attr("y", mouseY + -10)
                    .text(yValue.toFixed(2) + " €") // format the value as needed
                    .style("visibility", "visible");
            } else {
                mouseout();
            }
        }

        function mouseout() {
            crosshairX.style("visibility", "hidden");
            crosshairY.style("visibility", "hidden");
            yAxisLabel.style("visibility", "hidden");
        }
    }, [data, selectedProduct]);

    return (
        <div style={{position: 'relative'}}>
            <svg ref={ref}></svg>
        </div>
    )
}

export default PriceHistoryLine