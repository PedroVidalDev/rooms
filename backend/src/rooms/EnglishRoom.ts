import { Room, type Client } from "@colyseus/core";
import { Player, RoomState } from "../entities/RoomState.js";

type MoveMessage = {
  x: number;
  z: number;
};

const floorHalfSize = 10;
const playerHalfSize = 0.5;
const movementSpeed = 0.2;

export class EnglishRoom extends Room<{ state: RoomState }> {
  onCreate(options: any) {
    this.setState(new RoomState());
    console.log(`Room criada: ${this.roomId}`);

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
  }

  onJoin(client: Client, options: any) {
    console.log(`Jogador ${client.sessionId} entrou na room ${this.roomId}!`);

    const player = new Player();
    const spawn = this.findSpawnPosition();

    player.x = spawn.x;
    player.z = spawn.z;

    player.color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, code: number) {
    console.log(`Jogador ${client.sessionId} saiu da room ${this.roomId}! Codigo: ${code}`);
    this.state.players.delete(client.sessionId);
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
