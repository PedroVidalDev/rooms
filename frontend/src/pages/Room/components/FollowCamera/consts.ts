import { Vector3 } from "three";

export const cameraOffset = new Vector3(0, 2.35, 3.35);
export const cameraTargetOffset = new Vector3(0, 0.85, 0);
export const firstPersonEyeOffset = new Vector3(0, 0.55, 0);

export const thirdPersonDistance = 4;
export const thirdPersonMinY = 0.25;

export const mouseSensitivity = 0.0022;
export const minCameraPitch = -Math.PI / 2 + 0.15;
export const maxCameraPitch = Math.PI / 2 - 0.15;
export const initialCameraPitch = -0.35;
