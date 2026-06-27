import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Client, Room, getStateCallbacks } from '@colyseus/sdk';
import * as THREE from 'three';
import { RoomState, Player } from './RoomState';

const client = new Client('ws://localhost:8080');
const cameraOffset = new THREE.Vector3(0, 2.35, 3.35);
const cameraTargetOffset = new THREE.Vector3(0, 1, 0);
const floorSize = 20;
const playerHalfSize = 0.5;
const wallHeight = 4;
const wallThickness = 0.4;
const halfFloor = floorSize / 2;
const maxVoiceDistance = 14;

const rtcConfiguration: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

type MovementState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type VoiceSignalPayload =
  | {
      type: 'offer' | 'answer';
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: 'ice-candidate';
      candidate: RTCIceCandidateInit;
    };

type PlayerBodyProps = {
  isLocal: boolean;
  onLocalPositionChange?: (position: THREE.Vector3) => void;
  player: Player;
  sessionId: string;
};

const Arena = () => {
  const wallY = wallHeight / 2;
  const columnOffset = halfFloor - 0.8;

  return (
    <>
      <color attach="background" args={['#101820']} />
      <fog attach="fog" args={['#101820', 12, 28]} />

      <RigidBody type="fixed" colliders={false} position={[0, -0.05, 0]}>
        <CuboidCollider args={[halfFloor, 0.05, halfFloor]} />
        <CuboidCollider args={[halfFloor, wallHeight / 2, wallThickness / 2]} position={[0, wallY, -halfFloor]} />
        <CuboidCollider args={[halfFloor, wallHeight / 2, wallThickness / 2]} position={[0, wallY, halfFloor]} />
        <CuboidCollider args={[wallThickness / 2, wallHeight / 2, halfFloor]} position={[-halfFloor, wallY, 0]} />
        <CuboidCollider args={[wallThickness / 2, wallHeight / 2, halfFloor]} position={[halfFloor, wallY, 0]} />
      </RigidBody>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[floorSize, floorSize, 20, 20]} />
        <meshStandardMaterial color="#2f3a45" roughness={0.92} metalness={0.08} />
      </mesh>

      <gridHelper args={[floorSize, 20, '#dfbe62', '#58708a']} position={[0, 0.01, 0]} />

      <mesh position={[0, 0.03, -halfFloor + 0.35]} receiveShadow>
        <boxGeometry args={[floorSize - 0.8, 0.08, 0.35]} />
        <meshStandardMaterial color="#d4a64f" />
      </mesh>
      <mesh position={[0, 0.03, halfFloor - 0.35]} receiveShadow>
        <boxGeometry args={[floorSize - 0.8, 0.08, 0.35]} />
        <meshStandardMaterial color="#d4a64f" />
      </mesh>
      <mesh position={[-halfFloor + 0.35, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.08, floorSize - 0.8]} />
        <meshStandardMaterial color="#d4a64f" />
      </mesh>
      <mesh position={[halfFloor - 0.35, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.08, floorSize - 0.8]} />
        <meshStandardMaterial color="#d4a64f" />
      </mesh>

      <mesh position={[0, wallY, -halfFloor]} castShadow receiveShadow>
        <boxGeometry args={[floorSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#44505c" roughness={0.88} />
      </mesh>
      <mesh position={[0, wallY, halfFloor]} castShadow receiveShadow>
        <boxGeometry args={[floorSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#44505c" roughness={0.88} />
      </mesh>
      <mesh position={[-halfFloor, wallY, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
        <meshStandardMaterial color="#4d5966" roughness={0.88} />
      </mesh>
      <mesh position={[halfFloor, wallY, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
        <meshStandardMaterial color="#4d5966" roughness={0.88} />
      </mesh>

      {[
        [-columnOffset, 1.6, -columnOffset],
        [columnOffset, 1.6, -columnOffset],
        [-columnOffset, 1.6, columnOffset],
        [columnOffset, 1.6, columnOffset],
      ].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 3.2, 0.55]} />
          <meshStandardMaterial color="#6f7b86" metalness={0.12} roughness={0.76} />
        </mesh>
      ))}

      <mesh position={[0, wallHeight - 0.55, -halfFloor + 0.22]} castShadow>
        <boxGeometry args={[6.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#8ed1c2" emissive="#5dc8b0" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, wallHeight - 0.55, halfFloor - 0.22]} castShadow>
        <boxGeometry args={[6.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#8ed1c2" emissive="#5dc8b0" emissiveIntensity={0.8} />
      </mesh>
    </>
  );
};

const FollowCamera = ({ target }: { target: React.RefObject<THREE.Vector3> }) => {
  const { camera } = useThree();

  useFrame(() => {
    const desiredPosition = target.current.clone().add(cameraOffset);
    const desiredTarget = target.current.clone().add(cameraTargetOffset);

    camera.position.lerp(desiredPosition, 0.16);
    camera.lookAt(desiredTarget);
  });

  return null;
};

const PlayerBody = ({ isLocal, onLocalPositionChange, player, sessionId }: PlayerBodyProps) => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const nextPositionRef = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const initialPositionRef = useRef<[number, number, number]>([player.x, player.y, player.z]);
  const color = isLocal ? '#f4d35e' : player.color;

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const current = body.translation();
    const smoothing = isLocal ? 0.24 : 0.18;

    nextPositionRef.current.set(
      THREE.MathUtils.lerp(current.x, player.x, smoothing),
      THREE.MathUtils.lerp(current.y, player.y, 0.35),
      THREE.MathUtils.lerp(current.z, player.z, smoothing),
    );

    body.setNextKinematicTranslation(nextPositionRef.current);

    if (isLocal && onLocalPositionChange) {
      onLocalPositionChange(nextPositionRef.current);
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={initialPositionRef.current}
      enabledRotations={[false, false, false]}
      enabledTranslations={[true, false, true]}
    >
      <CuboidCollider args={[playerHalfSize, playerHalfSize, playerHalfSize]} />
      <mesh castShadow receiveShadow userData={{ sessionId }}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
};

export const App = () => {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Voz desligada');
  const voiceEnabledRef = useRef(false);
  const roomRef = useRef<Room<RoomState> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const playersRef = useRef<Record<string, Player>>({});
  const movementRef = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const localPlayerPositionRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef(new Map<string, RTCPeerConnection>());
  const remoteAudioElementsRef = useRef(new Map<string, HTMLAudioElement>());
  const voiceReadyPeersRef = useRef(new Set<string>());
  const offeredPeersRef = useRef(new Set<string>());

  const syncPlayersSnapshot = (state: RoomState) => {
    const nextPlayers = Object.fromEntries(state.players.entries()) as Record<string, Player>;
    playersRef.current = nextPlayers;
    setPlayers(nextPlayers);
  };

  const removeRemoteAudioElement = (peerSessionId: string) => {
    const audioElement = remoteAudioElementsRef.current.get(peerSessionId);
    if (!audioElement) {
      return;
    }

    audioElement.pause();
    audioElement.srcObject = null;
    audioElement.remove();
    remoteAudioElementsRef.current.delete(peerSessionId);
  };

  const closeVoiceConnection = (peerSessionId: string) => {
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
  };

  const closeAllVoiceConnections = () => {
    for (const peerSessionId of [...peerConnectionsRef.current.keys()]) {
      closeVoiceConnection(peerSessionId);
    }
  };

  const stopLocalVoice = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  };

  const updateRemoteAudioVolumes = () => {
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
  };

  const sendVoiceSignal = (targetSessionId: string, payload: VoiceSignalPayload) => {
    roomRef.current?.send('voice_signal', {
      targetSessionId,
      payload,
    });
  };

  const ensureRemoteAudioElement = (peerSessionId: string) => {
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
  };

  const createPeerConnection = (peerSessionId: string) => {
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
  };

  const ensureVoiceConnection = async (peerSessionId: string) => {
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
  };

  const handleVoiceSignal = async (peerSessionId: string, payload: VoiceSignalPayload) => {
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
  };

  const toggleVoiceChat = async () => {
    if (!roomRef.current) {
      setVoiceStatus('Conecte na room antes de ativar a voz.');
      return;
    }

    if (voiceEnabled) {
      roomRef.current.send('voice_disabled');
      closeAllVoiceConnections();
      stopLocalVoice();
      voiceEnabledRef.current = false;
      setVoiceEnabled(false);
      setVoiceStatus('Voz desligada');
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
      roomRef.current.send('voice_ready');
    } catch {
      setVoiceStatus('Nao foi possivel acessar o microfone.');
    }
  };

  useEffect(() => {
    let room: Room<RoomState>;
    let detached = false;

    async function connect() {
      try {
        room = await client.joinOrCreate('english_room', {}, RoomState);

        if (detached) {
          await room.leave();
          return;
        }

        roomRef.current = room;
        setSessionId(room.sessionId);
        sessionIdRef.current = room.sessionId;

        const $ = getStateCallbacks(room);
        syncPlayersSnapshot(room.state);

        room.onStateChange.once((state) => {
          syncPlayersSnapshot(state);
        });

        $(room.state).players.onAdd((player: Player, playerSessionId: string) => {
          playersRef.current = { ...playersRef.current, [playerSessionId]: player };
          setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));

          $(player).onChange(() => {
            playersRef.current = { ...playersRef.current, [playerSessionId]: player };
            setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));
          });
        });

        $(room.state).players.onRemove((_player: Player, playerSessionId: string) => {
          closeVoiceConnection(playerSessionId);
          voiceReadyPeersRef.current.delete(playerSessionId);
          delete playersRef.current[playerSessionId];

          setPlayers((prev) => {
            const nextState = { ...prev };
            delete nextState[playerSessionId];
            return nextState;
          });
        });

        room.onMessage('voice-ready-peers', (message: { peers: string[] }) => {
          voiceReadyPeersRef.current = new Set(message.peers);

          if (voiceEnabledRef.current) {
            message.peers.forEach((peerSessionId) => {
              void ensureVoiceConnection(peerSessionId);
            });
          }
        });

        room.onMessage('voice-peer-ready', (message: { sessionId: string }) => {
          voiceReadyPeersRef.current.add(message.sessionId);

          if (voiceEnabledRef.current) {
            void ensureVoiceConnection(message.sessionId);
          }
        });

        room.onMessage('voice-peer-disabled', (message: { sessionId: string }) => {
          voiceReadyPeersRef.current.delete(message.sessionId);
          closeVoiceConnection(message.sessionId);
        });

        room.onMessage('voice-peer-left', (message: { sessionId: string }) => {
          voiceReadyPeersRef.current.delete(message.sessionId);
          closeVoiceConnection(message.sessionId);
        });

        room.onMessage(
          'voice-signal',
          (message: { fromSessionId: string; payload: VoiceSignalPayload }) => {
            void handleVoiceSignal(message.fromSessionId, message.payload).catch(() => {
              setVoiceStatus('Falha ao processar o sinal de voz.');
            });
          },
        );
      } catch {
        setVoiceStatus('Nao foi possivel conectar na sala.');
      }
    }

    connect();

    return () => {
      detached = true;
      roomRef.current = null;
      sessionIdRef.current = null;
      voiceEnabledRef.current = false;
      setSessionId(null);
      closeAllVoiceConnections();
      stopLocalVoice();
      if (room) {
        room.leave();
      }
    };
  }, []);

  useEffect(() => {
    const updateMovement = (code: string, pressed: boolean) => {
      switch (code) {
        case 'KeyW':
          movementRef.current.forward = pressed;
          break;
        case 'KeyS':
          movementRef.current.backward = pressed;
          break;
        case 'KeyA':
          movementRef.current.left = pressed;
          break;
        case 'KeyD':
          movementRef.current.right = pressed;
          break;
        default:
          break;
      }
    };

    const resetMovement = () => {
      movementRef.current.forward = false;
      movementRef.current.backward = false;
      movementRef.current.left = false;
      movementRef.current.right = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();

        if (!event.repeat) {
          roomRef.current?.send('jump');
        }
      }

      updateMovement(event.code, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
      }

      updateMovement(event.code, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', resetMovement);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', resetMovement);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const room = roomRef.current;
      if (!room) {
        return;
      }

      const x = Number(movementRef.current.right) - Number(movementRef.current.left);
      const z = Number(movementRef.current.backward) - Number(movementRef.current.forward);

      if (x === 0 && z === 0) {
        return;
      }

      room.send('move', { x, z });
    }, 50);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      updateRemoteAudioVolumes();
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1e1e1e', position: 'relative' }}>
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

      <Canvas camera={{ position: [0, 6, 8] }} shadows>
        <ambientLight intensity={0.85} color="#dbe7f2" />
        <hemisphereLight intensity={0.55} color="#d7ecff" groundColor="#1d232b" />
        <directionalLight castShadow position={[10, 12, 8]} intensity={1.65} color="#fff6d6" shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <spotLight position={[0, wallHeight + 2.5, 0]} angle={0.5} penumbra={0.45} intensity={70} distance={30} color="#b9f3ff" />
        <FollowCamera target={localPlayerPositionRef} />

        <Physics gravity={[0, 0, 0]} colliders={false} timeStep="vary" interpolate>
          <Arena />

          {Object.entries(players).map(([playerSessionId, player]) => (
            <PlayerBody
              key={playerSessionId}
              sessionId={playerSessionId}
              player={player}
              isLocal={playerSessionId === sessionId}
              onLocalPositionChange={(position) => {
                if (playerSessionId === sessionId) {
                  localPlayerPositionRef.current.copy(position);
                }
              }}
            />
          ))}
        </Physics>
      </Canvas>
    </div>
  );
};
