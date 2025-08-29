import React, { useRef, useEffect, useState, memo, useMemo, useCallback } from "react";
import { useDevice } from "../../state/DeviceContext";

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
    const { isMobile } = useDevice();
    const [fps, setFps] = useState(60);
    const [avgFps, setAvgFps] = useState(60);
    const [minFps, setMinFps] = useState(60);
    const [maxFps, setMaxFps] = useState(60);

    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const fpsHistory = useRef<number[]>([]);
    const animationId = useRef<number | undefined>(undefined);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Memoize mobile-optimized dimensions to prevent recalculation
    const mobileGraphDimensions = useMemo(() => ({
      width: Math.min(graphWidth * 0.8, 110),
      height: Math.min(graphHeight * 0.8, 48)
    }), [graphWidth, graphHeight]);

    // Memoize position styles to prevent object recreation
    const positionStyles = useMemo(() => ({
      "top-left": { top: 10, left: 10 },
      "top-right": { top: 10, right: 10 },
      "bottom-left": { bottom: 10, left: 10 },
      "bottom-right": { bottom: 10, right: 10 },
    }), []);

    const mobilePositionStyles = useMemo(() => ({
      "top-left": { top: 8, left: 8 },
      "top-right": { top: 8, right: 8 },
      "bottom-left": { bottom: 8, left: 8 },
      "bottom-right": { bottom: 8, right: 8 },
    }), []);

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
    }, [historySize, isMobile]);

    // Draw the FPS history graph on the canvas
    const drawGraph = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid with mobile-optimized spacing
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 0.5;

      // Adjust grid spacing for mobile
      const horizontalSpacing = isMobile ? 12 : 15;
      const verticalSpacing = isMobile ? 15 : 20;

      // Horizontal grid lines
      for (let i = 0; i <= canvas.height; i += horizontalSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= canvas.width; i += verticalSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Don't draw the graph if we don't have enough data points
      if (fpsHistory.current.length <= 1) return;

      // Find the max value for scaling (minimum 60 to keep scale consistent)
      const maxValue = Math.max(60, ...fpsHistory.current);

      // Draw the FPS line with mobile-optimized width
      ctx.lineWidth = isMobile ? 1.5 : 2;
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

    // Memoize color calculation to prevent recalculation
    const getColor = useCallback((fps: number) => {
      if (fps >= warningThreshold) return "#00ff00"; // Green
      if (fps >= criticalThreshold) return "#ffaa00"; // Orange
      return "#ff0000"; // Red
    }, [warningThreshold, criticalThreshold]);

    // Mobile variant - shows only current FPS and graph
    if (isMobile) {

      return (
        <div
          style={{
            position: "absolute",
            ...mobilePositionStyles[position],
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "#ffffff",
            padding: "6px 8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "11px",
            lineHeight: "1.2",
            minWidth: "90px",
            maxWidth: "120px",
            zIndex: 100, /* Reduced to ensure it's below the hamburger menu (z-index: 9999) */
            pointerEvents: "none",
            userSelect: "none",
            // Ensure readability on mobile
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{ 
              marginBottom: "4px", 
              fontSize: "12px", 
              fontWeight: "bold",
              textAlign: "center"
            }}
          >
            FPS: <span style={{ color: getColor(fps) }}>{fps}</span>
          </div>

          <div style={{ marginTop: "6px", display: "flex", justifyContent: "center" }}>
            <canvas
              ref={canvasRef}
              width={mobileGraphDimensions.width}
              height={mobileGraphDimensions.height}
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderRadius: "2px",
                // Ensure canvas is touch-friendly (though it's non-interactive)
                touchAction: "none",
              }}
            />
          </div>

          {fps < criticalThreshold && (
            <div
              style={{
                marginTop: "3px",
                padding: "2px 4px",
                backgroundColor: "rgba(255, 0, 0, 0.4)",
                borderRadius: "2px",
                fontSize: "9px",
                textAlign: "center",
              }}
            >
              ⚠️ Low Performance
            </div>
          )}
        </div>
      );
    }

    // Desktop variant - maintains existing full display with all metrics
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
          zIndex: 100, /* Reduced to ensure it's below the hamburger menu (z-index: 9999) */
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
