import { playerHalfSize } from "../../consts";

export const SKIN_TEXTURE_SIZE = 64;
export const MINECRAFT_TOTAL_PIXELS_HEIGHT = 32;
export const MINECRAFT_CHARACTER_HEIGHT = 1.2;
export const MINECRAFT_PIXEL_SCALE =
  MINECRAFT_CHARACTER_HEIGHT / MINECRAFT_TOTAL_PIXELS_HEIGHT;
export const MINECRAFT_FEET_OFFSET_Y = -playerHalfSize;

export const MINECRAFT_UV_ORIGIN = {
  head: { u: 0, v: 0, w: 8, h: 8, d: 8 },
  body: { u: 16, v: 16, w: 8, h: 12, d: 4 },
  rightArm: { u: 40, v: 16, w: 4, h: 12, d: 4 },
  leftArm: { u: 32, v: 48, w: 4, h: 12, d: 4 },
  rightLeg: { u: 0, v: 16, w: 4, h: 12, d: 4 },
  leftLeg: { u: 16, v: 48, w: 4, h: 12, d: 4 },
} as const;
