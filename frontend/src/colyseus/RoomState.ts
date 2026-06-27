import { Schema, MapSchema, defineTypes } from "@colyseus/schema";

export class Player extends Schema {
  x = 0;
  y = 0.5;
  z = 0;
  color = "#ffffff";
}

defineTypes(Player, {
  x: "number",
  y: "number",
  z: "number",
  color: "string",
});

export class RoomState extends Schema {
  players = new MapSchema<Player>();
}

defineTypes(RoomState, {
  players: { map: Player },
});
