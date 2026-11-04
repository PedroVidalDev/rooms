import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Client, getStateCallbacks, Room } from '@colyseus/sdk';
import * as THREE from 'three';
import { RoomState, type Player } from '../../colyseus/RoomState';
import { RoomHud } from './components/RoomHud';
import { RoomScene } from './components/RoomScene';
import { VoiceChatControls } from './components/VoiceChatControls';
import {
  computeMovementVector,
  extractPlayersSnapshot,
  formatRoomConnectionError,
} from './helpers';
import { useHotkeys, type MovementState } from './hooks/useHotkeys';
import type { CreateRoomLocationState, ThreeRoomProps } from './types';

const client = new Client(import.meta.env.VITE_WEBSOCKET_SERVER ?? 'ws://localhost:8080');

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
  const roomRef = useRef<Room<RoomState> | null>(null);
  const movementRef = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const localPlayerPositionRef = useRef(new THREE.Vector3(0, 0.5, 0));

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
      roomRef.current?.send('jump');
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
          setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));

          stateCallbacks(player).onChange(() => {
            setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));
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
      if (!room) {
        return;
      }

      const { x, z } = computeMovementVector(movementRef.current);

      if (x === 0 && z === 0) {
        return;
      }

      room.send('move', { x, z });
    }, 50);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#101820', position: 'relative' }}>
      <RoomHud
        roomName={activeRoomName}
        roomId={roomInstance?.roomId}
        playersCount={Object.keys(players).length}
        maxClients={maxClientsCount}
        onLeaveRoom={handleLeaveRoom}
      />

      <VoiceChatControls room={roomInstance} players={players} sessionId={sessionId} />

      <RoomScene
        players={players}
        sessionId={sessionId}
        localPlayerPositionRef={localPlayerPositionRef}
      />
    </div>
  );
};
