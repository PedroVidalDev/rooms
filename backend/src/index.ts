import http from "http";
import { LobbyRoom, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { EnglishRoom } from "./colyseus/EnglishRoom.js";
import { configDotenv } from "dotenv";

configDotenv();

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

const httpServer = http.createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

gameServer.define("lobby", LobbyRoom);
gameServer.define("english_room", EnglishRoom as any).enableRealtimeListing();

gameServer.listen(port).then(() => {
  console.log(`Colyseus server is listening on ws://localhost:${port}`);
});