import React from 'react';

const tooltipSeasaonStats = ({ x, y, content }) => {
    if (!content) return null;
    return (
        <g transform={`translate(${x}, ${y})`}>
            <rect
                x={0}
                y={0}
                width={150}
                height={70}
                fill="white"
                stroke="black"
                rx={5}
                ry={5}
                opacity={0.8}
            />
            <text x={10} y={20} fill="black">
                {content}
            </text>
        </g>
    );
};

export default tooltipSeasaonStats;
