export type CharacterTextureSectionProps = {
  skinFile: File | null;
  skinPreviewUrl: string | null;
  error?: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
};
