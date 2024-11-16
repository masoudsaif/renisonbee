import React, { memo } from "react";
import PALETTE from "../../../styles/palette.styles";
import { SNAP_THRESHOLD } from "../../../constants/settings";
import IPosition from "../../../interfaces/position.interface";

interface SnapHighlightProps extends IPosition {
  radius?: number;
  color?: string;
}

const SnapHighlight: React.FC<SnapHighlightProps> = memo(
  ({ x, y, radius = SNAP_THRESHOLD, color = PALETTE.SELECTION }) => (
    <circle cx={x!} cy={y!} r={radius} fill={color} />
  )
);

export default SnapHighlight;
