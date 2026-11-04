export const formatHudRoomName = (roomName: string): string => {
  return roomName || "Loading...";
};

export const formatHudRoomId = (roomId?: string): string => {
  return roomId ?? "Connecting...";
};

export const formatHudPlayersCount = (playersCount: number, maxClients: number): string => {
  return `${playersCount} / ${maxClients}`;
};
