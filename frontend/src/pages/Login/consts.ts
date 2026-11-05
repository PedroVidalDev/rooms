import type { BannerHighlight } from "../../components/AuthBanner/types";
import type { FormFieldConfig } from "../../components/Form/types";
import { validateLoginEmail, validateLoginPassword } from "./helpers";
import type { LoginFieldName } from "./types";

export const LOGIN_FORM_FIELDS: FormFieldConfig<LoginFieldName>[] = [
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "seu@email.com",
    autoComplete: "email",
    validate: validateLoginEmail,
  },
  {
    name: "password",
    label: "Senha",
    type: "password",
    placeholder: "Digite sua senha (mín. 6 caracteres)",
    autoComplete: "current-password",
    validate: validateLoginPassword,
  },
];

export const LOGIN_BANNER_HIGHLIGHTS: BannerHighlight[] = [
  {
    label: "Ambiente",
    value: "Arena 3D",
    accentColor: "#67d1bf",
  },
  {
    label: "Comunicação",
    value: "Voz Ao Vivo",
    accentColor: "#dfbe62",
  },
  {
    label: "Capacidade",
    value: "Até 8 Players",
    accentColor: "#e7edf5",
  },
];
