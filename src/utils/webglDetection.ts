/**
 * WebGL Hardware Detection Utilities
 * Used to determine GPU capabilities and optimize rendering accordingly
 */

export interface WebGLCapabilities {
  supported: boolean;
  version: number | null;
  renderer: string;
  vendor: string;
  maxTextureSize: number;
  maxVertexTextures: number;
  isHighPerformance: boolean;
  maxAnisotropy: number;
  supportsFloatTextures: boolean;
  supportsDepthTextures: boolean;
}

/**
 * Detects WebGL capabilities and hardware information
 * @returns WebGL capabilities object
 */
export const detectWebGLCapabilities = (): WebGLCapabilities => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    return {
      supported: false,
      version: null,
      renderer: 'Unknown',
      vendor: 'Unknown',
      maxTextureSize: 1024,
      maxVertexTextures: 0,
      isHighPerformance: false,
      maxAnisotropy: 1,
      supportsFloatTextures: false,
      supportsDepthTextures: false
    };
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
  const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
  
  // Check for performance indicators
  const rendererLower = renderer.toLowerCase();
  const isHighPerformance = !rendererLower.includes('software') && 
                           !rendererLower.includes('llvmpipe') &&
                           !rendererLower.includes('swiftshader');

  // Get anisotropic filtering support
  const anisoExt = gl.getExtension('EXT_texture_filter_anisotropic');
  const maxAnisotropy = anisoExt ? gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;

  // Check for float texture support
  const floatTextureExt = gl.getExtension('OES_texture_float');
  const supportsFloatTextures = !!floatTextureExt;

  // Check for depth texture support
  const depthTextureExt = gl.getExtension('WEBGL_depth_texture') || gl.getExtension('OES_depth_texture');
  const supportsDepthTextures = !!depthTextureExt;

  // Clean up
  canvas.remove();
  
  return {
    supported: true,
    version: gl instanceof WebGL2RenderingContext ? 2 : 1,
    renderer,
    vendor,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexTextures: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    isHighPerformance,
    maxAnisotropy,
    supportsFloatTextures,
    supportsDepthTextures
  };
};

/**
 * Gets recommended shadow map size based on hardware capabilities
 * @param capabilities WebGL capabilities
 * @returns Recommended shadow map size (width/height)
 */
export const getRecommendedShadowMapSize = (capabilities: WebGLCapabilities): number => {
  if (!capabilities.supported || !capabilities.isHighPerformance) {
    return 1024;
  }
  
  if (capabilities.maxTextureSize >= 4096) {
    return 2048;
  }
  
  return 1024;
};

/**
 * Gets recommended texture quality settings based on hardware
 * @param capabilities WebGL capabilities
 * @returns Quality settings object
 */
export const getRecommendedQualitySettings = (capabilities: WebGLCapabilities) => {
  const isHighEnd = capabilities.isHighPerformance && capabilities.maxTextureSize >= 4096;
  const isMidRange = capabilities.isHighPerformance && capabilities.maxTextureSize >= 2048;
  
  return {
    shadowMapSize: isHighEnd ? 2048 : isMidRange ? 1024 : 512,
    anisotropicFiltering: Math.min(capabilities.maxAnisotropy, isHighEnd ? 16 : isMidRange ? 8 : 4),
    antialiasing: capabilities.isHighPerformance,
    trailSegments: isHighEnd ? 8 : isMidRange ? 6 : 4,
    starCount: isHighEnd ? 8000 : isMidRange ? 5000 : 3000,
    enableFloatTextures: capabilities.supportsFloatTextures && capabilities.isHighPerformance
  };
};

/**
 * Logs WebGL capabilities to console for debugging
 * @param capabilities WebGL capabilities
 */
export const logWebGLCapabilities = (capabilities: WebGLCapabilities): void => {
  if (!capabilities.supported) {
    console.warn('WebGL not supported');
    return;
  }

  console.group('🎮 WebGL Hardware Capabilities');
  console.log(`WebGL Version: ${capabilities.version}`);
  console.log(`Renderer: ${capabilities.renderer}`);
  console.log(`Vendor: ${capabilities.vendor}`);
  console.log(`Max Texture Size: ${capabilities.maxTextureSize}px`);
  console.log(`Max Vertex Textures: ${capabilities.maxVertexTextures}`);
  console.log(`High Performance: ${capabilities.isHighPerformance ? '✅' : '❌'}`);
  console.log(`Max Anisotropy: ${capabilities.maxAnisotropy}x`);
  console.log(`Float Textures: ${capabilities.supportsFloatTextures ? '✅' : '❌'}`);
  console.log(`Depth Textures: ${capabilities.supportsDepthTextures ? '✅' : '❌'}`);
  
  const quality = getRecommendedQualitySettings(capabilities);
  console.log('📊 Recommended Settings:', quality);
  console.groupEnd();
};