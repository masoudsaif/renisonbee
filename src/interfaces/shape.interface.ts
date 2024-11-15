import ShapeType from "../enum/shape-type.enum";
import IShapePosition from "./shape-position.interface";

export default interface IShape extends IShapePosition {
  id: string;
  type: ShapeType;
  isSelected?: boolean;
}
