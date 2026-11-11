import type { RefObject } from "react";
import type { Vector3 } from "three";
import type { Player } from "../../../../colyseus/RoomState";
import type { MovementState } from "../../hooks/useHotkeys";
import type { CameraMode, CameraRotation } from "../FollowCamera/types";

export type PlayerBodyProps = {
  cameraMode?: CameraMode;
  cameraRotationRef?: RefObject<CameraRotation>;
  isLocal: boolean;
  jumpRequestedRef?: RefObject<boolean>;
  movementRef?: RefObject<MovementState>;
  onLocalPositionChange?: (position: Vector3) => void;
  player: Player;
  sessionId: string;
};

