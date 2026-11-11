import type { Player } from "../../../../colyseus/RoomState";

export type RoomHudProps = {
  roomName: string;
  roomId?: string;
  players: Record<string, Player>;
  maxClients: number;
  onLeaveRoom: () => void;
};
