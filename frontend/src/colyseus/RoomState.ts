import { Schema, MapSchema, defineTypes } from "@colyseus/schema";

export class Player extends Schema {
  x = 0;
  y = 0.5;
  z = 0;
  color = "#ffffff";
  name = "";
  skinUrl = "";
}

defineTypes(Player, {
  x: "number",
  y: "number",
  z: "number",
  color: "string",
  name: "string",
  skinUrl: "string",
});

export class RoomState extends Schema {
  players = new MapSchema<Player>();
  roomName = "";
  maxClients = 8;
}

defineTypes(RoomState, {
  players: { map: Player },
  roomName: "string",
  maxClients: "number",
});
