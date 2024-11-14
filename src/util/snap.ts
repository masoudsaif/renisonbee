import { GRID_SIZE } from "../constants/settings";

export const snapToGrid = (value: number, gridSize = GRID_SIZE): number =>
  Math.round(value / gridSize) * gridSize;
