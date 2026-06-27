import { useCallback, useEffect, useRef, useState } from 'react';
import { type Player } from '../../../../colyseus/RoomState';
import type { VoiceChatControlsProps, VoiceSignalPayload } from './types';
import { maxVoiceDistance, rtcConfiguration } from './consts';

export const VoiceChatControls = (props: VoiceChatControlsProps) => {
  const { room, players, sessionId } = props;

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Voz desligada');
  const voiceEnabledRef = useRef(false);
  const sessionIdRef = useRef<string | null>(sessionId);
  const playersRef = useRef<Record<string, Player>>(players);
  const previousPlayerIdsRef = useRef<string[]>(Object.keys(players));
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef(new Map<string, RTCPeerConnection>());
  const remoteAudioElementsRef = useRef(new Map<string, HTMLAudioElement>());
  const voiceReadyPeersRef = useRef(new Set<string>());
  const offeredPeersRef = useRef(new Set<string>());

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const removeRemoteAudioElement = useCallback((peerSessionId: string) => {
    const audioElement = remoteAudioElementsRef.current.get(peerSessionId);
    if (!audioElement) {
      return;
    }

    audioElement.pause();
    audioElement.srcObject = null;
    audioElement.remove();
    remoteAudioElementsRef.current.delete(peerSessionId);
  }, []);

  const closeVoiceConnection = useCallback(
    (peerSessionId: string) => {
      const peerConnection = peerConnectionsRef.current.get(peerSessionId);
      if (peerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.close();
        peerConnectionsRef.current.delete(peerSessionId);
      }

      offeredPeersRef.current.delete(peerSessionId);
      removeRemoteAudioElement(peerSessionId);
    },
    [removeRemoteAudioElement],
  );

  const closeAllVoiceConnections = useCallback(() => {
    for (const peerSessionId of [...peerConnectionsRef.current.keys()]) {
      closeVoiceConnection(peerSessionId);
    }
  }, [closeVoiceConnection]);

  const stopLocalVoice = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }, []);

  const updateRemoteAudioVolumes = useCallback(() => {
    const localSessionId = sessionIdRef.current;
    if (!localSessionId) {
      return;
    }

    const localPlayer = playersRef.current[localSessionId];
    if (!localPlayer) {
      return;
    }

    for (const [peerSessionId, audioElement] of remoteAudioElementsRef.current.entries()) {
      const remotePlayer = playersRef.current[peerSessionId];

      if (!remotePlayer) {
        audioElement.volume = 0;
        continue;
      }

      const dx = remotePlayer.x - localPlayer.x;
      const dz = remotePlayer.z - localPlayer.z;
      const distance = Math.hypot(dx, dz);
      const ratio = Math.max(0, 1 - distance / maxVoiceDistance);

      audioElement.volume = ratio * ratio;
    }
  }, []);

  const sendVoiceSignal = useCallback(
    (targetSessionId: string, payload: VoiceSignalPayload) => {
      room?.send('voice_signal', {
        targetSessionId,
        payload,
      });
    },
    [room],
  );

  const ensureRemoteAudioElement = useCallback((peerSessionId: string) => {
    let audioElement = remoteAudioElementsRef.current.get(peerSessionId);

    if (!audioElement) {
      audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      audioElement.setAttribute('playsinline', 'true');
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
      remoteAudioElementsRef.current.set(peerSessionId, audioElement);
    }

    return audioElement;
  }, []);

  const createPeerConnection = useCallback(
    (peerSessionId: string) => {
      const existingPeerConnection = peerConnectionsRef.current.get(peerSessionId);
      if (existingPeerConnection) {
        return existingPeerConnection;
      }

      const peerConnection = new RTCPeerConnection(rtcConfiguration);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current as MediaStream);
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        sendVoiceSignal(peerSessionId, {
          type: 'ice-candidate',
          candidate: event.candidate.toJSON(),
        });
      };

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const audioElement = ensureRemoteAudioElement(peerSessionId);

        if (audioElement.srcObject !== remoteStream) {
          audioElement.srcObject = remoteStream;
        }

        void audioElement.play().catch(() => {
          setVoiceStatus('Clique em ativar voz para liberar o audio do navegador.');
        });
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed'
        ) {
          closeVoiceConnection(peerSessionId);
        }
      };

      peerConnectionsRef.current.set(peerSessionId, peerConnection);
      return peerConnection;
    },
    [closeVoiceConnection, ensureRemoteAudioElement, sendVoiceSignal],
  );

  const ensureVoiceConnection = useCallback(
    async (peerSessionId: string) => {
      if (
        !voiceEnabledRef.current ||
        !localStreamRef.current ||
        !sessionIdRef.current ||
        peerSessionId === sessionIdRef.current
      ) {
        return;
      }

      const peerConnection = createPeerConnection(peerSessionId);
      const shouldInitiateOffer = sessionIdRef.current.localeCompare(peerSessionId) < 0;

      if (!shouldInitiateOffer || offeredPeersRef.current.has(peerSessionId)) {
        return;
      }

      offeredPeersRef.current.add(peerSessionId);

      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        sendVoiceSignal(peerSessionId, {
          type: 'offer',
          sdp: offer,
        });
      } catch {
        offeredPeersRef.current.delete(peerSessionId);
        setVoiceStatus('Nao foi possivel iniciar a conexao de voz.');
      }
    },
    [createPeerConnection, sendVoiceSignal],
  );

  const handleVoiceSignal = useCallback(
    async (peerSessionId: string, payload: VoiceSignalPayload) => {
      if (!voiceEnabledRef.current || !localStreamRef.current) {
        return;
      }

      const peerConnection = createPeerConnection(peerSessionId);

      if (payload.type === 'offer') {
        await peerConnection.setRemoteDescription(payload.sdp);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        sendVoiceSignal(peerSessionId, {
          type: 'answer',
          sdp: answer,
        });
        return;
      }

      if (payload.type === 'answer') {
        await peerConnection.setRemoteDescription(payload.sdp);
        return;
      }

      if (payload.type === 'ice-candidate') {
        await peerConnection.addIceCandidate(payload.candidate);
      }
    },
    [createPeerConnection, sendVoiceSignal],
  );

  const resetVoiceState = useCallback(() => {
    closeAllVoiceConnections();
    stopLocalVoice();
    voiceReadyPeersRef.current.clear();
    offeredPeersRef.current.clear();
    voiceEnabledRef.current = false;
    setVoiceEnabled(false);
    setVoiceStatus('Voz desligada');
  }, [closeAllVoiceConnections, stopLocalVoice]);

  const toggleVoiceChat = useCallback(async () => {
    if (!room) {
      setVoiceStatus('Conecte na room antes de ativar a voz.');
      return;
    }

    if (voiceEnabledRef.current) {
      room.send('voice_disabled');
      resetVoiceState();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      voiceEnabledRef.current = true;
      setVoiceEnabled(true);
      setVoiceStatus('Voz por proximidade ativada.');
      room.send('voice_ready');
    } catch {
      setVoiceStatus('Nao foi possivel acessar o microfone.');
    }
  }, [resetVoiceState, room]);

  useEffect(() => {
    const previousPlayerIds = new Set(previousPlayerIdsRef.current);
    const currentPlayerIds = Object.keys(players);

    currentPlayerIds.forEach((playerId) => {
      previousPlayerIds.delete(playerId);
    });

    previousPlayerIds.forEach((playerId) => {
      voiceReadyPeersRef.current.delete(playerId);
      closeVoiceConnection(playerId);
    });

    previousPlayerIdsRef.current = currentPlayerIds;
  }, [closeVoiceConnection, players]);

  useEffect(() => {
    if (!room) {
      return;
    }

    const disposeVoiceReadyPeers = room.onMessage(
      'voice-ready-peers',
      (message: { peers: string[] }) => {
        voiceReadyPeersRef.current = new Set(message.peers);

        if (voiceEnabledRef.current) {
          message.peers.forEach((peerSessionId) => {
            void ensureVoiceConnection(peerSessionId);
          });
        }
      },
    );

    const disposeVoicePeerReady = room.onMessage(
      'voice-peer-ready',
      (message: { sessionId: string }) => {
        voiceReadyPeersRef.current.add(message.sessionId);

        if (voiceEnabledRef.current) {
          void ensureVoiceConnection(message.sessionId);
        }
      },
    );

    const disposeVoicePeerDisabled = room.onMessage(
      'voice-peer-disabled',
      (message: { sessionId: string }) => {
        voiceReadyPeersRef.current.delete(message.sessionId);
        closeVoiceConnection(message.sessionId);
      },
    );

    const disposeVoicePeerLeft = room.onMessage(
      'voice-peer-left',
      (message: { sessionId: string }) => {
        voiceReadyPeersRef.current.delete(message.sessionId);
        closeVoiceConnection(message.sessionId);
      },
    );

    const disposeVoiceSignal = room.onMessage(
      'voice-signal',
      (message: { fromSessionId: string; payload: VoiceSignalPayload }) => {
        void handleVoiceSignal(message.fromSessionId, message.payload).catch(() => {
          setVoiceStatus('Falha ao processar o sinal de voz.');
        });
      },
    );

    return () => {
      disposeVoiceReadyPeers();
      disposeVoicePeerReady();
      disposeVoicePeerDisabled();
      disposeVoicePeerLeft();
      disposeVoiceSignal();
      resetVoiceState();
    };
  }, [closeVoiceConnection, ensureVoiceConnection, handleVoiceSignal, resetVoiceState, room]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      updateRemoteAudioVolumes();
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [updateRemoteAudioVolumes]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        background: 'rgba(10, 18, 28, 0.82)',
        color: '#e7edf5',
        fontFamily: 'system-ui, sans-serif',
        minWidth: 220,
        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.22)',
      }}
    >
      <button
        onClick={() => {
          void toggleVoiceChat();
        }}
        style={{
          border: 'none',
          borderRadius: 10,
          padding: '10px 12px',
          fontWeight: 700,
          cursor: 'pointer',
          background: voiceEnabled ? '#d96b6b' : '#67d1bf',
          color: '#12202b',
        }}
      >
        {voiceEnabled ? 'Desativar Voz' : 'Ativar Voz'}
      </button>
      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{voiceStatus}</span>
      <span style={{ fontSize: 12, opacity: 0.78 }}>
        O volume dos outros jogadores cai conforme a distancia entre os cubos.
      </span>
    </div>
  );
};
