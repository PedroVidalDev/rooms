export type RoomHudProps = {
  roomName: string;
  roomId?: string;
  playersCount: number;
  maxClients: number;
  onLeaveRoom: () => void;
};
