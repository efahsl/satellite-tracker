# TV Focus Manager Test Guide

The TV Focus Manager custom hook has been implemented and can be tested using two different methods:

## 🎯 **What is the TV Focus Manager?**

The TV Focus Manager is a custom React hook that provides keyboard navigation for TV interfaces. It enables:
- **Arrow key navigation** with proper 2D grid support (Up/Down for vertical, Left/Right for horizontal)
- **Focus looping** (first ↔ last element)
- **Enter/Space activation** of focused elements
- **Escape key handling** for menu reopening
- **Visual focus indicators** with styling
- **Automatic cleanup** of event listeners

## 🧪 **Testing Methods**

### Method 1: Standalone HTML Test Page (Recommended for Quick Testing)

**File:** `src/test-tv-focus-manager.html`

**How to test:**
1. Open the HTML file directly in your browser
2. Use your keyboard to test the functionality:
   - **Arrow Up/Down**: Navigate vertically in the 3x4 grid
   - **Arrow Left/Right**: Navigate horizontally in the 3x4 grid  
   - **Enter/Space**: Activate the focused button
   - **Escape**: Reopen menu when closed
3. Use the control panel to enable/disable features
4. Watch the activity log for real-time feedback

**Features:**
- ✅ Standalone - no build process needed
- ✅ Real-time activity logging
- ✅ Visual focus indicators
- ✅ Control panel for testing different states
- ✅ Simulates TV interface behavior

### Method 2: React Component Test Page

**Route:** `/tv-focus-test` (when running the development server)

**How to test:**
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173/tv-focus-test`
3. Use the same keyboard controls as the HTML version
4. Test with React's state management and hooks

**Features:**
- ✅ Full React integration
- ✅ Uses the actual useTVFocusManager hook
- ✅ Real-time state updates
- ✅ Activity logging
- ✅ Control panel

## 🎮 **Test Scenarios**

### Basic Navigation
1. **Enable focus manager** (should be enabled by default)
2. **Use Arrow Down** - Focus should move down one row in the grid
3. **Use Arrow Up** - Focus should move up one row in the grid
4. **Use Arrow Right** - Focus should move right one column in the grid
5. **Use Arrow Left** - Focus should move left one column in the grid
6. **Test grid wrapping** - At edges, focus wraps to opposite side
7. **Test 3x4 grid layout** - Navigate through all 12 buttons with proper 2D movement

### Activation Testing
1. **Focus on any button** using arrow keys
2. **Press Enter** - Button should activate (check activity log)
3. **Press Space** - Button should also activate
4. **Try "Manual Mode" button** - Menu should close

### Menu Reopening
1. **Close the menu** by clicking "Manual Mode" or unchecking "Show Menu"
2. **Press Escape key** - Menu should reopen
3. **Focus should return** to first button

### Edge Cases
1. **Disable focus manager** - Arrow keys should not work
2. **Hide menu** - No focusable elements, should handle gracefully
3. **Mouse hover** - Should update focus when enabled
4. **Rapid key presses** - Should handle smoothly

## 🔍 **What to Look For**

### Visual Indicators
- **Blue border** around focused element
- **Enhanced scaling** (1.05x) of focused element for better TV visibility
- **Stronger box shadow** with blue glow for depth
- **Smooth transitions** (0.2s ease) between focus states
- **Grid layout** with 3 columns and 4 rows
- **Focus counter** showing current position (e.g., "5 of 12")

### Activity Log
- **Timestamp** for each action
- **Focus changes** logged with element names
- **Button activations** recorded
- **State changes** (enable/disable, show/hide)

### Keyboard Behavior
- **All arrow keys** (Up/Down/Left/Right) should be captured (preventDefault)
- **Other keys** should work normally
- **Focus should loop** at boundaries (12th element back to 1st)
- **Escape key** should work when menu is closed
- **Sequential navigation** through grid elements regardless of arrow direction

## 🐛 **Common Issues to Test**

1. **Focus lost** - Focus should always be on a valid element
2. **Multiple activations** - Rapid Enter/Space presses
3. **State changes** - Enabling/disabling during navigation
4. **Element changes** - Menu show/hide during focus
5. **Browser compatibility** - Test in different browsers

## 📋 **Requirements Verification**

The test pages verify all requirements from the TV Interface Enhancement spec:

- **4.1** ✅ Arrow key navigation support
- **4.2** ✅ Focus movement with up/down arrows  
- **4.3** ✅ Clear visual feedback (blue borders, scaling)
- **4.4** ✅ Enter/Space key activation
- **4.5** ✅ Focus looping behavior (first ↔ last)
- **4.6** ✅ Focus boundary management
- **6.2** ✅ Escape key handling for menu reopening

## 🚀 **Next Steps**

After testing the focus manager:

1. **Verify all functionality** works as expected
2. **Test on different browsers** (Chrome, Firefox, Safari, Edge)
3. **Test with actual TV remote** if available
4. **Ready for integration** into HamburgerMenu component (Task 6)

The focus manager is now ready to be integrated into the actual TV interface components!