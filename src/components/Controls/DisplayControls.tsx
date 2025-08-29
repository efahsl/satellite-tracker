import { memo, useCallback } from "react";
import { useUI } from "../../state/UIContext";
import { useDevice } from "../../state/DeviceContext";
import { ToggleButton } from "../UI/ToggleButton";
import styles from "./DisplayControls.module.css";

interface DisplayControlsProps {
  className?: string;
}

export const DisplayControls = memo<DisplayControlsProps>(
  ({ className = "" }) => {
    const { state, toggleFPSMonitor, toggleInfoPanel } = useUI();
    const { isTV, isTVProfile } = useDevice();

    const handleFPSToggle = useCallback(() => {
      toggleFPSMonitor();
    }, [toggleFPSMonitor]);

    const handleInfoToggle = useCallback(() => {
      toggleInfoPanel();
    }, [toggleInfoPanel]);

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
          <ToggleButton
            isActive={state.fpsMonitorVisible}
            onClick={handleFPSToggle}
            activeText="FPS Stats ON"
            inactiveText="FPS Stats OFF"
            ariaLabel={`${
              state.fpsMonitorVisible ? "Hide" : "Show"
            } FPS statistics monitor`}
            isTVMode={isTVProfile}
          />

          <ToggleButton
            isActive={state.infoPanelVisible}
            onClick={handleInfoToggle}
            activeText="Position Info ON"
            inactiveText="Position Info OFF"
            ariaLabel={`${
              state.infoPanelVisible ? "Hide" : "Show"
            } ISS position information panel`}
            isTVMode={isTVProfile}
          />
        </div>
      </div>
    );
  }
);

DisplayControls.displayName = "DisplayControls";
