import React, { useRef, useEffect, useState } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AdjustableCamera = ({
  makeDefault = true,
  initialPosition = [10, 10, 10],
  initialTarget = [0, 0, 0],
  enableControls = true,
  moveSpeed = 0.1,
  rotateSpeed = 0.01,
  zoomSpeed = 1,
  minDistance = 1,
  maxDistance = 1000,
  enableDamping = true,
  dampingFactor = 0.05
}) => {
  const cameraRef = useRef();
  const targetRef = useRef(new THREE.Vector3(...initialTarget));
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();

  useEffect(() => {
    if (cameraRef.current && makeDefault) {
      camera.position.set(...initialPosition);
      camera.lookAt(...initialTarget);
    }
  }, []);

  useFrame(() => {
    if (cameraRef.current && enableDamping) {
      cameraRef.current.lookAt(targetRef.current);
      cameraRef.current.updateProjectionMatrix();
    }
  });

  const handleKeyDown = (event) => {
    if (!enableControls || !cameraRef.current) return;

    const camera = cameraRef.current;
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    camera.getWorldDirection(forward);
    right.crossVectors(forward, up).normalize();

    switch (event.key.toLowerCase()) {
      case 'w':
        camera.position.addScaledVector(forward, moveSpeed);
        targetRef.current.addScaledVector(forward, moveSpeed);
        break;
      case 's':
        camera.position.addScaledVector(forward, -moveSpeed);
        targetRef.current.addScaledVector(forward, -moveSpeed);
        break;
      case 'a':
        camera.position.addScaledVector(right, -moveSpeed);
        targetRef.current.addScaledVector(right, -moveSpeed);
        break;
      case 'd':
        camera.position.addScaledVector(right, moveSpeed);
        targetRef.current.addScaledVector(right, moveSpeed);
        break;
      case 'q':
        camera.position.y += moveSpeed;
        targetRef.current.y += moveSpeed;
        break;
      case 'e':
        camera.position.y -= moveSpeed;
        targetRef.current.y -= moveSpeed;
        break;
    }
  };

  const handleMouseDown = (event) => {
    if (!enableControls) return;
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!enableControls || !isDragging || !cameraRef.current) return;

    const camera = cameraRef.current;
    const deltaX = event.movementX * rotateSpeed;
    const deltaY = event.movementY * rotateSpeed;

    // Rotate around target
    const position = new THREE.Vector3().copy(camera.position);
    const target = new THREE.Vector3().copy(targetRef.current);
    const offset = position.sub(target);

    // Vertical rotation
    const qx = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -deltaY);
    offset.applyQuaternion(qx);

    // Horizontal rotation
    const qy = new THREE.Quaternion();
    qy.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX);
    offset.applyQuaternion(qy);

    camera.position.copy(target).add(offset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event) => {
    if (!enableControls || !cameraRef.current) return;

    const camera = cameraRef.current;
    const target = targetRef.current;
    const direction = new THREE.Vector3().subVectors(camera.position, target);
    const distance = direction.length();

    // Calculate zoom factor
    const zoomDelta = -Math.sign(event.deltaY) * zoomSpeed;
    const newDistance = THREE.MathUtils.clamp(
      distance + zoomDelta,
      minDistance,
      maxDistance
    );

    direction.normalize().multiplyScalar(newDistance);
    camera.position.copy(target).add(direction);
  };

  useEffect(() => {
    if (enableControls) {
      window.addEventListener('keydown', handleKeyDown);
      gl.domElement.addEventListener('mousedown', handleMouseDown);
      gl.domElement.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      gl.domElement.addEventListener('wheel', handleWheel);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        gl.domElement.removeEventListener('mousedown', handleMouseDown);
        gl.domElement.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        gl.domElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [enableControls, isDragging]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={makeDefault}
      position={initialPosition}
      fov={75}
      near={0.1}
      far={1000}
    />
  );
};

export default AdjustableCamera;
