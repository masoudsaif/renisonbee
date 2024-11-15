import ShapeType from "../enum/shape-type.enum";
import ISelectionBounds from "../interfaces/selection-bounds.interface";
import IShapePosition from "../interfaces/shape-position.interface";
import IShape from "../interfaces/shape.interface";

export const getIsShapeIntersecting = (
  shape: IShape,
  selectionBounds: ISelectionBounds
) => {
  switch (shape.type) {
    case ShapeType.RECTANGLE:
      return isRectangleIntersectingWithSelection(shape, selectionBounds);
    case ShapeType.CIRCLE:
      return isCircleIntersectingWithSelection(shape, selectionBounds);
    case ShapeType.LINE:
      return isLineIntersectingWithSelection(shape, selectionBounds);
    default:
      throw new Error("Invalid shape type");
  }
};

export const isRectangleIntersectingWithSelection = (
  shape: IShapePosition,
  selectionBounds: ISelectionBounds
) => {
  const { startX, startY, endX, endY } = shape;
  const rectMinX = Math.min(startX, endX);
  const rectMinY = Math.min(startY, endY);
  const rectMaxX = Math.max(startX, endX);
  const rectMaxY = Math.max(startY, endY);

  // Case 1: Check if the selection box fully covers the rectangle
  const isFullyCovered =
    selectionBounds.minX <= rectMinX &&
    selectionBounds.minY <= rectMinY &&
    selectionBounds.maxX >= rectMaxX &&
    selectionBounds.maxY >= rectMaxY;

  if (isFullyCovered) {
    return isFullyCovered;
  }

  // Case 2: Check if the selection box intersects with any of the rectangle's sides using isLineIntersectingWithSelection
  const topLine = {
    startX: rectMinX,
    startY: rectMinY,
    endX: rectMaxX,
    endY: rectMinY,
  };
  const rightLine = {
    startX: rectMaxX,
    startY: rectMinY,
    endX: rectMaxX,
    endY: rectMaxY,
  };
  const bottomLine = {
    startX: rectMinX,
    startY: rectMaxY,
    endX: rectMaxX,
    endY: rectMaxY,
  };
  const leftLine = {
    startX: rectMinX,
    startY: rectMinY,
    endX: rectMinX,
    endY: rectMaxY,
  };

  const isIntersecting =
    isLineIntersectingWithSelection(topLine, selectionBounds) ||
    isLineIntersectingWithSelection(rightLine, selectionBounds) ||
    isLineIntersectingWithSelection(bottomLine, selectionBounds) ||
    isLineIntersectingWithSelection(leftLine, selectionBounds);

  // Return true if either the selection box fully covers the rectangle or intersects any side of the rectangle
  return isFullyCovered || isIntersecting;
};

export const isCircleIntersectingWithSelection = (
  shape: IShape,
  selectionBounds: ISelectionBounds
) => {
  const { startX: cx, startY: cy } = shape;
  const radius = Math.hypot(
    shape.endX - shape.startX,
    shape.endY - shape.startY
  );

  // Calculate the bounding box for the circle
  const circleMinX = cx - radius;
  const circleMinY = cy - radius;
  const circleMaxX = cx + radius;
  const circleMaxY = cy + radius;

  // Case 1: Check if the selection box fully covers the circle
  const isFullyCovered =
    selectionBounds.minX <= circleMinX &&
    selectionBounds.minY <= circleMinY &&
    selectionBounds.maxX >= circleMaxX &&
    selectionBounds.maxY >= circleMaxY;

  // Case 2: Check if the selection box intersects the circumference of the circle
  // Find the closest point on the selection box to the circle's center
  const closestX = Math.max(
    selectionBounds.minX,
    Math.min(cx, selectionBounds.maxX)
  );
  const closestY = Math.max(
    selectionBounds.minY,
    Math.min(cy, selectionBounds.maxY)
  );

  // Calculate the distance from the center of the circle to the closest point
  const distanceX = closestX - cx;
  const distanceY = closestY - cy;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Case 3: Intersection with the circumference
  const isIntersecting = distance <= radius;

  // Only return true if the selection box fully covers the circle or intersects its circumference
  return isFullyCovered || isIntersecting;
};

