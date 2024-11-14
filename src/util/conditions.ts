import EventType from "../enum/event-type.enum";

export const isCreateShapeMode = (mode: EventType) =>
  mode === EventType.CREATE_CIRCLE ||
  mode === EventType.CREATE_LINE ||
  mode === EventType.CREATE_RECTANGLE;
