import { Vector3 } from "three";
import {
  cameraTargetOffset,
  firstPersonEyeOffset,
  initialCameraPitch,
  thirdPersonDistance,
  thirdPersonMinY,
} from "./consts";
import type { CameraMode, CameraRotation } from "./types";

export const computeCameraLookDirection = (rotation: CameraRotation): Vector3 => {
  const cosPitch = Math.cos(rotation.pitch);
  return new Vector3(
    -Math.sin(rotation.yaw) * cosPitch,
    Math.sin(rotation.pitch),
    -Math.cos(rotation.yaw) * cosPitch,
  );
};

export const computeCameraTargets = (
  baseTarget: Vector3,
  rotation: CameraRotation = { yaw: 0, pitch: initialCameraPitch },
  mode: CameraMode = "third-person",
) => {
  const lookDirection = computeCameraLookDirection(rotation);

  if (mode === "first-person") {
    const desiredPosition = baseTarget.clone().add(firstPersonEyeOffset);
    const desiredTarget = desiredPosition.clone().add(lookDirection);
    return { desiredPosition, desiredTarget };
  }

  const desiredTarget = baseTarget.clone().add(cameraTargetOffset);
  const desiredPosition = desiredTarget
    .clone()
    .addScaledVector(lookDirection, -thirdPersonDistance);
  desiredPosition.y = Math.max(thirdPersonMinY, desiredPosition.y);

  return { desiredPosition, desiredTarget };
};

