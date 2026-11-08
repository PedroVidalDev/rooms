import { useEffect, useState } from "react";
import { Button } from "../../../../components/Button";
import { ErrorBanner } from "../../../../components/ErrorBanner";
import { TextInput } from "../../../../components/TextInput";
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
          maxWidth: 420,
          padding: "28px 26px 26px",
          borderRadius: 20,
          background: "rgba(10, 18, 28, 0.96)",
          border: "1px solid rgba(88, 112, 138, 0.42)",
          boxShadow: "0 22px 54px rgba(0, 0, 0, 0.55)",
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
              Criar Nova Sala
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar modal"
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
          <TextInput
            id="create-room-name"
            label="Nome da Sala (único)"
            type="text"
            autoFocus
            placeholder="Ex: Daily Conversation"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <TextInput
            id="create-room-max-clients"
            label="Máximo de Jogadores (2 - 8)"
            type="number"
            min={2}
            max={8}
            value={maxClients}
            onChange={(e) => setMaxClients(Number(e.target.value))}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              style={{ flex: 1, color: "#e7edf5" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ flex: 1 }}
            >
              Criar Sala
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
