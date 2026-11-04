export const getPlayerColor = (isLocal: boolean, remoteColor: string): string => {
  return isLocal ? "#f4d35e" : remoteColor;
};

export const getPlayerSmoothing = (isLocal: boolean): number => {
  return isLocal ? 0.24 : 0.18;
};
