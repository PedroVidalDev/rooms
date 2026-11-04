import type { LobbyRoomEntry } from "../../types";

export type AvailableRoomsProps = {
  rooms: LobbyRoomEntry[];
  onJoinRoom: (roomId: string) => void;
};
