import { extend } from '@react-three/fiber'
import * as THREE from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any
      mesh: any
      line: any
      points: any
      planeGeometry: any
      meshLambertMaterial: any
      meshPhongMaterial: any
      meshBasicMaterial: any
      meshStandardMaterial: any
      meshPhysicalMaterial: any
      pointsMaterial: any
      lineBasicMaterial: any
      cylinderGeometry: any
      boxGeometry: any
      ambientLight: any
      directionalLight: any
    }
  }
} 