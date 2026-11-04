import { Room, Client, ServerError } from "@colyseus/core";
import { Player, RoomState } from "./RoomState.js";

type CreateRoomOptions = {
  roomName?: string;
  maxClients?: number;
}

type MoveMessage = {
  x: number;
  y?: number;
  z: number;
};

type VoiceSignalMessage = {
  targetSessionId: string;
  payload: unknown;
};

const spawnHalfRange = 8;
const playerHalfSize = 0.5;
const groundedY = 0.5;

export class EnglishRoom extends Room<{ state: RoomState }> {
  private static activeRoomNames = new Set<string>();
  private normalizedRoomName: string = "";

  private voiceReadyClients = new Set<string>();

  onCreate(options: CreateRoomOptions = {}) {
    const rawName = options.roomName?.trim() ?? "";
    if (!rawName) {
      throw new ServerError(400, "Room name is required.");
    }

    const normalizedName = rawName.toLowerCase();
    if (EnglishRoom.activeRoomNames.has(normalizedName)) {
      throw new ServerError(400, "Room name is already in use.");
    }

    const maxClients = options.maxClients ?? 8;
    if (maxClients < 1 || maxClients > 8) {
      throw new ServerError(400, "Max clients must be between 1 and 8.");
    }

    this.normalizedRoomName = normalizedName;
    this.maxClients = maxClients;
    EnglishRoom.activeRoomNames.add(normalizedName);

    this.state = new RoomState();
    this.state.roomName = rawName;
    this.state.maxClients = maxClients;

    this.setMetadata({ roomName: rawName });

    this.onMessage("move", (client, message: MoveMessage) => {
      const player = this.state.players.get(client.sessionId);

      if (!player) {
        return;
      }

      if (Number.isFinite(message.x)) {
        player.x = message.x;
      }

      if (Number.isFinite(message.y)) {
        player.y = Math.max(groundedY, message.y as number);
      }

      if (Number.isFinite(message.z)) {
        player.z = message.z;
      }
    });

    this.onMessage("voice_ready", (client) => {
      if (this.voiceReadyClients.has(client.sessionId)) {
        return;
      }

      this.voiceReadyClients.add(client.sessionId);

      client.send("voice-ready-peers", {
        peers: [...this.voiceReadyClients].filter((sessionId) => sessionId !== client.sessionId),
      });

      this.broadcast("voice-peer-ready", { sessionId: client.sessionId }, { except: client });
    });

    this.onMessage("voice_disabled", (client) => {
      if (!this.voiceReadyClients.delete(client.sessionId)) {
        return;
      }

      this.broadcast("voice-peer-disabled", { sessionId: client.sessionId }, { except: client });
    });

    this.onMessage("voice_signal", (client, message: VoiceSignalMessage) => {
      const targetClient = this.clients.find(
        (connectedClient) => connectedClient.sessionId === message.targetSessionId,
      );

      if (!targetClient) {
        return;
      }

      targetClient.send("voice-signal", {
        fromSessionId: client.sessionId,
        payload: message.payload,
      });
    });
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    const spawn = this.findSpawnPosition();

    player.x = spawn.x;
    player.y = groundedY;
    player.z = spawn.z;
    player.color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, code: number) {
    this.voiceReadyClients.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
    this.broadcast("voice-peer-left", { sessionId: client.sessionId }, { except: client });
  }

  onDispose() {
    if (this.normalizedRoomName) {
      EnglishRoom.activeRoomNames.delete(this.normalizedRoomName);
    }
    console.log("room", this.roomId, "disposing...");
  }

  private canSpawnAt(x: number, z: number) {
    for (const otherPlayer of this.state.players.values()) {
      const overlapX = Math.abs(otherPlayer.x - x) < playerHalfSize * 2;
      const overlapZ = Math.abs(otherPlayer.z - z) < playerHalfSize * 2;

      if (overlapX && overlapZ) {
        return false;
      }
    }

    return true;
  }

  private findSpawnPosition() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const x = (Math.random() - 0.5) * spawnHalfRange * 2;
      const z = (Math.random() - 0.5) * spawnHalfRange * 2;

      if (this.canSpawnAt(x, z)) {
        return { x, z };
      }
    }

    return { x: 0, z: 0 };
  }
}
