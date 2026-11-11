import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { maxCameraPitch, minCameraPitch, mouseSensitivity } from "./consts";
import { computeCameraTargets } from "./helpers";
import type { FollowCameraProps } from "./types";

export const FollowCamera = (props: FollowCameraProps) => {
  const { cameraMode, cameraRotationRef, target } = props;
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleCanvasClick = () => {
      if (document.pointerLockElement !== canvas) {
        void canvas.requestPointerLock?.()?.catch?.(() => {});
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) {
        return;
      }

      cameraRotationRef.current.yaw -= event.movementX * mouseSensitivity;
      cameraRotationRef.current.pitch = MathUtils.clamp(
        cameraRotationRef.current.pitch - event.movementY * mouseSensitivity,
        minCameraPitch,
        maxCameraPitch,
      );
    };

    canvas.addEventListener("click", handleCanvasClick);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      document.removeEventListener("mousemove", handleMouseMove);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock?.();
      }
    };
  }, [cameraRotationRef, gl]);

  useFrame(() => {
    const { desiredPosition, desiredTarget } = computeCameraTargets(
      target.current,
      cameraRotationRef.current,
      cameraMode,
    );

    if (cameraMode === "first-person") {
      camera.position.copy(desiredPosition);
    } else {
      camera.position.lerp(desiredPosition, 0.28);
    }

    camera.lookAt(desiredTarget);
  });

  return null;
};

