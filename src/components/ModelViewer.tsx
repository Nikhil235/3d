'use client';

import React, { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  useProgress,
  Html,
  OrbitControls,
  Environment,
  ContactShadows,
  Center,
} from '@react-three/drei';
import * as THREE from 'three';
import { setConsoleFunction } from 'three/src/utils.js';

/* ------------------------------------------------------------------ */
/*  Suppress known-benign Three.js warnings                            */
/*  • THREE.Clock deprecated → upstream @react-three/fiber issue       */
/*  • X4122 shader precision → Windows DirectX HLSL compiler noise     */
/* ------------------------------------------------------------------ */

// 1) Use Three.js's official API to intercept warnings from its internal
//    warn()/log()/error() — this catches "Program Info Log" + X4122.
setConsoleFunction((type: string, message: string, ...params: unknown[]) => {
  const full = [message, ...params].join(' ');
  if (full.includes('Program Info Log') || full.includes('X4122')) return;
  (console as Record<string, Function>)[type](message, ...params);
});

// 2) Patch console.warn for the Clock deprecation that comes from
//    @react-three/fiber (bypasses Three.js's warn utility).
const _origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('THREE.Clock')) return;
  _origWarn.apply(console, args);
};

/* ------------------------------------------------------------------ */
/*  TypeScript Interfaces                                              */
/* ------------------------------------------------------------------ */

export interface ModelViewerProps {
  /** Path to the GLB/GLTF model file (relative to /public) */
  modelPath: string;
  /** Uniform or per-axis scale */
  scale?: number | [number, number, number];
  /** Auto-rotation speed in radians/sec (0 = disabled) */
  rotationSpeed?: number;
  /** Canvas height (CSS value) */
  height?: string | number;
  /** Optional CSS class for the outer container */
  className?: string;
  /** Show contact shadows beneath the model */
  showShadows?: boolean;
  /** drei Environment preset for PBR reflections */
  environmentPreset?: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
}

/* ------------------------------------------------------------------ */
/*  Loading Overlay (inside Canvas via Html)                           */
/* ------------------------------------------------------------------ */

function Loader() {
  const { progress } = useProgress();
  const pct = Math.round(progress);

  return (
    <Html center>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          color: '#e2e8f0',
          fontFamily:
            "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* ring spinner */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{ animation: 'model-spin 1s linear infinite' }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="url(#loaderGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="90 150"
          />
          <defs>
            <linearGradient id="loaderGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>

        {/* progress bar */}
        <div
          style={{
            width: '140px',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #818cf8, #38bdf8)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            opacity: 0.8,
          }}
        >
          Loading model… {pct}%
        </span>

        <style>{`
          @keyframes model-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/*  The 3-D model (loaded inside Canvas)                               */
/* ------------------------------------------------------------------ */

const DRACO_CDN = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

interface ModelProps {
  modelPath: string;
  scale?: number | [number, number, number];
  rotationSpeed: number;
}

function Model({ modelPath, scale = 1, rotationSpeed }: ModelProps) {
  const gltf = useGLTF(modelPath, DRACO_CDN);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={gltf.scene} scale={scale} />
      </group>
    </Center>
  );
}

/* ------------------------------------------------------------------ */
/*  Error Boundary                                                     */
/* ------------------------------------------------------------------ */

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Public Component                                                   */
/* ------------------------------------------------------------------ */

export default function ModelViewer({
  modelPath,
  scale = 1,
  rotationSpeed = 0.5,
  height = '600px',
  className = '',
  showShadows = true,
  environmentPreset = 'city',
}: ModelViewerProps) {
  const [hasError, setHasError] = useState(false);

  const handleCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer }) => {
      state.gl.toneMapping = THREE.ACESFilmicToneMapping;
      state.gl.toneMappingExposure = 1.2;
      // Explicitly set PCFShadowMap to avoid the PCFSoftShadowMap deprecation
      // warning in Three.js r175+
      state.gl.shadowMap.type = THREE.PCFShadowMap;
    },
    [],
  );

  /* ---- Fallback UI ---- */
  const errorFallback = (
    <div
      style={{
        height,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'linear-gradient(135deg, #1e1b2e 0%, #0f172a 100%)',
        borderRadius: '16px',
        color: '#f87171',
        fontFamily:
          "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>
        Failed to load 3D model
      </p>
      <p style={{ margin: 0, fontSize: '13px', opacity: 0.7, maxWidth: '360px' }}>
        Could not load <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{modelPath}</code>.
        Make sure the file exists inside the <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>/public</code> folder.
      </p>
    </div>
  );

  if (hasError) return errorFallback;

  return (
    <div
      className={className}
      style={{
        height,
        width: '100%',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e1b2e 0%, #0f172a 100%)',
      }}
    >
      <ModelErrorBoundary fallback={errorFallback}>
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [0, 2, 5], fov: 45 }}
          onCreated={handleCreated}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[8, 10, 8]}
            intensity={1.8}
          />
          <pointLight position={[-6, 4, -8]} intensity={0.6} color="#c4b5fd" />

          {/* Environment map for PBR reflections */}
          <Environment preset={environmentPreset} />

          {/* Model */}
          <Suspense fallback={<Loader />}>
            <Model
              modelPath={modelPath}
              scale={scale}
              rotationSpeed={rotationSpeed}
            />
          </Suspense>

          {/* Contact shadows for ground feel */}
          {showShadows && (
            <ContactShadows
              position={[0, -1.5, 0]}
              opacity={0.45}
              scale={12}
              blur={2.5}
              far={4}
            />
          )}

          {/* Orbit controls */}
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
            enablePan
          />
        </Canvas>
      </ModelErrorBoundary>

      {/* Subtle gradient vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: '16px',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.35)',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preload helper — call at module level for instant loads            */
/* ------------------------------------------------------------------ */

export function preloadModel(path: string) {
  useGLTF.preload(path, DRACO_CDN);
}
