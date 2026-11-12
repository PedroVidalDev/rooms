import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getStateCallbacks, Room } from '@colyseus/sdk';
import * as THREE from 'three';
import { RoomState, type Player } from '../../colyseus/RoomState';
import { initialCameraPitch } from './components/FollowCamera/consts';
import type { CameraMode, CameraRotation } from './components/FollowCamera/types';
import { RoomChat } from './components/RoomChat';
import { RoomHud } from './components/RoomHud';
import { RoomScene } from './components/RoomScene';
import { VoiceChatControls } from './components/VoiceChatControls';
import {
  extractPlayersSnapshot,
  formatRoomConnectionError,
  hasPositionChanged,
} from './helpers';
import { useHotkeys, type MovementState } from './hooks/useHotkeys';
import type { CreateRoomLocationState, ThreeRoomProps } from './types';
import { client } from '../../colyseus/client';
import { AUTH_TOKEN_STORAGE_KEY } from '../../storage/authToken';

export const ThreeRoom = (props: ThreeRoomProps = {}) => {
  const { mode, roomId: propRoomId, onLeave } = props;
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const targetRoomId = propRoomId ?? paramRoomId;
  const shouldCreate = mode === 'create' || !targetRoomId || targetRoomId === 'new';
  const locationState = (location.state as CreateRoomLocationState | null) ?? null;

  const initialConnectRef = useRef({
    shouldCreate,
    targetRoomId,
    locationState,
    navigate,
  });

  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [roomInstance, setRoomInstance] = useState<Room<RoomState> | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string>(locationState?.roomName ?? '');
  const [maxClientsCount, setMaxClientsCount] = useState<number>(locationState?.maxClients ?? 8);
  const [cameraMode, setCameraMode] = useState<CameraMode>('third-person');
  const [chatEnabled, setChatEnabled] = useState<boolean>(false);
  const roomRef = useRef<Room<RoomState> | null>(null);
  const cameraRotationRef = useRef<CameraRotation>({
    yaw: 0,
    pitch: initialCameraPitch,
  });
  const movementRef = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const jumpRequestedRef = useRef(false);
  const hasLocalSpawnedRef = useRef(false);
  const localPlayerPositionRef = useRef(new THREE.Vector3(0, 0.5, 0));
  const lastSentPositionRef = useRef(new THREE.Vector3(NaN, NaN, NaN));

  const handleLeaveRoom = () => {
    if (onLeave) {
      onLeave();
      return;
    }
    navigate('/');
  };

  useHotkeys({
    movementRef,
    onJump: () => {
      jumpRequestedRef.current = true;
    },
    onToggleCameraMode: () => {
      setCameraMode((prev) => (prev === 'third-person' ? 'first-person' : 'third-person'));
    },
    onToggleEnter: () => {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      setChatEnabled(true);
    },
    onToggleEsc: () => {
      if (chatEnabled) {
        setChatEnabled(false);
      }
    },
  });

  const syncPlayersSnapshot = (state: RoomState) => {
    setPlayers(extractPlayersSnapshot(state));
    if (state.roomName) {
      setActiveRoomName(state.roomName);
    }
    if (state.maxClients) {
      setMaxClientsCount(state.maxClients);
    }
  };

  useEffect(() => {
    let room: Room<RoomState>;
    let detached = false;

    async function connect() {
      const {
        shouldCreate: createNewRoom,
        targetRoomId: initialRoomId,
        locationState: createState,
        navigate: redirect,
      } = initialConnectRef.current;

      client.auth.token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? "";
      try {
        if (createNewRoom || !initialRoomId) {
          if (!createState?.roomName) {
            redirect('/', {
              replace: true,
              state: { error: 'Please specify a room name from the menu to create a room.' },
            });
            return;
          }

          room = await client.create(
            'english_room',
            {
              roomName: createState.roomName,
              maxClients: createState.maxClients ?? 8,
            },
            RoomState,
          );

          if (!detached) {
            redirect(`/room/${room.roomId}`, { replace: true });
          }
        } else {
          room = await client.joinById(initialRoomId, {}, RoomState);
        }

        if (detached) {
          await room.leave();
          return;
        }

        roomRef.current = room;
        setRoomInstance(room);
        setSessionId(room.sessionId);

        const stateCallbacks = getStateCallbacks(room);
        syncPlayersSnapshot(room.state);

        room.onStateChange((state) => {
          if (state.roomName) {
            setActiveRoomName(state.roomName);
          }
          if (state.maxClients) {
            setMaxClientsCount(state.maxClients);
          }
        });

        room.onStateChange.once((state) => {
          syncPlayersSnapshot(state);
        });

        stateCallbacks(room.state).players.onAdd((player: Player, playerSessionId: string) => {
          if (playerSessionId === room.sessionId) {
            localPlayerPositionRef.current.set(player.x, player.y, player.z);
            lastSentPositionRef.current.set(player.x, player.y, player.z);
            hasLocalSpawnedRef.current = true;
          }

          setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));

          stateCallbacks(player).onChange(() => {
            if (playerSessionId !== room.sessionId) {
              setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));
            }
          });
        });

        stateCallbacks(room.state).players.onRemove((_player: Player, playerSessionId: string) => {
          setPlayers((prev) => {
            const nextState = { ...prev };
            delete nextState[playerSessionId];
            return nextState;
          });
        });
      } catch (err: unknown) {
        setRoomInstance(null);
        if (!detached) {
          redirect('/', {
            replace: true,
            state: { error: formatRoomConnectionError(err) },
          });
        }
      }
    }

    connect();

    return () => {
      detached = true;
      hasLocalSpawnedRef.current = false;
      roomRef.current = null;
      setRoomInstance(null);
      setSessionId(null);
      if (room) {
        room.leave();
      }
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const room = roomRef.current;
      if (!room || !hasLocalSpawnedRef.current) {
        return;
      }

      const currentPos = localPlayerPositionRef.current;
      if (!hasPositionChanged(currentPos, lastSentPositionRef.current)) {
        return;
      }

      lastSentPositionRef.current.copy(currentPos);
      room.send('move', {
        x: currentPos.x,
        y: currentPos.y,
        z: currentPos.z,
      });
    }, 50);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#101820', position: 'relative' }}>
      {
        chatEnabled && (
          <RoomChat roomInstance={roomInstance} onClose={() => setChatEnabled(false)} />
        )
      }

      <RoomHud
        roomName={activeRoomName}
        roomId={roomInstance?.roomId}
        players={players}
        maxClients={maxClientsCount}
        onLeaveRoom={handleLeaveRoom}
      />

      <VoiceChatControls room={roomInstance} players={players} sessionId={sessionId} />

      <RoomScene
        players={players}
        sessionId={sessionId}
        cameraMode={cameraMode}
        cameraRotationRef={cameraRotationRef}
        localPlayerPositionRef={localPlayerPositionRef}
        movementRef={movementRef}
        jumpRequestedRef={jumpRequestedRef}
      />
    </div>
  );
};
