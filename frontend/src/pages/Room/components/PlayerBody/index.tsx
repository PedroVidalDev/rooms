import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { type Group, MathUtils, Vector3 } from "three";
import { MinecraftCharacter } from "./components/MinecraftCharacter";
import type { CharacterMotionState } from "./components/MinecraftCharacter/types";
import {
  playerHalfSize,
  playerJumpVelocity,
  playerNameOffsetY,
} from "./consts";
import { computeHorizontalVelocity, getPlayerSmoothing } from "./helpers";
import type { PlayerBodyProps } from "./types";

export const PlayerBody = (props: PlayerBodyProps) => {
  const {
    cameraMode = "third-person",
    cameraRotationRef,
    player,
    isLocal,
    jumpRequestedRef,
    movementRef,
    onLocalPositionChange,
    sessionId,
  } = props;

  const { world, rapier } = useRapier();
  const bodyRef = useRef<RapierRigidBody>(null);
  const characterVisualRef = useRef<Group>(null);
  const targetRotationYRef = useRef(0);
  const motionRef = useRef<CharacterMotionState>({
    isGrounded: true,
    isMoving: false,
  });

  const nextPositionRef = useRef(new Vector3(player.x, player.y, player.z));
  const [initialPosition] = useState<[number, number, number]>(() => [
    player.x,
    player.y,
    player.z,
  ]);
  const playerName = player.name.trim();
  const backendHttpUrl = (
    import.meta.env.VITE_WEBSOCKET_SERVER ?? "ws://localhost:8080"
  ).replace(/^ws/, "http");
  const skinUrl = player.skinUrl
    ? player.skinUrl.startsWith("http")
      ? player.skinUrl
      : `${backendHttpUrl}${player.skinUrl}`
    : undefined;

  const rotateCharacterSmoothly = () => {
    if (!characterVisualRef.current) {
      return;
    }

    const currentAngle = characterVisualRef.current.rotation.y;
    const targetAngle = targetRotationYRef.current;
    const delta = Math.atan2(
      Math.sin(targetAngle - currentAngle),
      Math.cos(targetAngle - currentAngle),
    );
    characterVisualRef.current.rotation.y = currentAngle + delta * 0.22;
  };

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const current = body.translation();

    if (isLocal) {
      const cameraYaw = cameraRotationRef?.current.yaw ?? 0;
      const { vx, vz } = computeHorizontalVelocity(movementRef?.current, cameraYaw);
      const currentVel = body.linvel();
      let nextVy = currentVel.y;

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
      const isGrounded = groundHit !== null && Math.abs(currentVel.y) <= 0.5;

      if (jumpRequestedRef?.current) {
        jumpRequestedRef.current = false;

        if (isGrounded) {
          nextVy = playerJumpVelocity;
        }
      }

      body.setLinvel({ x: vx, y: nextVy, z: vz }, true);

      const isMovingHorizontally = Math.abs(vx) > 0.01 || Math.abs(vz) > 0.01;
      if (isMovingHorizontally) {
        targetRotationYRef.current = Math.atan2(vx, vz);
      }
      rotateCharacterSmoothly();

      motionRef.current.isMoving = isMovingHorizontally;
      motionRef.current.isGrounded = isGrounded && Math.abs(nextVy) <= 0.5;

      nextPositionRef.current.set(current.x, current.y, current.z);
      if (onLocalPositionChange) {
        onLocalPositionChange(nextPositionRef.current);
      }
      return;
    }

    const smoothing = getPlayerSmoothing(false);
    const dx = player.x - current.x;
    const dz = player.z - current.z;
    const horizontalDist = Math.hypot(dx, dz);

    if (horizontalDist > 0.02) {
      targetRotationYRef.current = Math.atan2(dx, dz);
    }
    rotateCharacterSmoothly();

    motionRef.current.isMoving = horizontalDist > 0.02;
    motionRef.current.isGrounded = player.y <= playerHalfSize + 0.08;

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
      <group ref={characterVisualRef} visible={!isLocal || cameraMode !== "first-person"}>
        <MinecraftCharacter
          motionRef={motionRef}
          sessionId={sessionId}
          skinUrl={skinUrl}
        />
      </group>
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
