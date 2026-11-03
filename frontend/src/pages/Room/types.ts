export type ThreeRoomProps = {
  mode?: 'create' | 'join';
  roomId?: string;
  onLeave?: () => void;
};
