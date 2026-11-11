import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { useAuthContext } from "../../contexts/AuthContext";
import { removeAuthToken, saveAuthToken } from "../../storage/authToken";
import { getUserInitials } from "../RoomMenu/components/UserAccountBar/helpers";
import { CharacterTextureSection } from "./components/CharacterTextureSection";
import { PasswordChangeSection } from "./components/PasswordChangeSection";
import { PersonalDataSection } from "./components/PersonalDataSection";
import {
  formatAccountUpdateError,
  getAuthenticatedUserId,
  getAuthenticatedUserSkinUrl,
  resolveSkinUrl,
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
  const [currentSkinUrl, setCurrentSkinUrl] = useState<string | null>(() =>
    getAuthenticatedUserSkinUrl(),
  );

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

  const handleSkinFileSelect = (selectedFile: File) => {
    if (
      selectedFile.type !== "image/png" &&
      !selectedFile.name.toLowerCase().endsWith(".png")
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        skinFile: "Selecione um arquivo no formato PNG (.png).",
      }));
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

    const payload = {
      skinFile,
      ...validation.payload,
    }

    setFieldErrors({});

    if (Object.keys(validation.payload).length === 0 && !skinFile) {
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
      const updatedUser = await updateUserAccount(userId, payload);

      if (validation.payload.email || validation.payload.password) {
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
      } else if (updatedUser.token) {
        saveAuthToken(updatedUser.token);
        if (updatedUser.skinUrl !== undefined) {
          setCurrentSkinUrl(updatedUser.skinUrl);
        }
      }
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
          <PersonalDataSection
            name={name}
            email={email}
            nameError={fieldErrors.name}
            emailError={fieldErrors.email}
            disabled={isSubmitting}
            onNameChange={(value) => {
              setName(value);
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            onEmailChange={(value) => {
              setEmail(value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
          />

          <CharacterTextureSection
            skinFile={skinFile}
            skinPreviewUrl={skinPreviewUrl}
            activeSkinUrl={skinPreviewUrl ?? resolveSkinUrl(currentSkinUrl)}
            error={fieldErrors.skinFile}
            disabled={isSubmitting}
            onFileSelect={handleSkinFileSelect}
            onFileRemove={handleRemoveSkinFile}
          />

          <PasswordChangeSection
            currentPassword={currentPassword}
            newPassword={newPassword}
            currentPasswordError={fieldErrors.currentPassword}
            newPasswordError={fieldErrors.password}
            disabled={isSubmitting}
            onCurrentPasswordChange={(value) => {
              setCurrentPassword(value);
              if (fieldErrors.currentPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  currentPassword: undefined,
                }));
              }
            }}
            onNewPasswordChange={(value) => {
              setNewPassword(value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
          />

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
