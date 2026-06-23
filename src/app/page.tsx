import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="model-page" style={{ justifyContent: 'center', gap: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '540px' }}>
        <div className="model-page__badge">NEXT.JS + THREE.JS</div>
        <h1 className="model-page__title">3D Model Viewer</h1>
        <p className="model-page__subtitle">
          A production-ready, interactive GLB model viewer built with React Three Fiber,
          Draco compression support, and PBR environment lighting.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link
            href="/model-view"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 24px rgba(99, 102, 241, 0.35)',
            }}
          >
            View 3D Model
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