export const isLineIntersectingWithSelection = (
  shape: IShapePosition,
  selectionBounds: ISelectionBounds
) => {
  // Line endpoints
  const x1 = shape.startX;
  const y1 = shape.startY;
  const x2 = shape.endX;
  const y2 = shape.endY;

  // Check if both endpoints of the line are inside the selection box
  const isLineInsideSelection =
    x1 >= selectionBounds.minX &&
    x1 <= selectionBounds.maxX &&
    y1 >= selectionBounds.minY &&
    y1 <= selectionBounds.maxY &&
    x2 >= selectionBounds.minX &&
    x2 <= selectionBounds.maxX &&
    y2 >= selectionBounds.minY &&
    y2 <= selectionBounds.maxY;

  if (isLineInsideSelection) {
    return true;
  }

  // Check if the selection rectangle overlaps with the line's bounding box
  if (
    selectionBounds.minX <= Math.max(x1, x2) &&
    selectionBounds.maxX >= Math.min(x1, x2) &&
    selectionBounds.minY <= Math.max(y1, y2) &&
    selectionBounds.maxY >= Math.min(y1, y2)
  ) {
    // Check if the line intersects the selection area by testing each side of the rectangle
    const lineIntersects =
      lineIntersectsRectEdge(
        x1,
        y1,
        x2,
        y2,
        selectionBounds.minX,
        selectionBounds.minY,
        selectionBounds.maxX,
        selectionBounds.minY
      ) ||
      lineIntersectsRectEdge(
        x1,
        y1,
        x2,
        y2,
        selectionBounds.maxX,
        selectionBounds.minY,
        selectionBounds.maxX,
        selectionBounds.maxY
      ) ||
      lineIntersectsRectEdge(
        x1,
        y1,
        x2,
        y2,
        selectionBounds.maxX,
        selectionBounds.maxY,
        selectionBounds.minX,
        selectionBounds.maxY
      ) ||
      lineIntersectsRectEdge(
        x1,
        y1,
        x2,
        y2,
        selectionBounds.minX,
        selectionBounds.maxY,
        selectionBounds.minX,
        selectionBounds.minY
      );

    if (lineIntersects) return true;

    // Check if the line is close enough to the selection box (proximity check)
    const proximityThreshold = 5; // Example threshold for proximity, can be adjusted
    if (
      isLineCloseToSelection(
        x1,
        y1,
        x2,
        y2,
        selectionBounds,
        proximityThreshold
      )
    ) {
      return true;
    }
  }

  return false;
};

export const lineIntersectsRectEdge = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): boolean => {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return false; // Parallel lines, no intersection

  const intersectX =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const intersectY =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  // Check if the intersection point is within the bounds of both line segments
  if (
    intersectX < Math.min(x1, x2) ||
    intersectX > Math.max(x1, x2) ||
    intersectX < Math.min(x3, x4) ||
    intersectX > Math.max(x3, x4)
  ) {
    return false;
  }
  if (
    intersectY < Math.min(y1, y2) ||
    intersectY > Math.max(y1, y2) ||
    intersectY < Math.min(y3, y4) ||
    intersectY > Math.max(y3, y4)
  ) {
    return false;
  }

  return true;
};

export const isLineCloseToSelection = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  selectionBounds: ISelectionBounds,
  threshold: number
): boolean => {
  // Calculate the perpendicular distance from the selection area to the line
  const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const dx = (x2 - x1) / lineLength;
  const dy = (y2 - y1) / lineLength;

  // Check if any corner of the selection rectangle is within the proximity threshold of the line
  const corners = [
    { x: selectionBounds.minX, y: selectionBounds.minY },
    { x: selectionBounds.maxX, y: selectionBounds.minY },
    { x: selectionBounds.maxX, y: selectionBounds.maxY },
    { x: selectionBounds.minX, y: selectionBounds.maxY },
  ];

  for (const corner of corners) {
    const dxLine = corner.x - x1;
    const dyLine = corner.y - y1;
    const projection = dxLine * dx + dyLine * dy;
    const closestX = x1 + projection * dx;
    const closestY = y1 + projection * dy;

    const distance = Math.sqrt(
      (corner.x - closestX) ** 2 + (corner.y - closestY) ** 2
    );
    if (distance <= threshold) {
      return true;
    }
  }

  return false;
};
