import React, { useRef, useEffect, useState, memo } from "react";

interface FPSMonitorProps {
  warningThreshold?: number;
  criticalThreshold?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  graphWidth?: number;
  graphHeight?: number;
  historySize?: number;
}

const FPSMonitor: React.FC<FPSMonitorProps> = memo(
  ({
    warningThreshold = 30,
    criticalThreshold = 20,
    position = "top-right",
    graphWidth = 140,
    graphHeight = 60,
    historySize = 80,
  }) => {
    const [fps, setFps] = useState(60);
    const [avgFps, setAvgFps] = useState(60);
    const [minFps, setMinFps] = useState(60);
    const [maxFps, setMaxFps] = useState(60);

    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const fpsHistory = useRef<number[]>([]);
    const animationId = useRef<number | undefined>(undefined);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const measureFPS = () => {
        frameCount.current++;
        const currentTime = performance.now();
        const delta = currentTime - lastTime.current;

        // Update FPS every 250ms
        if (delta >= 250) {
          const currentFps = Math.round((frameCount.current * 1000) / delta);
          setFps(currentFps);

          // Update history
          fpsHistory.current.push(currentFps);
          if (fpsHistory.current.length > historySize) {
            fpsHistory.current.shift();
          }

          // Calculate statistics
          const avg = Math.round(
            fpsHistory.current.reduce((a, b) => a + b, 0) /
              fpsHistory.current.length
          );
          setAvgFps(avg);

          const min = Math.min(...fpsHistory.current);
          const max = Math.max(...fpsHistory.current);
          setMinFps(min);
          setMaxFps(max);

          // Reset counters
          frameCount.current = 0;
          lastTime.current = currentTime;

          // Draw the graph
          drawGraph();
        }

        animationId.current = requestAnimationFrame(measureFPS);
      };

      animationId.current = requestAnimationFrame(measureFPS);

      return () => {
        if (animationId.current) {
          cancelAnimationFrame(animationId.current);
        }
      };
    }, [historySize]);

    // Draw the FPS history graph on the canvas
    const drawGraph = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 0.5;

      // Horizontal grid lines
      for (let i = 0; i <= canvas.height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Don't draw the graph if we don't have enough data points
      if (fpsHistory.current.length <= 1) return;

      // Find the max value for scaling (minimum 60 to keep scale consistent)
      const maxValue = Math.max(60, ...fpsHistory.current);

      // Draw the FPS line
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";

      const history = [...fpsHistory.current];
      const step = canvas.width / (historySize - 1);

      // Draw the line segments with color based on FPS value
      for (let i = 0; i < history.length - 1; i++) {
        const x1 = canvas.width - (history.length - i) * step;
        const y1 = canvas.height - (history[i] / maxValue) * canvas.height;
        const x2 = canvas.width - (history.length - i - 1) * step;
        const y2 = canvas.height - (history[i + 1] / maxValue) * canvas.height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        // Set color based on the FPS value
        ctx.strokeStyle = getColor(history[i]);
        ctx.stroke();
      }

      // Draw threshold lines
      ctx.setLineDash([5, 5]);

      // Warning threshold line
      ctx.strokeStyle = "#ffaa00";
      const warningY =
        canvas.height - (warningThreshold / maxValue) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, warningY);
      ctx.lineTo(canvas.width, warningY);
      ctx.stroke();

      // Critical threshold line
      ctx.strokeStyle = "#ff0000";
      const criticalY =
        canvas.height - (criticalThreshold / maxValue) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, criticalY);
      ctx.lineTo(canvas.width, criticalY);
      ctx.stroke();

      // Reset line dash
      ctx.setLineDash([]);
    };

    // Determine color based on FPS
    const getColor = (fps: number) => {
      if (fps >= warningThreshold) return "#00ff00"; // Green
      if (fps >= criticalThreshold) return "#ffaa00"; // Orange
      return "#ff0000"; // Red
    };

    // Position styles
    const positionStyles = {
      "top-left": { top: 10, left: 10 },
      "top-right": { top: 10, right: 10 },
      "bottom-left": { bottom: 10, left: 10 },
      "bottom-right": { bottom: 10, right: 10 },
    };

    return (
      <div
        style={{
          position: "absolute",
          ...positionStyles[position],
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "#ffffff",
          padding: "10px",
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "12px",
          lineHeight: "1.4",
          minWidth: "120px",
          zIndex: 1000,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{ marginBottom: "5px", fontSize: "14px", fontWeight: "bold" }}
        >
          FPS: <span style={{ color: getColor(fps) }}>{fps}</span>
        </div>
        <div style={{ opacity: 0.8 }}>
          <div>
            Avg: <span style={{ color: getColor(avgFps) }}>{avgFps}</span>
          </div>
          <div>
            Min: <span style={{ color: getColor(minFps) }}>{minFps}</span>
          </div>
          <div>Max: {maxFps}</div>
        </div>

        <div style={{ marginTop: "10px" }}>
          <canvas
            ref={canvasRef}
            width={graphWidth}
            height={graphHeight}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderRadius: "3px",
              marginTop: "5px",
            }}
          />
        </div>

        {fps < criticalThreshold && (
          <div
            style={{
              marginTop: "5px",
              padding: "3px",
              backgroundColor: "rgba(255, 0, 0, 0.3)",
              borderRadius: "3px",
              fontSize: "11px",
            }}
          >
            ⚠️ Low Performance
          </div>
        )}
      </div>
    );
  }
);

export default FPSMonitor;
