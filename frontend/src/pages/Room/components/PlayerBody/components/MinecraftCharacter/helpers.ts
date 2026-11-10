import {
  BoxGeometry,
  CanvasTexture,
  NearestFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import {
  MINECRAFT_PIXEL_SCALE,
  SKIN_TEXTURE_SIZE,
} from "./consts";
import type { MinecraftBoxRegion } from "./types";

const setFaceUv = (
  uvArray: Float32Array,
  faceIndex: number,
  px: number,
  py: number,
  pw: number,
  ph: number,
) => {
  const u0 = px / SKIN_TEXTURE_SIZE;
  const u1 = (px + pw) / SKIN_TEXTURE_SIZE;
  const v1 = 1 - py / SKIN_TEXTURE_SIZE;
  const v0 = 1 - (py + ph) / SKIN_TEXTURE_SIZE;

  const offset = faceIndex * 8;
  // Vertex 0: top-left
  uvArray[offset + 0] = u0;
  uvArray[offset + 1] = v1;
  // Vertex 1: top-right
  uvArray[offset + 2] = u1;
  uvArray[offset + 3] = v1;
  // Vertex 2: bottom-left
  uvArray[offset + 4] = u0;
  uvArray[offset + 5] = v0;
  // Vertex 3: bottom-right
  uvArray[offset + 6] = u1;
  uvArray[offset + 7] = v0;
};

/**
 * Builds a BoxGeometry scaled to world units whose 6 faces map to a standard
 * 64x64 Minecraft skin region (u, v, w, h, d).
 */
export const createMinecraftBoxGeometry = (
  region: MinecraftBoxRegion,
): BoxGeometry => {
  const { w, h, d, u, v } = region;
  const geometry = new BoxGeometry(
    w * MINECRAFT_PIXEL_SCALE,
    h * MINECRAFT_PIXEL_SCALE,
    d * MINECRAFT_PIXEL_SCALE,
  );

  const uvAttr = geometry.attributes.uv;
  const uvArray = uvAttr.array as Float32Array;

  // 0: +X (Character Left side when facing +Z)
  setFaceUv(uvArray, 0, u + d + w, v + d, d, h);
  // 1: -X (Character Right side when facing +Z)
  setFaceUv(uvArray, 1, u, v + d, d, h);
  // 2: +Y (Top)
  setFaceUv(uvArray, 2, u + d, v, w, d);
  // 3: -Y (Bottom)
  setFaceUv(uvArray, 3, u + d + w, v, w, d);
  // 4: +Z (Front)
  setFaceUv(uvArray, 4, u + d, v + d, w, h);
  // 5: -Z (Back)
  setFaceUv(uvArray, 5, u + d + w + d, v + d, w, h);

  uvAttr.needsUpdate = true;
  return geometry;
};

export const configureMinecraftSkinTexture = (texture: Texture): Texture => {
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
};

/**
 * Generates a 64x64 pixel-art gray Minecraft skin texture on an offscreen canvas.
 * Matches the official 64x64 Minecraft skin layout so any user-provided 64x64 PNG
 * can swap in seamlessly.
 */
export const createDefaultGraySkinTexture = (): CanvasTexture => {
  const canvas = document.createElement("canvas");
  canvas.width = SKIN_TEXTURE_SIZE;
  canvas.height = SKIN_TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  const fillRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  // Base fallback fill
  fillRect(0, 0, 64, 64, "#8c939b");

  // --- HEAD (u=0, v=0, w=8, h=8, d=8) ---
  // Top & Bottom of head
  fillRect(8, 0, 8, 8, "#565c64"); // Top hair
  fillRect(16, 0, 8, 8, "#7b828a"); // Chin/bottom
  // Right, Front, Left, Back of head
  fillRect(0, 8, 32, 8, "#9aa1a9"); // Base gray skin
  // Hair cap across sides and back
  fillRect(0, 8, 32, 2, "#565c64");
  fillRect(0, 10, 2, 2, "#565c64");
  fillRect(22, 10, 10, 3, "#565c64");
  // Face details on Front (x: 8..16, y: 8..16)
  fillRect(9, 11, 2, 1, "#3b4046"); // Right eyebrow
  fillRect(13, 11, 2, 1, "#3b4046"); // Left eyebrow
  fillRect(9, 12, 1, 1, "#f0f4f8"); // Right eye sclera
  fillRect(10, 12, 1, 1, "#25292e"); // Right pupil
  fillRect(13, 12, 1, 1, "#25292e"); // Left pupil
  fillRect(14, 12, 1, 1, "#f0f4f8"); // Left eye sclera
  fillRect(11, 13, 2, 1, "#7b828a"); // Nose
  fillRect(10, 14, 4, 1, "#494f56"); // Mouth

  // --- TORSO / BODY (u=16, v=16, w=8, h=12, d=4) ---
  fillRect(20, 16, 8, 4, "#6c737b"); // Top shoulder
  fillRect(28, 16, 8, 4, "#525860"); // Bottom torso
  fillRect(16, 20, 24, 12, "#6c737b"); // Jacket gray
  // Shirt collar & center seam on Front (x: 20..28, y: 20..32)
  fillRect(22, 20, 4, 2, "#adb4bc");
  fillRect(23, 22, 2, 10, "#596068");
  fillRect(16, 30, 24, 2, "#525860"); // Belt/hem

  // --- RIGHT ARM (u=40, v=16, w=4, h=12, d=4) ---
  fillRect(44, 16, 4, 4, "#6c737b"); // Top shoulder
  fillRect(48, 16, 4, 4, "#9aa1a9"); // Bottom hand
  fillRect(40, 20, 16, 9, "#737a82"); // Sleeve
  fillRect(40, 28, 16, 1, "#596068"); // Cuff
  fillRect(40, 29, 16, 3, "#9aa1a9"); // Hand

  // --- LEFT ARM (u=32, v=48, w=4, h=12, d=4) ---
  fillRect(36, 48, 4, 4, "#6c737b"); // Top shoulder
  fillRect(40, 48, 4, 4, "#9aa1a9"); // Bottom hand
  fillRect(32, 52, 16, 9, "#737a82"); // Sleeve
  fillRect(32, 60, 16, 1, "#596068"); // Cuff
  fillRect(32, 61, 16, 3, "#9aa1a9"); // Hand

  // --- RIGHT LEG (u=0, v=16, w=4, h=12, d=4) ---
  fillRect(4, 16, 4, 4, "#4e545c"); // Top hip
  fillRect(8, 16, 4, 4, "#2f343a"); // Bottom boot sole
  fillRect(0, 20, 16, 9, "#4e545c"); // Pants
  fillRect(0, 29, 16, 3, "#363b42"); // Boot

  // --- LEFT LEG (u=16, v=48, w=4, h=12, d=4) ---
  fillRect(20, 48, 4, 4, "#4e545c"); // Top hip
  fillRect(24, 48, 4, 4, "#2f343a"); // Bottom boot sole
  fillRect(16, 52, 16, 9, "#4e545c"); // Pants
  fillRect(16, 61, 16, 3, "#363b42"); // Boot

  const texture = new CanvasTexture(canvas);
  configureMinecraftSkinTexture(texture);
  return texture;
};

export const loadCustomSkinTexture = (
  url: string,
  onLoad: (texture: Texture) => void,
) => {
  const loader = new TextureLoader();
  loader.setCrossOrigin("anonymous");
  loader.load(url, (loaded) => {
    onLoad(configureMinecraftSkinTexture(loaded));
  });
};
