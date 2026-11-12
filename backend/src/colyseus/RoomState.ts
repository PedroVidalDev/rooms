import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export type ChatMessageType = "USER_MESSAGE" | "SERVER_LOG";

export class Player extends Schema {
  @type("number") id: number = 0;
  @type("number") x: number = 0;
  @type("number") y: number = 0.5;
  @type("number") z: number = 0;
  @type("string") color: string = "#ffffff";
  @type("string") name: string = "";
  @type("string") skinUrl: string = "";
}

export class ChatMessage extends Schema {
  @type("string") id: string = "";
  @type("string") type: ChatMessageType = "USER_MESSAGE";
  @type("number") playerId: number = 0;
  @type("string") sender: string = "";
  @type("string") message: string = "";
  @type("number") timestamp: number = Date.now();
}

export class RoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") roomName: string = "";
  @type({ array: ChatMessage }) chat = new ArraySchema<ChatMessage>();
  @type("number") maxClients: number = 8;
}