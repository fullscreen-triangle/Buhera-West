# Camera Components

This folder contains camera components for 3D scene visualization and control.

## Components

### `CustomCamera.ts`
Provides the `CameraControls` component that extends OrbitControls with additional features like preset positions, target following, and configurable constraints. Ideal for cinematic and interactive camera movements.

### `CubeCamera.jsx`
Creates a cube camera for environment mapping, reflections, and cubemap generation. Useful for realistic reflections in 3D scenes.

### `OrthogonalCamera.jsx`
Implements an orthographic camera view that removes perspective distortion, ideal for technical visualizations where accurate measurements and proportions are important.

### `AdjustableCamera.jsx`
An advanced camera component with dynamic adjustments for focus, exposure, and other camera properties. Includes animation capabilities for smooth transitions between settings.

### `PerspectiveCamera.jsx`
A configurable perspective camera that simulates natural human vision with depth perception. Provides controls for field of view, aspect ratio, and near/far clipping planes.

## Presets

The module exports `CameraPresets` with common camera configurations:

- `FRONT`: Front view of the athlete
- `SIDE`: Side view for analyzing lateral movement
- `TOP`: Overhead view for pattern analysis
- `PERSPECTIVE`: 3/4 view showing multiple angles
- `TRACKING`: Camera that follows behind the athlete

## Usage

These components can be used to create dynamic camera systems for 3D visualizations and animations.

Example:
```jsx
import { AdjustableCamera, CameraPresets } from '../components/camera';

function TrackScene() {
  return (
    <>
      <AdjustableCamera 
        initialPosition={CameraPresets.PERSPECTIVE.position}
        target={[0, 1, 0]}
        animationDuration={1.5}
      />
      {/* Scene content */}
    </>
  );
}
```

The camera components provide flexible viewing options for biomechanical analysis, allowing different perspectives on athletic movement for comprehensive assessment. 