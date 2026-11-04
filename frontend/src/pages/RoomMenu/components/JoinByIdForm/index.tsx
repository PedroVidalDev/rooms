import { useState } from "react";
import { normalizeRoomId } from "./helpers";
import type { JoinByIdFormProps } from "./types";

export const JoinByIdForm = (props: JoinByIdFormProps) => {
  const { onJoinById } = props;
  const [roomIdInput, setRoomIdInput] = useState("");

  const trimmedRoomId = normalizeRoomId(roomIdInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedRoomId) {
      return;
    }
    onJoinById(trimmedRoomId);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10 }}>
      <input
        placeholder="Paste Room ID..."
        value={roomIdInput}
        onChange={(e) => setRoomIdInput(e.target.value)}
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
        type="submit"
        disabled={!trimmedRoomId}
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
    </form>
  );
};
