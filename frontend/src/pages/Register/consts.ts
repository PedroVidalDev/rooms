import type { BannerHighlight } from "../../components/AuthBanner/types";
import type { FormFieldConfig } from "../../components/Form/types";
import {
  validateRegisterEmail,
  validateRegisterName,
  validateRegisterPassword,
} from "./helpers";
import type { RegisterFieldName } from "./types";

export const REGISTER_FORM_FIELDS: FormFieldConfig<RegisterFieldName>[] = [
  {
    name: "name",
    label: "Nome",
    type: "text",
    placeholder: "Como deseja ser chamado",
    autoComplete: "name",
    validate: validateRegisterName,
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "seu@email.com",
    autoComplete: "email",
    validate: validateRegisterEmail,
  },
  {
    name: "password",
    label: "Senha",
    type: "password",
    placeholder: "Crie uma senha (mín. 6 caracteres)",
    autoComplete: "new-password",
    validate: validateRegisterPassword,
  },
];

export const REGISTER_BANNER_HIGHLIGHTS: BannerHighlight[] = [
  {
    label: "Cadastro",
    value: "Rápido",
    accentColor: "#67d1bf",
  },
  {
    label: "Salas",
    value: "Públicas & ID",
    accentColor: "#dfbe62",
  },
  {
    label: "Conversação",
    value: "100% Ao Vivo",
    accentColor: "#e7edf5",
  },
];
