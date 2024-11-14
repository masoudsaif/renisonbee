import MeasurementUnit from "../enum/measurement-unit.enum";

export const convertToUnit = (
  unit: MeasurementUnit,
  pixelDistance: number
): string => {
  const factor = unit === MeasurementUnit.METRIC ? 0.01 : 0.0328; // 1 pixel = 0.01 meters (metric), 1 pixel = 0.0328 feet (imperial)
  const distance = pixelDistance * factor;

  if (unit === MeasurementUnit.METRIC) {
    return `${distance.toFixed(2)} m`; // Metric (meters)
  } else {
    return `${distance.toFixed(2)} ft`; // Imperial (feet)
  }
};
