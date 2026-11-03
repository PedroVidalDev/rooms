import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Client, getStateCallbacks, Room } from '@colyseus/sdk';
import * as THREE from 'three';
import { RoomState, type Player } from '../../colyseus/RoomState';
import { wallHeight } from './components/Arena/consts';
import { FollowCamera } from './components/FollowCamera';
import { Arena } from './components/Arena';
import { PlayerBody } from './components/PlayerBody';
import { useHotkeys, type MovementState } from './hooks/useHotkeys';
import { VoiceChatControls } from './components/VoiceChatControls';
import type { ThreeRoomProps } from './types';

const client = new Client(import.meta.env.WEBSOCKET_SERVER ?? 'ws://localhost:8080');

export const ThreeRoom = (props: ThreeRoomProps) => {
  const { mode, roomId: propRoomId, onLeave } = props;
  const { roomId: paramRoomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();

  const targetRoomId = propRoomId ?? paramRoomId;
  const shouldCreate = mode === 'create' || !targetRoomId || targetRoomId === 'new';
  const initialConnectRef = useRef({ shouldCreate, targetRoomId, navigate });

  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [roomInstance, setRoomInstance] = useState<Room<RoomState> | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
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
    const nextPlayers = Object.fromEntries(state.players.entries()) as Record<string, Player>;
    setPlayers(nextPlayers);
  };

  useEffect(() => {
    let room: Room<RoomState>;
    let detached = false;

    async function connect() {
      const {
        shouldCreate: createNewRoom,
        targetRoomId: initialRoomId,
        navigate: redirect,
      } = initialConnectRef.current;

      try {
        if (createNewRoom || !initialRoomId) {
          room = await client.create('english_room', {}, RoomState);
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
      } catch {
        setRoomInstance(null);
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

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#101820', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(10, 18, 28, 0.82)',
          color: '#e7edf5',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 10px 28px rgba(0, 0, 0, 0.22)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>
            Room ID
          </span>
          <strong style={{ fontSize: 14, color: '#dfbe62', letterSpacing: '0.04em' }}>
            {roomInstance?.roomId ?? 'Connecting...'}
          </strong>
        </div>

        <button
          onClick={handleLeaveRoom}
          style={{
            border: 'none',
            borderRadius: 10,
            padding: '10px 14px',
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
            cursor: 'pointer',
            background: '#d96b6b',
            color: '#12202b',
          }}
        >
          Leave Room
        </button>
      </div>
      <VoiceChatControls room={roomInstance} players={players} sessionId={sessionId} />

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
