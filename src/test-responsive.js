// Simple test to verify responsive utilities are loaded
console.log('Testing responsive utilities...');

// Test if CSS classes exist by checking computed styles
function testResponsiveUtilities() {
  // Create test elements
  const testDiv = document.createElement('div');
  testDiv.className = 'mobile-only desktop-only sm:hidden md:block';
  document.body.appendChild(testDiv);
  
  // Check if styles are applied
  const styles = window.getComputedStyle(testDiv);
  console.log('Test element display:', styles.display);
  
  // Test media query functionality
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  const desktopQuery = window.matchMedia('(min-width: 768px)');
  
  console.log('Is mobile viewport:', mobileQuery.matches);
  console.log('Is desktop viewport:', desktopQuery.matches);
  console.log('Current viewport width:', window.innerWidth);
  
  // Clean up
  document.body.removeChild(testDiv);
  
  return {
    isMobile: mobileQuery.matches,
    isDesktop: desktopQuery.matches,
    viewportWidth: window.innerWidth
  };
}

// Export for use in browser console
window.testResponsiveUtilities = testResponsiveUtilities;

// Run test immediately
const result = testResponsiveUtilities();
console.log('Responsive utilities test result:', result);