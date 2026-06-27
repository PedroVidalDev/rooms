import http from "http";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { EnglishRoom } from "./colyseus/EnglishRoom.js";

const port = 8080;

const httpServer = http.createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

gameServer.define("english_room", EnglishRoom as any);
gameServer.listen(port);
