import { LobbyRoom } from "@colyseus/core";
import { verifyRoomToken } from "../middlewares/authMiddleware.js";

export class AuthenticatedLobbyRoom extends LobbyRoom {
    static async onAuth(token: string) {
    return verifyRoomToken(token);
    }
}