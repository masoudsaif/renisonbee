import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import CursorSVG from "../../../assets/svg/cursor.svg";
import "./Cursor.css";

const Cursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return ReactDOM.createPortal(
    <div ref={cursorRef} className="cursor">
      <img src={CursorSVG} alt="" />
    </div>,
    document.body
  );
};

export default Cursor;
