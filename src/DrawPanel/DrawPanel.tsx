import React, { useState, useEffect, useRef } from "react";
import "./DrawPanel.css";
import IEvent from "../interfaces/event.interface";
import EventType from "../enum/event-type.enum";
import MeasurementUnit from "../enum/measurement-unit.enum";
import If from "../components/components-logical/If/If";
import { generateId } from "../util/string";
import { isAtTheSameCoordinate } from "../util/coordinates";
import Cursor from "../components/components-ui/Cursor/Cursor";
import { GRID_SIZE, SNAP_THRESHOLD } from "../constants/settings";
import PALETTE from "../styles/palette";
import IShape from "../interfaces/shape.interface";
import { mapEventToShape, mapShapeComponentToShape } from "../util/map";
import ShapeType from "../enum/shape-type.enum";
import { isCreateShapeMode } from "../util/conditions";
import useCursor from "../hooks/ui/useCursor";

export interface DrawPanelProps {
  mode: EventType;
  unit: MeasurementUnit;
}

const DrawPanel: React.FC<DrawPanelProps> = ({ mode, unit }) => {
  const historyRef = useRef<IEvent[]>([]);
  const [shapes, setShapes] = useState<IShape[]>([]);
  const [currentShape, setCurrentShape] = useState<IShape | null>(null);
  const [snapHighlight, setSnapHighlight] = useState<IShape | null>(null);
  const { cursorPosition } = useCursor();

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isCreateShapeMode(mode)) {
      const startX = snapHighlight?.startX || e.nativeEvent.offsetX;
      const startY = snapHighlight?.startY || e.nativeEvent.offsetY;
      setCurrentShape({
        id: generateId(),
        startX,
        startY,
        endX: startX,
        endY: startY,
        type: mapEventToShape(mode),
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    const endX = snapHighlight?.startX || e.nativeEvent.offsetX;
    const endY = snapHighlight?.startY || e.nativeEvent.offsetY;
    // Check for snapping proximity
    const snappedShape = shapes.find((shape) => {
      if (shape.type === ShapeType.LINE) {
        const points = [
          { x: shape.startX, y: shape.startY }, // Start point
          { x: shape.endX, y: shape.endY }, // End point
          {
            x: (shape.startX + shape.endX) / 2,
            y: (shape.startY + shape.endY) / 2,
          }, // Midpoint
          {
            x: shape.startX + (shape.endX - shape.startX) / 4,
            y: shape.startY + (shape.endY - shape.startY) / 4,
          }, // Quarter point
          {
            x: shape.startX + (shape.endX - shape.startX) * 0.75,
            y: shape.startY + (shape.endY - shape.startY) * 0.75,
          }, // Three-quarters point
        ];

        // Check for snapping to prioritized points
        const closestPoint = points.find(
          (point) =>
            Math.hypot(mouseX - point.x, mouseY - point.y) <= SNAP_THRESHOLD
        );
        if (closestPoint) return true;

        // Check for snapping to any point along the line
        const lineLength = Math.hypot(
          shape.endX - shape.startX,
          shape.endY - shape.startY
        );
        const t = Math.max(
          0,
          Math.min(
            1,
            ((mouseX - shape.startX) * (shape.endX - shape.startX) +
              (mouseY - shape.startY) * (shape.endY - shape.startY)) /
              Math.pow(lineLength, 2)
          )
        );
        const closestX = shape.startX + t * (shape.endX - shape.startX);
        const closestY = shape.startY + t * (shape.endY - shape.startY);

        const distToLine = Math.hypot(mouseX - closestX, mouseY - closestY);
        return distToLine <= SNAP_THRESHOLD;
      } else if (shape.type === ShapeType.RECTANGLE) {
        const { startX, startY, endX, endY } = shape;

        // Calculate rectangle sides
        const sides = [
          { x1: startX, y1: startY, x2: endX, y2: startY }, // Top side
          { x1: endX, y1: startY, x2: endX, y2: endY }, // Right side
          { x1: endX, y1: endY, x2: startX, y2: endY }, // Bottom side
          { x1: startX, y1: endY, x2: startX, y2: startY }, // Left side
        ];

        // Priority snapping points
        const priorityPoints = [
          { x: startX, y: startY }, // Top-left corner
          { x: endX, y: startY }, // Top-right corner
          { x: endX, y: endY }, // Bottom-right corner
          { x: startX, y: endY }, // Bottom-left corner
          {
            x: (startX + endX) / 2,
            y: startY,
          }, // Midpoint (top)
          {
            x: (startX + endX) / 2,
            y: endY,
          }, // Midpoint (bottom)
          {
            x: startX,
            y: (startY + endY) / 2,
          }, // Midpoint (left)
          {
            x: endX,
            y: (startY + endY) / 2,
          }, // Midpoint (right)
          {
            x: startX + (endX - startX) / 4,
            y: startY,
          }, // Quarter (top)
          {
            x: startX + (endX - startX) / 4,
            y: endY,
          }, // Quarter (bottom)
          {
            x: startX + (endX - startX) * 0.75,
            y: startY,
          }, // Three-quarters (top)
          {
            x: startX + (endX - startX) * 0.75,
            y: endY,
          }, // Three-quarters (bottom)
        ];

        // Check if mouse is near any priority point
        const closestPriorityPoint = priorityPoints.find(
          (point) =>
            Math.hypot(mouseX - point.x, mouseY - point.y) <= SNAP_THRESHOLD
        );
        if (closestPriorityPoint) return true;

        // Check for snapping to any point along the rectangle's sides
        const isNearSide = sides.some(({ x1, y1, x2, y2 }) => {
          const sideLength = Math.hypot(x2 - x1, y2 - y1);
          const t = Math.max(
            0,
            Math.min(
              1,
              ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) /
                Math.pow(sideLength, 2)
            )
          );
          const closestX = x1 + t * (x2 - x1);
          const closestY = y1 + t * (y2 - y1);

          return (
            Math.hypot(mouseX - closestX, mouseY - closestY) <= SNAP_THRESHOLD
          );
        });
        return isNearSide;
      } else if (shape.type === ShapeType.CIRCLE) {
        const centerX = shape.startX;
        const centerY = shape.startY;
        const radius = Math.hypot(
          shape.endX - shape.startX,
          shape.endY - shape.startY
        );

        // Distance from mouse to the circle's center
        const distToCenter = Math.hypot(mouseX - centerX, mouseY - centerY);

        // Check if within snapping range of the circle's center
        if (distToCenter <= SNAP_THRESHOLD) {
          return true; // Near the center
        }

        // Check if within snapping range of the circle's boundary
        if (Math.abs(distToCenter - radius) <= SNAP_THRESHOLD) {
          return true; // Near the boundary
        }
      }

      return false;
    });
    if (snappedShape) {
      if (snappedShape.type === ShapeType.LINE) {
        // Prioritized points for snapping
        const points = [
          { x: snappedShape.startX, y: snappedShape.startY },
          { x: snappedShape.endX, y: snappedShape.endY },
          {
            x: (snappedShape.startX + snappedShape.endX) / 2,
            y: (snappedShape.startY + snappedShape.endY) / 2,
          },
          {
            x:
              snappedShape.startX +
              (snappedShape.endX - snappedShape.startX) / 4,
            y:
              snappedShape.startY +
              (snappedShape.endY - snappedShape.startY) / 4,
          },
          {
            x:
              snappedShape.startX +
              (snappedShape.endX - snappedShape.startX) * 0.75,
            y:
              snappedShape.startY +
              (snappedShape.endY - snappedShape.startY) * 0.75,
          },
        ];

        // Find the closest prioritized point
        let closestPoint = points[0];
        let minDistance = Math.hypot(
          mouseX - closestPoint.x,
          mouseY - closestPoint.y
        );
        points.forEach((point) => {
          const distance = Math.hypot(mouseX - point.x, mouseY - point.y);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        });

        // If close to a prioritized point, snap to it
        if (minDistance <= SNAP_THRESHOLD) {
          setSnapHighlight({
            ...snappedShape,
            startX: closestPoint.x,
            startY: closestPoint.y,
          });
        } else {
          // Snap to any point along the line
          const lineLength = Math.hypot(
            snappedShape.endX - snappedShape.startX,
            snappedShape.endY - snappedShape.startY
          );
          const t = Math.max(
            0,
            Math.min(
              1,
              ((mouseX - snappedShape.startX) *
                (snappedShape.endX - snappedShape.startX) +
                (mouseY - snappedShape.startY) *
                  (snappedShape.endY - snappedShape.startY)) /
                Math.pow(lineLength, 2)
            )
          );
          const closestX =
            snappedShape.startX + t * (snappedShape.endX - snappedShape.startX);
          const closestY =
            snappedShape.startY + t * (snappedShape.endY - snappedShape.startY);

          setSnapHighlight({
            ...snappedShape,
            startX: closestX,
            startY: closestY,
          });
        }
      } else if (snappedShape.type === ShapeType.RECTANGLE) {
        const { startX, startY, endX, endY } = snappedShape;

        // Define priority points
        const priorityPoints = [
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

        // Check the closest point among priority points
        let closestPoint = priorityPoints[0];
        let minDistance = Math.hypot(
          mouseX - closestPoint.x,
          mouseY - closestPoint.y
        );
        priorityPoints.forEach((point) => {
          const distance = Math.hypot(mouseX - point.x, mouseY - point.y);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        });

        // If not close enough to a priority point, snap to any point along the rectangle's sides
        if (minDistance > SNAP_THRESHOLD) {
          // Horizontal sides
          if (
            mouseY >= startY - SNAP_THRESHOLD &&
            mouseY <= startY + SNAP_THRESHOLD
          ) {
            closestPoint = {
              x: Math.max(startX, Math.min(mouseX, endX)),
              y: startY,
            };
          } else if (
            mouseY >= endY - SNAP_THRESHOLD &&
            mouseY <= endY + SNAP_THRESHOLD
          ) {
            closestPoint = {
              x: Math.max(startX, Math.min(mouseX, endX)),
              y: endY,
            };
          }

          // Vertical sides
          if (
            mouseX >= startX - SNAP_THRESHOLD &&
            mouseX <= startX + SNAP_THRESHOLD
          ) {
            closestPoint = {
              x: startX,
              y: Math.max(startY, Math.min(mouseY, endY)),
            };
          } else if (
            mouseX >= endX - SNAP_THRESHOLD &&
            mouseX <= endX + SNAP_THRESHOLD
          ) {
            closestPoint = {
              x: endX,
              y: Math.max(startY, Math.min(mouseY, endY)),
            };
          }
        }

        // Set the snap highlight to the closest snapping point
        setSnapHighlight({
          ...snappedShape,
          startX: closestPoint.x,
          startY: closestPoint.y,
        });
      } else if (snappedShape.type === ShapeType.CIRCLE) {
        const centerX = snappedShape.startX;
        const centerY = snappedShape.startY;
        const radius = Math.hypot(
          snappedShape.endX - snappedShape.startX,
          snappedShape.endY - snappedShape.startY
        );

        // Calculate tangent points
        const tangentPoints = [
          { x: centerX - radius, y: centerY }, // Left
          { x: centerX + radius, y: centerY }, // Right
          { x: centerX, y: centerY - radius }, // Top
          { x: centerX, y: centerY + radius }, // Bottom
        ];

        // Find the closest tangent point or center point
        const snapPoints = [...tangentPoints, { x: centerX, y: centerY }];

        // Find the closest snap point
        let closestPoint = snapPoints[0];
        let minDistance = Math.hypot(
          mouseX - closestPoint.x,
          mouseY - closestPoint.y
        );
        snapPoints.forEach((point) => {
          const distance = Math.hypot(mouseX - point.x, mouseY - point.y);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        });

        // If the mouse is close to a tangent, snap to it
        if (minDistance <= SNAP_THRESHOLD) {
          setSnapHighlight({
            ...snappedShape,
            startX: closestPoint.x,
            startY: closestPoint.y,
          });
        } else {
          // Otherwise, snap to the nearest point on the circle's boundary
          const distToCenter = Math.hypot(mouseX - centerX, mouseY - centerY);
          if (Math.abs(distToCenter - radius) <= SNAP_THRESHOLD) {
            const scale = radius / distToCenter;
            const snappedX = centerX + (mouseX - centerX) * scale;
            const snappedY = centerY + (mouseY - centerY) * scale;

            setSnapHighlight({
              ...snappedShape,
              startX: snappedX,
              startY: snappedY,
            });
          }
        }
      }
    } else {
      const nearestGridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
      const nearestGridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;
      // Check if the grid cell is within the snapping threshold
      const gridDistance = Math.hypot(
        mouseX - nearestGridX,
        mouseY - nearestGridY
      );
      if (gridDistance <= SNAP_THRESHOLD) {
        setSnapHighlight({
          id: generateId(),
          startX: nearestGridX,
          startY: nearestGridY,
          endX: nearestGridX,
          endY: nearestGridY,
          type: ShapeType.POINT,
        });
      } else {
        setSnapHighlight(null);
      }
    }

    if (isCreateShapeMode(mode) && currentShape) {
      setCurrentShape({
        ...currentShape,
        endX,
        endY,
      });
    }
  };

  const handleMouseUp = () => {
    if (isCreateShapeMode(mode) && currentShape) {
      if (!isAtTheSameCoordinate(currentShape)) {
        setShapes((prevShapes) => [
          ...prevShapes,
          {
            ...currentShape,
            endX: snapHighlight?.startX || currentShape.endX,
            endY: snapHighlight?.startY || currentShape.endY,
          },
        ]);
        historyRef.current.push({
          type: mode,
          data: currentShape,
        });
      }
      setCurrentShape(null);
    }
  };

  const handleUndo = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      if (historyRef.current.length === 0) return;

      const lastEvent = historyRef.current.pop();
      if (lastEvent?.type && isCreateShapeMode(lastEvent?.type)) {
        setShapes((prevShapes) => prevShapes.slice(0, -1));
      }
    }
  };

  const handleDelete = (e: KeyboardEvent) => {
    if (e.key === "Delete") {
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShapes((prevShapes) =>
        prevShapes.map((shape) => ({ ...shape, isSelected: false }))
      );
    }
  };

  const renderShapes = () =>
    shapes.map((shape) =>
      React.createElement(mapShapeComponentToShape(shape.type), {
        ...shape,
        key: shape.id,
        unit,
      })
    );

  useEffect(() => {
    window.addEventListener("keydown", handleUndo);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("keydown", handleDelete);
    return () => {
      window.removeEventListener("keydown", handleUndo);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("keydown", handleDelete);
    };
  }, []);

  return (
    <div
      className="grid"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Cursor position={cursorPosition} />
      <svg className="draw-layer">
        {renderShapes()}
        {currentShape
          ? React.createElement(mapShapeComponentToShape(currentShape.type), {
              ...currentShape!,
              unit,
              isDimensionsVisible: true,
            })
          : null}
        <If condition={snapHighlight !== null}>
          <circle
            cx={snapHighlight?.startX}
            cy={snapHighlight?.startY}
            r={SNAP_THRESHOLD}
            fill={PALETTE.SELECTION}
          />
        </If>
      </svg>
    </div>
  );
};

export default DrawPanel;
