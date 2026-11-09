export const maxVoiceDistance = 14;

export const rtcConfiguration: RTCConfiguration = {
  iceServers: [
    { urls: `stun:stun.l.google.com:19302` },
    {
      urls: `turn:${import.meta.env.VITE_TURN_SERVER}:${import.meta.env.VITE_TURN_PORT}`,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    },
  ],
};