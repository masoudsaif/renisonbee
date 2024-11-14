import ShapeType from "../enum/shape-type.enum";

export default interface IShape {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: ShapeType;
  isSelected?: boolean;
}
