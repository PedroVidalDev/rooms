import { HudMetric } from "./components/HudMetric";
import { formatHudPlayersCount, formatHudRoomId, formatHudRoomName } from "./helpers";
import type { RoomHudProps } from "./types";

export const RoomHud = (props: RoomHudProps) => {
  const { roomName, roomId, playersCount, maxClients, onLeaveRoom } = props;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 12,
        borderRadius: 12,
        background: "rgba(10, 18, 28, 0.82)",
        color: "#e7edf5",
        fontFamily: "system-ui, sans-serif",
        boxShadow: "0 10px 28px rgba(0, 0, 0, 0.22)",
      }}
    >
      <HudMetric
        label="Room"
        value={formatHudRoomName(roomName)}
        valueColor="#67d1bf"
        letterSpacing="0.02em"
      />

      <div style={{ width: 1, height: 28, background: "rgba(88, 112, 138, 0.35)" }} />

      <HudMetric
        label="Room ID"
        value={formatHudRoomId(roomId)}
        valueColor="#dfbe62"
        letterSpacing="0.04em"
      />

      <div style={{ width: 1, height: 28, background: "rgba(88, 112, 138, 0.35)" }} />

      <HudMetric
        label="Players"
        value={formatHudPlayersCount(playersCount, maxClients)}
        valueColor="#e7edf5"
      />

      <button
        type="button"
        onClick={onLeaveRoom}
        style={{
          border: "none",
          borderRadius: 10,
          padding: "10px 14px",
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          cursor: "pointer",
          background: "#d96b6b",
          color: "#12202b",
        }}
      >
        Leave Room
      </button>
    </div>
  );
};
