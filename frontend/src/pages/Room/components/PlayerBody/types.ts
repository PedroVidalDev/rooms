import type { RefObject } from "react";
import type { Vector3 } from "three";
import type { Player } from "../../../../colyseus/RoomState";
import type { MovementState } from "../../hooks/useHotkeys";

export type PlayerBodyProps = {
  isLocal: boolean;
  jumpRequestedRef?: RefObject<boolean>;
  movementRef?: RefObject<MovementState>;
  onLocalPositionChange?: (position: Vector3) => void;
  player: Player;
  sessionId: string;
};
