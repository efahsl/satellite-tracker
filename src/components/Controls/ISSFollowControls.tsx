import { useISS } from "../../state/ISSContext";
import { useDevice } from "../../state/DeviceContext";
import { useUI } from "../../state/UIContext";
import { ToggleButton } from "../UI/ToggleButton";
import styles from "./ISSFollowControls.module.css";

interface ISSFollowControlsProps {
  className?: string;
}

export function ISSFollowControls({ className = "" }: ISSFollowControlsProps) {
  const { state, dispatch } = useISS();
  const { isTVProfile } = useDevice();
  const { closeHamburgerMenuForManual } = useUI();

  const handleToggleFollow = () => {
    dispatch({ type: "TOGGLE_FOLLOW_ISS" });
  };

  const handleToggleEarthRotate = () => {
    dispatch({ type: "TOGGLE_EARTH_ROTATE" });
  };

  const handleSetManualMode = () => {
    dispatch({ type: "SET_MANUAL_MODE" });
    // Close hamburger menu when manual mode is activated (TV mode only)
    if (isTVProfile) {
      closeHamburgerMenuForManual();
    }
  };

  return (
    <div className={`${styles.issFollowControls} ${isTVProfile ? 'tv-typography' : ''} ${className}`}>
      <div className={styles.header}>
        <h3>Camera Tracking</h3>
        {!isTVProfile && (
        <p className={styles.description}>
          {state.followISS
            ? "Camera is automatically tracking the ISS"
            : state.earthRotateMode
            ? "Camera is rotating around Earth"
            : "Camera is in manual mode - you can pan and zoom freely"}
        </p>
)}
      </div>

      <div className={styles.buttonContainer}>
        <ToggleButton
          isActive={state.followISS}
          onClick={handleToggleFollow}
          activeText="Following ISS"
          inactiveText="Follow ISS"
          ariaLabel={`${state.followISS ? 'Stop following' : 'Start following'} the ISS`}
          isTVMode={isTVProfile}
        />

        <ToggleButton
          isActive={state.earthRotateMode}
          onClick={handleToggleEarthRotate}
          activeText="Earth Rotating"
          inactiveText="Earth Rotate"
          ariaLabel={`${state.earthRotateMode ? 'Stop' : 'Start'} Earth rotation mode`}
          isTVMode={isTVProfile}
        />

        <ToggleButton
          isActive={!state.followISS && !state.earthRotateMode}
          onClick={handleSetManualMode}
          activeText="Manual"
          inactiveText="Manual"
          ariaLabel={`${!state.followISS && !state.earthRotateMode ? 'Exit' : 'Enter'} manual camera mode`}
          isTVMode={isTVProfile}
        />
      </div>
    </div>
  );
}
