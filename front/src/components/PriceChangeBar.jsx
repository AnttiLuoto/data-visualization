import React, { useRef, useEffect } from "react";
import * as d3 from 'd3';

const PriceChangeBar = ({ data, selectedProduct, onBarClick }) => {
    const ref = useRef();

    useEffect(() => {
        if (!data || data.length === 0) {
            return;
        }
        const rootStyles = getComputedStyle(document.documentElement);

        const svgHeight = 600;
        const svgWidth = 1450;
        const margin = { top: 50, right: 0, bottom: 200, left: 100 };
        const fontColor = rootStyles.getPropertyValue('--font-color').trim();
        const yTickFontSize = rootStyles.getPropertyValue('--y-tick-font-size').trim();
        const xTickFontSize = rootStyles.getPropertyValue('--x-tick-font-size-bar').trim();
        const titleFontSize = rootStyles.getPropertyValue('--title-font-size').trim();
        const positiveColor = rootStyles.getPropertyValue('--positive-color').trim();
        const negativeColor = rootStyles.getPropertyValue('--negative-color').trim();
        const hoverColor = rootStyles.getPropertyValue('--hover-color').trim();
        const shadowColor = rootStyles.getPropertyValue('--shadow-color').trim();

        const tooltipSize = 100; // Define tooltip size
        const tooltipColor = "rgba(0, 0, 0, 0.8)"; // Define tooltip color

        const selectedKpi = 'price_change_percentage';

        const maxValue = d3.max(data, d => d[selectedKpi]);
        const minValue = d3.min(data, d => d[selectedKpi]);



        const svg = d3.select(ref.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.productName))
            .range([margin.left, svgWidth-margin.right])
            .padding(0.05);

        const yScale = d3.scaleLinear()
            .domain([minValue - 5, maxValue + 5])
            .range([svgHeight - margin.bottom, margin.top]);

        const zeroLine = yScale(0);

        const yGridlines = d3.axisLeft(yScale)
            .tickSize(-svgWidth + margin.left + margin.right)
            .tickFormat('');

        svg.selectAll('*').remove();

        // Title
        svg.append('text')
            .attr('class', 'main-chart-title')
            .attr('x', margin.left)
            .attr('y', 30)
            .text("Overview: Price Change Percentage: 2019 - 2024 ");

        // Instructions
        svg.append('text')
            .attr('x', svgWidth - 500)
            .attr('y', margin.top * 3)
            .style('font-size', 30)
            .style('text-anchor', 'end')
            .style('color', 'red')
            .text("Click bar to drill down!");

        // Y-grid
        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yGridlines);

        // Format y-grid lines
        svg.selectAll('.grid line')
            .style('stroke', 'grey')
            .style('stroke-width', 0.1);

        // Y-axis ticks
        svg.append('g')
            .style('font-size', yTickFontSize)
            .style('font-weight', 'bold')
            .style('color', fontColor)
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale)
                .tickFormat(d => d + ' %'));

        // X-axis ticks and formatting
        svg.append('g')
            .style('font-size', xTickFontSize)
            .style('font-weight', 'bold')
            .style('color', fontColor)
            .attr('transform', `translate(0,${svgHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d => d.length > 44 ? d.slice(0, 20) + '...' : d))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', d => d.productName === selectedProduct ? 'bar highlighted-bar' : 'bar')
            .attr('x', d => xScale(d.productName))
            .attr('width', xScale.bandwidth())
            .attr('y', d => d[selectedKpi] >= 0 ? yScale(d[selectedKpi]) : zeroLine)
            .attr('height', d => Math.abs(yScale(d[selectedKpi]) - zeroLine))
            .attr('fill', d => d[selectedKpi] >= 0 ? positiveColor : negativeColor)
            .attr('rx', 6)
            .on('click', function(event, d) {
                onBarClick(d.productName);
            })
            .on('mouseover', function(event, d) {
                d3.select(this).attr('fill', hoverColor);

                // Calculate tooltip position
                // let tooltipX = d => xScale(d.productName);
                let tooltipXBase = event.pageX - 350;
                let tooltipX = tooltipXBase < 900 ? tooltipXBase : tooltipXBase - 400
                let tooltipY = event.pageY;

                // Append text over the tooltip
                svg.append('text')
                    .attr('id', 'tooltip-text')
                    .attr('x', tooltipX + 20)
                    .attr('y', tooltipY - 120)
                    .attr('fill', 'black')
                    .style('font-size', '18px')
                    .text(d.productName);
            })
            .on('mouseout', function(event, d) {
                d3.select(this).attr('fill', d[selectedKpi] >= 0 ? positiveColor : negativeColor);
                svg.select('#tooltip').remove();
                svg.select('#tooltip-text').remove();
            });

        // Constant y-line for Y=0
        svg.append('line')
            .attr('x1', margin.left)
            .attr('x2', svgWidth - margin.right)
            .attr('y1', zeroLine)
            .attr('y2', zeroLine)
            .attr('stroke', '#232222')
            .attr('stroke-width', '2')
            .attr("stroke-dasharray", "4 4");

    }, [data, selectedProduct]);

    return (
        <div style={{ position: 'relative' }}>
            <svg ref={ref}></svg>
        </div>
    );
};

export default PriceChangeBar;
