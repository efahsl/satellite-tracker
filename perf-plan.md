## Performance Tiers Implementation

### Overview
Implement 3 performance tiers (High, Medium, Low) with manual controls to allow users to adjust visual quality based on their device capabilities and preferences.

### Performance Tier Controls
- Add a performance tier selector component with 3 buttons (High/Medium/Low)
- Store current tier in global state (ISSContext)
- Provide visual feedback for current tier selection
- Allow real-time switching between tiers

### Tier-Specific Settings

#### High Performance Tier
- **Earth Rendering**: Full shader effects, normal maps, specular maps
- **ISS Trail**: Maximum trail length (300 points), full tube geometry (8 segments)
- **Lighting**: Dynamic shadows, multiple light sources, atmospheric effects
- **Textures**: High-resolution textures, all texture maps enabled
- **Animation**: Smooth 60fps animations, complex shader calculations
- **Update Frequency**: Real-time updates (5 seconds)
- **City Effects**: Full city lighting with glow effects
- **Sun**: Detailed sun model with corona effects

#### Medium Performance Tier
- **Earth Rendering**: Simplified shader, basic lighting effects
- **ISS Trail**: Reduced trail length (150 points), simplified geometry (4 segments)
- **Lighting**: Basic directional lighting, no shadows
- **Textures**: Medium-resolution textures, essential maps only
- **Animation**: 30fps target, simplified calculations
- **Update Frequency**: Moderate updates (10 seconds)
- **City Effects**: Basic city highlighting
- **Sun**: Simple sun sphere

#### Low Performance Tier
- **Earth Rendering**: Basic material, no shader effects
- **ISS Trail**: Minimal trail (50 points), basic line geometry
- **Lighting**: Single ambient light only
- **Textures**: Low-resolution textures, day map only
- **Animation**: 15fps target, minimal calculations
- **Update Frequency**: Reduced updates (30 seconds)
- **City Effects**: Disabled
- **Sun**: Disabled

### Implementation Components

#### 1. Performance Context
```typescript
// src/state/PerformanceContext.tsx
interface PerformanceState {
  tier: 'high' | 'medium' | 'low';
  settings: PerformanceSettings;
}

interface PerformanceSettings {
  earthQuality: 'high' | 'medium' | 'low';
  trailLength: number;
  trailSegments: number;
  shadowEnabled: boolean;
  textureQuality: 'high' | 'medium' | 'low';
  animationFPS: number;
  updateInterval: number;
  cityEffects: boolean;
  sunEnabled: boolean;
}
```

#### 2. Performance Controls Component
```typescript
// src/components/Controls/PerformanceControls.tsx
- Three-tier button layout
- Visual indicators for current tier
- Real-time switching capability
- Performance impact preview
```

#### 3. Tier-Specific Constants
```typescript
// src/utils/performanceTiers.ts
export const PERFORMANCE_TIERS = {
  high: {
    earthQuality: 'high',
    trailLength: 300,
    trailSegments: 8,
    shadowEnabled: true,
    textureQuality: 'high',
    animationFPS: 60,
    updateInterval: 5000,
    cityEffects: true,
    sunEnabled: true
  },
  medium: {
    // Medium settings
  },
  low: {
    // Low settings
  }
};
```

#### 4. Component Adaptations
- **Earth.tsx**: Conditional shader/material loading
- **ISS-Enhanced.tsx**: Dynamic trail geometry creation
- **Globe.tsx**: Conditional component rendering
- **Sun.tsx**: Conditional sun rendering

### Technical Implementation Steps

#### Phase 1: Foundation
1. Create PerformanceContext with tier state management
2. Implement PerformanceControls component
3. Define tier-specific constants
4. Add performance tier to main layout

#### Phase 2: Component Adaptation
1. Modify Earth component for tier-based rendering
2. Adapt ISS-Enhanced component for dynamic trail settings
3. Update Globe component for conditional rendering
4. Implement Sun component tier support

#### Phase 3: Optimization
1. Add performance monitoring
2. Implement smooth tier transitions
3. Add tier-specific loading states
4. Optimize texture loading per tier

#### Phase 4: Testing & Refinement
1. Test on various devices
2. Measure performance impact
3. Fine-tune tier settings
4. Add user feedback mechanisms

### Performance Monitoring
- FPS monitoring per tier
- Memory usage tracking
- Load time measurements
- User preference storage

### User Experience
- Clear visual distinction between tiers
- Smooth transitions when switching
- Performance impact indicators
- Automatic tier suggestions based on device

### Future Enhancements
- Automatic tier detection based on device performance
- Custom tier settings
- Performance analytics
- Tier-specific feature toggles
