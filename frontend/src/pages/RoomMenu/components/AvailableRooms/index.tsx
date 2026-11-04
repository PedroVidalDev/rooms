import { RoomCard } from "./components/RoomCard";
import type { AvailableRoomsProps } from "./types";

export const AvailableRooms = (props: AvailableRoomsProps) => {
  const { rooms, onJoinRoom } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#e7edf5",
            opacity: 0.75,
          }}
        >
          Salas Disponíveis
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 999,
            background: "rgba(103, 209, 191, 0.14)",
            color: "#67d1bf",
          }}
        >
          {rooms.length}
        </span>
      </div>

      {rooms.length === 0 ? (
        <div
          style={{
            background: "#1d232b",
            border: "1px solid #44505c",
            borderRadius: 10,
            padding: "16px 12px",
            textAlign: "center",
            fontSize: 13,
            color: "rgba(231, 237, 245, 0.58)",
          }}
        >
          Nenhuma sala ativa no momento. Crie uma nova sala abaixo!
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: 210,
            overflowY: "auto",
            paddingRight: 2,
          }}
        >
          {rooms.map((room) => (
            <RoomCard key={room.roomId} room={room} onJoin={onJoinRoom} />
          ))}
        </div>
      )}
    </div>
  );
};
