import React from 'react';
import ko from '../../locales/ko.json';
import en from '../../locales/en.json';
import ja from '../../locales/ja.json';

// 클래스 컴포넌트 + 크래시 화면 특성상 LanguageContext에 의존하지 않고
// 저장된 로케일로 언어팩을 직접 조회한다 (컨텍스트 붕괴 시에도 동작 보장).
const EB_DICTS = { ko, en, ja };
const ebText = (key) => {
  let locale = 'ko';
  try { locale = localStorage.getItem('prs_locale') || 'ko'; } catch { /* 저장소 접근 불가 시 ko */ }
  const dict = EB_DICTS[locale] || EB_DICTS.ko;
  return dict.errorBoundary?.[key] || EB_DICTS.ko.errorBoundary[key];
};

/**
 * Premium PriSincera Error Boundary (Fault Tolerance Core v1.0)
 * Design: High-fidelity restrained dark-mode layout with custom glassmorphism card
 * and micro-animations for exquisite recovery.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorType: null };
  }

  static getDerivedStateFromError(error) {
    const isChunkError = error.name === 'ChunkLoadError' || 
                         error.message?.includes('Failed to fetch dynamically imported module') ||
                         error.message?.includes('error loading dynamically imported module');
    return { hasError: true, errorType: isChunkError ? 'chunk' : 'generic' };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleRecover = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunk = this.state.errorType === 'chunk';
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'radial-gradient(circle at center, #0B0A0F 0%, #050505 100%)',
          color: '#F4F4F5',
          fontFamily: "'Pretendard Variable', 'Pretendard', system-ui, -apple-system, sans-serif",
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background ambient glowing pulse */}
          <div style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: isChunk ? 'rgba(34, 211, 238, 0.03)' : 'rgba(139, 92, 246, 0.03)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'ambientPulse 8s infinite ease-in-out'
          }} />

          {/* Exquisite Glassmorphism Recovery Card */}
          <div style={{
            background: 'rgba(20, 20, 25, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '24px',
            padding: '40px 32px',
            maxWidth: '440px',
            boxShadow: '0 24px 60px -15px rgba(0, 0, 0, 0.7)',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Visual Icon Art */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: isChunk ? 'rgba(34, 211, 238, 0.08)' : 'rgba(139, 92, 246, 0.08)',
              border: isChunk ? '1px solid rgba(34, 211, 238, 0.15)' : '1px solid rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '24px',
              boxShadow: isChunk ? '0 0 20px rgba(34, 211, 238, 0.05)' : '0 0 20px rgba(139, 92, 246, 0.05)'
            }}>
              {isChunk ? '📡' : '🛡️'}
            </div>

            {/* Error Message */}
            <h1 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
              lineHeight: 1.4
            }}>
              {isChunk ? ebText('chunkTitle') : ebText('genericTitle')}
            </h1>
            
            <p style={{
              fontSize: '13px',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '32px',
              wordBreak: 'keep-all'
            }}>
              {isChunk ? ebText('chunkDesc') : ebText('genericDesc')}
            </p>

            {/* Premium Interactive Action Button */}
            <button 
              onClick={this.handleRecover}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 28px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '99px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
            >
              {ebText('restore')}
            </button>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes ambientPulse {
              0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
            }
          ` }} />
        </div>
      );
    }

    return this.props.children;
  }
}
