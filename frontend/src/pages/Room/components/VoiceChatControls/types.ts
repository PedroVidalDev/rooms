import type { Room } from "@colyseus/sdk";
import type { Player, RoomState } from "../../../../colyseus/RoomState";

export type VoiceSignalPayload =
  | {
      type: 'offer' | 'answer';
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: 'ice-candidate';
      candidate: RTCIceCandidateInit;
    };

export type VoiceChatControlsProps = {
  room: Room<RoomState> | null;
  players: Record<string, Player>;
  sessionId: string | null;
};