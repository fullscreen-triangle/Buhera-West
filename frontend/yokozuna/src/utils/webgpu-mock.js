// Mock WebGPU module for compatibility with older Three.js versions
// This prevents import errors when globe.gl tries to import three/webgpu

export const WebGPURenderer = null;
export const WebGPUUtils = null;
export const WebGPUInfo = null;
export const WebGPUObjects = null;
export const WebGPUProperties = null;
export const WebGPUBindings = null;
export const WebGPUBufferRenderer = null;
export const WebGPUIndexedBufferRenderer = null;

// Default export
export default {
  WebGPURenderer: null,
  WebGPUUtils: null,
  WebGPUInfo: null,
  WebGPUObjects: null,
  WebGPUProperties: null,
  WebGPUBindings: null,
  WebGPUBufferRenderer: null,
  WebGPUIndexedBufferRenderer: null,
}; 