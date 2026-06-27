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

type MovementState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
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
  const roomRef = useRef<Room<RoomState> | null>(null);
  const movementRef = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const localPlayerPositionRef = useRef(new THREE.Vector3(0, 0.5, 0));

  useEffect(() => {
    let room: Room<RoomState>;
    let detached = false;

    const syncPlayersSnapshot = (state: RoomState) => {
      const nextPlayers = Object.fromEntries(state.players.entries()) as Record<string, Player>;
      setPlayers(nextPlayers);
    };

    async function connect() {
      try {
        room = await client.joinOrCreate('english_room', {}, RoomState);

        if (detached) {
          await room.leave();
          return;
        }

        console.log('Conectado com sucesso!', {
          roomId: room.roomId,
          sessionId: room.sessionId,
        });

        roomRef.current = room;
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
      } catch (error) {
        console.error('Erro ao conectar:', error);
      }
    }

    connect();

    return () => {
      detached = true;
      roomRef.current = null;
      setSessionId(null);
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
      updateMovement(event.code, true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
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

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1e1e1e' }}>
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
