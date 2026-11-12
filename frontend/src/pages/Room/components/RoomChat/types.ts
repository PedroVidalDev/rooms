import type { Room } from "@colyseus/sdk";
import type { ChatMessageType, RoomState } from "../../../../colyseus/RoomState";

export type RoomChatMessage = {
  id: string;
  type: ChatMessageType;
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
