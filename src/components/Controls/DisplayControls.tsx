import React from "react";
import { useUI } from "../../state/UIContext";
import { useDevice } from "../../state/DeviceContext";
import styles from "./DisplayControls.module.css";

interface DisplayControlsProps {
  className?: string;
}

export function DisplayControls({ className = "" }: DisplayControlsProps) {
  const { state, toggleFPSMonitor, toggleInfoPanel } = useUI();
  const { isTV } = useDevice();

  return (
    <div className={`${styles.displayControls} ${className}`}>
      <div className={styles.header}>
        <h3>Display Options</h3>
        {!isTV && (
          <p className={styles.description}>
            Control which information panels are visible on screen
          </p>
        )}
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={toggleFPSMonitor}
          className={`${styles.button} ${
            state.fpsMonitorVisible ? styles.buttonActive : ""
          }`}
        >
          <span className={styles.buttonLabel}>
            {state.fpsMonitorVisible ? "FPS Stats ON" : "FPS Stats OFF"}
          </span>
          {state.fpsMonitorVisible && (
            <span className={styles.buttonIndicator}>✓</span>
          )}
        </button>

        <button
          onClick={toggleInfoPanel}
          className={`${styles.button} ${
            state.infoPanelVisible ? styles.buttonActive : ""
          }`}
        >
          <span className={styles.buttonLabel}>
            {state.infoPanelVisible ? "Position Info ON" : "Position Info OFF"}
          </span>
          {state.infoPanelVisible && (
            <span className={styles.buttonIndicator}>✓</span>
          )}
        </button>
      </div>
    </div>
  );
}
