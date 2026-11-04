export type CreateRoomLocationState = {
  roomName?: string;
  maxClients?: number;
};

export type ThreeRoomProps = {
  mode?: 'create' | 'join';
  roomId?: string;
  onLeave?: () => void;
};

