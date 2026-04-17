import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
 *
 * Props:
 * - forceShowAllConstellations: scroll-driven signal to reveal all zodiac constellations
 * - scrollProgress: 0-1 value representing the hero-to-content scroll transition
 *
 * Constellation toggle logic:
 * - User can toggle constellations ON/OFF at any time via the STAR MAP button
 * - Scroll past 30% also triggers constellations ON automatically
 * - effectiveShowAll = forceShowAll OR userToggledOn
 */
export default function HeroSection({ forceShowAllConstellations = false, contentVisible = false, scrollProgress = 0, onIntroComplete }) {
  const { raw: rawMouseRef } = useMousePosition();
  const [assemblyDone, setAssemblyDone] = useState(false);
  const [userToggledConstellations, setUserToggledConstellations] = useState(false);
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

  // Toggle constellation visibility:
  // - User click directly toggles on/off (works at any scroll position)
  // - Scroll triggers forceShowAll → auto ON (additive)
  // - effectiveShowAll = scroll-triggered OR user-toggled-on
  const toggleConstellations = useCallback(() => {
    setUserToggledConstellations(prev => !prev);
  }, []);

  // Effective state: user toggled ON, or scroll triggered ON
  const effectiveShowAll = forceShowAllConstellations || userToggledConstellations;
  // Show as active in button UI
  const constellationsActive = effectiveShowAll;

  return (
    <section className="hero" id="hero">
      <SvgDefs />
      <StarField
        rawMouseRef={rawMouseRef}
        zodiacActive={assemblyDone}
        zodiacShowAll={effectiveShowAll}
      />
      <div className="hero-center" style={{
        opacity: scrollProgress > 0.3 ? 0 : 1,
        transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: scrollProgress > 0.3 ? 'none' : 'auto',
      }}>
        <ConstellationAssembly
          rawMouseRef={rawMouseRef}
          onAssemblyComplete={onAssemblyComplete}
        />
        <HeroContent visible={assemblyDone} onIntroComplete={onIntroComplete} />
      </div>
      <EnergyCirculation rawMouseRef={rawMouseRef} active={assemblyDone} />

      {/* BGM toggle — rendered into GNB via portal */}
      {assemblyDone && document.getElementById('gnbBgmSlot') && createPortal(
        <button
          className={`gnb-bgm-btn ${musicPlaying ? 'active' : ''}`}
          onClick={toggleMusic}
          aria-label="Toggle music"
          id="bgmToggle"
        >
          <div className={`waveform-bars ${musicPlaying ? 'on' : 'off'}`}>
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
          </div>
        </button>,
        document.getElementById('gnbBgmSlot')
      )}

      {/* Celestial Controls — Star Map toggle only */}
      {assemblyDone && createPortal(
        <div className="celestial-controls" id="celestialControls">
          {/* Constellation — Celestial Atlas */}
          <button
            className={`celestial-btn atlas-btn ${constellationsActive ? 'active' : ''}`}
            onClick={toggleConstellations}
            aria-label="Toggle constellations"
            id="atlasToggle"
          >
            <div className={`atlas-icon ${constellationsActive ? 'on' : 'off'}`}>
              <svg viewBox="0 0 26 26" fill="none">
                {/* Outer ring — celestial frame */}
                <circle cx="13" cy="13" r="11.5" fill="none" className="atlas-ring" />

                {/* Degree ticks — 12 marks around the rim */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) * Math.PI / 180;
                  const x1 = 13 + 10.2 * Math.cos(angle);
                  const y1 = 13 + 10.2 * Math.sin(angle);
                  const x2 = 13 + 11.5 * Math.cos(angle);
                  const y2 = 13 + 11.5 * Math.sin(angle);
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      className="atlas-tick" strokeWidth="0.5" />
                  );
                })}

                {/* Grid lines — celestial equator + meridian */}
                <line x1="3" y1="13" x2="23" y2="13" className="atlas-grid"
                  stroke="rgba(103, 232, 249, 0.3)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
                <line x1="13" y1="3" x2="13" y2="23" className="atlas-grid"
                  stroke="rgba(103, 232, 249, 0.3)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />

                {/* Ecliptic arc */}
                <ellipse cx="13" cy="13" rx="8" ry="4" className="atlas-grid"
                  stroke="rgba(196, 181, 253, 0.2)" strokeWidth="0.4" fill="none"
                  transform="rotate(-25 13 13)" />

                {/* Star dots — mini constellation pattern */}
                <circle cx="8" cy="8" r="0.8" className="atlas-star" />
                <circle cx="16" cy="7" r="1" className="atlas-star" />
                <circle cx="19" cy="11" r="0.7" className="atlas-star" />
                <circle cx="10" cy="13" r="0.6" className="atlas-star" />
                <circle cx="15" cy="15" r="0.9" className="atlas-star" />
                <circle cx="7" cy="17" r="0.7" className="atlas-star" />
                <circle cx="18" cy="18" r="0.6" className="atlas-star" />

                {/* Constellation lines — connecting stars */}
                <line x1="8" y1="8" x2="16" y2="7" className="atlas-line" />
                <line x1="16" y1="7" x2="19" y2="11" className="atlas-line" />
                <line x1="19" y1="11" x2="15" y2="15" className="atlas-line" />
                <line x1="10" y1="13" x2="15" y2="15" className="atlas-line" />
                <line x1="7" y1="17" x2="10" y2="13" className="atlas-line" />
                <line x1="15" y1="15" x2="18" y2="18" className="atlas-line" />
              </svg>
            </div>
            <span className="ctrl-tooltip">STAR MAP</span>
          </button>
        </div>,
        document.body
      )}

      {/* Scroll indicator — fades out as user scrolls */}
      <div
        className="scroll-indicator"
        id="scrollIndicator"
        style={{ opacity: Math.max(0, 1 - scrollProgress * 5) }}
      >
        <div className="scroll-line"></div>
        <span className="scroll-text">SCROLL</span>
      </div>
    </section>
  );
}
