import type { Player, RoomState } from "../../colyseus/RoomState";
import type { MovementState } from "./hooks/useHotkeys";

export const extractPlayersSnapshot = (state: RoomState): Record<string, Player> => {
  return Object.fromEntries(state.players.entries()) as Record<string, Player>;
};

export const formatRoomConnectionError = (err: unknown): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Failed to join or create room.";
};

export const computeMovementVector = (movement: MovementState): { x: number; z: number } => {
  const x = Number(movement.right) - Number(movement.left);
  const z = Number(movement.backward) - Number(movement.forward);
  return { x, z };
};
