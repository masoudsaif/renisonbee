import MeasurementUnit from "../enum/measurement-unit.enum";

export const convertToUnit = (
  distance: number,
  _unit: MeasurementUnit
): string => `${distance % 1 === 0 ? distance : distance.toFixed(2)}PX`; // Metric (meters)
