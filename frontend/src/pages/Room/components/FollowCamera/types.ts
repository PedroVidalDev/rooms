import type { RefObject } from "react";
import type { Vector3 } from "three";

export type CameraMode = "first-person" | "third-person";

export type CameraRotation = {
  yaw: number;
  pitch: number;
};

export type FollowCameraProps = {
  cameraMode: CameraMode;
  cameraRotationRef: RefObject<CameraRotation>;
  target: RefObject<Vector3>;
};

