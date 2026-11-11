export type CharacterTextureSectionProps = {
  skinFile: File | null;
  skinPreviewUrl: string | null;
  activeSkinUrl?: string;
  error?: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
};
