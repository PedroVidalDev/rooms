import { Room } from "@colyseus/sdk";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { client } from "../../colyseus/client";
import { AuthBanner } from "../../components/AuthBanner";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { PageHeader } from "../../components/PageHeader";
import { SectionDivider } from "../../components/SectionDivider";
import { useAuthContext } from "../../contexts/AuthContext";
import { AUTH_TOKEN_STORAGE_KEY } from "../../storage/authToken";
import { AvailableRooms } from "./components/AvailableRooms";
import { CreateRoomModal } from "./components/CreateRoomModal";
import { JoinByIdForm } from "./components/JoinByIdForm";
import { UserAccountBar } from "./components/UserAccountBar";
import {
  buildLobbyBannerHighlights,
  extractLocationError,
  removeAvailableRoom,
  upsertAvailableRoom,
} from "./helpers";
import type { LobbyRoomEntry } from "./types";

export const RoomMenu = () => {
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [availableRooms, setAvailableRooms] = useState<LobbyRoomEntry[]>([]);
  const [error, setError] = useState<string | null>(() =>
    extractLocationError(location.state),
  );
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

  const handleOpenAccountDetails = () => {
    navigate("/account");
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
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "90vw",
          height: "90vh",
          borderRadius: 20,
          background: "rgba(10, 18, 28, 0.88)",
          border: "1px solid rgba(88, 112, 138, 0.36)",
          boxShadow: "0 22px 54px rgba(0, 0, 0, 0.48)",
          display: "flex",
          flexDirection: "row",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "12%",
            right: "12%",
            height: 3,
            zIndex: 2,
            borderRadius: "0 0 6px 6px",
            background: "#8ed1c2",
            boxShadow: "0 0 14px #5dc8b0",
          }}
        />

        <AuthBanner
          badge="Arena de Voz 3D"
          statusTag="Lobby Online"
          title="Escolha sua arena e converse em tempo real."
          subtitle="Explore as salas ativas no lobby, entre diretamente pelo código da sala ou crie sua própria arena 3D para praticar."
          highlights={buildLobbyBannerHighlights(availableRooms)}
        />

        <div
          style={{
            flex: 1,
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              margin: "auto 0",
            }}
          >
            <UserAccountBar
              name={authUser?.name}
              email={authUser?.email}
              onOpenAccountDetails={handleOpenAccountDetails}
            />

            <PageHeader
              badge="Lobby de Salas"
              title="Salas de Conversação"
              subtitle="Escolha uma sala disponível, entre usando o ID ou crie uma nova arena de conversação."
            />

            <ErrorBanner message={error} onDismiss={() => setError(null)} />

            <AvailableRooms rooms={availableRooms} onJoinRoom={handleJoinRoom} />

            <SectionDivider label="ou entrar por ID" />

            <JoinByIdForm onJoinById={handleJoinRoom} />

            <SectionDivider label="ou criar sala" />

            <Button
              variant="primary"
              fullWidth
              onClick={() => setIsCreateModalOpen(true)}
              style={{ fontSize: 15 }}
            >
              + Criar Nova Sala
            </Button>
          </div>
        </div>
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
