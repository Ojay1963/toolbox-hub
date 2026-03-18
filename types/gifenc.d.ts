declare module "gifenc" {
  export type GifPalette = number[][];

  export function GIFEncoder(): {
    writeFrame(
      index: Uint8Array | number[],
      width: number,
      height: number,
      options: {
        palette: GifPalette;
        delay?: number;
      },
    ): void;
    finish(): void;
    bytesView(): Uint8Array;
  };

  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
  ): GifPalette;

  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: GifPalette,
  ): Uint8Array;
}
