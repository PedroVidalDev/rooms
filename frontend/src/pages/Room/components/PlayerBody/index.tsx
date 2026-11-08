import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MathUtils, Vector3 } from "three";
import {
  playerHalfSize,
  playerJumpVelocity,
  playerNameOffsetY,
} from "./consts";
import { computeHorizontalVelocity, getPlayerSmoothing } from "./helpers";
import type { PlayerBodyProps } from "./types";

export const PlayerBody = (props: PlayerBodyProps) => {
  const {
    player,
    isLocal,
    jumpRequestedRef,
    movementRef,
    onLocalPositionChange,
    sessionId,
  } = props;

  const { world, rapier } = useRapier();
  const bodyRef = useRef<RapierRigidBody>(null);
  const nextPositionRef = useRef(new Vector3(player.x, player.y, player.z));
  const [initialPosition] = useState<[number, number, number]>(() => [
    player.x,
    player.y,
    player.z,
  ]);
  const color = player.color;
  const playerName = player.name.trim();

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const current = body.translation();

    if (isLocal) {
      const { vx, vz } = computeHorizontalVelocity(movementRef?.current);
      const currentVel = body.linvel();
      let nextVy = currentVel.y;

      if (jumpRequestedRef?.current) {
        jumpRequestedRef.current = false;

        const groundShape = new rapier.Cuboid(
          playerHalfSize * 0.9,
          0.04,
          playerHalfSize * 0.9,
        );
        const groundHit = world.intersectionWithShape(
          { x: current.x, y: current.y - playerHalfSize - 0.03, z: current.z },
          { x: 0, y: 0, z: 0, w: 1 },
          groundShape,
          undefined,
          undefined,
          undefined,
          body,
        );

        if (groundHit !== null && Math.abs(currentVel.y) <= 0.5) {
          nextVy = playerJumpVelocity;
        }
      }

      body.setLinvel({ x: vx, y: nextVy, z: vz }, true);

      nextPositionRef.current.set(current.x, current.y, current.z);
      if (onLocalPositionChange) {
        onLocalPositionChange(nextPositionRef.current);
      }
      return;
    }

    const smoothing = getPlayerSmoothing(false);

    nextPositionRef.current.set(
      MathUtils.lerp(current.x, player.x, smoothing),
      MathUtils.lerp(current.y, player.y, 0.35),
      MathUtils.lerp(current.z, player.z, smoothing),
    );

    body.setNextKinematicTranslation(nextPositionRef.current);
  });

  return (
    <RigidBody
      ref={bodyRef}
      type={isLocal ? "dynamic" : "kinematicPosition"}
      colliders={false}
      position={initialPosition}
      enabledRotations={[false, false, false]}
      enabledTranslations={[true, true, true]}
      ccd={isLocal}
    >
      <CuboidCollider
        args={[playerHalfSize, playerHalfSize, playerHalfSize]}
        friction={0}
      />
      <mesh castShadow receiveShadow userData={{ sessionId }}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {!isLocal && playerName && (
        <Html
          position={[0, playerNameOffsetY, 0]}
          center
          zIndexRange={[5, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(10, 18, 28, 0.82)",
              border: "1px solid rgba(231, 237, 245, 0.16)",
              color: "#e7edf5",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              whiteSpace: "nowrap",
              userSelect: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.28)",
            }}
          >
            {playerName}
          </div>
        </Html>
      )}
    </RigidBody>
  );
};

