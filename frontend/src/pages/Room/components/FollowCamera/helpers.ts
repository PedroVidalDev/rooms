import type { Vector3 } from "three";
import { cameraOffset, cameraTargetOffset } from "./consts";

export const computeCameraTargets = (baseTarget: Vector3) => {
  const desiredPosition = baseTarget.clone().add(cameraOffset);
  const desiredTarget = baseTarget.clone().add(cameraTargetOffset);
  return { desiredPosition, desiredTarget };
};
