import type { UserMessageProps } from "./types"

export const UserMessage = (props: UserMessageProps) => {
    const { item } = props;

    return (
        <div
            key={item.id}
            style={{
                alignSelf: item.isOwn ? "flex-end" : "flex-start",
                maxWidth: "88%",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "8px 10px",
                borderRadius: 10,
                background: item.isOwn
                ? "rgba(103, 209, 191, 0.12)"
                : "#1d232b",
                border: item.isOwn
                ? "1px solid rgba(103, 209, 191, 0.38)"
                : "1px solid #44505c",
            }}
        >
            <div
                style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                }}
            >
                <strong
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: item.isOwn ? "#67d1bf" : "#dfbe62",
                }}
                >
                {item.sender}
                </strong>
                <span
                style={{
                    fontSize: 10,
                    color: "rgba(231, 237, 245, 0.48)",
                }}
                >
                {new Date().setTime(item.timestamp as number).toString()}
                </span>
            </div>

            <span
                style={{
                fontSize: 13,
                lineHeight: 1.4,
                color: "#e7edf5",
                wordBreak: "break-word",
                }}
            >
                {item.message}
            </span>
            </div>
    )
}