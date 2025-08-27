# 📺 TV App UI/UX Design Guidelines

These are best practices for designing applications for TV platforms. Follow these foundational principles to ensure your app is accessible, readable, and usable on a 10-foot UI.

**Primary Sources:**
- [Amazon Fire TV Design Guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html)
- [Android TV Design Foundations](https://developer.android.com/design/ui/tv/guides/foundations/design-for-tv)

---

## 1. 🧭 Navigation & Focus

- Use **D-pad navigation** with clear visual focus states (borders, scaling, or shadows).
- **Focus Requirements:**
  - Focus indicators must be **at least 4dp thick** and use high contrast colors
  - Focused items should **scale up by 10-15%** or use a distinct border/glow
  - Focus should be **immediately visible** without animation delays
- Avoid ambiguous focus: ensure **only one item is focusable at a time**.
- Use a **predictable and spatial layout**: left/right and up/down movement should map naturally to UI arrangement.
- **Navigation Patterns:**
  - Support **circular navigation** in grids and lists where appropriate
  - Implement **fast scrolling** for long lists (hold direction for acceleration)
  - Use **focus memory** - return to previously focused item when navigating back
- **Remote Control Support:**
  - Primary: D-pad, Select, Back, Home, Menu
  - Secondary: Play/Pause, Fast Forward, Rewind (for media apps)
  - Optional: Voice search integration when available
- Avoid gesture-based navigation (e.g., swipe/touch) — assume remote-only input.

---

## 2. 👁️ Visual Clarity & Readability

- **Typography Requirements:**
  - Minimum **18sp for small text**, **24sp for body text**, **32sp for titles**
  - Use **medium or bold font weights** for better readability at distance
  - Prefer **sans-serif fonts** (Roboto, system fonts, or similar)
- **Color & Contrast:**
  - Use **dark backgrounds** (#000000 to #1a1a1a) with bright text/images
  - Maintain **4.5:1 contrast ratio minimum** for text
  - Use **brand colors** for primary actions and highlights
  - Avoid pure white text - use #FFFFFF or #F0F0F0 for better eye comfort
- **Safe Zones & Overscan:**
  - Keep **text within 90% of screen bounds** (5% margin)
  - Keep **interactive elements within 85% of screen bounds** (7.5% margin)
  - Use **10% general padding** for overall layout safety
  - Test on actual TV devices as overscan varies by manufacturer
- **Spacing & Layout:**
  - Use **minimum 16dp spacing** between focusable elements
  - **48dp minimum touch target size** for any interactive elements
  - Maintain **consistent grid systems** (8dp or 16dp base units)

---

## 3. 🎮 Input & Interaction

- **Primary Input Methods:**
  - **D-pad navigation** (Up, Down, Left, Right, Select)
  - **Back button** for navigation hierarchy
  - **Home button** returns to platform home screen
  - **Menu button** for contextual options
  - **Voice button** for search (when available)
- **Remote Considerations:**
  - Support **voice search** when platform provides it
  - Implement **quick actions** accessible via Menu button
  - Handle **power and volume** controls gracefully (system-level)
- **Interaction Patterns:**
  - **Single press** for selection/activation
  - **Long press** for contextual menus or additional options
  - **Double press** sparingly and only for advanced features
- **Input Limitations:**
  - Avoid requiring **text input** unless absolutely necessary
  - When text input is needed, provide **voice input option** when available
  - Use **on-screen keyboards** with predictive text
- **Response Times:**
  - **Immediate feedback** (<100ms) for button presses
  - **Visual confirmation** for all user actions
  - **Loading states** for operations taking >200ms

---

## 4. 🧱 Layout & Structure

- **Content Organization:**
  - Use **horizontal scrolling rows** as primary content structure
  - **Hero banner** at top for featured content (16:9 aspect ratio recommended)
  - **Category rows** below hero with 6-8 items visible per row
  - **Vertical navigation** between rows, **horizontal within rows**
- **Layout Patterns:**
  - **Browse Fragment**: Main content discovery with rows of media
  - **Details Fragment**: Full-screen content details with actions
  - **Playback Fragment**: Video player with overlay controls
  - **Search Fragment**: Search interface with results
- **Information Architecture:**
  - **Hub-and-spoke navigation** - main menu leads to specialized views
  - **Maximum 3-level hierarchy** to prevent user confusion
  - **Breadcrumb navigation** for deep content structures
- **Content Loading:**
  - **Progressive loading** - show content as it becomes available
  - **Skeleton screens** during initial load
  - **Infinite scroll** for large catalogs with performance optimization
- **Grid Systems:**
  - Use **consistent spacing** (16dp, 24dp, 32dp multiples)
  - **Responsive grids** that adapt to different screen sizes
  - **Aspect ratios**: 16:9 for video, 2:3 for posters, 1:1 for profiles

---

## 5. 🎨 Motion & Feedback

- **Focus Animations:**
  - **Scale transform**: 1.0 to 1.1 scale on focus (100ms duration)
  - **Elevation/shadow**: Add depth with subtle shadows
  - **Color transitions**: Smooth border or background color changes
  - Use **ease-out timing** for natural feeling animations
- **Transition Guidelines:**
  - **Page transitions**: 300-400ms with slide or fade effects
  - **Focus transitions**: 100-150ms for immediate responsiveness
  - **Content loading**: Fade-in animations for new content (200ms)
- **Performance:**
  - **60fps target** for all animations
  - **Hardware acceleration** for transforms and opacity
  - **Reduce motion** option support for accessibility
- **Feedback Patterns:**
  - **Immediate visual feedback** on button press
  - **Audio feedback** for navigation (system sounds)
  - **Visual cues** for all user interactions
- **Loading States:**
  - **Shimmer effects** for content placeholders
  - **Progress indicators** for longer operations
  - **Skeleton screens** maintain layout during loading

---

## 6. 🧑‍🦯 Accessibility

## 6. 🧑🦯 Accessibility

- **Focus Management:**
  - **High contrast focus indicators** (minimum 3:1 contrast ratio)
  - **Focus order** follows logical reading pattern (left-to-right, top-to-bottom)
  - **Focus trapping** in modals and overlays
  - **Skip navigation** options for long lists
- **Visual Accessibility:**
  - **Color independence** - don't rely solely on color for information
  - **Text scaling** support up to 200% without layout breaking
  - **High contrast mode** compatibility
- **Platform Accessibility Features:**
  - **Screen reader** support with proper content descriptions
  - **Voice control** integration when available
  - **Closed captions** support for video content
  - **Audio descriptions** for visual content when available
- **Implementation Requirements:**
  - Use **semantic HTML** or proper accessibility roles
  - Provide **alt text** for images and **content descriptions** for complex UI
  - **Keyboard navigation** support (D-pad maps to keyboard arrows)
  - **Focus announcements** for screen reader users

---

## 7. 📐 Safe Zones

**Why Safe Zones Matter:** TVs can crop content around the edges due to overscan, where the TV displays an image larger than the screen to hide potential artifacts. This means content near screen edges may be cut off.

- **Safe Zone Requirements:**
  - **Title Safe Area**: Keep all text within **90% of screen bounds** (5% margin on all sides)
  - **Action Safe Area**: Keep interactive elements within **85% of screen bounds** (7.5% margin on all sides)
  - **General Content**: Use **10% padding minimum** from screen edges for optimal safety
  
- **Practical Implementation:**
  ```css
  /* Title safe - for text content */
  .title-safe {
    margin: 5vh 5vw; /* 5% margins */
  }
  
  /* Action safe - for buttons and interactive elements */
  .action-safe {
    margin: 7.5vh 7.5vw; /* 7.5% margins */
  }
  
  /* General safe zone - for overall layout */
  .safe-zone {
    padding: 10vh 10vw; /* 10% padding */
    box-sizing: border-box;
  }
  ```

- **Overscan Considerations:**
  - **Modern TVs (2015+)**: Minimal overscan, but safe zones still recommended
  - **Older TVs**: May crop up to 10% on each edge
  - **Varies by manufacturer**: Samsung, LG, Sony handle overscan differently
  - **User settings**: Some users manually adjust overscan settings

- **Testing Strategy:**
  - Test on **real TV devices** when possible
  - Use **visual indicators** during development to verify safe zone compliance
  - Consider **dynamic safe zones** that adapt to detected screen capabilities

---

## 8. 📱 Responsive Layouts

- **TV Resolution Support:**
  - **Primary**: 1080p (1920x1080) - most common
  - **Secondary**: 720p (1280x720) - older devices
  - **4K**: 2160p (3840x2160) - newer devices
  - **HDR**: Support HDR10 and Dolby Vision where available
- **Responsive Design Principles:**
  - **Density-independent pixels** (dp/sp) for consistent sizing
  - **Flexible grid systems** that scale across resolutions
  - **Breakpoint-based layouts** for different screen sizes
  - **Vector graphics** (SVG) for crisp icons at any resolution
- **Platform Considerations:**
  - **Performance scaling** - 4K requires optimized assets and rendering
  - **Memory constraints** on lower-end devices
  - **Network bandwidth** considerations for different device tiers
- **Testing Requirements:**
  - **Real device testing** across TV device family
  - **Emulator testing** for initial development
  - **Performance profiling** on lowest-spec target devices

---

## 9. 🧩 Component Library

Use these reusable UI components to build consistent TV app experiences. Each component follows D-pad navigation rules and is optimized for focus, spacing, and visibility on large screens.

### `HeroBanner`
> Featured content banner at the top of the main screen.

- **16:9 aspect ratio** with high-quality background image
- **Overlay text** with title, description, and primary action
- **Auto-rotation** through featured content (optional)
- **Focus handling** for overlay buttons and navigation
- **Parallax scrolling** effect when navigating to rows below

---

### `BrowseRow`
> A horizontally scrolling list of content cards.

- **6-8 cards visible** at once for optimal browsing
- **Row title** with optional "See All" action
- **Smooth horizontal scrolling** with D-pad left/right
- **Focus memory** - remembers last focused item in row
- **Lazy loading** for performance with large datasets
- **Loading states** with skeleton cards

---

### `MediaCard`
> A content tile representing a movie, show, or other media.

- **Poster aspect ratio** (2:3) or **landscape** (16:9) based on content type
- **Focus scaling** (1.0 to 1.1) with smooth animation
- **Metadata overlay** on focus (title, rating, duration)
- **Progress indicator** for partially watched content
- **Accessibility labels** for screen readers
- **High-resolution images** with fallback loading

---

### `DetailScreen`
> Full-screen content details with actions and metadata.

- **Hero image/video** background with content overlay
- **Primary actions** (Play, Add to Watchlist, etc.)
- **Content metadata** (cast, genre, rating, description)
- **Related content rows** below the fold
- **Vertical scrolling** navigation with D-pad up/down
- **Back button** returns to previous screen with focus memory

---

### `NavigationDrawer`
> Collapsible side navigation menu.

- **Left-edge placement** with slide-out animation
- **Icon-only collapsed state** with labels on expansion
- **Focus-triggered expansion** when navigating to far left
- **Menu categories** (Home, Movies, TV Shows, Settings, etc.)
- **User profile** section at top with account info
- **Search shortcut** prominently placed

---

### `SearchInterface`
> Search interface with results display.

- **Voice search** when platform supports it
- **On-screen keyboard** for text input
- **Search suggestions** and **recent searches**
- **Results grid** with filtering and sorting options
- **No results state** with helpful suggestions
- **Search history** management

---

### `VideoPlayer`
> Full-screen video playback with overlay controls.

- **Transport controls** (Play/Pause, Skip, Seek)
- **Progress bar** with chapter markers and thumbnails
- **Info overlay** (title, time remaining, audio/subtitle options)
- **Auto-hide controls** after 3 seconds of inactivity
- **D-pad navigation** for seeking and control access
- **Back button** returns to detail screen

---

### `SettingsScreen`
> Hierarchical settings navigation and controls.

- **List-based layout** with clear focus indicators
- **Grouped settings** with section headers
- **Toggle switches** for boolean options
- **Selection lists** for multiple choice options
- **Slider controls** for numeric values (volume, brightness)
- **Account management** integration

---

### `LoadingState`
> Placeholder content during data fetching.

- **Skeleton screens** that match final content layout
- **Shimmer animation** for visual feedback
- **Progressive loading** - show content as it becomes available
- **Error states** with retry options
- **Timeout handling** with user feedback

---

### `Modal`
> Overlay dialogs for confirmations and forms.

- **Center-screen positioning** with backdrop dimming
- **Focus trapping** within modal content
- **Clear primary and secondary actions**
- **Back button dismissal** or explicit close action
- **Keyboard shortcuts** for common actions
- **Accessibility announcements** for screen readers

---

### `DetailScreen`
> Shows detailed information about a selected item.

- Hero image/banner.
- Title, description, metadata, actions.
- Vertical stacking; D-pad up/down navigation.

---

### `MenuBar`
> A vertical menu on the left edge of the screen.

- Collapsed by default, expands on far-left focus.
- Contains multiple `MenuItem`s.
- Sticky on screen; visually distinct from content area.

---

### `MenuItem`
> A single entry in the `MenuBar`.

- Icon (always visible) and optional label (on expand).
- D-pad Select navigates to a screen.
- Focusable with visible feedback.

---

### `SearchBar`
> Entry point for search interaction.

- Optional on main screen or triggered from menu.
- Placeholder text: “Search movies, shows…”
- Supports D-pad and/or voice search (platform dependent).

---

### `Screen`
> A full-page layout (e.g., Home, Settings).

- Stacks `Row`s, content, or other components.
- Handles loading states and safe zone padding.
- Can contain `MenuBar` and dynamic content.

---

### `Dialog` / `Popup`
> A modal UI for confirmations, alerts, or actions.

- Traps focus while active.
- Should dismiss via D-pad or Back button.
- Used sparingly — keep minimal and informative.

---

### `PlayerOverlay`
> UI shown over active video playback.

- Includes controls like Play/Pause, Seek, Info.
- Auto-hides after inactivity.
- Triggered by remote actions (e.g., Info or Play).

---

### `SkeletonLoader`
> Placeholder content while data is loading.

- Replaces `Card` or `DetailScreen` elements.
- Animates with shimmer or pulse.
- Improves perceived performance and layout stability.

---

## ✅ Design Checklist for Each Screen

- [ ] All elements are accessible via D-pad
- [ ] Visual focus is clear and unambiguous
- [ ] Text is legible at 10 feet
- [ ] UI fits within TV-safe bounds
- [ ] Only essential content and controls are visible
- [ ] Consistent layout and spacing
- [ ] No gesture or mouse interactions required
- [ ] Smooth transitions and feedback on interactions

---

## 🧠 Pro Tip for LLM Usage

When generating code or layouts:
- Always apply the **focusable** and **accessible** props to navigable elements.
- Use **FlatList or ScrollView** with `horizontal={true}` for row carousels.
- Avoid absolute positioning unless within a well-defined layout container.
- Prefer component names like `Row`, `Card`, `MenuBar`, and `DetailScreen` to align with TV design patterns.


---

## 10. 📺 Platform-Specific Considerations

### Performance Optimization
- **Memory Management**: TV devices often have limited RAM (1-4GB)
- **Image Optimization**: Use WebP format, progressive loading, and appropriate resolutions
- **JavaScript Optimization**: Minimize bundle size, use code splitting
- **Network Efficiency**: Implement smart caching and offline capabilities

### Voice Integration (When Available)
- **Voice Search**: Integrate with platform voice capabilities for content discovery
- **Voice Commands**: Support platform-specific voice deep linking
- **Voice UI**: Provide voice alternatives for complex navigation when supported

### App Store Requirements
- **Content Rating**: Implement proper content rating and parental controls
- **Privacy Policy**: Clear data collection and usage policies
- **Accessibility**: Screen reader compatibility required on most platforms
- **Performance**: Apps should launch quickly (typically within 10 seconds)

---

## ✅ TV Design Checklist

### Navigation & Focus
- [ ] D-pad navigation works for all interactive elements
- [ ] Focus indicators are clearly visible (4dp minimum thickness)
- [ ] Focus order follows logical spatial layout
- [ ] Back button behavior is consistent and predictable
- [ ] Voice integration where platform supports it

### Visual Design
- [ ] Text meets minimum size requirements (18sp+)
- [ ] High contrast ratios maintained (4.5:1 minimum)
- [ ] Safe zones respected (10% minimum margins)
- [ ] Dark theme optimized for TV viewing
- [ ] Brand colors used appropriately

### Performance
- [ ] App launches quickly (under 10 seconds)
- [ ] Smooth 60fps animations and scrolling
- [ ] Memory usage optimized for device constraints
- [ ] Network requests are efficient and cached
- [ ] Images are optimized for TV resolutions

### Accessibility
- [ ] Screen reader support implemented
- [ ] Voice control alternatives when available
- [ ] Color-independent information design
- [ ] Keyboard/D-pad navigation fully functional
- [ ] Content descriptions for all media

### Content & UX
- [ ] Content organized in browsable rows
- [ ] Search functionality with voice support when available
- [ ] Loading states and error handling
- [ ] Offline capabilities where appropriate
- [ ] Parental controls and content ratings

---

## 🧠 Development Tips

### Code Generation Guidelines
- **Component Naming**: Use TV patterns (`HeroBanner`, `BrowseRow`, `MediaCard`)
- **Focus Management**: Always implement proper focus handling with visual feedback
- **Responsive Design**: Support 720p, 1080p, and 4K resolutions
- **Performance**: Optimize for lowest-spec target devices first
- **Accessibility**: Include ARIA labels and screen reader support from the start

### Common Patterns
```javascript
// Focus handling example
const handleFocus = (element) => {
  element.style.transform = 'scale(1.1)';
  element.style.transition = 'transform 100ms ease-out';
};

// Safe zone implementation
const safeZoneStyle = {
  padding: '10vh 10vw', // 10% safe zones
  boxSizing: 'border-box'
};

// D-pad navigation
const handleKeyDown = (event) => {
  switch(event.key) {
    case 'ArrowUp': navigateUp(); break;
    case 'ArrowDown': navigateDown(); break;
    case 'ArrowLeft': navigateLeft(); break;
    case 'ArrowRight': navigateRight(); break;
    case 'Enter': selectItem(); break;
    case 'Escape': goBack(); break;
  }
};
```

### Testing Recommendations
- **Real Device Testing**: Test on actual TV devices, not just emulators
- **Performance Profiling**: Monitor memory usage and frame rates
- **Accessibility Testing**: Use screen readers and keyboard-only navigation
- **Network Testing**: Test with various connection speeds and offline scenarios
- **Cross-Resolution**: Verify layouts work across all supported resolutions
