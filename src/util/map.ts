import EventType from "../enum/event-type.enum";
import ShapeType from "../enum/shape-type.enum";
import Line from "../components/components-drawing/Line/Line";
import Rectangle from "../components/components-drawing/Rectangle/Rectangle";
import Circle from "../components/components-drawing/Circle/Circle";

export const mapEventToShape = (type: EventType) => {
  switch (true) {
    case type === EventType.CREATE_LINE:
      return ShapeType.LINE;
    case type === EventType.CREATE_RECTANGLE:
      return ShapeType.RECTANGLE;
    case type === EventType.CREATE_CIRCLE:
      return ShapeType.CIRCLE;
    default:
      throw new Error("Invalid event type");
  }
};

export const mapShapeComponentToShape = (type: ShapeType) => {
  switch (true) {
    case type === ShapeType.LINE:
      return Line;
    case type === ShapeType.RECTANGLE:
      return Rectangle;
    case type === ShapeType.CIRCLE:
      return Circle;
    default:
      throw new Error("Invalid shape type");
  }
};