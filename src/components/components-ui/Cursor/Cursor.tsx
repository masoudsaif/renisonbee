import React from "react";
import "./Cursor.css";
import IPosition from "../../../interfaces/position.interface";

interface CursorProps {
  position: IPosition;
}

const Cursor: React.FC<CursorProps> = ({ position }) => {
  const cursorStyle: React.CSSProperties = {
    top: position.y,
    left: position.x,
  };

  return (
    <div className="cursor-container" style={cursorStyle}>
      <div className="crosshair">
        <div className="vertical-line"></div>
        <div className="horizontal-line"></div>
      </div>
    </div>
  );
};

export default Cursor;
