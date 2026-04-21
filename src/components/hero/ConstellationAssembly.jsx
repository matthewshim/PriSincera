import { useRef, useEffect, useCallback } from 'react';

// CI ×1.25 exact geometry
const TARGETS = [
  { id: 'v1', x: 250, y: 75,  color: '#C4B5FD', r: 5 },
  { id: 'v2', x: 406, y: 346, color: '#C4B5FD', r: 5 },
  { id: 'v3', x: 94,  y: 346, color: '#C4B5FD', r: 5 },
  { id: 'v4', x: 250, y: 425, color: '#A78BFA', r: 5 },
  { id: 'v5', x: 94,  y: 154, color: '#A78BFA', r: 5 },
  { id: 'v6', x: 406, y: 154, color: '#A78BFA', r: 5 },
  { id: 'i1', x: 173, y: 206, color: '#E9D5FF', r: 3 },
  { id: 'i2', x: 328, y: 206, color: '#E9D5FF', r: 3 },
  { id: 'i3', x: 173, y: 294, color: '#E9D5FF', r: 3 },
  { id: 'i4', x: 328, y: 294, color: '#E9D5FF', r: 3 },
  { id: 'i5', x: 250, y: 154, color: '#E9D5FF', r: 3 },
  { id: 'i6', x: 250, y: 346, color: '#E9D5FF', r: 3 },
];

const EDGES = [
  { from: 'v1', to: 'v2', color: '#C4B5FD', width: 1.2, delay: 0 },
  { from: 'v2', to: 'v3', color: '#C4B5FD', width: 1.2, delay: 200 },
  { from: 'v3', to: 'v1', color: '#C4B5FD', width: 1.2, delay: 400 },
  { from: 'v4', to: 'v5', color: '#A78BFA', width: 1.2, delay: 650 },
  { from: 'v5', to: 'v6', color: '#A78BFA', width: 1.2, delay: 850 },
  { from: 'v6', to: 'v4', color: '#A78BFA', width: 1.2, delay: 1050 },
  { from: 'i5', to: 'i2', color: '#E9D5FF', width: 0.5, delay: 1350 },
  { from: 'i2', to: 'i4', color: '#E9D5FF', width: 0.5, delay: 1500 },
  { from: 'i4', to: 'i6', color: '#E9D5FF', width: 0.5, delay: 1650 },
  { from: 'i6', to: 'i3', color: '#E9D5FF', width: 0.5, delay: 1800 },
  { from: 'i3', to: 'i1', color: '#E9D5FF', width: 0.5, delay: 1950 },
  { from: 'i1', to: 'i5', color: '#E9D5FF', width: 0.5, delay: 2100 },
];

const OUTER_NODES = [
  { cx: 55,  cy: 55,  r: 2,   color: '#C4B5FD' },
  { cx: 445, cy: 75,  r: 2.5, color: '#A78BFA' },
  { cx: 475, cy: 260, r: 1.8, color: '#E9D5FF' },
  { cx: 455, cy: 435, r: 2,   color: '#FDE68A' },
  { cx: 45,  cy: 425, r: 2.2, color: '#67E8F9' },
  { cx: 25,  cy: 195, r: 1.5, color: '#F0ABFC' },
  { cx: 155, cy: 25,  r: 1.8, color: '#C4B5FD' },
  { cx: 345, cy: 20,  r: 1.5, color: '#A78BFA' },
  { cx: 475, cy: 375, r: 2,   color: '#E9D5FF' },
  { cx: 15,  cy: 345, r: 1.6, color: '#67E8F9' },
];

const OUTER_LINKS = [[0,6],[1,7],[3,4],[5,9],[6,7],[8,3]];

/**
 * Constellation Assembly — 12 nodes fly in, connect, and form the Star Prism.
 * All transitions use smooth CSS easing for natural, organic feel.
 * onAssemblyComplete callback fires when all animations finish.
 */
