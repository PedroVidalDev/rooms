import { useState } from "react";
import { HudMetric } from "./components/HudMetric";
import { formatHudPlayersCount, formatHudRoomId, formatHudRoomName } from "./helpers";
import type { RoomHudProps } from "./types";

export const RoomHud = (props: RoomHudProps) => {
  const { roomName, roomId, players, maxClients, onLeaveRoom } = props;

  const [expand, setExpand] = useState(false);
  
  const playersCount = Object.keys(players).length;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
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
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
          Sair da sala
        </button>
      </div>
      {
        !expand && (
          <button
            type="button"
            onClick={() => setExpand(true)}
            style={{
              border: "none",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              cursor: "pointer",
              background: "#67d1bf",
              color: "#12202b",
            }}
          >
            Mostrar jogadores
          </button>
        )
      }
      {expand && (
        <div style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
          <span 
            style={{
              fontSize: 12, 
              textTransform: 
              "uppercase", 
              letterSpacing: "0.08em", 
              fontWeight: 700
            }}
          >
            Lista de jogadores:
          </span>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {Object.values(players).map((player, index) => (
              <li 
                key={index} 
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  opacity: 0.72,
                }}
              >
                {player.name}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setExpand(false)}
            style={{
              border: "none",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              cursor: "pointer",
              background: "#67d1bf",
              color: "#12202b",
              margin: "0 auto",
            }}
          >
            Fechar lista
          </button>
       </div>
      )}
    </div>
  );
};
