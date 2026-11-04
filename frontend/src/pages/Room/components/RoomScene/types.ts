import type { RefObject } from "react";
import type { Vector3 } from "three";
import type { Player } from "../../../../colyseus/RoomState";
import type { MovementState } from "../../hooks/useHotkeys";

export type RoomSceneProps = {
  jumpRequestedRef: RefObject<boolean>;
  localPlayerPositionRef: RefObject<Vector3>;
  movementRef: RefObject<MovementState>;
  players: Record<string, Player>;
  sessionId: string | null;
};

