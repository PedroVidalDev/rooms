import { Room } from "@colyseus/sdk";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AvailableRooms } from "./components/AvailableRooms";
import { CreateRoomModal } from "./components/CreateRoomModal";
import { ErrorBanner } from "./components/ErrorBanner";
import { JoinByIdForm } from "./components/JoinByIdForm";
import { MenuHeader } from "./components/MenuHeader";
import { SectionDivider } from "./components/SectionDivider";
import { extractLocationError, removeAvailableRoom, upsertAvailableRoom } from "./helpers";
import type { LobbyRoomEntry } from "./types";
import { client } from "../../colyseus/client";
import { AUTH_TOKEN_STORAGE_KEY } from "../../storage/authToken";

export const RoomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [availableRooms, setAvailableRooms] = useState<LobbyRoomEntry[]>([]);
  const [error, setError] = useState<string | null>(() => extractLocationError(location.state));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${encodeURIComponent(roomId)}`);
  };

  const handleCreateRoom = (roomName: string, maxClients: number) => {
    setError(null);
    setIsCreateModalOpen(false);
    navigate("/room/new", {
      state: {
        roomName,
        maxClients,
      },
    });
  };

  useEffect(() => {
    let lobbyRoom: Room | null = null;
    let isCancelled = false;

    const connectLobby = async () => {
      try {
        client.auth.token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? "";
        const room = await client.joinOrCreate("lobby");
        if (isCancelled) {
          room.leave();
          return;
        }
        lobbyRoom = room;

        room.onMessage("rooms", (rooms: LobbyRoomEntry[]) => {
          setAvailableRooms(rooms);
        });

        room.onMessage("+", ([roomId, roomData]: [string, LobbyRoomEntry]) => {
          setAvailableRooms((prev) => upsertAvailableRoom(prev, roomId, roomData));
        });

        room.onMessage("-", (roomId: string) => {
          setAvailableRooms((prev) => removeAvailableRoom(prev, roomId));
        });
      } catch (err) {
        console.error("Failed to connect to lobby:", err);
      }
    };

    connectLobby();

    return () => {
      isCancelled = true;
      lobbyRoom?.leave();
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#101820",
        backgroundImage: [
          "radial-gradient(circle at 50% 22%, rgba(185, 243, 255, 0.12) 0%, rgba(93, 200, 176, 0.06) 28%, transparent 65%)",
          "linear-gradient(rgba(88, 112, 138, 0.12) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(88, 112, 138, 0.12) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "100% 100%, 44px 44px, 44px 44px",
        fontFamily: "system-ui, sans-serif",
        color: "#e7edf5",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          padding: "28px 26px 26px",
          borderRadius: 16,
          background: "rgba(10, 18, 28, 0.86)",
          border: "1px solid rgba(88, 112, 138, 0.36)",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.38)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 3,
            borderRadius: "0 0 6px 6px",
            background: "#8ed1c2",
            boxShadow: "0 0 14px #5dc8b0",
          }}
        />

        <MenuHeader />

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        <AvailableRooms rooms={availableRooms} onJoinRoom={handleJoinRoom} />

        <SectionDivider label="ou entrar por ID" />

        <JoinByIdForm onJoinById={handleJoinRoom} />

        <SectionDivider label="ou criar sala" />

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            cursor: "pointer",
            background: "#67d1bf",
            color: "#12202b",
            boxShadow: "0 6px 18px rgba(103, 209, 191, 0.22)",
          }}
        >
          + Create New Room
        </button>
      </div>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        availableRooms={availableRooms}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};
