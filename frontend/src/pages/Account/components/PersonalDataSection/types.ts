export type PersonalDataSectionProps = {
  name: string;
  email: string;
  nameError?: string;
  emailError?: string;
  disabled?: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};
