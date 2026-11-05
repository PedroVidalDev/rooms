import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthBanner } from "../../components/AuthBanner";
import { Button } from "../../components/Button";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Form } from "../../components/Form";
import { PageHeader } from "../../components/PageHeader";
import { SectionDivider } from "../../components/SectionDivider";
import { REGISTER_BANNER_HIGHLIGHTS, REGISTER_FORM_FIELDS } from "./consts";
import { formatRegisterError, registerUser } from "./helpers";
import type { RegisterFieldName, RegisterPayload } from "./types";

export const Register = () => {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (values: Record<RegisterFieldName, string>) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: RegisterPayload = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      const createdUser = await registerUser(payload);
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: createdUser.email,
          successMessage: "Conta criada com sucesso! Faça login para entrar na arena.",
        },
      });
    } catch (err) {
      setError(formatRegisterError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationError = (message: string) => {
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
          statusTag="Novo Jogador"
          title="Comece sua jornada nas arenas de conversação."
          subtitle="Crie sua conta gratuitamente para entrar em salas ativas, conversar por voz e criar suas próprias arenas 3D."
          highlights={REGISTER_BANNER_HIGHLIGHTS}
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
              badge="Novo Cadastro"
              title="Criar sua Conta"
              subtitle="Preencha seus dados abaixo para se cadastrar e acessar as arenas de conversação."
            />

            <ErrorBanner
              message={error}
              onDismiss={() => setError(null)}
            />

            <Form
              idPrefix="register"
              fields={REGISTER_FORM_FIELDS}
              submitLabel="Criar Conta"
              submittingLabel="Criando conta..."
              submitVariant="primary"
              isSubmitting={isSubmitting}
              onSubmit={handleRegister}
              onValidationError={handleValidationError}
            />

            <SectionDivider label="ou já possui uma conta?" />

            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate("/login")}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
