import { MOVE_RADIUS_THRESHOLD } from "../constants/settings";
import IPosition from "../interfaces/position.interface";
import IShape from "../interfaces/shape.interface";
import { getNearestShapeSnapPoint } from "./snap";

export const getShapesSortedByDistance = (
  shapes: IShape[],
  position: IPosition
): IShape[] => {
  // If at least one shape is within the threshold, proceed with sorting all shapes by distance
  const sortedShapes = shapes.slice(); // Copy the shapes array to avoid mutation
  sortedShapes.sort((a, b) => {
    const aCenterX = (a.startX + a.endX) / 2;
    const aCenterY = (a.startY + a.endY) / 2;
    const bCenterX = (b.startX + b.endX) / 2;
    const bCenterY = (b.startY + b.endY) / 2;

    const distanceA = Math.sqrt(
      Math.pow(aCenterX - position.x, 2) + Math.pow(aCenterY - position.y, 2)
    );
    const distanceB = Math.sqrt(
      Math.pow(bCenterX - position.x, 2) + Math.pow(bCenterY - position.y, 2)
    );

    return distanceA - distanceB; // Sort by distance, closest first
  });

  return sortedShapes;
};

export const getMovingShapes = (
  shapes: IShape[],
  cursorPosition: IPosition,
  radius = MOVE_RADIUS_THRESHOLD
) => {
  const point = getNearestShapeSnapPoint(shapes, cursorPosition, radius);

  // If no shapes are within threshold, return null
  if (!point) {
    return null;
  }

  const sortedShapes = getShapesSortedByDistance(shapes, cursorPosition);

  if (sortedShapes.length === 0) {
    return null;
  }

  return sortedShapes;
};
