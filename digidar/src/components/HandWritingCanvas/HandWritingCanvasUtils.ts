type Point = { x: number; y: number };
export type Stroke = Point[];

export interface HandwritingCanvasHandle {
  exportPngBlob: () => Promise<Blob>;
  clear: () => void;
  undo: () => void;
}

export interface HandwritingCanvasProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  onHasInkChange?: (hasInk: boolean) => void;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): Point {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  return { x, y };
}

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  strokeWidth: number,
  strokeColor: string,
): void {
  if (stroke.length === 0) return;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(stroke[0].x, stroke[0].y);
  for (let i = 1; i < stroke.length; i++) {
    ctx.lineTo(stroke[i].x, stroke[i].y);
  }
  ctx.stroke();
}