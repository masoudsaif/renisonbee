import React, { memo } from "react";
import IShapePosition from "../../../interfaces/shape-position.interface";
import "./SelectionArea.css";

interface SelectionAreaProps extends IShapePosition {}

const SelectionArea: React.FC<SelectionAreaProps> = memo(
  ({ startX, startY, endX, endY }) => (
    <rect
      x={Math.min(startX, endX)}
      y={Math.min(startY, endY)}
      width={Math.abs(endX - startX)}
      height={Math.abs(endY - startY)}
      className="selection-rect"
    />
  )
);

export default SelectionArea;
