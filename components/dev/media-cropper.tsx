'use client';

/**
 * Pan-and-zoom framing surface shared by the dev editors.
 *
 * Renders a 16/9 stage with an optional safe-area guide, and hands back a
 * `getCrop()` that rasterises the current framing at export resolution.
 */

import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';

export type CropperHandle = {
  /** Current framing as a JPEG data URL, or null when no image is loaded. */
  getCrop: () => string | null;
  reset: () => void;
};

type Props = {
  /** Image URL to frame. */
  src: string | null;
  stageWidth?: number;
  exportWidth?: number;
  /** Aspect of the guide drawn on top, e.g. 1.25 for the blog card. Omit for none. */
  safeAreaRatio?: number;
  safeAreaLabel?: string;
  onLoad?: (image: HTMLImageElement) => void;
  onError?: (message: string) => void;
};

export const MediaCropper = forwardRef<CropperHandle, Props>(function MediaCropper(
  {
    src,
    stageWidth = 720,
    exportWidth = 1920,
    safeAreaRatio,
    safeAreaLabel = 'safe area',
    onLoad,
    onError,
  },
  ref,
) {
  const stageHeight = Math.round((stageWidth * 9) / 16);
  const exportHeight = Math.round((exportWidth * 9) / 16);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }
    const next = new Image();
    next.crossOrigin = 'anonymous';
    next.onload = () => {
      setImage(next);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      onLoad?.(next);
    };
    next.onerror = () => onError?.(`Could not load ${src}`);
    next.src = src;
    // onLoad / onError are event sinks, re-running on their identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const baseScale = useMemo(() => {
    if (!image) return 1;
    return Math.max(stageWidth / image.naturalWidth, stageHeight / image.naturalHeight);
  }, [image, stageWidth, stageHeight]);

  const paint = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, ratio: number) => {
      ctx.fillStyle = '#f2f2ed';
      ctx.fillRect(0, 0, width, height);
      if (!image) return;
      const scale = baseScale * zoom * ratio;
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, (width - w) / 2 + offset.x * ratio, (height - h) / 2 + offset.y * ratio, w, h);
    },
    [image, baseScale, zoom, offset],
  );

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) paint(ctx, stageWidth, stageHeight, 1);
  }, [paint, stageWidth, stageHeight]);

  useImperativeHandle(
    ref,
    () => ({
      getCrop: () => {
        if (!image) return null;
        const out = document.createElement('canvas');
        out.width = exportWidth;
        out.height = exportHeight;
        const ctx = out.getContext('2d');
        if (!ctx) return null;
        paint(ctx, exportWidth, exportHeight, exportWidth / stageWidth);
        return out.toDataURL('image/jpeg', 0.9);
      },
      reset: () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      },
    }),
    [image, paint, exportWidth, exportHeight, stageWidth],
  );

  // Non-passive so the page does not scroll while zooming.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((z) => Math.min(6, Math.max(1, z * (event.deltaY > 0 ? 0.94 : 1.06))));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="mc">
      <div className="mc-stage" style={{ width: stageWidth }}>
        <canvas
          ref={canvasRef}
          width={stageWidth}
          height={stageHeight}
          onPointerDown={(event) => {
            if (!image) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag) return;
            setOffset({
              x: drag.ox + (event.clientX - drag.x),
              y: drag.oy + (event.clientY - drag.y),
            });
          }}
          onPointerUp={(event) => {
            if (dragRef.current) event.currentTarget.releasePointerCapture(event.pointerId);
            dragRef.current = null;
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
        />
        {safeAreaRatio ? (
          <div className="mc-safe" style={{ width: stageHeight * safeAreaRatio }} aria-hidden="true">
            <span>{safeAreaLabel}</span>
          </div>
        ) : null}
      </div>

      <div className="mc-controls">
        <label>
          Zoom
          <input
            type="range"
            min={1}
            max={6}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <output>{zoom.toFixed(2)}x</output>
        </label>
        <button
          type="button"
          className="mc-reset"
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          Reset framing
        </button>
      </div>
    </div>
  );
});
