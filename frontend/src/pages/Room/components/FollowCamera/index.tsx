import { useFrame, useThree } from "@react-three/fiber";
import { computeCameraTargets } from "./helpers";
import type { FollowCameraProps } from "./types";

export const FollowCamera = (props: FollowCameraProps) => {
  const { target } = props;
  const { camera } = useThree();

  useFrame(() => {
    const { desiredPosition, desiredTarget } = computeCameraTargets(target.current);

    camera.position.lerp(desiredPosition, 0.16);
    camera.lookAt(desiredTarget);
  });

  return null;
};
