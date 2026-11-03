import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const RoomMenu = () => {
  const [roomIdInput, setRoomIdInput] = useState("");
  const navigate = useNavigate();

  const trimmedRoomId = roomIdInput.trim();

  const handleCreateRoom = () => {
    navigate("/room/new");
  };

  const handleJoinRoom = () => {
    if (!trimmedRoomId) {
      return;
    }
    navigate(`/room/${encodeURIComponent(trimmedRoomId)}`);
  };

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
          maxWidth: 420,
          padding: "28px 26px 26px",
          borderRadius: 16,
          background: "rgba(10, 18, 28, 0.86)",
          border: "1px solid rgba(88, 112, 138, 0.36)",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.38)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
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

        <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "center" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#dfbe62",
            }}
          >
            3D Voice Arena
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#e7edf5",
            }}
          >
            English Rooms
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: "#e7edf5",
              opacity: 0.78,
            }}
          >
            Crie uma nova sala de conversação ou entre em uma arena existente usando o ID.
          </p>
        </div>

        <button
          onClick={handleCreateRoom}
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

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(88, 112, 138, 0.35)" }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#e7edf5",
              opacity: 0.6,
            }}
          >
            ou entrar por ID
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(88, 112, 138, 0.35)" }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Paste Room ID..."
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJoinRoom();
              }
            }}
            style={{
              flex: 1,
              borderRadius: 10,
              border: "1px solid #44505c",
              background: "#1d232b",
              color: "#e7edf5",
              padding: "10px 12px",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
              outline: "none",
            }}
          />
          <button
            disabled={!trimmedRoomId}
            onClick={handleJoinRoom}
            style={{
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              cursor: trimmedRoomId ? "pointer" : "not-allowed",
              background: trimmedRoomId ? "#dfbe62" : "#2f3a45",
              color: trimmedRoomId ? "#12202b" : "rgba(231, 237, 245, 0.45)",
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};