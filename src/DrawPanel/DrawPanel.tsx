import React, { useState, useEffect, useRef, useCallback } from "react";
import "./DrawPanel.css";
import IEvent from "../interfaces/event.interface";
import EventType from "../enum/event-type.enum";
import MeasurementUnit from "../enum/measurement-unit.enum";
import { generateId } from "../util/string";
import { isAtTheSamePosition } from "../util/coordinates";
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
import SelectionArea from "../components/components-drawing/SelectionArea/SelectionArea";
import IShapePosition from "../interfaces/shape-position.interface";
import { getIsShapeIntersecting } from "../util/intersection";
import { shallowCopyArray } from "../util/copy";
import { getMovingShapes } from "../util/move";

export interface DrawPanelProps {
  mode: EventType;
  unit: MeasurementUnit;
}

const DrawPanel: React.FC<DrawPanelProps> = ({ mode, unit }) => {
  const historyRef = useRef<IEvent[]>([]);
  const isMouseDownRef = useRef(false);
  const cursorPositionRef = useRef<IPosition>({ x: 0, y: 0 });
  const movingReferencePointRef = useRef<IPosition | null>(null);
  const copiedShapesRef = useRef<IShape[] | null>(null);
  const [shapes, setShapes] = useState<IShape[]>([]);
  const [currentShape, setCurrentShape] = useState<IShape | null>(null);
  const [snapHighlight, setSnapHighlight] = useState<IPosition | null>(null);
  const [selectionArea, setSelectionArea] = useState<IShapePosition | null>(
    null
  );
  const [movingShapes, setMovingShapes] = useState<IShape[]>([]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      isMouseDownRef.current = true;
      const { offsetX: x, offsetY: y } = e.nativeEvent;
      if (isCreateShapeMode(mode)) {
        const startX = snapHighlight?.x || x;
        const startY = snapHighlight?.y || y;
        setCurrentShape({
          id: generateId(),
          startX,
          startY,
          endX: startX,
          endY: startY,
          type: mapEventToShape(mode),
        });
      } else if (mode === EventType.SELECT) {
        const movingState = getMovingShapes(
          shapes
            .filter(({ isSelected }) => isSelected)
            .map((shape) => ({ ...shape, isSelected: false })),
          { x, y }
        );
        if (shapes.some(({ isSelected }) => isSelected) && movingState) {
          const nextMovingShapes = movingState;
          if (nextMovingShapes) {
            movingReferencePointRef.current = snapHighlight;
            setMovingShapes(nextMovingShapes);
            return;
          }
        }
        setSelectionArea({ startX: x, startY: y, endX: x, endY: y });
      }
    },
    [shapes, mode, snapHighlight]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const cursorX = e.nativeEvent.offsetX;
      const cursorY = e.nativeEvent.offsetY;
      const cursorPosition = { x: cursorX, y: cursorY };
      const endX = snapHighlight?.x || cursorX;
      const endY = snapHighlight?.y || cursorY;
      cursorPositionRef.current = cursorPosition;

      const nearestShapeSnapPoint = getNearestShapeSnapPoint(
        shapes,
        cursorPosition
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
      } else if (
        mode === EventType.SELECT &&
        movingReferencePointRef.current &&
        movingShapes.length
      ) {
        const {
          current: { x: refX, y: refY },
        } = movingReferencePointRef;
        const offsetX = endX - refX;
        const offsetY = endY - refY;

        movingReferencePointRef.current = {
          x: refX + offsetX,
          y: refY + offsetY,
        };

        setMovingShapes((prevShapes) =>
          prevShapes.map((shape) => ({
            ...shape,
            startX: shape.startX + offsetX,
            startY: shape.startY + offsetY,
            endX: shape.endX + offsetX,
            endY: shape.endY + offsetY,
          }))
        );
      } else if (
        mode === EventType.SELECT &&
        selectionArea &&
        isMouseDownRef.current
      ) {
        setSelectionArea((prev) =>
          prev ? { ...prev, endX: cursorX, endY: cursorY } : null
        );
      }
    },
    [shapes, movingShapes, selectionArea, snapHighlight, currentShape, mode]
  );

  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
    if (isCreateShapeMode(mode) && currentShape) {
      if (!isAtTheSamePosition(currentShape)) {
        historyRef.current.push({
          type: mode,
          prevData: shallowCopyArray(shapes),
        });
        setShapes((prevShapes) => {
          return [
            ...prevShapes,
            {
              ...currentShape,
              endX: snapHighlight?.x || currentShape.endX,
              endY: snapHighlight?.y || currentShape.endY,
            },
          ];
        });
      }
      setCurrentShape(null);
    } else if (mode === EventType.SELECT && movingReferencePointRef.current) {
      resetMovingShapes();
      historyRef.current.push({
        type: mode,
        prevData: shallowCopyArray(shapes),
      });
      setShapes((prevShapes) =>
        prevShapes.map((shape) => {
          const updatedShape =
            movingShapes.find(({ id }) => id === shape.id) || shape;

          return { ...updatedShape, isMoving: false };
        })
      );
    } else if (mode === EventType.SELECT && selectionArea) {
      if (!isAtTheSamePosition(selectionArea)) {
        const { startX, startY, endX, endY } = selectionArea;
        const selectionBounds = {
          minX: Math.min(startX, endX),
          minY: Math.min(startY, endY),
          maxX: Math.max(startX, endX),
          maxY: Math.max(startY, endY),
        };

        setShapes((prevShapes) => {
          return prevShapes.map((shape) => ({
            ...shape,
            isSelected: getIsShapeIntersecting(shape, selectionBounds),
          }));
        });
        setSelectionArea(null);
      }
    }
  }, [shapes, selectionArea, currentShape, snapHighlight, movingShapes, mode]);

  const handleUndo = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      if (historyRef.current.length === 0) {
        return;
      }
      const lastEvent = historyRef.current.pop();
      setShapes(lastEvent!.prevData);
    }
  };

  const handleDelete = (e: KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      setShapes((prevShapes) => {
        historyRef.current.push({
          type: EventType.PASTE,
          prevData: shallowCopyArray(prevShapes),
        });
        return prevShapes.filter((shape) => !shape.isSelected);
      });
    }
  };

  const resetShapeSelection = () =>
    setShapes((prevShapes) =>
      prevShapes.map((shape) => ({ ...shape, isSelected: false }))
    );

  const resetMovingShapes = () => {
    setMovingShapes([]);
    movingReferencePointRef.current = null;
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      resetShapeSelection();
      resetMovingShapes();
    }
  };

  const handleCopy = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const selectedShapes = shapes.filter((shape) => shape.isSelected);
        if (selectedShapes.length > 0) {
          copiedShapesRef.current = selectedShapes.map((shape) => ({
            ...shape,
          }));
        }
      }
    },
    [shapes]
  );

  const handlePaste = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (copiedShapesRef.current) {
          const { x, y } = cursorPositionRef.current;
          const offsetX =
            (snapHighlight?.x || x) - copiedShapesRef.current[0].startX;
          const offsetY =
            (snapHighlight?.y || y) - copiedShapesRef.current[0].startY;
          const newShapes = copiedShapesRef.current.map((shape) => ({
            ...shape,
            id: generateId(),
            startX: shape.startX + offsetX,
            startY: shape.startY + offsetY,
            endX: shape.endX + offsetX,
            endY: shape.endY + offsetY,
            isSelected: true,
          }));
          resetShapeSelection();
          historyRef.current.push({
            type: EventType.PASTE,
            prevData: shallowCopyArray(shapes),
          });
          setShapes((prevShapes) => {
            return [...prevShapes, ...newShapes];
          });
        }
      }
    },
    [shapes, snapHighlight]
  );

  const renderShapes = () =>
    shapes.map((shape) =>
      React.createElement(mapShapeComponentToShape(shape.type), {
        ...shape,
        key: shape.id,
        unit,
      })
    );

  const renderMovingShapes = () =>
    movingShapes.map((shape) =>
      React.createElement(mapShapeComponentToShape(shape.type), {
        ...shape,
        key: `${shape.id}-is-moving`,
        unit,
        isMoving: true,
      })
    );

  useEffect(() => {
    window.addEventListener("keydown", handleCopy);
    return () => {
      window.removeEventListener("keydown", handleCopy);
    };
  }, [handleCopy]);

  useEffect(() => {
    window.addEventListener("keydown", handlePaste);
    return () => {
      window.removeEventListener("keydown", handlePaste);
    };
  }, [handlePaste]);

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

  useEffect(() => {
    resetShapeSelection();
  }, [mode]);

  return (
    <div
      className="grid"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg className="draw-layer">
        {renderShapes()}
        {renderMovingShapes()}
        {currentShape
          ? React.createElement(mapShapeComponentToShape(currentShape.type), {
              ...currentShape!,
              unit,
              isDimensionsVisible: true,
            })
          : null}
        {selectionArea ? <SelectionArea {...selectionArea} /> : null}
        {snapHighlight ? <SnapHighlight {...snapHighlight} /> : null}
      </svg>
    </div>
  );
};

export default DrawPanel;
