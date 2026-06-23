import type { Metadata } from 'next';
import ModelViewer from '@/components/ModelViewer';

export const metadata: Metadata = {
  title: '3D Model Viewer — Interactive GLB Visualization',
  description:
    'View and interact with 3D GLB models in real-time using React Three Fiber and Three.js.',
};

export default function ModelViewPage() {
  return (
    <main className="model-page">
      {/* ---- Header ---- */}
      <header className="model-page__header">
        <div className="model-page__badge">LIVE PREVIEW</div>
        <h1 className="model-page__title">3D Model Viewer</h1>
        <p className="model-page__subtitle">
          Interactive visualization &mdash; drag to orbit, scroll to zoom, right-click to pan.
        </p>
      </header>

      {/* ---- Viewer ---- */}
      <section className="model-page__viewer">
        <ModelViewer
          modelPath="/models/model.glb"
          scale={1}
          rotationSpeed={0.4}
          height="70vh"
          showShadows
          environmentPreset="city"
        />
      </section>

      {/* ---- Info cards ---- */}
      <section className="model-page__cards">
        <div className="info-card">
          <div className="info-card__icon">
            {/* mouse icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="3" width="12" height="18" rx="6" />
              <line x1="12" y1="7" x2="12" y2="11" />
            </svg>
          </div>
          <h3 className="info-card__title">Controls</h3>
          <ul className="info-card__list">
            <li><strong>Left Drag</strong> &mdash; Orbit camera</li>
            <li><strong>Right Drag</strong> &mdash; Pan view</li>
            <li><strong>Scroll</strong> &mdash; Zoom in / out</li>
          </ul>
        </div>

        <div className="info-card">
          <div className="info-card__icon">
            {/* cpu/tech icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
              <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
            </svg>
          </div>
          <h3 className="info-card__title">Stack</h3>
          <ul className="info-card__list">
            <li><strong>Framework</strong> &mdash; Next.js App Router</li>
            <li><strong>3D Engine</strong> &mdash; React Three Fiber + Three.js</li>
            <li><strong>Compression</strong> &mdash; Draco decoder ready</li>
            <li><strong>Rendering</strong> &mdash; ACES Filmic, PBR, Environment Maps</li>
          </ul>
        </div>

        <div className="info-card">
          <div className="info-card__icon">
            {/* sliders icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </div>
          <h3 className="info-card__title">Customizable</h3>
          <ul className="info-card__list">
            <li><strong>modelPath</strong> &mdash; Any GLB/GLTF file</li>
            <li><strong>scale</strong> &mdash; Uniform or per-axis</li>
            <li><strong>rotationSpeed</strong> &mdash; Auto-rotate speed</li>
            <li><strong>environmentPreset</strong> &mdash; 10 presets</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
