import type { LobbyRoomEntry } from "../../../../types";

export type RoomCardProps = {
  room: LobbyRoomEntry;
  onJoin: (roomId: string) => void;
};
