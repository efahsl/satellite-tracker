import React, { useState, useRef, useEffect } from 'react';
import { useTVFocusManager, findFocusableElements } from './hooks/useTVFocusManager';

const TestTVFocusManager: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [menuVisible, setMenuVisible] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);

  // Update focusable elements when container or menu visibility changes
  useEffect(() => {
    if (containerRef.current && menuVisible) {
      const elements = findFocusableElements(containerRef.current);
      setFocusableElements(elements);
    } else {
      setFocusableElements([]);
    }
  }, [menuVisible]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleEscape = () => {
    addLog('🔑 Escape key pressed - reopening menu');
    setMenuVisible(true);
  };

  const handleButtonClick = (buttonName: string) => {
    addLog(`🖱️ Button clicked: ${buttonName}`);
    if (buttonName === 'Manual Mode') {
      addLog('📱 Manual mode activated - closing menu');
      setMenuVisible(false);
    }
  };

  const { currentFocusIndex, focusElement, focusNext, focusPrevious, focusUp, focusDown, focusLeft, focusRight } = useTVFocusManager({
    isEnabled: isEnabled, // Keep enabled even when menu is closed so Escape key works
    focusableElements: menuVisible ? focusableElements : [], // Only provide elements when menu is visible
    onEscape: handleEscape,
    gridConfig: { columns: 3 } // 3-column grid layout
  });

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px',
      backgroundColor: '#000000',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#ffffff', marginBottom: '30px' }}>TV Focus Manager Test Page</h1>
      
      {/* Control Panel */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        color: '#ffffff',
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#ffffff', marginTop: '0' }}>Controls</h3>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => {
              setIsEnabled(e.target.checked);
              addLog(`Focus manager ${e.target.checked ? 'enabled' : 'disabled'}`);
            }}
            style={{ marginRight: '8px' }}
          />
          Enable TV Focus Manager
        </label>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={menuVisible}
            onChange={(e) => {
              setMenuVisible(e.target.checked);
              addLog(`Menu ${e.target.checked ? 'shown' : 'hidden'}`);
            }}
            style={{ marginRight: '8px' }}
          />
          Show Menu
        </label>

        <div style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Linear Navigation:</strong>
          </div>
          <button 
            onClick={() => focusPrevious()}
            style={{ 
              marginRight: '10px', 
              padding: '5px 10px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Previous
          </button>
          <button 
            onClick={() => focusNext()}
            style={{ 
              marginRight: '10px', 
              padding: '5px 10px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Next
          </button>
          <button 
            onClick={() => focusElement(0)}
            style={{ 
              marginRight: '10px',
              padding: '5px 10px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            First
          </button>
          <button 
            onClick={() => focusElement(focusableElements.length - 1)}
            style={{ 
              marginRight: '10px',
              padding: '5px 10px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Last
          </button>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Grid Navigation:</strong>
          </div>
          <button 
            onClick={() => focusUp()}
            style={{ 
              marginRight: '10px', 
              padding: '5px 10px',
              backgroundColor: '#444',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ↑ Up
          </button>
          <button 
            onClick={() => focusDown()}
            style={{ 
              marginRight: '10px', 
              padding: '5px 10px',
              backgroundColor: '#444',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ↓ Down
          </button>
          <button 
            onClick={() => focusLeft()}
            style={{ 
              marginRight: '10px', 
              padding: '5px 10px',
              backgroundColor: '#444',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Left
          </button>
          <button 
            onClick={() => focusRight()}
            style={{ 
              padding: '5px 10px',
              backgroundColor: '#444',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            → Right
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        color: '#ffffff',
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#ffffff', marginTop: '0' }}>Status</h3>
        <p><strong>Focus Manager Enabled:</strong> {isEnabled ? 'Yes' : 'No'}</p>
        <p><strong>Menu Visible:</strong> {menuVisible ? 'Yes' : 'No'}</p>
        <p><strong>Current Focus Index:</strong> {currentFocusIndex}</p>
        <p><strong>Focusable Elements:</strong> {focusableElements.length}</p>
      </div>

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#1a2332', 
        color: '#ffffff',
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #4A90E2'
      }}>
        <h3 style={{ color: '#ffffff', marginTop: '0' }}>Instructions</h3>
        <ul>
          <li><strong>Arrow Up/Down:</strong> Navigate vertically in the 3x4 grid</li>
          <li><strong>Arrow Left/Right:</strong> Navigate horizontally in the 3x4 grid</li>
          <li><strong>Enter/Space:</strong> Activate focused button</li>
          <li><strong>Escape:</strong> Reopen menu when closed</li>
          <li><strong>Manual Mode button:</strong> Closes the menu</li>
          <li>Focus indicators show with blue borders and scaling</li>
          <li><strong>Grid wrapping:</strong> Edges wrap to opposite sides</li>
        </ul>
      </div>

      {/* Test Menu */}
      {menuVisible && (
        <div 
          ref={containerRef}
          style={{ 
            backgroundColor: '#1a1a1a', 
            color: '#ffffff',
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #444',
            width: '800px'
          }}
        >
          <h3 style={{ color: '#ffffff', marginTop: '0', marginBottom: '20px' }}>TV Menu Grid (Focusable)</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            width: '100%'
          }}>
            {[
              // Row 1
              'Home', 'ISS Tracking', 'Manual Mode',
              // Row 2  
              'Settings', 'About', 'Help',
              // Row 3
              'Performance', 'Display', 'Audio',
              // Row 4
              'Network', 'System', 'Exit'
            ].map((label, index) => (
              <button
                key={label}
                onClick={() => handleButtonClick(label)}
                style={{
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '500',
                  backgroundColor: currentFocusIndex === index ? '#4A90E2' : '#333',
                  color: '#ffffff',
                  border: currentFocusIndex === index ? '3px solid #4A90E2' : '1px solid #555',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transform: currentFocusIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  boxShadow: currentFocusIndex === index ? '0 4px 12px rgba(74, 144, 226, 0.6)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
                onMouseEnter={() => {
                  if (isEnabled && menuVisible) {
                    focusElement(index);
                    addLog(`Mouse hover: ${label} (index: ${index})`);
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ 
            marginTop: '15px', 
            fontSize: '14px', 
            color: '#888',
            textAlign: 'center'
          }}>
            Use arrow keys to navigate • Current focus: {currentFocusIndex + 1} of {focusableElements.length}
          </div>
        </div>
      )}

      {!menuVisible && (
        <div style={{ 
          backgroundColor: '#2d1b00', 
          color: '#ffffff',
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #ff9500'
        }}>
          <h3 style={{ color: '#ff9500', marginTop: '0' }}>Menu Closed</h3>
          <p>Press <strong style={{ color: '#ff9500' }}>Escape</strong> key to reopen the menu, or use the checkbox above.</p>
        </div>
      )}

      {/* Activity Log */}
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        color: '#ffffff',
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#ffffff', marginTop: '0' }}>Activity Log</h3>
        <div style={{ 
          height: '200px', 
          overflowY: 'auto', 
          backgroundColor: '#0a0a0a', 
          color: '#00ff00',
          padding: '10px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          border: '1px solid #333'
        }}>
          {logs.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No activity yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))
          )}
        </div>
        <button 
          onClick={() => setLogs([])}
          style={{ 
            marginTop: '10px', 
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Log
        </button>
      </div>
    </div>
  );
};

export default TestTVFocusManager;