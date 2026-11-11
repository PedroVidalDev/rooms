import "reflect-metadata";
import "dotenv/config";
import "./container.js";

import http from "http";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { EnglishRoom } from "./colyseus/EnglishRoom.js";
import express from "express";
import userRoutes from "./user/routers/user.router.js";
import authRoutes from "./auth/routers/auth.router.js"; 
import bodyParser from "body-parser";
import { AuthenticatedLobbyRoom } from "./colyseus/AuthLobbyRoom.js";
import { seed } from "./database/seed.js";

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

const app = express();
app.use(bodyParser.json());
app.use("/auth", userRoutes);
app.use("/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const httpServer = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

gameServer.define("lobby", AuthenticatedLobbyRoom);
gameServer.define("english_room", EnglishRoom).enableRealtimeListing();

const startServer = async () => {
  if (process.env.NODE_ENV?.trim().toUpperCase() === "DEV") {
    await seed();
  }

  await gameServer.listen(port);
  console.log(`Colyseus server is listening on ws://localhost:${port}`);
};

startServer();