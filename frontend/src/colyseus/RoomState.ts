import { Schema, MapSchema, defineTypes, ArraySchema } from "@colyseus/schema";

export class Player extends Schema {
  x = 0;
  y = 0.5;
  z = 0;
  color = "#ffffff";
  name = "";
  skinUrl = "";
}

defineTypes(Player, {
  id: "number",
  x: "number",
  y: "number",
  z: "number",
  color: "string",
  name: "string",
  skinUrl: "string",
});

export class ChatMessage extends Schema {
  id = "";
  playerId = 0;
  sender = "";
  message = "";
  timestamp = Date.now();
}

defineTypes(ChatMessage, {
  id: "string",
  playerId: "number",
  sender: "string",
  message: "string",
  timestamp: "number",
});

export class RoomState extends Schema {
  players = new MapSchema<Player>();
  roomName = "";
  chat = new ArraySchema<ChatMessage>();
  maxClients = 8;
}

defineTypes(RoomState, {
  players: { map: Player },
  roomName: "string",
  chat: { array: ChatMessage },
  maxClients: "number",
});
