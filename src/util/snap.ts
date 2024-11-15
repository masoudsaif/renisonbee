import {
  ANGLE_SNAP_THRESHOLD,
  GRID_SIZE,
  SNAP_THRESHOLD,
} from "../constants/settings";
import ShapeType from "../enum/shape-type.enum";
import ICircleProperties from "../interfaces/circle-properties.interface";
import IPosition from "../interfaces/position.interface";
import IShapePosition from "../interfaces/shape-position.interface";
import IShape from "../interfaces/shape.interface";

export const snapToGrid = (value: number, gridSize = GRID_SIZE): number =>
  Math.round(value / gridSize) * gridSize;

export const isAtTheSamePosition = (shape: IShape) =>
  shape.startX === shape.endX && shape.startY === shape.endY;

export const getNearestShapeSnapPoint = (
  cursorPosition: IPosition,
  shapes: IShape[]
): IPosition | null => {
  for (const shape of shapes) {
    let nearestPoint: IPosition | null = null;

    switch (shape.type) {
      case ShapeType.LINE:
        nearestPoint = getNearestLinePoint(shape, cursorPosition);
        break;
      case ShapeType.RECTANGLE:
        nearestPoint = getNearestRectanglePoint(shape, cursorPosition);
        break;
      case ShapeType.CIRCLE:
        nearestPoint = getNearestCirclePoint(shape, cursorPosition);
        break;
      default:
        continue;
    }

    if (nearestPoint) {
      return nearestPoint;
    }
  }

  return null; // Return null if no snap point is found
};

export const calculateLineSnapPoints = ({
  startX,
  startY,
  endX,
  endY,
}: IShapePosition) => [
  { x: startX, y: startY }, // Start point
  { x: endX, y: endY }, // End point
  {
    x: (startX + endX) / 2,
    y: (startY + endY) / 2,
  }, // Midpoint
  {
    x: startX + (endX - startX) / 4,
    y: startY + (endY - startY) / 4,
  }, // Quarter point
  {
    x: startX + (endX - startX) * 0.75,
    y: startY + (endY - startY) * 0.75,
  }, // Three-quarters point
];

export const getNearestLinePoint = (
  line: IShapePosition,
  cursorPosition: IPosition
) => {
  const points = calculateLineSnapPoints(line);
  const nearestPoint = getNearestPoint(points, cursorPosition);

  if (nearestPoint) {
    return nearestPoint;
  }

  return getNearestLinePathPoint(line, cursorPosition);
};

export const getNearestLineSnapAnglePoint = (
  line: IShapePosition,
  cursorPosition: IPosition
) => {
  const { x: cursorX, y: cursorY } = cursorPosition;
  const startX = line.startX;
  const startY = line.startY;

  const dx = cursorX - startX;
  const dy = cursorY - startY;

  // Calculate the angle in degrees
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const normalizedAngle = (angle + 360) % 360;

  // Target angles and snapping threshold
  const targetAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  // Find the closest angle within the threshold
  const closestTargetAngle = targetAngles.find(
    (target) => Math.abs(normalizedAngle - target) <= ANGLE_SNAP_THRESHOLD
  );

  if (closestTargetAngle !== undefined) {
    // Snap to the closest target angle
    const snapRadians = (closestTargetAngle * Math.PI) / 180;
    const distance = Math.sqrt(dx * dx + dy * dy); // Keep the cursor's distance

    return {
      x: startX + distance * Math.cos(snapRadians),
      y: startY + distance * Math.sin(snapRadians),
    };
  }

  return null;
};

export const calculateRectangleSnapPoints = ({
  startX,
  startY,
  endX,
  endY,
}: IShapePosition) => [
  // Corners
  { x: startX, y: startY },
  { x: endX, y: startY },
  { x: endX, y: endY },
  { x: startX, y: endY },

  // Midpoints of sides
  { x: (startX + endX) / 2, y: startY },
  { x: (startX + endX) / 2, y: endY },
  { x: startX, y: (startY + endY) / 2 },
  { x: endX, y: (startY + endY) / 2 },

  // Quarter and three-quarters of horizontal sides
  { x: startX + (endX - startX) / 4, y: startY },
  { x: startX + (endX - startX) / 4, y: endY },
  { x: startX + (endX - startX) * 0.75, y: startY },
  { x: startX + (endX - startX) * 0.75, y: endY },

  // Quarter and three-quarters of vertical sides
  { x: startX, y: startY + (endY - startY) / 4 },
  { x: endX, y: startY + (endY - startY) / 4 },
  { x: startX, y: startY + (endY - startY) * 0.75 },
  { x: endX, y: startY + (endY - startY) * 0.75 },
];

