import type { MovementState } from "../../hooks/useHotkeys";
import { playerMoveSpeed } from "./consts";

export const getPlayerSmoothing = (isLocal: boolean): number => {
  return isLocal ? 0.24 : 0.22;
};

export const computeHorizontalVelocity = (
  movement: MovementState | undefined,
): { vx: number; vz: number } => {
  if (!movement) {
    return { vx: 0, vz: 0 };
  }

  const dirX = Number(movement.right) - Number(movement.left);
  const dirZ = Number(movement.backward) - Number(movement.forward);

  return {
    vx: dirX * playerMoveSpeed,
    vz: dirZ * playerMoveSpeed,
  };
};

