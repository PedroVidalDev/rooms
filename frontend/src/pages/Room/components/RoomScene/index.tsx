import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Arena } from "../Arena";
import { wallHeight } from "../Arena/consts";
import { FollowCamera } from "../FollowCamera";
import { PlayerBody } from "../PlayerBody";
import type { RoomSceneProps } from "./types";

export const RoomScene = (props: RoomSceneProps) => {
  const {
    cameraMode,
    cameraRotationRef,
    jumpRequestedRef,
    localPlayerPositionRef,
    movementRef,
    players,
    sessionId,
  } = props;

  return (
    <Canvas camera={{ position: [0, 6, 8] }} shadows>
      <ambientLight intensity={0.85} color="#dbe7f2" />
      <hemisphereLight intensity={0.55} color="#d7ecff" groundColor="#1d232b" />
      <directionalLight
        castShadow
        position={[10, 12, 8]}
        intensity={1.65}
        color="#fff6d6"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        position={[0, wallHeight + 2.5, 0]}
        angle={0.5}
        penumbra={0.45}
        intensity={70}
        distance={30}
        color="#b9f3ff"
      />
      <FollowCamera
        target={localPlayerPositionRef}
        cameraMode={cameraMode}
        cameraRotationRef={cameraRotationRef}
      />

      <Physics gravity={[0, -20, 0]} colliders={false} timeStep="vary" interpolate>
        <Arena />

        {Object.entries(players).map(([playerSessionId, player]) => (
          <PlayerBody
            key={playerSessionId}
            sessionId={playerSessionId}
            player={player}
            isLocal={playerSessionId === sessionId}
            cameraMode={cameraMode}
            cameraRotationRef={cameraRotationRef}
            movementRef={movementRef}
            jumpRequestedRef={jumpRequestedRef}
            onLocalPositionChange={(position) => {
              if (playerSessionId === sessionId) {
                localPlayerPositionRef.current.copy(position);
              }
            }}
          />
        ))}
      </Physics>
    </Canvas>
  );
};
