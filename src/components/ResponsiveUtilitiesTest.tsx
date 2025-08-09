import React from 'react';

/**
 * Test component to verify responsive utilities work correctly
 * This component demonstrates various responsive utility classes
 */
const ResponsiveUtilitiesTest: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Responsive Utilities Test</h2>
      
      {/* Display Utilities Test */}
      <div className="test-section p-4 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Display Utilities</h3>
        
        <div className="mobile-only p-2 mb-2 bg-iss-highlight rounded text-center">
          <strong>Mobile Only:</strong> Visible only on mobile (&lt; 768px)
        </div>
        
        <div className="desktop-only p-2 mb-2 bg-space-blue rounded text-center">
          <strong>Desktop Only:</strong> Visible only on desktop (≥ 768px)
        </div>
        
        <div className="show-mobile hide-desktop p-2 mb-2 bg-gray-700 rounded text-center">
          <strong>Show Mobile / Hide Desktop</strong>
        </div>
        
        <div className="show-desktop hide-mobile p-2 mb-2 bg-gray-700 rounded text-center">
          <strong>Show Desktop / Hide Mobile</strong>
        </div>
      </div>

      {/* Layout Utilities Test */}
      <div className="test-section p-4 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Layout Utilities</h3>
        
        <div className="flex sm:flex-col md:flex-row gap-2 mb-3">
          <div className="bg-iss-highlight p-3 rounded flex-1 text-center">Item 1</div>
          <div className="bg-iss-highlight p-3 rounded flex-1 text-center">Item 2</div>
          <div className="bg-iss-highlight p-3 rounded flex-1 text-center">Item 3</div>
        </div>
        <p className="text-sm text-gray-400">
          Above items: column layout on mobile, row layout on desktop
        </p>
      </div>

      {/* Typography Utilities Test */}
      <div className="test-section p-4 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Typography Utilities</h3>
        
        <div className="sm:text-xs md:text-base mb-2 p-2 bg-space-blue rounded">
          <strong>Responsive Text Size:</strong> Extra small on mobile, base size on desktop
        </div>
        
        <div className="mobile-text-sm md:text-lg mb-2 p-2 bg-space-blue rounded">
          <strong>Mixed Classes:</strong> Small text on mobile, large on desktop
        </div>
        
        <div className="sm:font-medium md:font-semibold p-2 bg-space-blue rounded">
          <strong>Responsive Font Weight:</strong> Medium on mobile, semibold on desktop
        </div>
      </div>

      {/* Spacing Utilities Test */}
      <div className="test-section p-4 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Spacing Utilities</h3>
        
        <div className="sm:p-2 md:p-4 mb-3 bg-space-blue rounded">
          <strong>Responsive Padding:</strong> Less padding on mobile, more on desktop
        </div>
        
        <div className="mobile-mb-1 md:mb-4 p-2 bg-space-blue rounded">
          <strong>Responsive Margin:</strong> Small bottom margin on mobile, larger on desktop
        </div>
      </div>

      {/* Grid Utilities Test */}
      <div className="test-section p-4 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Grid Utilities</h3>
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="p-3 bg-iss-highlight rounded text-center">Grid Item 1</div>
          <div className="p-3 bg-iss-highlight rounded text-center">Grid Item 2</div>
          <div className="p-3 bg-iss-highlight rounded text-center">Grid Item 3</div>
          <div className="p-3 bg-iss-highlight rounded text-center">Grid Item 4</div>
        </div>
        <p className="text-sm text-gray-400">
          Grid: 1 column on mobile, 2 columns on desktop
        </p>
      </div>

      {/* Container Utilities Test */}
      <div className="test-section p-4 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Container Utilities</h3>
        
        <div className="container-mobile md:container-desktop bg-space-blue p-3 rounded">
          <strong>Responsive Container:</strong> Mobile container on small screens, desktop container on large screens
        </div>
      </div>

      {/* Screen Size Indicator */}
      <div className="fixed top-4 right-4 bg-gray-800 p-2 rounded text-xs">
        <div className="sm:block md:hidden">📱 Mobile (&lt; 768px)</div>
        <div className="sm:hidden md:block">🖥️ Desktop (≥ 768px)</div>
      </div>
    </div>
  );
};

export default ResponsiveUtilitiesTest;