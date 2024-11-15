import React, { useState, useEffect, useRef } from "react";
import "./DrawPanel.css";
import IEvent from "../interfaces/event.interface";
import EventType from "../enum/event-type.enum";
import MeasurementUnit from "../enum/measurement-unit.enum";
import { generateId } from "../util/string";
import { isAtTheSamePosition } from "../util/coordinates";
import Cursor from "../components/components-ui/Cursor/Cursor";
import IShape from "../interfaces/shape.interface";
import { mapEventToShape, mapShapeComponentToShape } from "../util/map";
import { isCreateShapeMode } from "../util/conditions";
import {
  getNearestGridPoint,
  getNearestLineSnapAnglePoint,
  getNearestShapeSnapPoint,
} from "../util/snap";
import IPosition from "../interfaces/position.interface";
import SnapHighlight from "../components/components-drawing/SnapHightLight/SnapHighLight";
import ShapeType from "../enum/shape-type.enum";

export interface DrawPanelProps {
  mode: EventType;
  unit: MeasurementUnit;
}

const DrawPanel: React.FC<DrawPanelProps> = ({ mode, unit }) => {
  const historyRef = useRef<IEvent[]>([]);
  const [shapes, setShapes] = useState<IShape[]>([]);
  const [currentShape, setCurrentShape] = useState<IShape | null>(null);
  const [snapHighlight, setSnapHighlight] = useState<IPosition | null>(null);
  console.log("rerender");
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isCreateShapeMode(mode)) {
      const startX = snapHighlight?.x || e.nativeEvent.offsetX;
      const startY = snapHighlight?.y || e.nativeEvent.offsetY;
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
    const cursorX = e.nativeEvent.offsetX;
    const cursorY = e.nativeEvent.offsetY;
    const cursorPosition = { x: cursorX, y: cursorY };
    const endX = snapHighlight?.x || cursorX;
    const endY = snapHighlight?.y || cursorY;

    const nearestShapeSnapPoint = getNearestShapeSnapPoint(
      cursorPosition,
      shapes
    );

    if (nearestShapeSnapPoint) {
      setSnapHighlight(nearestShapeSnapPoint);
    } else {
      const nearestGridSnapPoint = getNearestGridPoint(cursorPosition);
      if (nearestGridSnapPoint) {
        setSnapHighlight(nearestGridSnapPoint);
      } else {
        setSnapHighlight(null);
      }
    }

    if (isCreateShapeMode(mode) && currentShape) {
      if (currentShape.type === ShapeType.LINE) {
        const point = getNearestLineSnapAnglePoint(
          currentShape,
          cursorPosition
        );
        setCurrentShape({
          ...currentShape,
          endX: point?.x || endX,
          endY: point?.y || endY,
        });
      } else {
        setCurrentShape({
          ...currentShape,
          endX,
          endY,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isCreateShapeMode(mode) && currentShape) {
      if (!isAtTheSamePosition(currentShape)) {
        setShapes((prevShapes) => [
          ...prevShapes,
          {
            ...currentShape,
            endX: snapHighlight?.x || currentShape.endX,
            endY: snapHighlight?.y || currentShape.endY,
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
        isDimensionsVisible: true,
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
      <Cursor />
      <svg className="draw-layer">
        {renderShapes()}
        {currentShape
          ? React.createElement(mapShapeComponentToShape(currentShape.type), {
              ...currentShape!,
              unit,
              isDimensionsVisible: true,
            })
          : null}
        <SnapHighlight {...snapHighlight} />
      </svg>
    </div>
  );
};

export default DrawPanel;
