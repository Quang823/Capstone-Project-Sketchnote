import { buildShapeFromPoints, detectShapeFromPoints } from "./utils";

export const detectShape = (points) => {
  return detectShapeFromPoints(points);
};

export const buildShape = (tool, points) => {
  return buildShapeFromPoints(tool, points);
};
