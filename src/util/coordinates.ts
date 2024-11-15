import IPosition from "../interfaces/position.interface";
import IShapePosition from "../interfaces/shape-position.interface";

export const isAtTheSamePosition = (shape: IShapePosition) =>
  shape.startX === shape.endX && shape.startY === shape.endY;

export const getAxesCenter = (): IPosition => {
  // Get the screen width and height
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Define margins to avoid drawing axes too close to the edges
  const margin = 500; // Adjust this value based on your needs

  // Calculate the center, adjusted with margin
  const x = screenWidth / 2;
  const y = screenHeight / 2;

  // Ensure the axes don't go out of the viewport by adjusting for the margin
  const safeX = Math.max(margin, Math.min(x, screenWidth - margin));
  const safeY = Math.max(margin, Math.min(y, screenHeight - margin));

  return { x: safeX, y: safeY };
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};
