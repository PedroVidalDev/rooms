import type { Player } from "../../../../colyseus/RoomState";
import { maxVoiceDistance } from "./consts";

export const computeProximityVolume = (localPlayer: Player, remotePlayer?: Player): number => {
  if (!remotePlayer) {
    return 0;
  }

  const dx = remotePlayer.x - localPlayer.x;
  const dz = remotePlayer.z - localPlayer.z;
  const distance = Math.hypot(dx, dz);
  const ratio = Math.max(0, 1 - distance / maxVoiceDistance);

  return ratio * ratio;
};

export const shouldInitiatePeerOffer = (localSessionId: string, peerSessionId: string): boolean => {
  return localSessionId.localeCompare(peerSessionId) < 0;
};
