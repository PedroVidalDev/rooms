import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, MathUtils, type Texture } from "three";
import {
  MINECRAFT_FEET_OFFSET_Y,
  MINECRAFT_PIXEL_SCALE,
  MINECRAFT_UV_ORIGIN,
} from "./consts";
import {
  createDefaultGraySkinTexture,
  createMinecraftBoxGeometry,
  loadCustomSkinTexture,
} from "./helpers";
import type { MinecraftCharacterProps } from "./types";

export const MinecraftCharacter = (props: MinecraftCharacterProps) => {
  const { motionRef, sessionId, skinUrl } = props;

  const headPivotRef = useRef<Group>(null);
  const rightArmPivotRef = useRef<Group>(null);
  const leftArmPivotRef = useRef<Group>(null);
  const rightLegPivotRef = useRef<Group>(null);
  const leftLegPivotRef = useRef<Group>(null);
  const walkCycleRef = useRef(0);

  const defaultTexture = useMemo(() => createDefaultGraySkinTexture(), []);
  const [customTexture, setCustomTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!skinUrl) {
      return;
    }

    let isActive = true;
    loadCustomSkinTexture(skinUrl, (loaded) => {
      if (isActive) {
        setCustomTexture(loaded);
      }
    });

    return () => {
      isActive = false;
    };
  }, [skinUrl]);

  const activeTexture = skinUrl && customTexture ? customTexture : defaultTexture;

  const geometries = useMemo(
    () => ({
      head: createMinecraftBoxGeometry(MINECRAFT_UV_ORIGIN.head),
      body: createMinecraftBoxGeometry(MINECRAFT_UV_ORIGIN.body),
      rightArm: createMinecraftBoxGeometry(MINECRAFT_UV_ORIGIN.rightArm),
      leftArm: createMinecraftBoxGeometry(MINECRAFT_UV_ORIGIN.leftArm),
      rightLeg: createMinecraftBoxGeometry(MINECRAFT_UV_ORIGIN.rightLeg),
      leftLeg: createMinecraftBoxGeometry(MINECRAFT_UV_ORIGIN.leftLeg),
    }),
    [],
  );

  useFrame((state, delta) => {
    const { isMoving, isGrounded } = motionRef.current;

    let targetRightArmX: number;
    let targetLeftArmX: number;
    let targetRightArmZ = 0.05;
    let targetLeftArmZ = -0.05;
    let targetRightLegX = 0;
    let targetLeftLegX = 0;
    let targetHeadY = 0;

    if (!isGrounded) {
      // Jump pose: arms slightly raised, legs split mid-air
      targetRightArmX = -0.55;
      targetLeftArmX = 0.55;
      targetRightArmZ = 0.22;
      targetLeftArmZ = -0.22;
      targetRightLegX = 0.4;
      targetLeftLegX = -0.4;
    } else if (isMoving) {
      // Classic Minecraft walk cycle: opposite arms and legs swing
      walkCycleRef.current += delta * 11;
      const swing = Math.sin(walkCycleRef.current) * 0.85;
      targetRightArmX = swing;
      targetLeftArmX = -swing;
      targetRightLegX = -swing * 0.9;
      targetLeftLegX = swing * 0.9;
      targetHeadY = Math.sin(walkCycleRef.current * 0.5) * 0.06;
    } else {
      // Subtle idle breathing sway
      const idleTime = state.clock.elapsedTime * 2;
      targetRightArmZ = 0.05 + Math.sin(idleTime) * 0.03;
      targetLeftArmZ = -0.05 - Math.sin(idleTime) * 0.03;
      targetRightArmX = Math.cos(idleTime) * 0.03;
      targetLeftArmX = -Math.cos(idleTime) * 0.03;
    }

    const lerpSpeed = Math.min(1, delta * 14);

    if (rightArmPivotRef.current) {
      rightArmPivotRef.current.rotation.x = MathUtils.lerp(
        rightArmPivotRef.current.rotation.x,
        targetRightArmX,
        lerpSpeed,
      );
      rightArmPivotRef.current.rotation.z = MathUtils.lerp(
        rightArmPivotRef.current.rotation.z,
        targetRightArmZ,
        lerpSpeed,
      );
    }

    if (leftArmPivotRef.current) {
      leftArmPivotRef.current.rotation.x = MathUtils.lerp(
        leftArmPivotRef.current.rotation.x,
        targetLeftArmX,
        lerpSpeed,
      );
      leftArmPivotRef.current.rotation.z = MathUtils.lerp(
        leftArmPivotRef.current.rotation.z,
        targetLeftArmZ,
        lerpSpeed,
      );
    }

    if (rightLegPivotRef.current) {
      rightLegPivotRef.current.rotation.x = MathUtils.lerp(
        rightLegPivotRef.current.rotation.x,
        targetRightLegX,
        lerpSpeed,
      );
    }

    if (leftLegPivotRef.current) {
      leftLegPivotRef.current.rotation.x = MathUtils.lerp(
        leftLegPivotRef.current.rotation.x,
        targetLeftLegX,
        lerpSpeed,
      );
    }

    if (headPivotRef.current) {
      headPivotRef.current.rotation.y = MathUtils.lerp(
        headPivotRef.current.rotation.y,
        targetHeadY,
        lerpSpeed,
      );
    }
  });

  const s = MINECRAFT_PIXEL_SCALE;

  return (
    <group position={[0, MINECRAFT_FEET_OFFSET_Y, 0]}>
      {/* Head (8x8x8, neck pivot at y = 24px) */}
      <group ref={headPivotRef} position={[0, 24 * s, 0]}>
        <mesh
          geometry={geometries.head}
          position={[0, 4 * s, 0]}
          castShadow
          receiveShadow
          userData={{ sessionId }}
        >
          <meshStandardMaterial map={activeTexture} roughness={0.9} />
        </mesh>
      </group>

      {/* Torso / Body (8x12x4, center at y = 18px) */}
      <mesh
        geometry={geometries.body}
        position={[0, 18 * s, 0]}
        castShadow
        receiveShadow
        userData={{ sessionId }}
      >
        <meshStandardMaterial map={activeTexture} roughness={0.9} />
      </mesh>

      {/* Right Arm (4x12x4, shoulder pivot at x = -6px, y = 22px) */}
      <group ref={rightArmPivotRef} position={[-6 * s, 22 * s, 0]}>
        <mesh
          geometry={geometries.rightArm}
          position={[0, -4 * s, 0]}
          castShadow
          receiveShadow
          userData={{ sessionId }}
        >
          <meshStandardMaterial map={activeTexture} roughness={0.9} />
        </mesh>
      </group>

      {/* Left Arm (4x12x4, shoulder pivot at x = +6px, y = 22px) */}
      <group ref={leftArmPivotRef} position={[6 * s, 22 * s, 0]}>
        <mesh
          geometry={geometries.leftArm}
          position={[0, -4 * s, 0]}
          castShadow
          receiveShadow
          userData={{ sessionId }}
        >
          <meshStandardMaterial map={activeTexture} roughness={0.9} />
        </mesh>
      </group>

      {/* Right Leg (4x12x4, hip pivot at x = -2px, y = 12px) */}
      <group ref={rightLegPivotRef} position={[-2 * s, 12 * s, 0]}>
        <mesh
          geometry={geometries.rightLeg}
          position={[0, -6 * s, 0]}
          castShadow
          receiveShadow
          userData={{ sessionId }}
        >
          <meshStandardMaterial map={activeTexture} roughness={0.9} />
        </mesh>
      </group>

      {/* Left Leg (4x12x4, hip pivot at x = +2px, y = 12px) */}
      <group ref={leftLegPivotRef} position={[2 * s, 12 * s, 0]}>
        <mesh
          geometry={geometries.leftLeg}
          position={[0, -6 * s, 0]}
          castShadow
          receiveShadow
          userData={{ sessionId }}
        >
          <meshStandardMaterial map={activeTexture} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
