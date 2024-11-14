import { useEffect, useState } from "react";
import IPosition from "../../interfaces/position.interface";

const useCursor = () => {
  const [cursorPosition, setCursorPosition] = useState<IPosition>({
    x: 0,
    y: 0,
  });

  const handleCursorMouseMove = (e: MouseEvent) => {
    setCursorPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleCursorMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleCursorMouseMove);
    };
  }, []);

  return { cursorPosition };
};

export default useCursor;
