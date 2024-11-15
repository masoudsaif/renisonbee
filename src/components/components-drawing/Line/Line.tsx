import React, { HTMLProps, memo } from "react";
import If from "../../components-logical/If/If";
import { convertToUnit } from "../../../util/units";
import MeasurementUnit from "../../../enum/measurement-unit.enum";
import PALETTE from "../../../styles/palette.styles";

interface LineProps extends HTMLProps<HTMLOrSVGElement> {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeColor?: string;
  strokeWidth?: number;
  textColor?: string;
  isSelected?: boolean;
  isLengthVisible?: boolean;
  isAngleVisible?: boolean;
  isDimensionsVisible?: boolean;
  isAngleArcVisible?: boolean;
  angleColor?: string;
  unit: MeasurementUnit;
}

const Line: React.FC<LineProps> = memo(
  ({
    startX,
    startY,
    endX,
    endY,
    unit,
    isSelected = false,
    strokeColor = PALETTE.BLACK,
    strokeWidth = 1,
    textColor = PALETTE.BLACK,
    angleColor = PALETTE.SILVER,
    isDimensionsVisible = false,
    isLengthVisible = isDimensionsVisible,
    isAngleVisible = isDimensionsVisible,
    isAngleArcVisible = isDimensionsVisible,
  }) => {
    const lengthInPixels = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );

    const length = convertToUnit(lengthInPixels, unit);

    const angleInRadians = Math.atan2(endY - startY, endX - startX);
    const angleInDegrees = ((-angleInRadians * 180) / Math.PI + 360) % 360;

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const offsetX = 10;
    const offsetY = -10;

    const arcRadius = 10;
    const largeArcFlag = angleInDegrees > 180 ? 1 : 0;

    // Calculate arc endpoint
    const arcEndX = startX + arcRadius * Math.cos(angleInRadians);
    const arcEndY = startY + arcRadius * Math.sin(angleInRadians);

    // SVG path for the arc
    const arcPath = `M ${
      startX + arcRadius
    } ${startY} A ${arcRadius} ${arcRadius} 1 ${largeArcFlag} 0 ${arcEndX} ${arcEndY}`;

    return (
      <g>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={isSelected ? "blue" : strokeColor}
          strokeWidth={strokeWidth}
        />
        <If condition={isLengthVisible}>
          <text
            x={midX + offsetX}
            y={midY + offsetY}
            textAnchor="after-edge"
            alignmentBaseline="after-edge"
            fontSize="12"
            fill={textColor}
          >
            {length}
          </text>
        </If>
        <If condition={isAngleVisible}>
          <text
            x={startX + offsetX}
            y={startY + offsetY + 15}
            textAnchor="before-edge"
            alignmentBaseline="before-edge"
            fontSize="12"
            fill={textColor}
          >
            {angleInDegrees.toFixed(2)}°
          </text>
        </If>
        <If condition={isAngleArcVisible}>
          <path d={arcPath} fill="none" stroke={angleColor} strokeWidth="1" />
          <line
            x1={startX}
            y1={startY}
            x2={startX + arcRadius}
            y2={startY}
            stroke={angleColor}
            strokeWidth={1}
          />
        </If>
      </g>
    );
  }
);

export default Line;
