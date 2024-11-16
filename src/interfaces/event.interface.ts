import PlanEventType from "../enum/event-type.enum";
import IShape from "./shape.interface";

export default interface IEvent {
  type: PlanEventType;
  prevData: IShape[];
}
