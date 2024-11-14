import React, { HTMLProps } from "react";
import If from "../../components-logical/If/If";
import { convertToUnit } from "../../../util/units";
import MeasurementUnit from "../../../enum/measurement-unit.enum";
import PALETTE from "../../../styles/palette";

interface SvgLineProps extends HTMLProps<HTMLOrSVGElement> {
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
  unit: MeasurementUnit;
}

const SvgLine: React.FC<SvgLineProps> = ({
  startX,
  startY,
  endX,
  endY,
  unit,
  isSelected = false,
  strokeColor = PALETTE.BLACK,
  strokeWidth = 1,
  textColor = PALETTE.BLACK,
  isDimensionsVisible = false,
  isLengthVisible = isDimensionsVisible,
  isAngleVisible = isDimensionsVisible,
}) => {
  const lengthInPixels = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );

  const length = convertToUnit(unit, lengthInPixels);

  const angleInRadians = Math.atan2(endY - startY, endX - startX);
  let angleInDegrees = Math.abs((angleInRadians * 180) / Math.PI);

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const offsetX = 10;
  const offsetY = -10;

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
          x={midX + offsetX}
          y={midY + offsetY + 15}
          textAnchor="before-edge"
          alignmentBaseline="before-edge"
          fontSize="12"
          fill={textColor}
        >
          {angleInDegrees.toFixed(2)}°
        </text>
      </If>
    </g>
  );
};

export default SvgLine;
