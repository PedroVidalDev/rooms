import type { LobbyRoomEntry } from "../../types";

export type CreateRoomModalProps = {
  isOpen: boolean;
  availableRooms: LobbyRoomEntry[];
  onClose: () => void;
  onCreateRoom: (roomName: string, maxClients: number) => void;
};
