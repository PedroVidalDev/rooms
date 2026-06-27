import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0.5;
  @type("number") z: number = 0;
  @type("string") color: string = "#ffffff";
}

export class RoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}