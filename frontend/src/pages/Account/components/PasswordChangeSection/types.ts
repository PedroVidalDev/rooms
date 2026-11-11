export type PasswordChangeSectionProps = {
  currentPassword: string;
  newPassword: string;
  currentPasswordError?: string;
  newPasswordError?: string;
  disabled?: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
};
