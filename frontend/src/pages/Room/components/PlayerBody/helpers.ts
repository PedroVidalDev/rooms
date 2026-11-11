import type { MovementState } from "../../hooks/useHotkeys";
import { playerMoveSpeed } from "./consts";

export const getPlayerSmoothing = (isLocal: boolean): number => {
  return isLocal ? 0.24 : 0.22;
};

export const computeHorizontalVelocity = (
  movement: MovementState | undefined,
  cameraYaw = 0,
): { vx: number; vz: number } => {
  if (!movement) {
    return { vx: 0, vz: 0 };
  }

  const dirX = Number(movement.right) - Number(movement.left);
  const dirZ = Number(movement.backward) - Number(movement.forward);
  const length = Math.hypot(dirX, dirZ);

  if (length === 0) {
    return { vx: 0, vz: 0 };
  }

  const normX = dirX / length;
  const normZ = dirZ / length;

  const cosYaw = Math.cos(cameraYaw);
  const sinYaw = Math.sin(cameraYaw);

  const worldDirX = normX * cosYaw + normZ * sinYaw;
  const worldDirZ = -normX * sinYaw + normZ * cosYaw;

  return {
    vx: worldDirX * playerMoveSpeed,
    vz: worldDirZ * playerMoveSpeed,
  };
};


