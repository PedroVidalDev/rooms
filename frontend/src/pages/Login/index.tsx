import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthBanner } from "../../components/AuthBanner";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Form } from "../../components/Form";
import { PageHeader } from "../../components/PageHeader";
import { SectionDivider } from "../../components/SectionDivider";
import { SuccessBanner } from "../../components/SuccessBanner";
import { LOGIN_BANNER_HIGHLIGHTS, LOGIN_FORM_FIELDS } from "./consts";
import {
  extractLoginLocationState,
  formatLoginError,
  loginUser,
  saveAuthToken,
} from "./helpers";
import type { LoginFieldName, LoginPayload } from "./types";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialLocationState = extractLoginLocationState(location.state);

  const [error, setError] = useState<string | null>(initialLocationState.error ?? null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    initialLocationState.successMessage ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (values: Record<LoginFieldName, string>) => {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const payload: LoginPayload = {
        email: values.email,
        password: values.password,
      };
      const token = await loginUser(payload);
      saveAuthToken(token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(formatLoginError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationError = (message: string) => {
    setSuccessMessage(null);
    setError(message);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#101820",
        backgroundImage: [
          "radial-gradient(circle at 50% 22%, rgba(185, 243, 255, 0.12) 0%, rgba(93, 200, 176, 0.06) 28%, transparent 65%)",
          "linear-gradient(rgba(88, 112, 138, 0.12) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(88, 112, 138, 0.12) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "100% 100%, 44px 44px, 44px 44px",
        fontFamily: "system-ui, sans-serif",
        color: "#e7edf5",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "90vw",
          height: "90vh",
          borderRadius: 20,
          background: "rgba(10, 18, 28, 0.88)",
          border: "1px solid rgba(88, 112, 138, 0.36)",
          boxShadow: "0 22px 54px rgba(0, 0, 0, 0.48)",
          display: "flex",
          flexDirection: "row",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "12%",
            right: "12%",
            height: 3,
            zIndex: 2,
            borderRadius: "0 0 6px 6px",
            background: "#8ed1c2",
            boxShadow: "0 0 14px #5dc8b0",
          }}
        />

        <AuthBanner
          badge="Arena de Voz 3D"
          statusTag="Lobby Online"
          title="Pratique inglês em salas 3D em tempo real."
          subtitle="Entre no lobby, conecte-se com outros jogadores por voz e evolua sua conversação em um ambiente interativo."
          highlights={LOGIN_BANNER_HIGHLIGHTS}
        />

        <div
          style={{
            flex: 1,
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <PageHeader
              badge="Acesso à Conta"
              title="Entrar na Arena"
              subtitle="Informe seu e-mail e senha para acessar o lobby e as salas de conversação."
            />

            <SuccessBanner
              message={successMessage}
              onDismiss={() => setSuccessMessage(null)}
            />

            <ErrorBanner
              message={error}
              onDismiss={() => setError(null)}
            />

            <Form
              idPrefix="login"
              fields={LOGIN_FORM_FIELDS}
              initialValues={{ email: initialLocationState.registeredEmail ?? "" }}
              submitLabel="Entrar na Arena"
              submittingLabel="Entrando..."
              submitVariant="primary"
              isSubmitting={isSubmitting}
              onSubmit={handleLogin}
              onValidationError={handleValidationError}
            />

            <SectionDivider label="ou ainda não tem conta?" />

            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate("/register")}
            >
              Criar Nova Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
