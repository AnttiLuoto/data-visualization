import React, { useRef, useEffect } from "react";
import * as d3 from 'd3';

const PriceHistoryLinePercentage = ({ data, selectedProduct }) => {
    const ref = useRef();

    useEffect(() => {
        if (!data || data.length === 0) {
            return;
        }
        const rootStyles = getComputedStyle(document.documentElement);

        const svgHeight = 500;
        const svgWidth = 700;
        const margin = { top: 50, right: 20, bottom: 75, left: 50 };
        const fontColor = rootStyles.getPropertyValue('--font-color').trim();
        const lineColor = rootStyles.getPropertyValue('--bar-line-color').trim();
        const crosshairsColor = rootStyles.getPropertyValue('--crosshairs-color').trim();
        const positiveShadeColor = rootStyles.getPropertyValue('--positive-shade-color').trim();
        const negativeShadeColor = rootStyles.getPropertyValue('--negative-shade-color').trim();
        const yTickFontSize = rootStyles.getPropertyValue('--y-tick-font-size').trim();
        const xTickFontSize = rootStyles.getPropertyValue('--x-tick-font-size').trim();

        const firstPrice = data[0].unitPrice;
        const maxPrice = d3.max(data, d => d.unitPrice);
        const minPrice = d3.min(data, d => d.unitPrice);
        const minDiff = 100 * (minPrice / firstPrice) - 100;
        const maxDiff = 100 * (maxPrice / firstPrice) - 100;

        // Creating an svg to render to
        const svg = d3.select(ref.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        // Clear any existing non-path content
        svg.selectAll('g').remove();
        svg.selectAll('.title').remove();

        // Add or update title
        const title = svg.selectAll('.chart-title').data([selectedProduct]);
        title.enter()
            .append('text')
            .attr('class', 'chart-title')
            .attr('x', margin.left)
            .attr('y', 30)
            .merge(title)
            .text("Price % Change: " + selectedProduct)

        title.exit().remove();

        // Set the scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date)))
            .range([margin.left, svgWidth - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([minDiff - 10, maxDiff + 10])
            .range([svgHeight - margin.bottom, margin.top]);

        // Add Y grid lines
        const yGridlines = d3.axisLeft(yScale)
            .tickSize(-svgWidth + margin.left + margin.right)
            // .style('fill', 'red') // Change this to your desired color
            .tickFormat('');

        const yGridGroup = svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yGridlines);

        // Style Y grid lines and ticks
        yGridGroup.selectAll('.tick line')
            .style('stroke', fontColor)
            .style('stroke-width', 0.1);

        // Add X axis
        svg.append('g')
            .style('font-size', xTickFontSize)
            .style('font-weight', 'bold')
            .style('color', fontColor)
            .attr('transform', `translate(0,${svgHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat("%Y-%m-%d"))
                .ticks(d3.utcMonth.every(4))
            )
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        svg.append('g')
            .style('font-size', '15px')
            .style('font-weight', 'bold')
            .style('color', fontColor)
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale).tickFormat(d => d + ' %'));

        // Create a constant line at y=0
        const zeroLineValue = yScale(0);

        svg.selectAll('.zeroline').remove(); // Remove previous line

        svg.append('line')
            .attr("class", "zeroline")
            .attr('x1', margin.left)
            .attr('x2', svgWidth - margin.right)
            .attr('y1', zeroLineValue)
            .attr('y2', zeroLineValue)
            .attr('stroke', fontColor)
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "4 4");

        // Create the line
        const line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(100 * (d.unitPrice / firstPrice) - 100))
            .curve(d3.curveMonotoneX);

        // Create the shaded area only if y1 is greater than 0
        const areaPositive = d3.area()
            .x(d => xScale(new Date(d.date)))
            .y0(yScale(0))
            .y1(d => {
                const value = 100 * (d.unitPrice / firstPrice) - 100;
                return value > 0 ? yScale(value) : yScale(0);
            })
            .curve(d3.curveMonotoneX);

        // Create the shaded area only if y1 is less than 0
        const areaNegative = d3.area()
            .x(d => xScale(new Date(d.date)))
            .y1(yScale(0))
            .y0(d => {
                const value = 100 * (d.unitPrice / firstPrice) - 100;
                return value < 0 ? yScale(value) : yScale(0);
            })
            .curve(d3.curveMonotoneX);

        // Update or append the positive area
        let positiveAreaPath = svg.selectAll('.area-positive').data([data]);
        positiveAreaPath.enter()
            .append('path')
            .attr('class', 'area-positive')
            .attr('fill', positiveShadeColor)
            .merge(positiveAreaPath)
            .transition()
            .duration(1000)
            .attr('d', areaPositive);

        positiveAreaPath.exit().remove();

        // Update or append the negative area
        let negativeAreaPath = svg.selectAll('.area-negative').data([data]);
        negativeAreaPath.enter()
            .append('path')
            .attr('class', 'area-negative')
            .attr('fill', negativeShadeColor)
            .merge(negativeAreaPath)
            .transition()
            .duration(1000)
            .attr('d', areaNegative);

        negativeAreaPath.exit().remove();

        // Update or append the line
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
                    .text(yValue.toFixed(1) + " %") // format the value as needed
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
        <div style={{ position: 'relative' }}>
            <svg ref={ref}></svg>
        </div>
    );
};

export default PriceHistoryLinePercentage;
