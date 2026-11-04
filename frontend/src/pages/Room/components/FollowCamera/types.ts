import type { RefObject } from "react";
import type { Vector3 } from "three";

export type FollowCameraProps = {
  target: RefObject<Vector3>;
};
