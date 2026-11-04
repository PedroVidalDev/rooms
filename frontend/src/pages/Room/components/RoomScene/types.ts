import type { RefObject } from "react";
import type { Vector3 } from "three";
import type { Player } from "../../../../colyseus/RoomState";

export type RoomSceneProps = {
  players: Record<string, Player>;
  sessionId: string | null;
  localPlayerPositionRef: RefObject<Vector3>;
};
