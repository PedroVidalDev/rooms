import { useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/Button";
import { TEXT_INPUT_BASE_STYLE } from "../../../../components/TextInput/consts";
import { type RoomChatMessage, type RoomChatProps } from "./types";
import { getStateCallbacks } from "@colyseus/sdk";
import type { ChatMessage } from "../../../../colyseus/RoomState";
import { getAuthenticatedUserId } from "../../../Account/helpers";
import { UserMessage } from "./components/UserMessage";
import { ServerLog } from "./components/ServerLog";

export const RoomChat = (props: RoomChatProps) => {
  const { onClose, roomInstance: room } = props;

  const [messages, setMessages] = useState<RoomChatMessage[]>([]);
  const [text, setText] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !room) {
      return;
    }

    room.send("chat", trimmed);
    setText("");
  };

  useEffect(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (!room) {
      return;
    }

    const loggedUserId = getAuthenticatedUserId();

    setMessages([]);
    const stateCallbacks = getStateCallbacks(room);

    const disposeOnAdd = stateCallbacks(room.state).chat.onAdd(
      (chatMessage: ChatMessage) => {
        setMessages((prev) => [
          ...prev,
          {
            id: chatMessage.id,
            type: chatMessage.type,
            playerId: chatMessage.playerId,
            sender: chatMessage.sender,
            message: chatMessage.message,
            timestamp: chatMessage.timestamp,
            isOwn: chatMessage.playerId === loggedUserId
          },
        ]);
      },
    );

    return () => {
      disposeOnAdd();
    };
  }, [room]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        zIndex: 10,
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        padding: 14,
        borderRadius: 16,
        background: "rgba(10, 18, 28, 0.88)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(88, 112, 138, 0.36)",
        boxShadow: "0 14px 34px rgba(0, 0, 0, 0.36)",
        color: "#e7edf5",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxSizing: "border-box",
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

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#dfbe62",
            }}
          >
            Comunicação
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong
              style={{
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                color: "#e7edf5",
              }}
            >
              Chat da Sala
            </strong>
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
              {messages.length}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 6px",
              borderRadius: 6,
              background: "#1d232b",
              border: "1px solid rgba(88, 112, 138, 0.36)",
              color: "rgba(231, 237, 245, 0.65)",
            }}
          >
            ESC
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar chat"
            style={{
              border: "1px solid rgba(88, 112, 138, 0.36)",
              borderRadius: 8,
              background: "#1d232b",
              color: "#e7edf5",
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(88, 112, 138, 0.28)" }} />

      <div
        ref={messagesContainerRef}
        className="room-chat-scroll"
        style={{
          display: "flex",
          flexDirection: "column",
          height: 220,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: "auto 0",
              background: "#1d232b",
              border: "1px solid #44505c",
              borderRadius: 10,
              padding: "16px 12px",
              textAlign: "center",
              fontSize: 13,
              color: "rgba(231, 237, 245, 0.58)",
            }}
          >
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        ) : (
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((item) => {
              if (item.type === "SERVER_LOG") {
                return (
                  <ServerLog key={item.id} item={item} />
                )
              }

              return (
                <UserMessage key={item.id} item={item} />
              )
            })}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          type="text"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{
            ...TEXT_INPUT_BASE_STYLE,
            flex: 1,
            width: "auto",
            padding: "10px 12px",
            fontSize: 13,
          }}
        />
        <Button
          type="submit"
          variant="primary"
          style={{
            padding: "10px 14px",
            fontSize: 13,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          Enviar
        </Button>
      </form>
    </div>
  );
};
