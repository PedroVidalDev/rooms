import { Room, Client, ServerError } from "@colyseus/core";
import { Player, RoomState } from "../entities/RoomState.js";

type CreateRoomOptions = {
  roomName?: string;
  maxClients?: number;
}

type MoveMessage = {
  x: number;
  z: number;
};

type VoiceSignalMessage = {
  targetSessionId: string;
  payload: unknown;
};

const floorHalfSize = 10;
const playerHalfSize = 0.5;
const movementSpeed = 0.2;
const groundedY = 0.5;
const jumpVelocity = 0.34;
const gravity = 0.02;

export class EnglishRoom extends Room<{ state: RoomState }> {
  private static activeRoomNames = new Set<string>();
  private normalizedRoomName: string = "";

  private voiceReadyClients = new Set<string>();
  private verticalVelocities = new Map<string, number>();

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

      const nextX = Number.isFinite(message.x) ? message.x : 0;
      const nextZ = Number.isFinite(message.z) ? message.z : 0;

      const desiredX = this.clampToFloor(player.x + Math.max(-1, Math.min(1, nextX)) * movementSpeed);
      const desiredZ = this.clampToFloor(player.z + Math.max(-1, Math.min(1, nextZ)) * movementSpeed);

      if (this.canOccupy(client.sessionId, desiredX, player.z)) {
        player.x = desiredX;
      }

      if (this.canOccupy(client.sessionId, player.x, desiredZ)) {
        player.z = desiredZ;
      }
    });

    this.onMessage("jump", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) {
        return;
      }

      const verticalVelocity = this.verticalVelocities.get(client.sessionId) ?? 0;
      const isGrounded = player.y <= groundedY + 0.001 && verticalVelocity === 0;

      if (isGrounded) {
        this.verticalVelocities.set(client.sessionId, jumpVelocity);
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

    this.setSimulationInterval(() => {
      for (const [sessionId, player] of this.state.players.entries()) {
        const verticalVelocity = this.verticalVelocities.get(sessionId) ?? 0;

        if (verticalVelocity === 0 && player.y <= groundedY) {
          continue;
        }

        const nextVelocity = verticalVelocity - gravity;
        const nextY = player.y + nextVelocity;

        if (nextY <= groundedY) {
          player.y = groundedY;
          this.verticalVelocities.set(sessionId, 0);
        } else {
          player.y = nextY;
          this.verticalVelocities.set(sessionId, nextVelocity);
        }
      }
    }, 1000 / 60);
  }

  onJoin(client: Client, options: any) {
    const player = new Player();
    const spawn = this.findSpawnPosition();

    player.x = spawn.x;
    player.y = groundedY;
    player.z = spawn.z;
    player.color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

    this.state.players.set(client.sessionId, player);
    this.verticalVelocities.set(client.sessionId, 0);
  }

  onLeave(client: Client, code: number) {
    this.voiceReadyClients.delete(client.sessionId);
    this.verticalVelocities.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
    this.broadcast("voice-peer-left", { sessionId: client.sessionId }, { except: client });
  }

  onDispose() {
    if (this.normalizedRoomName) {
      EnglishRoom.activeRoomNames.delete(this.normalizedRoomName);
    }
    console.log("room", this.roomId, "disposing...");
  }

  private clampToFloor(value: number) {
    const limit = floorHalfSize - playerHalfSize;
    return Math.max(-limit, Math.min(limit, value));
  }

  private canOccupy(sessionId: string, x: number, z: number) {
    for (const [otherSessionId, otherPlayer] of this.state.players.entries()) {
      if (otherSessionId === sessionId) {
        continue;
      }

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
      const x = this.clampToFloor((Math.random() - 0.5) * floorHalfSize * 2);
      const z = this.clampToFloor((Math.random() - 0.5) * floorHalfSize * 2);

      if (this.canOccupy("", x, z)) {
        return { x, z };
      }
    }

    return { x: 0, z: 0 };
  }
}
