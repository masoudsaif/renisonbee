import React, { memo } from "react";
import If from "../../components-logical/If/If";
import PALETTE from "../../../styles/palette.styles";
import { SNAP_THRESHOLD } from "../../../constants/settings";

interface SnapHighlightProps {
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
}

const SnapHighlight: React.FC<SnapHighlightProps> = memo(
  ({ x, y, radius = SNAP_THRESHOLD, color = PALETTE.SELECTION }) => {
    return (
      <If condition={!!x && !!y}>
        <circle cx={x!} cy={y!} r={radius} fill={color} />
      </If>
    );
  }
);

export default SnapHighlight;
