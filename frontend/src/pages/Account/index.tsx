import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { TextInput } from "../../components/TextInput";
import { useAuthContext } from "../../contexts/AuthContext";
import { removeAuthToken } from "../../storage/authToken";
import { getUserInitials } from "../RoomMenu/components/UserAccountBar/helpers";
import {
  formatAccountUpdateError,
  getAuthenticatedUserId,
  updateUserAccount,
  validateAccountForm,
} from "./helpers";
import type { AccountFieldErrors } from "./types";

export const Account = () => {
  const { authUser, logout } = useAuthContext();
  const navigate = useNavigate();

  const [name, setName] = useState(authUser?.name ?? "");
  const [email, setEmail] = useState(authUser?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [skinPreviewUrl, setSkinPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fieldErrors, setFieldErrors] = useState<AccountFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (skinPreviewUrl) {
        URL.revokeObjectURL(skinPreviewUrl);
      }
    };
  }, [skinPreviewUrl]);

  const handleSkinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "image/png" && !selectedFile.name.toLowerCase().endsWith(".png")) {
      setFieldErrors((prev) => ({
        ...prev,
        skinFile: "Selecione um arquivo no formato PNG (.png).",
      }));
      e.target.value = "";
      return;
    }

    if (skinPreviewUrl) {
      URL.revokeObjectURL(skinPreviewUrl);
    }

    setSkinFile(selectedFile);
    setSkinPreviewUrl(URL.createObjectURL(selectedFile));
    if (fieldErrors.skinFile) {
      setFieldErrors((prev) => ({ ...prev, skinFile: undefined }));
    }
  };

  const handleRemoveSkinFile = () => {
    if (skinPreviewUrl) {
      URL.revokeObjectURL(skinPreviewUrl);
    }
    setSkinFile(null);
    setSkinPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (fieldErrors.skinFile) {
      setFieldErrors((prev) => ({ ...prev, skinFile: undefined }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || isSubmitting) {
      return;
    }

    setError(null);

    const validation = validateAccountForm(
      authUser.name,
      authUser.email,
      name,
      email,
      currentPassword,
      newPassword,
    );

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});

    if (Object.keys(validation.payload).length === 0) {
      setError("Altere pelo menos um campo antes de salvar.");
      return;
    }

    const userId = getAuthenticatedUserId();
    if (!userId) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await updateUserAccount(userId, validation.payload);

      removeAuthToken();
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: updatedUser.email,
          requiresVerification: true,
          successMessage:
            "Dados atualizados! Enviamos um código de 6 dígitos para validar sua conta.",
        },
      });
    } catch (err) {
      setError(formatAccountUpdateError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#0e151d",
        fontFamily: "system-ui, sans-serif",
        color: "#e7edf5",
        boxSizing: "border-box",
        padding: "36px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            style={{
              padding: "9px 14px",
              fontSize: 13,
              color: "#e7edf5",
            }}
          >
            ← Voltar ao Lobby
          </Button>

          <Button
            variant="danger"
            onClick={handleLogout}
            style={{
              padding: "9px 14px",
              fontSize: 13,
            }}
          >
            Sair da Conta
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 22px",
            borderRadius: 14,
            background: "#151f2a",
            border: "1px solid rgba(88, 112, 138, 0.34)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(103, 209, 191, 0.16)",
              border: "1px solid rgba(103, 209, 191, 0.45)",
              color: "#67d1bf",
              fontSize: 18,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {getUserInitials(authUser?.name, authUser?.email)}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#dfbe62",
              }}
            >
              Detalhes da Conta
            </span>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: "#e7edf5",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {authUser?.name || "Minha Conta"}
            </h1>
            <span
              style={{
                fontSize: 13,
                color: "rgba(231, 237, 245, 0.65)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {authUser?.email}
            </span>
          </div>
        </div>

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        <form
          noValidate
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              padding: "22px",
              borderRadius: 14,
              background: "#151f2a",
              border: "1px solid rgba(88, 112, 138, 0.34)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
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
                Personalização
              </h2>
              <span style={{ fontSize: 12, color: "rgba(231, 237, 245, 0.6)" }}>
                Altere seu avatar enviando uma nova skin. A skin deve estar no formato PNG, com dimensões de 64x64 ou 64x32 pixels.
              </span>
            </div>

            <TextInput
              id="account-name"
              label="Nome"
              type="text"
              placeholder="Seu nome"
              value={name}
              disabled={isSubmitting}
              error={fieldErrors.name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
            />
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: 14,
              background: "#151f2a",
              border: "1px solid rgba(88, 112, 138, 0.34)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
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
                Dados Pessoais
              </h2>
              <span style={{ fontSize: 12, color: "rgba(231, 237, 245, 0.6)" }}>
                Altere seu nome ou e-mail. Ao confirmar a alteração, um novo código de verificação será enviado.
              </span>
            </div>

            <TextInput
              id="account-name"
              label="Nome"
              type="text"
              placeholder="Seu nome"
              value={name}
              disabled={isSubmitting}
              error={fieldErrors.name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
            />

            <TextInput
              id="account-email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              disabled={isSubmitting}
              error={fieldErrors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
            />
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: 14,
              background: "#151f2a",
              border: "1px solid rgba(88, 112, 138, 0.34)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
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
                disabled={isSubmitting}
                onChange={handleSkinFileChange}
                style={{ display: "none" }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "#1d232b",
                  border: fieldErrors.skinFile
                    ? "1px solid rgba(217, 107, 107, 0.75)"
                    : "1px solid #44505c",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
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
                      gap: 4,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
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
                        fontSize: 12,
                        color: "rgba(231, 237, 245, 0.48)",
                      }}
                    >
                      {skinFile
                        ? `${Math.max(1, Math.round(skinFile.size / 1024))} KB • PNG selecionado`
                        : "Formato aceito: .png (recomendado 64x64 pixels)"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Button
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "9px 14px",
                      fontSize: 13,
                    }}
                  >
                    {skinFile ? "Trocar PNG" : "Escolher PNG"}
                  </Button>

                  {skinFile && (
                    <Button
                      variant="danger"
                      disabled={isSubmitting}
                      onClick={handleRemoveSkinFile}
                      style={{
                        padding: "9px 12px",
                        fontSize: 13,
                      }}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>

              {fieldErrors.skinFile && (
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: 1.35,
                    color: "#f5b5b5",
                  }}
                >
                  {fieldErrors.skinFile}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: 14,
              background: "#151f2a",
              border: "1px solid rgba(88, 112, 138, 0.34)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
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
                Alterar Senha
              </h2>
              <span style={{ fontSize: 12, color: "rgba(231, 237, 245, 0.6)" }}>
                Preencha apenas se desejar alterar sua senha atual.
              </span>
            </div>

            <TextInput
              id="account-current-password"
              label="Senha Atual"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              disabled={isSubmitting}
              error={fieldErrors.currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (fieldErrors.currentPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    currentPassword: undefined,
                  }));
                }
              }}
            />

            <TextInput
              id="account-new-password"
              label="Nova Senha"
              type="password"
              autoComplete="new-password"
              placeholder="Nova senha (mín. 6 caracteres)"
              value={newPassword}
              disabled={isSubmitting}
              error={fieldErrors.password}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ minWidth: 180, fontSize: 14 }}
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
