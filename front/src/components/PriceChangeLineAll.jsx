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
        const svgHeight = 600;
        const svgWidth = 1450;
        const margin = { top: 30, right: 0, bottom: 200, left: 100 };
        const fontColor = "#252a34"
        const lineColor = "#252a34"; // Same as bar hoverColor in the barchart
        // const Q50LineColor = "#035655";
        const Q50LineColor = "#ff2e63";
        const crosshairsColor = "#21174a"
        const Q0Color = "rgba(8,217,214,0.06)";
        const Q10Color = "rgba(8,217,214,0.4)";
        const Q25Color = "#08d9d6";
        const yTickFontSize = '15px'
        const xTickFontSize = '15px'

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
        const title = svg.selectAll('.title').data([selectedProduct]);
        title.enter()
            .append('text')
            .attr('class', 'title')
            .attr('x', margin.left)
            .attr('y', svgHeight * 0.05)
            .merge(title)
            .text("Price % Change: " + selectedProduct)
            .attr('text-anchor', 'left')
            .style('font-weight', 'bold')
            .style('fill', fontColor);

        title.exit().remove();

        // Set the scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(priceHistory, d => new Date(d.date)))
            .range([margin.left, svgWidth - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([
                -100, // min price (not grouped data yet!
                130  // max price (not grouped data yet!
            ])
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
            .call(d3.axisLeft(yScale).tickFormat(d => d + ' %'));

        // Plot the quantiles as areas

        // Generator of area
        const Q_0Area = d3.area()
            .x(d => xScale(new Date(d.date)))
            .y0(d => yScale(d.Q_0_100[0]))  // Access the first element of the array
            .y1(d => yScale(d.Q_0_100[1]))  // Access the second element of the array
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
            .y0(d => yScale(d.Q_10_90[0]))  // Access the first element of the tuple
            .y1(d => yScale(d.Q_10_90[1]))  // Access the second element of the tuple
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
            .attr('stroke-width', 4)
            // .attr("stroke-dasharray", "1,1")
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
            .attr('stroke-width', 2)
            .attr('d', ([key, values]) => {
                const firstPrice = values[0].unitPrice;
                return d3.line()
                    .x(d => xScale(new Date(d.date)))
                    .y(d => yScale(100 * (d.unitPrice / firstPrice) - 100))
                    .curve(d3.curveMonotoneX)(values);
            });


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

    }, [priceHistory, priceHistoryQuantiles, selectedProduct]);

    return (
        <div style={{ position: 'relative' }}>
            <svg ref={ref}></svg>
        </div>
    );
};

export default PriceChangeLineAll;
