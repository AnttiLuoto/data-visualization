import React, { useRef, useEffect } from "react";
import * as d3 from 'd3';

const PriceChangeBar = ({ data, selectedProduct, onBarClick }) => {
    const ref = useRef();

    useEffect(() => {
        if (!data || data.length === 0) {
            return;
        }

        const svgHeight = 600;
        const svgWidth = 1450;
        const margin = { top: 30, right: 20, bottom: 200, left: 70 };
        const fontColor = "#252a34"
        const yTickFontSize = '15px'
        const xTickFontSize = '12px'
        const positiveColor = "#ff2e63";
        const negativeColor = "#08d9d6";
        const hoverColor = "#252a34"
        const shadowColor = "black"

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
            .attr('class', 'title')
            .attr('x', svgWidth * 0.05)
            .attr('y', svgHeight * 0.04)
            .text("Overview: " + selectedKpi)
            .attr('text-anchor', 'left')
            .style('font-weight', 'bold')
            .style('fill', 'black');

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
            .attr('class', d => d.productName === selectedProduct ? 'bar highlighted-bar' : 'bar') // Highlight the selected bar
            .attr('x', d => xScale(d.productName))
            .attr('width', xScale.bandwidth())
            .attr('y', d => d[selectedKpi] >= 0 ? yScale(d[selectedKpi]) : zeroLine)
            .attr('height', d => Math.abs(yScale(d[selectedKpi]) - zeroLine))
            .attr('fill', d => d[selectedKpi] >= 0 ? positiveColor : negativeColor)
            .attr('rx', 6)
            .on('click',function (event, d) {
                onBarClick(d.productName)
            })
            .on('mouseover', function(event, d) {
                d3.select(this).attr('fill', hoverColor);
            })
            .on('mouseout', function(event, d) {
                d3.select(this).attr('fill', d[selectedKpi] >= 0 ? positiveColor : negativeColor);
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
