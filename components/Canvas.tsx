import React, { useRef, useLayoutEffect, useImperativeHandle, forwardRef, useState, useEffect } from 'react';

export interface CanvasRef {
  clear: () => void;
  undo: () => void;
  getImageDataUrl: () => string | undefined;
}

interface CanvasProps {
  characterToTrace: string;
  onDrawingChange?: (isEmpty: boolean) => void;
}

type Point = { x: number; y: number };
type Path = Point[];

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ characterToTrace, onDrawingChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const dimensionsRef = useRef({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    onDrawingChange?.(paths.length === 0);
  }, [paths, onDrawingChange]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (!canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      dimensionsRef.current = { width: rect.width, height: rect.height, dpr };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Redraw everything after resizing
      redraw();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const redraw = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;

    const { width, height, dpr } = dimensionsRef.current;
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(dpr, dpr);

    // Draw the faint character trace
    const numChars = characterToTrace.length || 1;
    const maxCharWidth = width / numChars;
    // The font size should be limited by both the available height and the width per character.
    const baseSize = Math.min(height, maxCharWidth);
    const fontSize = baseSize * 0.8; // Use 80% of the available space for padding

    context.font = `${fontSize}px sans-serif`;
    context.fillStyle = '#EAEAEA';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(characterToTrace, width / 2, height / 2);

    // Draw the user's paths
    context.strokeStyle = '#333333';
    context.lineWidth = 10;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    paths.forEach(path => {
      if (path.length < 2) return;
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        context.lineTo(path[i].x, path[i].y);
      }
      context.stroke();
    });
  };
  
  // Redraw whenever the paths change
  useLayoutEffect(redraw, [paths, characterToTrace]);

  const getCoords = (e: React.PointerEvent): Point => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const point = getCoords(e);
    setPaths(prev => [...prev, [point]]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const point = getCoords(e);
    // FIX: Use an immutable update pattern to ensure React detects the change.
    setPaths(prevPaths => {
      const newPaths = [...prevPaths];
      const lastPath = newPaths[newPaths.length - 1];
      const newLastPath = [...lastPath, point];
      newPaths[newPaths.length - 1] = newLastPath;
      return newPaths;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDrawing(false);
  };

  useImperativeHandle(ref, () => ({
    clear: () => setPaths([]),
    undo: () => setPaths(prev => prev.slice(0, -1)),
    getImageDataUrl: (): string | undefined => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a temporary canvas to draw without the grid and trace
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        const { width, height, dpr } = dimensionsRef.current;
        tempCanvas.width = width * dpr;
        tempCanvas.height = height * dpr;
        tempCtx.scale(dpr, dpr);
        
        // Only draw the user paths
        tempCtx.strokeStyle = '#333333';
        tempCtx.lineWidth = 10;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        paths.forEach(path => {
            if (path.length < 2) return;
            tempCtx.beginPath();
            tempCtx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                tempCtx.lineTo(path[i].x, path[i].y);
            }
            tempCtx.stroke();
        });

        return tempCanvas.toDataURL('image/png');
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
});

Canvas.displayName = "Canvas";

export default Canvas;