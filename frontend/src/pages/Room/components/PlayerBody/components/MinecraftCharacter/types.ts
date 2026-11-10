import type { RefObject } from "react";

export type CharacterMotionState = {
  isGrounded: boolean;
  isMoving: boolean;
};

export type MinecraftCharacterProps = {
  motionRef: RefObject<CharacterMotionState>;
  sessionId: string;
  skinUrl?: string;
};

export type MinecraftBoxRegion = {
  d: number;
  h: number;
  u: number;
  v: number;
  w: number;
};
