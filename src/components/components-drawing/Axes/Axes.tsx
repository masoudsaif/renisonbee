import React, { useEffect, useState } from "react";
import { getAxesCenter } from "../../../util/coordinates";

const Axes: React.FC = () => {
  // Use the getAxesCenter function to calculate the center
  const { x, y } = getAxesCenter();

  // Length of axes (adjustable)
  const axisLength = 200;

  return (
    <svg width="100%" height="100%">
      {/* X-Axis: Horizontal line starting from (offsetX, offsetY) */}
      <line
        x1={x}
        y1={y}
        x2={x + axisLength}
        y2={y}
        stroke="black"
        opacity={0.3}
        strokeWidth={1}
      />
      {/* Y-Axis: Vertical line starting from (offsetX, offsetY) */}
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y - axisLength}
        stroke="black"
        opacity={0.3}
        strokeWidth={1}
      />

      {/* Label "x" at the end of the X-Axis */}
      <text x={x + axisLength + 10} y={y - 10} fontSize="14" fill="black">
        x
      </text>

      {/* Label "y" at the end of the Y-Axis */}
      <text x={x - 10} y={y - axisLength - 10} fontSize="14" fill="black">
        y
      </text>
    </svg>
  );
};

export default Axes;
