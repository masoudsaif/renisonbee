import React, { memo } from "react";
import { convertToUnit } from "../../../util/units";
import MeasurementUnit from "../../../enum/measurement-unit.enum";
import PALETTE from "../../../styles/palette.styles";
import { MOVE_OPCITY } from "../../../constants/settings";

interface RectangleProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  textColor?: string;
  isSelected?: boolean;
  isMoving?: boolean;
  isDimensionsVisible?: boolean;
  opacity?: number;
  unit: MeasurementUnit;
}

const Rectangle: React.FC<RectangleProps> = memo(
  ({
    startX,
    startY,
    endX,
    endY,
    unit,
    strokeColor = PALETTE.BLACK,
    strokeWidth = 1,
    fillColor = "none",
    textColor = PALETTE.BLACK,
    isSelected = false,
    isMoving = false,
    isDimensionsVisible = false,
    opacity = isMoving ? MOVE_OPCITY : 1,
    ...props
  }) => {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    const widthInUnit = convertToUnit(width, unit);
    const heightInUnit = convertToUnit(height, unit);

    const midX = x + width / 2;
    const midY = y + height / 2;

    const offsetX = 10;
    const offsetY = -10;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          stroke={isSelected ? "blue" : strokeColor}
          strokeWidth={strokeWidth}
          fill={fillColor}
          opacity={opacity}
          {...props}
        />
        {isDimensionsVisible ? (
          <>
            <text
              x={midX}
              y={y + offsetY}
              textAnchor="middle"
              alignmentBaseline="after-edge"
              fontSize="12"
              fill={textColor}
            >
              W: {widthInUnit}
            </text>
            <text
              x={x + offsetX}
              y={midY}
              textAnchor="before-edge"
              alignmentBaseline="middle"
              fontSize="12"
              fill={textColor}
            >
              H: {heightInUnit}
            </text>
          </>
        ) : null}
      </g>
    );
  }
);

export default Rectangle;
