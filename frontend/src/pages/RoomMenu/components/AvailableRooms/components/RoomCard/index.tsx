import { Button } from "../../../../../../components/Button";
import { getRoomDisplayName, isRoomFull } from "../../helpers";
import type { RoomCardProps } from "./types";

export const RoomCard = (props: RoomCardProps) => {
  const { room, onJoin } = props;

  const isFull = isRoomFull(room);
  const displayName = getRoomDisplayName(room);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        background: "#1d232b",
        border: "1px solid #44505c",
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <strong
          style={{
            fontSize: 14,
            color: "#e7edf5",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </strong>
        <span style={{ fontSize: 11, color: "rgba(231, 237, 245, 0.55)" }}>
          ID: {room.roomId}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: 999,
            background: isFull
              ? "rgba(217, 107, 107, 0.18)"
              : "rgba(103, 209, 191, 0.16)",
            color: isFull ? "#d96b6b" : "#67d1bf",
          }}
        >
          {room.clients} / {room.maxClients}
        </span>

        <Button
          variant="primary"
          onClick={() => onJoin(room.roomId)}
          disabled={isFull}
          style={{
            borderRadius: 8,
            padding: "7px 14px",
            fontSize: 13,
          }}
        >
          {isFull ? "Cheia" : "Entrar"}
        </Button>
      </div>
    </div>
  );
};
