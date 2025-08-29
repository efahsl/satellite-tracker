import { useState } from "react";
import {
  usePerformance,
  PerformanceTier,
} from "../../state/PerformanceContext";
import { useDevice } from "../../state/DeviceContext";
import { ToggleButton } from "../UI/ToggleButton";
import styles from "./PerformanceControls.module.css";

interface PerformanceControlsProps {
  className?: string;
}

export function PerformanceControls({
  className = "",
}: PerformanceControlsProps) {
  const { state, setTier } = usePerformance();
  const { tier } = state;
  const { isTV } = useDevice();
  const [showDetails, setShowDetails] = useState(true);

  const handleTierChange = (newTier: PerformanceTier) => {
    if (newTier !== tier) {
      setTier(newTier);
    }
  };

  const getTierLabel = (tier: PerformanceTier) => {
    switch (tier) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return tier;
    }
  };

  const getTierDescription = (tier: PerformanceTier) => {
    switch (tier) {
      case "high":
        return "Best quality, high performance impact";
      case "medium":
        return "Balanced quality and performance";
      case "low":
        return "Basic quality, minimal performance impact";
      default:
        return "";
    }
  };

  const getTierDetails = (tier: PerformanceTier) => {
    const settings = state.settings;
    return [
      { label: "Earth Quality", value: settings.earthQuality },
      { label: "Trail Length", value: `${settings.trailLength} points` },
      { label: "Trail Segments", value: settings.trailSegments },
      { label: "Shadows", value: settings.shadowEnabled ? "On" : "Off" },
      { label: "Texture Quality", value: settings.textureQuality },
      { label: "Animation FPS", value: settings.animationFPS },
      { label: "Update Interval", value: `${settings.updateInterval}ms` },
      { label: "City Effects", value: settings.cityEffects ? "On" : "Off" },
      { label: "Sun", value: settings.sunEnabled ? "On" : "Off" },
    ];
  };

  return (
    <div className={`${styles.performanceControls} ${className}`}>
      <div className={styles.header}>
        <h3>Performance Tier</h3>
        {!isTV && (
        <p className={styles.description}>{getTierDescription(tier)}</p>
        )}
      </div>

      <div className={styles.buttons}>
        {(["high", "medium", "low"] as PerformanceTier[]).map((tierOption) => (
          <ToggleButton
            key={tierOption}
            isActive={tier === tierOption}
            onClick={() => handleTierChange(tierOption)}
            activeText={getTierLabel(tierOption)}
            inactiveText={getTierLabel(tierOption)}
            ariaLabel={`Set performance tier to ${getTierLabel(tierOption)}: ${getTierDescription(tierOption)}`}
          />
        ))}
      </div>
      {/* Details Toggle - Hidden in TV mode */}
      {!isTV && (
        <div className={styles.detailsToggle}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={styles.detailsButton}
          >
            <span>{showDetails ? "Hide" : "Show"} Details</span>
            <span
              className={`${styles.detailsArrow} ${
                showDetails ? styles.detailsArrowExpanded : ""
              }`}
            >
              ▼
            </span>
          </button>
        </div>
      )}

      {/* Details Section */}
      {!isTV && showDetails && (
        <div className={styles.details}>
          <h4 className={styles.detailsTitle}>Current Tier Settings</h4>
          <div className={styles.detailsGrid}>
            {getTierDetails(tier).map((detail, index) => (
              <div key={index} className={styles.detailItem}>
                <span className={styles.detailLabel}>{detail.label}:</span>
                <span className={styles.detailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
