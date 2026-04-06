import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  Stroke,
  HandwritingCanvasHandle,
  HandwritingCanvasProps,
} from "./HandWritingCanvasUtils";

import { clamp, getCanvasPoint, drawStroke } from "./HandWritingCanvasUtils";

const HandwritingCanvas = forwardRef<
  HandwritingCanvasHandle,
  HandwritingCanvasProps
>(function HandwritingCanvas(
  {
    width = 520,
    height = 220,
    strokeWidth = 5,
    strokeColor = "#111",
    backgroundColor = "#fff",
    disabled = false,
    onHasInkChange,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeStroke, setActiveStroke] = useState<Stroke>([]);

  const hasInk = useMemo(
    () => strokes.length > 0 || activeStroke.length > 0,
    [strokes, activeStroke],
  );

  useEffect(() => {
    onHasInkChange?.(hasInk);
  }, [hasInk, onHasInkChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      drawStroke(ctx, stroke, strokeWidth, strokeColor);
    }
    drawStroke(ctx, activeStroke, strokeWidth, strokeColor);
  }, [
    strokes,
    activeStroke,
    width,
    height,
    strokeWidth,
    strokeColor,
    backgroundColor,
  ]);

  const clear = () => {
    if (disabled) return;
    setStrokes([]);
    setActiveStroke([]);
    setIsDrawing(false);
  };

  const undo = () => {
    if (disabled) return;
    setStrokes((prev) => prev.slice(0, -1));
  };

  const exportPngBlob = async (): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas not ready");

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Failed to export PNG"));
        else resolve(blob);
      }, "image/png");
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const p = getCanvasPoint(canvas, e.clientX, e.clientY);
    setActiveStroke([
      { x: clamp(p.x, 0, canvas.width), y: clamp(p.y, 0, canvas.height) },
    ]);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || !isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const p = getCanvasPoint(canvas, e.clientX, e.clientY);
    setActiveStroke((prev) => [
      ...prev,
      { x: clamp(p.x, 0, canvas.width), y: clamp(p.y, 0, canvas.height) },
    ]);
  };

  const finishStroke = () => {
    if (disabled) return;
    setIsDrawing(false);
    setStrokes((prev) =>
      activeStroke.length > 0 ? [...prev, activeStroke] : prev,
    );
    setActiveStroke([]);
  };

  useImperativeHandle(ref, () => ({ exportPngBlob, clear, undo }), [
    exportPngBlob,
  ]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        style={{
          width,
          height,
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.2)",
          background: backgroundColor,
          touchAction: "none",
          cursor: disabled ? "not-allowed" : "crosshair",
          opacity: disabled ? 0.6 : 1,
          userSelect: "none",
          display: "block",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          type="button"
          onClick={undo}
          disabled={disabled || strokes.length === 0}
        >
          Undo
        </button>
        <button type="button" onClick={clear} disabled={disabled || !hasInk}>
          Clear
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
          Tip: write dark & large for best OCR
        </span>
      </div>
    </div>
  );
});

export default HandwritingCanvas;
