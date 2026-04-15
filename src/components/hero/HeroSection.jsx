import { useState, useCallback, useRef, useEffect } from 'react';
import useMousePosition from '../../hooks/useMousePosition';
import StarField from './StarField';
import ConstellationAssembly from './ConstellationAssembly';
import EnergyCirculation from './EnergyCirculation';
import HeroContent from './HeroContent';
import SvgDefs from '../common/SvgDefs';
import './HeroSection.css';

/**
 * Hero Section — orchestrates all layers:
 * StarField canvas → Constellation Assembly SVG → Energy Circulation canvas → Text content
 * Floating control panel with music + zodiac toggles.
 */
export default function HeroSection() {
  const { raw: rawMouseRef } = useMousePosition();
  const [assemblyDone, setAssemblyDone] = useState(false);
  const [zodiacShowAll, setZodiacShowAll] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const audioRef = useRef(null);
  const musicIntentRef = useRef(true); // user wants music ON

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/bgm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }
    return audioRef.current;
  }, []);

  // Auto-play when assembly completes
  useEffect(() => {
    if (!assemblyDone || !musicIntentRef.current) return;
    const audio = getAudio();
    const tryPlay = () => {
      audio.play().then(() => {
        setMusicPlaying(true);
      }).catch(() => {
        // Autoplay blocked — wait for first user interaction
        setMusicPlaying(true); // show ON in UI (intent)
        const resume = () => {
          if (musicIntentRef.current) {
            audio.play().catch(() => {});
          }
          document.removeEventListener('click', resume);
          document.removeEventListener('touchstart', resume);
        };
        document.addEventListener('click', resume, { once: true });
        document.addEventListener('touchstart', resume, { once: true });
      });
    };
    tryPlay();
  }, [assemblyDone, getAudio]);

  const onAssemblyComplete = useCallback(() => {
    setAssemblyDone(true);
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = getAudio();
    if (musicPlaying) {
      audio.pause();
      musicIntentRef.current = false;
      setMusicPlaying(false);
    } else {
      musicIntentRef.current = true;
      audio.play().then(() => {
        setMusicPlaying(true);
      }).catch(() => {
        setMusicPlaying(false);
      });
    }
  }, [musicPlaying, getAudio]);

  return (
    <section className="hero" id="hero">
      <SvgDefs />
      <StarField
        rawMouseRef={rawMouseRef}
        zodiacActive={assemblyDone}
        zodiacShowAll={zodiacShowAll}
      />
      <div className="hero-center">
        <ConstellationAssembly
          rawMouseRef={rawMouseRef}
          onAssemblyComplete={onAssemblyComplete}
        />
        <HeroContent visible={assemblyDone} />
      </div>
      <EnergyCirculation rawMouseRef={rawMouseRef} active={assemblyDone} />

      {/* Floating control panel — bottom-right */}
      {assemblyDone && (
        <div className="control-panel" id="controlPanel">
          {/* Music row */}
          <div className="control-row" onClick={toggleMusic} role="button" tabIndex={0} aria-label="Toggle music">
            <svg viewBox="0 0 28 28" fill="none" className={`control-icon ${musicPlaying ? 'active' : ''}`}>
              {musicPlaying ? (
                <>
                  <path d="M10 10 C8 12.5, 8 15.5, 10 18" stroke="url(#g-edge)" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />
                  <path d="M7 7.5 C4 11, 4 17, 7 20.5" stroke="url(#g-edge)" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.55" />
                  <path d="M18 10 C20 12.5, 20 15.5, 18 18" stroke="url(#g-edge)" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />
                  <path d="M21 7.5 C24 11, 24 17, 21 20.5" stroke="url(#g-edge)" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.55" />
                  <circle cx="14" cy="14" r="2" fill="#FFFFFF" opacity="0.8" />
                </>
              ) : (
                <>
                  <path d="M10 10 C8 12.5, 8 15.5, 10 18" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.35" />
                  <path d="M18 10 C20 12.5, 20 15.5, 18 18" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.35" />
                  <line x1="8" y1="8" x2="20" y2="20" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />
                  <circle cx="14" cy="14" r="1.5" fill="currentColor" opacity="0.25" />
                </>
              )}
            </svg>
            <div className={`switch-track ${musicPlaying ? 'on' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>

          {/* Divider */}
          <div className="control-divider" />

          {/* Zodiac row */}
          <div className="control-row" onClick={() => setZodiacShowAll(p => !p)} role="button" tabIndex={0} aria-label="Toggle constellations">
            <svg viewBox="0 0 44 44" fill="none" className={`control-icon ${zodiacShowAll ? 'active' : ''}`}>
              {/* Orbit circle */}
              <circle
                cx="22" cy="22" r="19"
                fill="none"
                stroke={zodiacShowAll ? 'url(#g-orbit)' : 'currentColor'}
                strokeWidth={zodiacShowAll ? '1.2' : '0.8'}
                strokeDasharray={zodiacShowAll ? '115 4' : '8 6'}
                strokeLinecap="round"
                opacity={zodiacShowAll ? '0.8' : '0.3'}
                className={zodiacShowAll ? 'orbit-spin-slow' : ''}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              {/* Up triangle △ */}
              <path
                d="M22 7 L35 29 L9 29 Z"
                fill={zodiacShowAll ? 'url(#g-up)' : 'none'}
                stroke={zodiacShowAll ? 'url(#g-edge)' : 'currentColor'}
                strokeWidth={zodiacShowAll ? '0.8' : '0.6'}
                strokeLinejoin="round"
                opacity={zodiacShowAll ? '1' : '0.35'}
              />
              {/* Down triangle ▽ */}
              <path
                d="M22 37 L9 15 L35 15 Z"
                fill={zodiacShowAll ? 'url(#g-down)' : 'none'}
                stroke={zodiacShowAll ? 'url(#g-edge)' : 'currentColor'}
                strokeWidth={zodiacShowAll ? '0.8' : '0.6'}
                strokeLinejoin="round"
                opacity={zodiacShowAll ? '1' : '0.35'}
              />
              {/* Amber accent */}
              {zodiacShowAll && (
                <path d="M28.5 24 L35 29 L30 29 Z" fill="url(#g-amber)" opacity="0.7" />
              )}
              {/* Core light */}
              <circle
                cx="22" cy="22"
                r={zodiacShowAll ? '2.5' : '1.5'}
                fill={zodiacShowAll ? '#FFFFFF' : 'currentColor'}
                opacity={zodiacShowAll ? '0.9' : '0.25'}
              />
              {/* Core glow */}
              {zodiacShowAll && (
                <circle cx="22" cy="22" r="5" fill="url(#g-core-glow)" opacity="0.4" />
              )}
            </svg>
            <div className={`switch-track ${zodiacShowAll ? 'on' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>
        </div>
      )}

      <div className="scroll-indicator" id="scrollIndicator">
        <div className="scroll-line"></div>
        <span className="scroll-text">SCROLL</span>
      </div>
    </section>
  );
}
