/**
 * Shared SVG gradient definitions used across hero components.
 * Rendered once at the top of the page and referenced by id.
 */
function SvgDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <linearGradient id="g-up" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="g-down" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.75"/>
          <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.2"/>
        </linearGradient>
        <linearGradient id="g-edge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id="g-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.7"/>
          <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="g-amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7"/>
        </linearGradient>
        <radialGradient id="g-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.4"/>
          <stop offset="60%" stopColor="#7C3AED" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"/>
        </radialGradient>
        <filter id="glow-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-lg" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-xl" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="14" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export default SvgDefs;
