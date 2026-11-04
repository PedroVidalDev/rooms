import type { LobbyRoomEntry } from "../../types";

export const isRoomFull = (room: LobbyRoomEntry): boolean => {
  return room.clients >= room.maxClients || Boolean(room.locked);
};

export const getRoomDisplayName = (room: LobbyRoomEntry): string => {
  return room.metadata?.roomName || room.roomId;
};
