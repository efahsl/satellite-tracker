import React from "react";
import { useISS } from "../../state/ISSContext";
import { useDevice } from "../../state/DeviceContext";
import styles from "./ISSFollowControls.module.css";

interface ISSFollowControlsProps {
  className?: string;
}

export function ISSFollowControls({ className = "" }: ISSFollowControlsProps) {
  const { state, dispatch } = useISS();
  const { isTVProfile } = useDevice();

  const handleToggleFollow = () => {
    dispatch({ type: "TOGGLE_FOLLOW_ISS" });
  };

  const handleToggleEarthRotate = () => {
    dispatch({ type: "TOGGLE_EARTH_ROTATE" });
  };

  const handleSetManualMode = () => {
    dispatch({ type: "SET_MANUAL_MODE" });
  };

  return (
    <div className={`${styles.issFollowControls} ${isTVProfile ? 'tv-typography' : ''} ${className}`}>
      <div className={styles.header}>
        <h3>Camera Tracking</h3>
        <p className={styles.description}>
          {state.followISS
            ? "Camera is automatically tracking the ISS"
            : state.earthRotateMode
            ? "Camera is rotating around Earth"
            : "Camera is in manual mode - you can pan and zoom freely"}
        </p>
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={handleToggleFollow}
          className={`${styles.button} ${
            state.followISS ? styles.buttonActive : ""
          } ${isTVProfile ? 'tv-button tv-focus-indicator' : ''}`}
        >
          <span className={styles.buttonLabel}>
            {state.followISS ? "Following ISS" : "Follow ISS"}
          </span>
          {state.followISS && (
            <span className={styles.buttonIndicator}>✓</span>
          )}
        </button>

        <button
          onClick={handleToggleEarthRotate}
          className={`${styles.button} ${
            state.earthRotateMode
              ? styles.buttonActiveEarthRotate
              : ""
          } ${isTVProfile ? 'tv-button tv-focus-indicator' : ''}`}
        >
          <span className={styles.buttonLabel}>
            {state.earthRotateMode ? "Earth Rotating" : "Earth Rotate"}
          </span>
          {state.earthRotateMode && (
            <span className={styles.buttonIndicator}>✓</span>
          )}
        </button>

        <button
          onClick={handleSetManualMode}
          className={`${styles.button} ${
            !state.followISS && !state.earthRotateMode
              ? styles.buttonActiveManual
              : ""
          } ${isTVProfile ? 'tv-button tv-focus-indicator' : ''}`}
        >
          <span className={styles.buttonLabel}>
            Manual
          </span>
          {!state.followISS && !state.earthRotateMode && (
            <span className={styles.buttonIndicator}>✓</span>
          )}
        </button>
      </div>
    </div>
  );
}
