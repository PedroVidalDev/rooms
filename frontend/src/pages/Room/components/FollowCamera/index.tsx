import { useFrame, useThree } from "@react-three/fiber";
import { cameraOffset, cameraTargetOffset } from "./consts";
import type { Vector3 } from "three";

export const FollowCamera = ({ target }: { target: React.RefObject<Vector3> }) => {
  const { camera } = useThree();

  useFrame(() => {
    const desiredPosition = target.current.clone().add(cameraOffset);
    const desiredTarget = target.current.clone().add(cameraTargetOffset);

    camera.position.lerp(desiredPosition, 0.16);
    camera.lookAt(desiredTarget);
  });

  return null;
};