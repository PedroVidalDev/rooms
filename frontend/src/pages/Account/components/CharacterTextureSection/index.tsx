import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Button } from "../../../../components/Button";
import { MinecraftCharacter } from "../../../Room/components/PlayerBody/components/MinecraftCharacter";
import type { CharacterMotionState } from "../../../Room/components/PlayerBody/components/MinecraftCharacter/types";
import type { CharacterTextureSectionProps } from "./types";

export const CharacterTextureSection = (props: CharacterTextureSectionProps) => {
  const {
    skinFile,
    skinPreviewUrl,
    activeSkinUrl,
    error,
    disabled = false,
    onFileSelect,
    onFileRemove,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewMotionRef = useRef<CharacterMotionState>({
    isGrounded: true,
    isMoving: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    onFileSelect(selectedFile);
    e.target.value = "";
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileRemove();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        gap: 16,
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 280,
          padding: "22px",
          borderRadius: 14,
          background: "#151f2a",
          border: "1px solid rgba(88, 112, 138, 0.34)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "#e7edf5",
            }}
          >
            Textura do Personagem
          </h2>
          <span style={{ fontSize: 12, color: "rgba(231, 237, 245, 0.6)" }}>
            Envie um arquivo PNG (64x64) com a skin do seu personagem Minecraft.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="account-skin-file"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#e7edf5",
              opacity: 0.75,
            }}
          >
            Arquivo de Textura (PNG)
          </label>

          <input
            ref={fileInputRef}
            id="account-skin-file"
            type="file"
            accept="image/png,.png"
            disabled={disabled}
            onChange={handleInputChange}
            style={{ display: "none" }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#1d232b",
              border: error
                ? "1px solid rgba(217, 107, 107, 0.75)"
                : "1px solid #44505c",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: "#101820",
                  border: "1px solid rgba(88, 112, 138, 0.36)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {skinPreviewUrl ? (
                  <img
                    src={skinPreviewUrl}
                    alt="Pré-visualização da skin"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      imageRendering: "pixelated",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgba(231, 237, 245, 0.45)",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    PNG
                    <br />
                    64x64
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: skinFile ? "#e7edf5" : "rgba(231, 237, 245, 0.6)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {skinFile ? skinFile.name : "Nenhum arquivo selecionado"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(231, 237, 245, 0.48)",
                  }}
                >
                  {skinFile
                    ? `${Math.max(1, Math.round(skinFile.size / 1024))} KB • PNG selecionado`
                    : "Formato: .png (64x64)"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Button
                variant="outline"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "9px 12px",
                  fontSize: 12,
                }}
              >
                {skinFile ? "Trocar PNG" : "Escolher PNG"}
              </Button>

              {skinFile && (
                <Button
                  variant="danger"
                  disabled={disabled}
                  onClick={handleRemove}
                  style={{
                    padding: "9px 12px",
                    fontSize: 12,
                  }}
                >
                  Remover
                </Button>
              )}
            </div>
          </div>

          {error && (
            <span
              style={{
                fontSize: 12,
                lineHeight: 1.35,
                color: "#f5b5b5",
              }}
            >
              {error}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          width: 190,
          flexShrink: 0,
          padding: "14px",
          borderRadius: 14,
          background: "#151f2a",
          border: "1px solid rgba(88, 112, 138, 0.34)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#dfbe62",
            textAlign: "center",
          }}
        >
          Preview 3D
        </span>

        <div
          style={{
            flex: 1,
            minHeight: 155,
            borderRadius: 10,
            background: "#101820",
            border: "1px solid rgba(88, 112, 138, 0.36)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Canvas camera={{ position: [0, 0.2, 2.1], fov: 38 }}>
            <ambientLight intensity={1.0} color="#dbe7f2" />
            <hemisphereLight
              intensity={0.65}
              color="#d7ecff"
              groundColor="#1d232b"
            />
            <directionalLight
              position={[4, 6, 5]}
              intensity={1.5}
              color="#fff6d6"
            />
            <MinecraftCharacter
              motionRef={previewMotionRef}
              sessionId="account-preview"
              skinUrl={activeSkinUrl}
            />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              target={[0, 0.1, 0]}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.85}
              autoRotate
              autoRotateSpeed={2.2}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
};
