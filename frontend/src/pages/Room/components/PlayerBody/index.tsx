import { useRef } from "react";
import type { PlayerBodyProps } from "./types";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { MathUtils, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { playerHalfSize } from "./consts";

export const PlayerBody = (props: PlayerBodyProps) => {
    const { player, isLocal, onLocalPositionChange, sessionId } = props;

  const bodyRef = useRef<RapierRigidBody>(null);
  const nextPositionRef = useRef(new Vector3(player.x, player.y, player.z));
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
      MathUtils.lerp(current.x, player.x, smoothing),
      MathUtils.lerp(current.y, player.y, 0.35),
      MathUtils.lerp(current.z, player.z, smoothing),
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