import React from "react";
import { useISS } from "../../state/ISSContext";
import "./ISSFollowControls.css";

interface ISSFollowControlsProps {
  className?: string;
}

export function ISSFollowControls({ className = "" }: ISSFollowControlsProps) {
  const { state, dispatch } = useISS();

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
    <div className={`iss-follow-controls ${className}`}>
      <div className="iss-follow-controls__header">
        <h3>Camera Tracking</h3>
        <p className="iss-follow-controls__description">
          {state.followISS
            ? "Camera is automatically tracking the ISS"
            : state.earthRotateMode
            ? "Camera is rotating around Earth"
            : "Camera is in manual mode - you can pan and zoom freely"}
        </p>
      </div>

      <div className="iss-follow-controls__button-container">
        <button
          onClick={handleToggleFollow}
          className={`iss-follow-controls__button ${
            state.followISS ? "iss-follow-controls__button--active" : ""
          }`}
        >
          <span className="iss-follow-controls__button-label">
            {state.followISS ? "Following ISS" : "Follow ISS"}
          </span>
          {state.followISS && (
            <span className="iss-follow-controls__button-indicator">✓</span>
          )}
        </button>

        <button
          onClick={handleToggleEarthRotate}
          className={`iss-follow-controls__button ${
            state.earthRotateMode
              ? "iss-follow-controls__button--active-earth-rotate"
              : ""
          }`}
        >
          <span className="iss-follow-controls__button-label">
            {state.earthRotateMode ? "Earth Rotating" : "Earth Rotate"}
          </span>
          {state.earthRotateMode && (
            <span className="iss-follow-controls__button-indicator">✓</span>
          )}
        </button>

        <button
          onClick={handleSetManualMode}
          className={`iss-follow-controls__button ${
            !state.followISS && !state.earthRotateMode
              ? "iss-follow-controls__button--active-manual"
              : ""
          }`}
        >
          <span className="iss-follow-controls__button-label">
            {!state.followISS && !state.earthRotateMode ? "Manual Active" : "Manual"}
          </span>
          {!state.followISS && !state.earthRotateMode && (
            <span className="iss-follow-controls__button-indicator">✓</span>
          )}
        </button>
      </div>
    </div>
  );
}
