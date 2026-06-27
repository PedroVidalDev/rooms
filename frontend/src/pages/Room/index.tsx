import { useEffect, useRef, useState } from 'react';
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

const client = new Client('wss://b36e-45-227-209-174.ngrok-free.app');

export const ThreeRoom = () => {
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
      try {
        room = await client.joinOrCreate('english_room', {}, RoomState);

        if (detached) {
          await room.leave();
          return;
        }

        roomRef.current = room;
        setRoomInstance(room);
        setSessionId(room.sessionId);

        const $ = getStateCallbacks(room);
        syncPlayersSnapshot(room.state);

        room.onStateChange.once((state) => {
          syncPlayersSnapshot(state);
        });

        $(room.state).players.onAdd((player: Player, playerSessionId: string) => {
          setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));

          $(player).onChange(() => {
            setPlayers((prev) => ({ ...prev, [playerSessionId]: player }));
          });
        });

        $(room.state).players.onRemove((_player: Player, playerSessionId: string) => {
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
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1e1e1e', position: 'relative' }}>
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