export default function ConstellationAssembly({ rawMouseRef, onAssemblyComplete }) {
  const svgRef = useRef(null);
  const nodesRef = useRef(null);
  const edgesRef = useRef(null);
  const outerNodesRef = useRef(null);
  const constellationLinesRef = useRef(null);
  const starBodyRef = useRef(null);

  const runAssembly = useCallback(() => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const nodesGroup = nodesRef.current;
    const edgesGroup = edgesRef.current;
    const outerGroup = outerNodesRef.current;
    const linesGroup = constellationLinesRef.current;
    if (!nodesGroup || !edgesGroup) return;

    // --- Utility: Apply smooth SVG transition via style ---
    function smoothAttr(el, props, duration = '0.8s', easing = 'cubic-bezier(0.16, 1, 0.3, 1)') {
      const transProps = Object.keys(props).map(p => {
        // SVG attribute names -> CSS transition property names
        if (p === 'stroke-opacity') return 'stroke-opacity';
        if (p === 'stroke-dashoffset') return 'stroke-dashoffset';
        return p;
      });
      el.style.transition = transProps.map(p => `${p} ${duration} ${easing}`).join(', ');
      // Set after a microtask to ensure transition is registered
      requestAnimationFrame(() => {
        Object.entries(props).forEach(([k, v]) => el.setAttribute(k, v));
      });
    }

    // Create scattered nodes with initial transition setup
    const nodeElements = {};
    const scatterPos = {};

    TARGETS.forEach((t) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 200;
      const sx = 250 + Math.cos(angle) * dist;
      const sy = 250 + Math.sin(angle) * dist;
      scatterPos[t.id] = { x: sx, y: sy };

      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', sx);
      circle.setAttribute('cy', sy);
      circle.setAttribute('r', '0'); // Start at zero size
      circle.setAttribute('fill', t.color);
      circle.setAttribute('opacity', '0');
      circle.style.filter = 'blur(2px)'; // Start blurry
      circle.style.transition = 'opacity 0.6s ease-out, r 0.5s ease-out, filter 0.8s ease-out';
      nodesGroup.appendChild(circle);
      nodeElements[t.id] = { el: circle, target: t, current: { x: sx, y: sy } };
    });

    // Create edges with smoother transitions
    const edgeElements = [];
    EDGES.forEach((e) => {
      const fromT = TARGETS.find(t => t.id === e.from);
      const toT = TARGETS.find(t => t.id === e.to);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', fromT.x);
      line.setAttribute('y1', fromT.y);
      line.setAttribute('x2', toT.x);
      line.setAttribute('y2', toT.y);
      line.setAttribute('stroke', e.color);
      line.setAttribute('stroke-width', e.width);
      line.setAttribute('stroke-opacity', '0');
      const length = Math.hypot(toT.x - fromT.x, toT.y - fromT.y);
      line.setAttribute('stroke-dasharray', length);
      line.setAttribute('stroke-dashoffset', length);
      // Longer, smoother edge drawing
      line.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1), stroke-opacity 0.8s ease-in-out';
      edgesGroup.appendChild(line);
      edgeElements.push({ el: line, data: e });
    });

    /* ─── Phase 1: Nodes fade in gradually from blur (0.4s–1.2s) ─── */
    setTimeout(() => {
      Object.values(nodeElements).forEach((n, i) => {
        const delay = i * 80; // More stagger between nodes
        setTimeout(() => {
          n.el.setAttribute('opacity', '0.5');
          n.el.setAttribute('r', n.target.r * 0.4);
          n.el.style.filter = 'blur(0.5px)';
        }, delay);
        // Second stage: brighten further
        setTimeout(() => {
          n.el.setAttribute('opacity', '0.7');
          n.el.style.filter = 'blur(0px)';
        }, delay + 300);
      });
    }, 400);

    /* ─── Phase 2: Nodes fly to targets with smooth cubic easing (1.4s–3.6s) ─── */
    const FLIGHT_START = 1400;
    const FLIGHT_DURATION = 2200; // Longer, more graceful flight

    setTimeout(() => {
      const startTime = performance.now();

      function animateFlight(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / FLIGHT_DURATION, 1);
        // Smoother ease: cubic ease-in-out
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        Object.values(nodeElements).forEach((n) => {
          const s = scatterPos[n.target.id];
          const cx = s.x + (n.target.x - s.x) * eased;
          const cy = s.y + (n.target.y - s.y) * eased;
          n.el.setAttribute('cx', cx);
          n.el.setAttribute('cy', cy);

          // Size grows gradually during flight
          const targetR = n.target.r;
          n.el.setAttribute('r', targetR * (0.4 + 0.6 * eased));

          // Brightness increases as nodes approach
          const opacity = 0.5 + 0.5 * eased;
          n.el.setAttribute('opacity', opacity.toFixed(3));

          // Subtle glow intensifies near destination
          if (eased > 0.7) {
            const glowIntensity = (eased - 0.7) / 0.3;
            n.el.style.filter = `drop-shadow(0 0 ${2 + glowIntensity * 4}px ${n.target.color})`;
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animateFlight);
        } else {
          onFlightDone();
        }
      }

      requestAnimationFrame(animateFlight);
    }, FLIGHT_START);

    /* ─── Phase 3: Nodes settle + edges draw (3.6s–6s) ─── */
    function onFlightDone() {
      // Smooth settle: gentle pulse then stabilize (no abrupt flash)
      Object.values(nodeElements).forEach((n, i) => {
        const el = n.el;
        const origR = n.target.r;

        // Gentle glow pulse on arrival (staggered by index)
        setTimeout(() => {
          el.style.transition = 'r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out, filter 0.6s ease-out';
          el.setAttribute('r', origR * 1.4);
          el.setAttribute('opacity', '1');
          el.style.filter = `drop-shadow(0 0 6px ${n.target.color})`;
        }, i * 30);

        // Settle back to normal size
        setTimeout(() => {
          el.style.transition = 'r 0.8s ease-out, filter 1s ease-out';
          el.setAttribute('r', origR);
          el.style.filter = `drop-shadow(0 0 2px ${n.target.color})`;
        }, i * 30 + 500);
      });

      // Draw edges (delayed start, smoother stagger)
      edgeElements.forEach(({ el, data }) => {
        setTimeout(() => {
          el.setAttribute('stroke-opacity', '0.4');
          el.setAttribute('stroke-dashoffset', '0');
        }, data.delay);
      });

      const maxDelay = Math.max(...EDGES.map(e => e.delay));
      setTimeout(revealFaces, maxDelay + 600);
    }

    /* ─── Phase 4: Faces fill in with soft gradual opacity (6s–8s) ─── */
    function revealFaces() {
      const body = starBodyRef.current;
      if (!body) return;
      const triDown = body.querySelector('#triDown');
      const triUp = body.querySelector('#triUp');
      const hexInner = body.querySelector('#hexInner');
      const refrLines = body.querySelector('#refractionLines');
      const triAmber = body.querySelector('#triAmber');

      // Apply transitions to all face elements
      [triDown, triUp, hexInner, refrLines, triAmber].forEach(el => {
        if (el) el.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      });

      // Staggered reveal with gradual opacity build-up
      // Down triangle: fade to 0.3 first, then full
      if (triDown) {
        triDown.setAttribute('opacity', '0.35');
        setTimeout(() => { triDown.setAttribute('opacity', '1'); }, 500);
      }

      // Up triangle overlaps with down triangle's second stage
      setTimeout(() => {
        if (triUp) {
          triUp.setAttribute('opacity', '0.35');
          setTimeout(() => { triUp.setAttribute('opacity', '1'); }, 500);
        }
      }, 400);

      // Inner hex and refraction lines fade in after both triangles are partially visible
      setTimeout(() => {
        if (hexInner) hexInner.setAttribute('opacity', '1');
        if (refrLines) {
          refrLines.style.transition = 'opacity 1.5s ease-in-out';
          refrLines.setAttribute('opacity', '0.3');
        }
      }, 900);

      // Amber accent last, subtle entrance
      setTimeout(() => {
        if (triAmber) {
          triAmber.style.transition = 'opacity 1s ease-in-out';
          triAmber.setAttribute('opacity', '0.75');
        }
      }, 1200);

      setTimeout(igniteCore, 1500);
    }

    /* ─── Phase 5: Core ignition — gradual glow build (8s–9.5s) ─── */
    function igniteCore() {
      const body = starBodyRef.current;
      if (!body) return;
      const dot = body.querySelector('#coreDot');
      const light = body.querySelector('#coreLight');
      const glow = body.querySelector('#coreGlow');
      const orbit = svgRef.current?.querySelector('#orbitGroup');
      const heroGlow = document.getElementById('heroGlow');

      // Core dot: tiny spark first, then brighten
      if (dot) {
        dot.style.transition = 'opacity 0.6s ease-in-out';
        dot.setAttribute('opacity', '0.4');
        setTimeout(() => {
          dot.style.transition = 'opacity 0.8s ease-out';
          dot.setAttribute('opacity', '1');
        }, 400);
      }

      // Core light: gradual bloom
      setTimeout(() => {
        if (light) {
          light.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)';
          light.setAttribute('opacity', '0.3');
          setTimeout(() => {
            light.setAttribute('opacity', '0.85');
          }, 500);
        }
      }, 300);

      // Core glow: slow expansion
      setTimeout(() => {
        if (glow) {
          glow.style.transition = 'opacity 1.5s ease-out';
          glow.setAttribute('opacity', '0.2');
          setTimeout(() => {
            glow.setAttribute('opacity', '0.5');
          }, 600);
        }
      }, 600);

      // Orbit ring: smooth fade in
      setTimeout(() => {
        if (orbit) orbit.classList.add('visible');
      }, 900);

      // Hero background glow: very slow bloom
      setTimeout(() => {
        if (heroGlow) heroGlow.classList.add('active');
      }, 1100);

      // Fade assembly scaffolding: slow, graceful exit
      setTimeout(() => {
        edgeElements.forEach(({ el }) => {
          el.style.transition = 'stroke-opacity 2s ease-in-out';
          el.setAttribute('stroke-opacity', '0.12');
        });
        Object.values(nodeElements).forEach(n => {
          n.el.style.transition = 'opacity 2s ease-in-out, filter 2s ease-in-out';
          n.el.setAttribute('opacity', '0.4');
          n.el.style.filter = 'drop-shadow(0 0 1px rgba(196,181,253,0.3))';
        });
      }, 1200);

      // Outer constellation starts building during core glow
      setTimeout(() => {
        buildOuterConstellation(outerGroup, linesGroup, svgNS);
      }, 1400);

      setTimeout(() => {
        onAssemblyComplete?.();
      }, 1800);
    }

    /* ─── Outer constellation: ambient star connections ─── */
    function buildOuterConstellation(outerGroup, linesGroup, svgNS) {
      if (!outerGroup || !linesGroup) return;
      const verts = TARGETS.slice(0, 6);

      OUTER_NODES.forEach((sn, i) => {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', sn.cx);
        circle.setAttribute('cy', sn.cy);
        circle.setAttribute('r', '0');
        circle.setAttribute('fill', sn.color);
        circle.setAttribute('opacity', '0');
        outerGroup.appendChild(circle);

        // Grow and fade in simultaneously
        setTimeout(() => {
          circle.style.transition = 'opacity 1s ease-out, r 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
          circle.setAttribute('opacity', '0.6');
          circle.setAttribute('r', sn.r);
        }, i * 180);

        // Find nearest vertex
        let minD = Infinity, nearest = verts[0];
        for (const v of verts) {
          const d = Math.hypot(sn.cx - v.x, sn.cy - v.y);
          if (d < minD) { minD = d; nearest = v; }
        }

        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', nearest.x);
        line.setAttribute('y1', nearest.y);
        line.setAttribute('x2', sn.cx);
        line.setAttribute('y2', sn.cy);
        line.setAttribute('stroke', sn.color);
        line.setAttribute('stroke-width', '0.4');
        line.setAttribute('stroke-opacity', '0');
        line.setAttribute('stroke-dasharray', '3 6');

        // Draw line via dashoffset for a "line drawing" effect
        const lineLength = Math.hypot(sn.cx - nearest.x, sn.cy - nearest.y);
        line.setAttribute('stroke-dasharray', lineLength);
        line.setAttribute('stroke-dashoffset', lineLength);
        linesGroup.appendChild(line);

        setTimeout(() => {
          line.style.transition = 'stroke-opacity 1s ease-out, stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
          line.setAttribute('stroke-opacity', '0.15');
          line.setAttribute('stroke-dashoffset', '0');
          // After draw, switch to dotted pattern
          setTimeout(() => {
            line.style.transition = 'stroke-dasharray 0.8s ease';
            line.setAttribute('stroke-dasharray', '3 6');
          }, 1300);
        }, 400 + i * 200);
      });

      OUTER_LINKS.forEach(([a, b], i) => {
        const na = OUTER_NODES[a], nb = OUTER_NODES[b];
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', na.cx);
        line.setAttribute('y1', na.cy);
        line.setAttribute('x2', nb.cx);
        line.setAttribute('y2', nb.cy);
        line.setAttribute('stroke', '#C4B5FD');
        line.setAttribute('stroke-width', '0.3');
        line.setAttribute('stroke-opacity', '0');
        line.setAttribute('stroke-dasharray', '4 8');
        linesGroup.appendChild(line);

        setTimeout(() => {
          line.style.transition = 'stroke-opacity 1s ease-in-out';
          line.setAttribute('stroke-opacity', '0.1');
        }, 2200 + i * 200);
      });
    }
  }, [onAssemblyComplete]);

  // Parallax effect
  useEffect(() => {
    const body = starBodyRef.current;
    if (!body) return;
    let curX = 0, curY = 0, frameId;
    let lastFrameTime = 0;
    const FPS_INTERVAL = 1000 / 30;

    function animateFrame() {
      const stage = svgRef.current?.closest('.star-constellation');
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = rawMouseRef?.current?.x ?? cx;
      const my = rawMouseRef?.current?.y ?? cy;
      const dx = (mx - cx) / window.innerWidth;
      const dy = (my - cy) / window.innerHeight;
      curX += (dx * 18 - curX) * 0.06;
      curY += (dy * 14 - curY) * 0.06;
      body.style.transform = `translate(${curX}px, ${curY}px)`;
    }

    function animate(now) {
      frameId = requestAnimationFrame(animate);
      if (now - lastFrameTime < FPS_INTERVAL) return;
      lastFrameTime = now;
      animateFrame();
    }
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [rawMouseRef]);

  // Start assembly on mount — only animate on first visit per session
  useEffect(() => {
    const PLAYED_KEY = 'prisincera_ci_played';
    if (sessionStorage.getItem(PLAYED_KEY)) {
      // Skip animation: show final state immediately
      const body = starBodyRef.current;
      if (body) {
        const triDown = body.querySelector('#triDown');
        const triUp = body.querySelector('#triUp');
        const hexInner = body.querySelector('#hexInner');
        const refrLines = body.querySelector('#refractionLines');
        const triAmber = body.querySelector('#triAmber');
        const dot = body.querySelector('#coreDot');
        const light = body.querySelector('#coreLight');
        const glow = body.querySelector('#coreGlow');
        [triDown, triUp].forEach(el => el?.setAttribute('opacity', '1'));
        hexInner?.setAttribute('opacity', '1');
        refrLines?.setAttribute('opacity', '0.3');
        triAmber?.setAttribute('opacity', '0.75');
        dot?.setAttribute('opacity', '1');
        light?.setAttribute('opacity', '0.85');
        glow?.setAttribute('opacity', '0.5');
      }
      const orbit = svgRef.current?.querySelector('#orbitGroup');
      if (orbit) orbit.classList.add('visible');
      const heroGlow = document.getElementById('heroGlow');
      if (heroGlow) heroGlow.classList.add('active');
      // Fire completion callback immediately
      onAssemblyComplete?.();
    } else {
      runAssembly();
      sessionStorage.setItem(PLAYED_KEY, '1');
    }
  }, [runAssembly, onAssemblyComplete]);

  return (
    <div className="star-constellation" id="starConstellation">
      <div className="hero-glow" id="heroGlow"></div>
      <svg className="star-prism-svg" viewBox="0 0 500 500" fill="none" ref={svgRef}>
        <circle cx="250" cy="250" r="220" fill="url(#g-core-glow)" opacity="0.04" className="star-aura"/>
        <g className="constellation-lines" ref={constellationLinesRef}></g>
        <g className="orbit-group" id="orbitGroup">
          <circle className="orbit-ring orbit-spin" cx="250" cy="250" r="219"
                  fill="none" stroke="url(#g-orbit)" strokeWidth="1.2"
                  strokeDasharray="1325 50" strokeLinecap="round"/>
        </g>
        <g className="outer-nodes" ref={outerNodesRef}></g>
        <g className="star-body" ref={starBodyRef}>
          <path className="tri-down" id="triDown" d="M250 425 L94 154 L406 154 Z"
                fill="url(#g-down)" stroke="url(#g-edge)" strokeWidth="1.5" strokeLinejoin="round" opacity="0"/>
          <path className="tri-up" id="triUp" d="M250 75 L406 346 L94 346 Z"
                fill="url(#g-up)" stroke="url(#g-edge)" strokeWidth="1.5" strokeLinejoin="round" opacity="0"/>
          <path className="tri-amber" id="triAmber" d="M329 294 L406 346 L344 346 Z"
                fill="url(#g-amber)" opacity="0"/>
          <path className="hex-inner" id="hexInner"
                d="M173 206 L250 154 L328 206 L328 294 L250 346 L173 294 Z"
                fill="rgba(124,58,237,0.06)" stroke="rgba(196,181,253,0.15)" strokeWidth="0.8" opacity="0"/>
          <g className="refraction-lines" id="refractionLines" opacity="0">
            <line x1="250" y1="154" x2="250" y2="346" stroke="#E9D5FF" strokeWidth="0.6"/>
            <line x1="173" y1="206" x2="328" y2="294" stroke="#C4B5FD" strokeWidth="0.5"/>
            <line x1="328" y1="206" x2="173" y2="294" stroke="#FDE68A" strokeWidth="0.5"/>
          </g>
          <circle className="core-glow" id="coreGlow" cx="250" cy="250" r="18"
                  fill="url(#g-core-glow)" filter="url(#glow-xl)" opacity="0"/>
          <circle className="core-light" id="coreLight" cx="250" cy="250" r="8"
                  fill="#FFFFFF" filter="url(#glow-lg)" opacity="0"/>
          <circle className="core-dot" id="coreDot" cx="250" cy="250" r="4"
                  fill="#FFFFFF" opacity="0"/>
        </g>
        <g className="assembly-edges" ref={edgesRef}></g>
        <g className="assembly-nodes" ref={nodesRef}></g>
      </svg>
      <canvas className="energy-canvas" id="energyCanvas"></canvas>
    </div>
  );
}
