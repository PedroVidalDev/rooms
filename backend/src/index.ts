import "reflect-metadata"

import http from "http";
import { LobbyRoom, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { EnglishRoom } from "./colyseus/EnglishRoom.js";
import { configDotenv } from "dotenv";
import express from "express";
import userRoutes from "./user/routers/user.router.js";

configDotenv();

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

const app = express();
app.use(express.json());
app.use(userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const httpServer = http.createServer(app);

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