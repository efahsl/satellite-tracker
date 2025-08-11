# 📺 TV App UI/UX Design Guidelines

These are best practices for designing applications for TV platforms. Follow these foundational principles to ensure your app is accessible, readable, and usable on a 10-foot UI.  
Source: [Android TV Design Foundations](https://developer.android.com/design/ui/tv/guides/foundations/design-for-tv)

---

## 1. 🧭 Navigation & Focus

- Use **D-pad navigation** with clear visual focus states (borders, scaling, or shadows).
- Avoid ambiguous focus: ensure **only one item is focusable at a time**.
- Use a **predictable and spatial layout**: left/right and up/down movement should map naturally to UI arrangement.
- Support **looping navigation** if appropriate (e.g., carousel menus).
- Avoid gesture-based navigation (e.g., swipe/touch) — assume remote-only input.

---

## 2. 👁️ Visual Clarity & Readability

- Use **large fonts** (minimum 32sp for body text) and **high contrast**.
- Use a **dark background** with bright text/images for better readability in dim rooms.
- Ensure a **safe margin zone** (~5% on all edges) to prevent clipping on older TVs.
- Maintain **ample spacing between elements** to prevent focus ambiguity.

---

## 3. 🎮 Input & Interaction

- Assume **limited input**: D-pad, Select, Back, and Home buttons only.
- Avoid requiring keyboard input unless absolutely necessary.
- Surface **only relevant actions** — keep UI lean and intuitive.
- For modals or popups, ensure clear focus trapping and Back button support.

---

## 4. 🧱 Layout & Structure

- Prefer **horizontal scrolling rows** of content (e.g., rows of cards or thumbnails).
- Organize screens in a **hub-and-spoke pattern** — a main menu leads to detail views.
- Use **consistent layouts** across screens to reduce cognitive load.
- Support **lazy loading** or pagination for large data sets.

---

## 5. 🎨 Motion & Feedback

- Use **smooth, subtle animations** to indicate focus changes (e.g., scale up on focus).
- Avoid fast, jarring transitions — keep motion readable and slow (~200–300ms).
- Provide **immediate feedback** on button presses or content loading.

---

## 6. 🧑‍🦯 Accessibility

- Make all focusable elements **clearly distinguishable** via shape, color, or size.
- Avoid relying on color alone to indicate state or focus.
- Ensure **text descriptions** are available for content (use `accessibilityLabel` or similar).

---

## 7. 📐 Safe Zones

- Use **TV-safe zones** to prevent UI clipping:
  - **5% padding** from screen edges
  - Keep text and buttons well within these bounds

---

## 8. 📱 Responsive Layouts

- Design for **720p and 1080p resolutions** primarily.
- Use scalable layout units (e.g., `dp` or `sp` in Android) to handle screen size differences.
- Test on real devices when possible, not just emulators.

---

## 9. 🧩 Component Library

Use these reusable UI components to build consistent TV app experiences. Each component follows D-pad navigation rules and is optimized for focus, spacing, and visibility on large screens.

### `Row`
> A horizontally scrolling list of `Card` components.

- D-pad left/right navigation.
- Label/title above the row.
- Lazy loads large data sets.

---

### `Card`
> A rectangular tile for a single piece of content.

- Focusable with visual feedback.
- Includes image, title, and optional metadata.
- Leads to `DetailScreen` on Select.

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

