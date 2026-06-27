import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { floorSize, halfFloor, wallHeight, wallThickness } from "./consts";

export const Arena = () => {
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