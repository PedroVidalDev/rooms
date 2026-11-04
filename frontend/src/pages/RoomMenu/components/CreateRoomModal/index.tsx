import { useEffect, useState } from "react";
import { ErrorBanner } from "../ErrorBanner";
import { clampMaxClients, validateRoomCreation } from "./helpers";
import type { CreateRoomModalProps } from "./types";

export const CreateRoomModal = (props: CreateRoomModalProps) => {
  const { isOpen, availableRooms, onClose, onCreateRoom } = props;

  const [roomName, setRoomName] = useState("");
  const [maxClients, setMaxClients] = useState<number>(8);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setModalError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRoomCreation(roomName, availableRooms);

    if (!validation.valid) {
      setModalError(validation.error);
      return;
    }

    setModalError(null);
    onCreateRoom(validation.trimmedName, clampMaxClients(maxClients));
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(6, 11, 17, 0.76)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "26px 24px 24px",
          borderRadius: 16,
          background: "rgba(10, 18, 28, 0.96)",
          border: "1px solid rgba(88, 112, 138, 0.42)",
          boxShadow: "0 22px 48px rgba(0, 0, 0, 0.55)",
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

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#dfbe62",
              }}
            >
              Nova Arena
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#e7edf5",
              }}
            >
              Create New Room
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={{
              border: "1px solid rgba(88, 112, 138, 0.36)",
              borderRadius: 8,
              background: "#1d232b",
              color: "#e7edf5",
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <ErrorBanner message={modalError} onDismiss={() => setModalError(null)} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#e7edf5",
                opacity: 0.75,
              }}
            >
              Room Name (unique)
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Daily Conversation"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid #44505c",
                background: "#1d232b",
                color: "#e7edf5",
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#e7edf5",
                opacity: 0.75,
              }}
            >
              Max Users (2 - 8)
            </label>
            <input
              type="number"
              min={2}
              max={8}
              value={maxClients}
              onChange={(e) => setMaxClients(Number(e.target.value))}
              style={{
                width: "100%",
                borderRadius: 10,
                border: "1px solid #44505c",
                background: "#1d232b",
                color: "#e7edf5",
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "system-ui, sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                border: "1px solid #44505c",
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                cursor: "pointer",
                background: "#1d232b",
                color: "#e7edf5",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                border: "none",
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                cursor: "pointer",
                background: "#67d1bf",
                color: "#12202b",
                boxShadow: "0 6px 18px rgba(103, 209, 191, 0.22)",
              }}
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
