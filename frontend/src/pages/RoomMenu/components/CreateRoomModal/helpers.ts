import type { LobbyRoomEntry } from "../../types";

export const clampMaxClients = (value: number): number => {
  return Math.min(Math.max(Number(value) || 8, 2), 8);
};

export const validateRoomCreation = (
  rawRoomName: string,
  availableRooms: LobbyRoomEntry[],
): { valid: true; trimmedName: string } | { valid: false; error: string } => {
  const trimmedName = rawRoomName.trim();

  if (!trimmedName) {
    return { valid: false, error: "Please enter a room name." };
  }

  const nameExists = availableRooms.some(
    (r) => (r.metadata?.roomName ?? "").toLowerCase() === trimmedName.toLowerCase(),
  );

  if (nameExists) {
    return {
      valid: false,
      error: `Room name "${trimmedName}" is already taken.`,
    };
  }

  return { valid: true, trimmedName };
};
