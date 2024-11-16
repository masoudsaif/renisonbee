import React, { memo } from "react";
import { convertToUnit } from "../../../util/units";
import MeasurementUnit from "../../../enum/measurement-unit.enum";
import PALETTE from "../../../styles/palette.styles";
import { MOVE_OPCITY } from "../../../constants/settings";

interface CircleProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  textColor?: string;
  isSelected?: boolean;
  isMoving?: boolean;
  isRadiusVisible?: boolean;
  isAreaVisible?: boolean;
  isDimensionsVisible?: boolean;
  opacity?: number;
  unit: MeasurementUnit;
}

const Circle: React.FC<CircleProps> = memo(
  ({
    startX,
    startY,
    endX,
    endY,
    unit,
    strokeColor = PALETTE.BLACK,
    fillColor = "none",
    strokeWidth = 1,
    textColor = PALETTE.BLACK,
    isSelected = false,
    isMoving = false,
    isDimensionsVisible = false,
    isRadiusVisible = isDimensionsVisible,
    isAreaVisible = isDimensionsVisible,
    opacity = isMoving ? MOVE_OPCITY : 1,
    ...props
  }) => {
    // Calculate radius
    const radiusInPixels = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    const radius = convertToUnit(radiusInPixels, unit);

    // Calculate area
    const area = Math.PI * Math.pow(radiusInPixels, 2);
    const convertedArea = convertToUnit(area, unit);

    const offsetX = 10;
    const offsetY = -10;

    return (
      <g>
        <circle
          cx={startX}
          cy={startY}
          r={radiusInPixels}
          stroke={isSelected ? "blue" : strokeColor}
          strokeWidth={strokeWidth}
          fill={fillColor}
          opacity={opacity}
          {...props}
        />
        {isRadiusVisible ? (
          <text
            x={startX + radiusInPixels + offsetX}
            y={startY + offsetY}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="12"
            fill={textColor}
          >
            R: {radius}
          </text>
        ) : null}
        {isAreaVisible ? (
          <text
            x={startX}
            y={startY + radiusInPixels + offsetY}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="12"
            fill={textColor}
          >
            Area: {convertedArea}
          </text>
        ) : null}
      </g>
    );
  }
);

export default Circle;