export const getNearestRectanglePoint = (
  rectangle: IShape,
  cursorPosition: IPosition
) => {
  const points = calculateRectangleSnapPoints(rectangle);
  const nearestPoint = getNearestPoint(points, cursorPosition);

  if (nearestPoint) {
    return nearestPoint;
  }

  return getNearestRectangleSidesPoint(rectangle, cursorPosition);
};

export const calculateCircleProperties = ({
  startX,
  startY,
  endX,
  endY,
}: IShape) => ({
  centerX: startX,
  centerY: startY,
  radius: Math.hypot(endX - startX, endY - startY),
});

export const calculateCircleSnapPoints = ({
  centerX,
  centerY,
  radius,
}: ICircleProperties) => [
  { x: centerX - radius, y: centerY }, // Left
  { x: centerX + radius, y: centerY }, // Right
  { x: centerX, y: centerY - radius }, // Top
  { x: centerX, y: centerY + radius }, // Bottom
  { x: centerX, y: centerY }, // center
];

export const getNearestCircleBoundaryPoint = (
  circle: IShape,
  cursorPosition: IPosition,
  threshold = SNAP_THRESHOLD
) => {
  const { x: cursorX, y: cursorY } = cursorPosition;
  const { centerX, centerY, radius } = calculateCircleProperties(circle);
  const distToCenter = Math.hypot(
    cursorPosition.x - centerX,
    cursorPosition.y - centerY
  );

  if (Math.abs(distToCenter - radius) <= threshold) {
    const scale = radius / distToCenter;
    const x = centerX + (cursorX - centerX) * scale;
    const y = centerY + (cursorY - centerY) * scale;

    return { x, y };
  }

  return null;
};

export const getNearestCirclePoint = (
  circle: IShape,
  cursorPosition: IPosition,
  threshold = SNAP_THRESHOLD
) => {
  const circleProps = calculateCircleProperties(circle);
  const points = calculateCircleSnapPoints(circleProps);
  const nearestPoint = getNearestPoint(points, cursorPosition);

  if (nearestPoint) {
    return nearestPoint;
  }

  return getNearestCircleBoundaryPoint(circle, cursorPosition, threshold);
};

export const getNearestPoint = (
  points: IPosition[],
  cursorPosition: IPosition,
  threshold = SNAP_THRESHOLD
) => {
  const point = points.find(
    (point) =>
      Math.hypot(cursorPosition.x - point.x, cursorPosition.y - point.y) <=
      threshold
  );

  return point || null;
};

export const getNearestLinePathPoint = (
  linePosition: IShapePosition,
  cursorPosition: IPosition,
  threshold = SNAP_THRESHOLD
) => {
  const { x: cursorX, y: cursorY } = cursorPosition;
  const { startX, startY, endX, endY } = linePosition;
  const lineLength = Math.hypot(endX - startX, endY - startY);
  const t = Math.max(
    0,
    Math.min(
      1,
      ((cursorX - startX) * (endX - startX) +
        (cursorY - startY) * (endY - startY)) /
        Math.pow(lineLength, 2)
    )
  );
  const closestX = startX + t * (endX - startX);
  const closestY = startY + t * (endY - startY);

  if (Math.hypot(cursorX - closestX, cursorY - closestY) <= threshold) {
    return { x: closestX, y: closestY };
  }

  return null;
};

export const calculateRectangleSides = ({
  startX,
  startY,
  endX,
  endY,
}: IShape) => [
  { x1: startX, y1: startY, x2: endX, y2: startY }, // Top side
  { x1: endX, y1: startY, x2: endX, y2: endY }, // Right side
  { x1: endX, y1: endY, x2: startX, y2: endY }, // Bottom side
  { x1: startX, y1: endY, x2: startX, y2: startY }, // Left side
];

export const getNearestRectangleSidesPoint = (
  rectangle: IShape,
  cursorPosition: IPosition
): IPosition | null => {
  const sides = calculateRectangleSides(rectangle);

  let nearestPoint: IPosition | null = null;
  let minDistance = Infinity;

  for (const { x1, y1, x2, y2 } of sides) {
    const point = getNearestLinePathPoint(
      { startX: x1, startY: y1, endX: x2, endY: y2 },
      cursorPosition
    );

    if (point) {
      const distance = Math.hypot(
        cursorPosition.x - point.x,
        cursorPosition.y - point.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }
  }

  return nearestPoint;
};

export const getNearestGridPoint = (
  cursorPosition: IPosition,
  threshold = SNAP_THRESHOLD
) => {
  const { x, y } = cursorPosition;
  const nearestGridX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  const nearestGridY = Math.round(y / GRID_SIZE) * GRID_SIZE;
  const gridDistance = Math.hypot(x - nearestGridX, y - nearestGridY);

  if (gridDistance <= threshold) {
    return { x: nearestGridX, y: nearestGridY };
  }

  return null;
};
