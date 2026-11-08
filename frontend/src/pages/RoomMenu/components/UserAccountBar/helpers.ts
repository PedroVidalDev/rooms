export const getUserInitials = (name?: string, email?: string): string => {
  const trimmedName = (name ?? "").trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return trimmedName.slice(0, 2).toUpperCase();
  }

  const trimmedEmail = (email ?? "").trim();
  if (trimmedEmail) {
    return trimmedEmail.slice(0, 2).toUpperCase();
  }

  return "JG";
};
