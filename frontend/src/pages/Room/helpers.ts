import type { Vector3 } from "three";
import type { Player, RoomState } from "../../colyseus/RoomState";

export const extractPlayersSnapshot = (state: RoomState): Record<string, Player> => {
  return Object.fromEntries(state.players.entries()) as Record<string, Player>;
};

export const formatRoomConnectionError = (err: unknown): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Failed to join or create room.";
};

export const hasPositionChanged = (current: Vector3, lastSent: Vector3): boolean => {
  return (
    Math.abs(current.x - lastSent.x) > 0.001 ||
    Math.abs(current.y - lastSent.y) > 0.001 ||
    Math.abs(current.z - lastSent.z) > 0.001
  );
};

