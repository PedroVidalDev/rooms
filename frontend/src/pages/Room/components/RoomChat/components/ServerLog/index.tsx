import type { ServerLogProps } from "./types"

export const ServerLog = (props: ServerLogProps) => {
    const { item } = props;

    return (
        <div
            key={item.id}
            style={{
                alignSelf: "center",
                maxWidth: "88%",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "6px 12px",
                borderRadius: 10,
                background: "rgba(10, 18, 28, 0.78)",
                border: "1px solid rgba(223, 190, 98, 0.24)",
            }}
        >
            <span
                style={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: "#dfbe62",
                    wordBreak: "break-word",
                    fontWeight: 600
                }}
            >
                {item.message}
            </span>
        </div>
    )
}