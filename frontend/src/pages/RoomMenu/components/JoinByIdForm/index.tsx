import { useState } from "react";
import { Button } from "../../../../components/Button";
import { TEXT_INPUT_BASE_STYLE } from "../../../../components/TextInput/consts";
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
        placeholder="Cole o ID da sala..."
        value={roomIdInput}
        onChange={(e) => setRoomIdInput(e.target.value)}
        style={{
          ...TEXT_INPUT_BASE_STYLE,
          flex: 1,
          width: "auto",
        }}
      />
      <Button
        type="submit"
        variant="secondary"
        disabled={!trimmedRoomId}
        style={{
          padding: "11px 16px",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        Entrar na Sala
      </Button>
    </form>
  );
};
