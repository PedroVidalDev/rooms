import type { LobbyRoomEntry, RoomMenuLocationState } from "./types";

export const extractLocationError = (state: unknown): string | null => {
  return (state as RoomMenuLocationState | null)?.error ?? null;
};

export const upsertAvailableRoom = (
  rooms: LobbyRoomEntry[],
  roomId: string,
  roomData: LobbyRoomEntry,
): LobbyRoomEntry[] => {
  const index = rooms.findIndex((r) => r.roomId === roomId);
  if (index !== -1) {
    const updated = [...rooms];
    updated[index] = roomData;
    return updated;
  }
  return [...rooms, roomData];
};

export const removeAvailableRoom = (
  rooms: LobbyRoomEntry[],
  roomId: string,
): LobbyRoomEntry[] => {
  return rooms.filter((r) => r.roomId !== roomId);
};
