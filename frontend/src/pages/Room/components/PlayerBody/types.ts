import type { Vector3 } from "three";
import type { Player } from "../../../../colyseus/RoomState";

export type PlayerBodyProps = {
  isLocal: boolean;
  onLocalPositionChange?: (position: Vector3) => void;
  player: Player;
  sessionId: string;
};