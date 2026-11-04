import "reflect-metadata";
import "dotenv/config";
import "./container.js";

import http from "http";
import { LobbyRoom, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { EnglishRoom } from "./colyseus/EnglishRoom.js";
import express from "express";
import userRoutes from "./user/routers/user.router.js";
import bodyParser from "body-parser";

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

const app = express();
app.use(bodyParser.json());
app.use("/auth", userRoutes);

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