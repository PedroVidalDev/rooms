export type LobbyRoomEntry = {
  roomId: string;
  clients: number;
  maxClients: number;
  locked?: boolean;
  metadata?: {
    roomName?: string;
  };
};

export type RoomMenuLocationState = {
  error?: string;
};
