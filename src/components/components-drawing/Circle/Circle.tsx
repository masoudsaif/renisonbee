import React, { HTMLProps } from "react";
import If from "../../components-logical/If/If";
import { convertToUnit } from "../../../util/units";
import MeasurementUnit from "../../../enum/measurement-unit.enum";
import PALETTE from "../../../styles/palette";

interface CircleProps extends HTMLProps<HTMLOrSVGElement> {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  textColor?: string;
  isSelected?: boolean;
  isRadiusVisible?: boolean;
  isAreaVisible?: boolean;
  isDimensionsVisible?: boolean;
  unit: MeasurementUnit;
}

const Circle: React.FC<CircleProps> = ({
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
  isDimensionsVisible = false,
  isRadiusVisible = isDimensionsVisible,
  isAreaVisible = isDimensionsVisible,
}) => {
  // Calculate radius
  const radiusInPixels = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const radius = convertToUnit(unit, radiusInPixels);

  // Calculate area
  const area = Math.PI * Math.pow(radiusInPixels, 2);
  const convertedArea = convertToUnit(unit, area);

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
      />
      <If condition={isRadiusVisible}>
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
      </If>
      <If condition={isAreaVisible}>
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
      </If>
    </g>
  );
};

export default Circle;
