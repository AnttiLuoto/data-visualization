import React, { useRef, useEffect } from "react";
import * as d3 from 'd3';

// eslint-disable-next-line react/prop-types
const PriceChangeLineAll = ({ 
                                priceHistory,
                                priceHistoryQuantiles,
                                selectedProduct }) => {
    const ref = useRef();

    useEffect(() => {

        console.log('Quantiles', priceHistoryQuantiles)

        if (!priceHistory || priceHistory.length === 0 || !priceHistoryQuantiles || priceHistoryQuantiles.length === 0) {
            return;
        }
        const rootStyles = getComputedStyle(document.documentElement);

        const svgHeight = 500;
        const svgWidth = 1450;
        const margin = { top: 50, right: 80, bottom: 75, left: 100 };
        const yMin = -50
        const yMax = 100
        const fontColor = rootStyles.getPropertyValue('--font-color').trim();
        const lineColor = rootStyles.getPropertyValue('--bar-line-color').trim(); // Same as bar hoverColor in the barchart
        const Q50LineColor = rootStyles.getPropertyValue('--q50-line-color').trim();
        const crosshairsColor = rootStyles.getPropertyValue('--crosshairs-color').trim()
        const Q0Color = rootStyles.getPropertyValue('--q0-color').trim();
        const Q10Color = rootStyles.getPropertyValue('--q10-color').trim();
        const Q25Color = rootStyles.getPropertyValue('--q25-color').trim();
        const yTickFontSize = rootStyles.getPropertyValue('--y-tick-font-size').trim()
        const xTickFontSize = rootStyles.getPropertyValue('--x-tick-font-size').trim()
        const quantileFontSize = rootStyles.getPropertyValue('--quantile-font-size').trim()

        const QuantileLastItem = priceHistoryQuantiles[priceHistoryQuantiles.length - 1];
        const Q50LastVal = QuantileLastItem.Q_50
        const Q10LastVal = QuantileLastItem.Q_10_90[1]
        const Q25LastVal = QuantileLastItem.Q_25_75[1]

        // const firstPrice = priceHistory[0].unitPrice;
        const maxPrice = d3.max(priceHistory, d => d.unitPrice);
        const minPrice = d3.min(priceHistory, d => d.unitPrice);
        // const minDiff = 100 * (minPrice / firstPrice) - 100;
        // const maxDiff = 100 * (maxPrice / firstPrice) - 100;

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
            .domain(d3.extent(priceHistory, d => new Date(d.date)))
            .range([margin.left, svgWidth - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([svgHeight - margin.bottom, margin.top]);

        // Add Y grid lines
        const yGridlines = d3.axisLeft(yScale)
            .tickSize(-svgWidth + margin.left + margin.right)
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

        // Plot the quantiles as areas

        // Generator of area
        const Q_0Area = d3.area()
            .x(d => xScale(new Date(d.date)))
            .y0(d => d.Q_0_100[0] < yMin ? yScale(yMin) : yScale(d.Q_0_100[0]))  // Access the first element of the tuple
            .y1(d => d.Q_0_100[1] > yMax ? yScale(yMax) : yScale(d.Q_0_100[1]))  // Access the first element of the tuple
            .curve(d3.curveMonotoneX);

        // Update or append the area
        let Q_0Path = svg.selectAll('.area-Q_0').data([priceHistoryQuantiles]);
        Q_0Path.enter()
            .append('path')
            .attr('class', 'area-Q_0')
            .attr('fill', Q0Color)

            .merge(Q_0Path)
            .attr('d', Q_0Area);
        Q_0Path.exit().remove();

        //------------------------

        // Generator of area
        const Q_10Area = d3.area()
            .x(d => xScale(new Date(d.date)))
            .y0(d => yScale(d.Q_10_90[0]) > yScale(yMax) ? yScale(d.Q_10_90[0]) : yScale(yMax))  // Access the first element of the tuple
            .y1(d => yScale(d.Q_10_90[1]) > yMin ? yScale(d.Q_10_90[1]) : yMin)  // Access the second element of the tuple
            .curve(d3.curveMonotoneX);

        // Update or append the area
        let Q_10Path = svg.selectAll('.area-Q_10').data([priceHistoryQuantiles]);
        Q_0Path.enter()
            .append('path')
            .attr('class', 'area-Q_10')
            .attr('fill', Q10Color)
            .merge(Q_10Path)
            .attr('d', Q_10Area); // Still getting same error here, help fix it
        Q_10Path.exit().remove();

        //------------------------

        // Generator of area
        const Q_25Area = d3.area()
            .x(d => xScale(new Date(d.date)))
            .y0(d => yScale(d.Q_25_75[0]))  // Access the first element of the tuple
            .y1(d => yScale(d.Q_25_75[1]))  // Access the second element of the tuple
            .curve(d3.curveMonotoneX);

        // Update or append the area
        let Q_25Path = svg.selectAll('.area-Q_25').data([priceHistoryQuantiles]);
        Q_25Path.enter()
            .append('path')
            .attr('class', 'area-Q_25')
            .attr('fill', Q25Color)
            .merge(Q_25Path)
            .attr('d', Q_25Area); // Still getting same error here, help fix it
        Q_25Path.exit().remove();

        // create Q50 line

        svg.selectAll('.Q50-line').remove(); // Remove previous line

        // Line generator
        const Q50Line = d3.line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.Q_50))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(priceHistoryQuantiles)
            .attr('class', 'Q50-line')
            .attr('fill', 'none')
            .attr('stroke', Q50LineColor)
            .attr('stroke-width', 1.5)
            .attr("stroke-dasharray", "10,5")
            .attr('d', Q50Line);


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

        // Draw line for each product by first grouping data by productName

        const dataGrouped = Array.from(d3.group(priceHistory, d => d.productName))
            .filter(([key, values]) => key === selectedProduct);

        // Draw lines for each product group
        svg.selectAll('.line-path')
            .data(dataGrouped)
            .join('path')
            .attr('class', 'line-path')
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', 4)
            .attr('d', ([key, values]) => {
                const firstPrice = values[0].unitPrice;
                const yValue = d => yScale(100 * (d.unitPrice / firstPrice) - 100)
                return d3.line()
                    .x(d => xScale(new Date(d.date)))
                    .y(d => {
                        const value = yValue(d);
                        return value < yScale(yMax) ? yScale(yMax) : value;
                    })
                    .curve(d3.curveMonotoneX)(values);
            });

        // Add quantile indicators

        svg.append('text')
            .attr('class', 'quantile-label')
            .attr('x', svgWidth - margin.right + 5)
            .attr('y', yScale(Q50LastVal) + 4)
            .attr('text-anchor', 'left')
            .style('fill', Q50LineColor)
            .style('font-size', quantileFontSize)
            .text('Mean');

        svg.append('text')
            .attr('class', 'quantile-label')
            .attr('x', svgWidth - margin.right + 5)
            .attr('y', yScale(Q25LastVal) + 8)
            .attr('text-anchor', 'left')
            .style('fill', Q25Color)
            .style('font-size', quantileFontSize)
            .text('Q25 - Q75');

        svg.append('text')
            .attr('class', 'quantile-label')
            .attr('x', svgWidth - margin.right + 5)
            .attr('y', yScale(Q10LastVal) + 8)
            .attr('text-anchor', 'left')
            .style('fill', Q10Color)
            .style('font-size', quantileFontSize)
            .text('Q10 - Q90');

        svg.append('text')
            .attr('class', 'quantile-label')
            .attr('x', svgWidth - margin.right + 5)
            .attr('y', yScale(yMax) + 15)
            .attr('text-anchor', 'left')
            .style('fill', 'rgba(146,143,143,0.53)')
            .style('font-size', quantileFontSize)
            .text('Max - Min');

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

    }, [priceHistory, priceHistoryQuantiles, selectedProduct]);

    return (
        <div style={{ position: 'relative' }}>
            <svg ref={ref}></svg>
        </div>
    );
};

export default PriceChangeLineAll;
