import type { Room } from "@colyseus/sdk";
import type { RoomState } from "../../../../colyseus/RoomState";

export type RoomChatMessage = {
  id: string;
  type: string;
  playerId?: number;
  sender: string;
  message: string;
  timestamp: number | string;
  isOwn?: boolean;
};

export type RoomChatProps = {
  roomInstance: Room<RoomState, RoomState> | null;
  onClose?: () => void;
};
