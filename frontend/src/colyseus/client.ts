import { Client } from "@colyseus/sdk";

export const client = new Client(
    import.meta.env.VITE_WEBSOCKET_SERVER ?? "ws://localhost:8080"
);