import { useRef, useEffect } from 'react';

/* ============================================================
   Zodiac Constellation Data
   12 zodiac constellations with simplified star patterns.
   Positions are offsets in px from constellation center.
   ============================================================ */
const ZODIACS = [
  {
    // ♈ Aries — γ→β→α→41Ari (Mesarthim→Sheratan→Hamal→41Ari)
    name: 'Aries', sub: 'The Ram', symbol: '♈',
    cx: 0.10, cy: 0.18,
    stars: [[16,12],[15,7],[4,-3],[-35,-17]],
    lines: [[3,2],[2,1],[1,0]],
  },
  {
    // ♉ Taurus — Hyades V + Elnath/ζTau horns (λ→γ→δ→α→ε→β,ε→ζ)
    name: 'Taurus', sub: 'The Bull', symbol: '♉',
    cx: 0.30, cy: 0.16,
    stars: [[26,16],[14,8],[12,3],[8,-1],[4,6],[-28,-25],[-35,-6]],
    lines: [[0,1],[1,2],[2,4],[4,3],[3,5],[3,6]],
  },
  {
    // ♊ Gemini — Castor/Pollux twins (Castor→ε→μ→η, Castor→δ→Pollux, δ→ξ→γ)
    name: 'Gemini', sub: 'The Twins', symbol: '♊',
    cx: 0.52, cy: 0.15,
    stars: [[-27,-24],[-35,-13],[-16,5],[15,21],[10,-4],[26,3],[32,3],[-5,9]],
    lines: [[0,4],[4,5],[5,6],[0,2],[2,1],[2,7],[7,3]],
  },
  {
    // ♋ Cancer — β→δ→α, δ→γ→ι (Altarf→Asellus Australis→Acubens/Borealis→ι)
    name: 'Cancer', sub: 'The Crab', symbol: '♋',
    cx: 0.88, cy: 0.17,
    stars: [[-13,19],[20,28],[-1,-12],[-2,-1],[-4,-35]],
    lines: [[1,3],[3,0],[3,2],[2,4]],
  },
  {
    // ♌ Leo — Sickle: Regulus→η→Algieba→ζ→ε→μ / Body: Algieba→δ→Denebola, δ→θ→Regulus
    name: 'Leo', sub: 'The Lion', symbol: '♌',
    cx: 0.06, cy: 0.42,
    stars: [[11,13],[-35,8],[5,-1],[-19,-3],[21,-8],[11,4],[-19,7],[18,-12],[7,-8]],
    lines: [[0,5],[5,2],[2,8],[8,4],[4,7],[2,3],[3,1],[3,6],[6,0]],
  },
  {
    // ♍ Virgo — ε→δ→γ→η→β, γ→θ→Spica, γ→ζ
    name: 'Virgo', sub: 'The Maiden', symbol: '♍',
    cx: 0.92, cy: 0.35,
    stars: [[-19,24],[35,-5],[6,2],[-2,-9],[-5,-26],[18,1],[-24,0],[-10,12]],
    lines: [[4,3],[3,2],[2,5],[5,1],[2,7],[7,0],[2,6]],
  },
  {
    // ♎ Libra — α→β→γ→υ, α→σ (Zubenelgenubi→Zubeneschamali→γ→υ, α→σ)
    name: 'Libra', sub: 'The Scales', symbol: '♎',
    cx: 0.08, cy: 0.72,
    stars: [[24,-10],[0,-35],[-17,-15],[12,24],[-19,35]],
    lines: [[0,1],[1,2],[2,4],[0,3]],
  },
  {
    // ♏ Scorpius — β→δ→π→σ→Antares→τ→ε→μ→η→λ→κ (head to stinger)
    name: 'Scorpius', sub: 'The Scorpion', symbol: '♏',
    cx: 0.92, cy: 0.68,
    stars: [[24,-19],[21,-26],[25,-11],[12,-12],[7,-10],[4,-6],[-5,8],[-6,16],[-17,28],[-30,14],[-35,19]],
    lines: [[1,0],[0,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10]],
  },
  {
    // ♐ Sagittarius — Teapot: γ→ε→δ→λ→φ→σ→ζ→ε, λ→σ
    name: 'Sagittarius', sub: 'The Archer', symbol: '♐',
    cx: 0.14, cy: 0.90,
    stars: [[35,7],[19,4],[15,24],[11,-15],[-7,-8],[-18,-11],[-25,4],[-30,-5]],
    lines: [[0,2],[2,1],[1,3],[3,4],[4,5],[5,6],[6,2],[3,5]],
  },
  {
    // ♑ Capricornus — α→β→ψ→ω→θ→ζ→γ→δ→α closed loop
    name: 'Capricornus', sub: 'The Sea-Goat', symbol: '♑',
    cx: 0.36, cy: 0.92,
    stars: [[35,-20],[32,-13],[12,20],[8,25],[-3,-5],[-19,11],[-30,-7],[-35,-9]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]],
  },
  {
    // ♒ Aquarius — ε→β→α→γ→ζ→η, γ→θ→λ→δ
    name: 'Aquarius', sub: 'The Water-Bearer', symbol: '♒',
    cx: 0.60, cy: 0.92,
    stars: [[35,7],[17,0],[3,-8],[-4,-6],[-7,-9],[-9,-9],[-2,4],[-16,4],[-17,17]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[3,6],[6,7],[7,8]],
  },
  {
    // ♓ Pisces — γ→θ→ι→ω→ε→μ→ν→α→η→φ→τ (south fish cord to north fish)
    name: 'Pisces', sub: 'The Fish', symbol: '♓',
    cx: 0.84, cy: 0.88,
    stars: [[35,11],[31,6],[26,7],[19,6],[-6,4],[-17,7],[-21,8],[-29,12],[-17,-8],[-10,-22],[-10,-31]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10]],
  },
];

/**
 * Full-viewport background star field canvas.
 * Includes hidden zodiac constellations revealed by telescope proximity.
 * zodiacActive: constellations only appear after CI assembly completes.
 * zodiacShowAll: when true, all constellations are fully revealed.
 */
export default function StarField({ rawMouseRef, zodiacActive, zodiacShowAll }) {
  const canvasRef = useRef(null);
  const zodiacActiveRef = useRef(false);
  const zodiacShowAllRef = useRef(false);
  zodiacActiveRef.current = zodiacActive;
  zodiacShowAllRef.current = zodiacShowAll;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, stars = [], nebulae = [], shootingStars = [], constellations = [], frameId;
    let zodiacFade = 0; // 0 = hidden, 1 = fully visible
    let lastFrameTime = 0;
    const FPS_INTERVAL = 1000 / 30; // 30fps cap

    // Smoothed mouse position for parallax (avoids jitter)
    let smoothMx = 0, smoothMy = 0;

    let resizeTimeout;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
      }, 100);
    }

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      smoothMx = w / 2;
      smoothMy = h / 2;
      createStars();
      createNebulae();
      createConstellations();
    }

    /**
     * Create stars with depth-based properties:
     * - depth: 0 (farthest) → 1 (nearest)
     * - Size, opacity, color temperature, parallax all scale with depth
     * - Cubic distribution: most stars are far (small/dim), few are near (bright)
     */
    function createStars() {
      stars = [];
      const isMobile = w <= 768;
      const density = Math.floor((w * h) / (isMobile ? 5600 : 2800));

      // Depth-based color palettes (natural blackbody classification)
      // Far (Class O/B: blue-white): #E2ECFF, #C9DFFE, #A3C9FF
      // Mid (Class A/F: pure white, ice white): #F8F9FA, #F0F4F8, #E6ECF5
      // Near (Class G/K/M: warm whites, soft golds, orange-reds): #FFFEE8, #FFFAC7, #FFE1C2, #FFCFA3
      const colorsByDepth = {
        far:  ['#E2ECFF', '#C9DFFE', '#A3C9FF'],
        mid:  ['#F8F9FA', '#F0F4F8', '#E6ECF5'],
        near: ['#FFFEE8', '#FFFAC7', '#FFE1C2', '#FFCFA3'],
      };

      for (let i = 0; i < density; i++) {
        // Cubic distribution: depth³ makes most stars far, few near
        const rawDepth = Math.random();
        const depth = rawDepth * rawDepth * rawDepth; // 0~1, skewed toward 0

        // Select color palette based on depth
        let palette;
        if (depth < 0.15) {
          palette = colorsByDepth.far;
        } else if (depth < 0.55) {
          palette = colorsByDepth.mid;
        } else {
          palette = colorsByDepth.near;
        }
        const color = palette[Math.floor(Math.random() * palette.length)];

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          depth,
          r: 0.15 + depth * 1.8,                        // far: tiny, near: big
          color,
          twinkleSpeed: 0.003 + (1 - depth) * 0.025,    // far: slow twinkle, near: faster
          twinklePhase: Math.random() * Math.PI * 2,
          baseOpacity: 0.04 + depth * 0.55,              // far: very dim, near: bright
          parallaxFactor: depth * 0.045,                 // far: almost static, near: moves a lot
          glowRadius: depth > 0.7 ? 2 + depth * 4 : 0,  // only near stars get glow
          isSuperBright: depth > 0.88,                  // top ~1.2% brightest stars!
        });
      }

      // Sort by depth so far stars draw first (painter's algorithm)
      stars.sort((a, b) => a.depth - b.depth);
    }

    function createNebulae() {
      nebulae = [];
      const colors = [{ r:124,g:58,b:237 }, { r:167,g:139,b:250 }, { r:240,g:171,b:252 }, { r:34,g:211,b:238 }];
      // Each nebula at a different depth for parallax layering
      const depths = [0.05, 0.15, 0.08, 0.12];
      for (let i = 0; i < 4; i++) {
        const r = Math.random() * 250 + 120;
        
        // Create Offscreen Canvas for double-buffering cache
        const offCanvas = document.createElement('canvas');
        offCanvas.width = r * 2;
        offCanvas.height = r * 2;
        const offCtx = offCanvas.getContext('2d');
        
        // Draw the radial gradient on the offscreen canvas once
        const grad = offCtx.createRadialGradient(r, r, 0, r, r, r);
        const col = colors[i];
        grad.addColorStop(0, `rgba(${col.r},${col.g},${col.b},1)`);
        grad.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(r, r, r, 0, Math.PI * 2);
        offCtx.fill();

        nebulae.push({
          x: Math.random() * w, y: Math.random() * h,
          r, color: col,
          speedX: (Math.random() - 0.5) * 0.12, speedY: (Math.random() - 0.5) * 0.08,
          opacity: 0.012 + Math.random() * 0.015, phase: Math.random() * Math.PI * 2,
          depth: depths[i],
          parallaxFactor: depths[i] * 0.03,
          offCanvas, // Store cached canvas reference
        });
      }
    }

    function createConstellations() {
      const scale = Math.min(w, h) / 900;
      constellations = ZODIACS.map(z => {
        const centerX = z.cx * w;
        const centerY = z.cy * h;
        const starPositions = z.stars.map(([ox, oy]) => ({
          x: centerX + ox * scale * 1.8,
          y: centerY + oy * scale * 1.8,
        }));
        return {
          ...z,
          centerX, centerY,
          starPositions,
          revealAmount: 0, // 0 = hidden, 1 = fully revealed
        };
      });
    }

    function drawFrame() {
      ctx.clearRect(0, 0, w, h);

      // --- Mouse position & smooth parallax ---
      const rawMx = rawMouseRef?.current?.x ?? w / 2;
      const rawMy = rawMouseRef?.current?.y ?? h / 2;
      // Smooth lerp toward actual mouse for fluid parallax
      smoothMx += (rawMx - smoothMx) * 0.06;
      smoothMy += (rawMy - smoothMy) * 0.06;
      // Parallax offset base: distance from viewport center
      const centerX = w / 2, centerY = h / 2;
      const parallaxBaseX = smoothMx - centerX;
      const parallaxBaseY = smoothMy - centerY;

      // --- Background Celestial Grids (very faint Planisphere styling) ---
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.025)';
      ctx.lineWidth = 0.35;
      const centerGridX = w / 2, centerGridY = h / 2;
      const minSize = Math.min(w, h);
      
      // Declination Rings
      for (let rFactor = 0.15; rFactor <= 0.85; rFactor += 0.15) {
        ctx.beginPath();
        ctx.arc(centerGridX, centerGridY, minSize * rFactor, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Right Ascension Radial Lines
      for (let angleDeg = 0; angleDeg < 360; angleDeg += 30) {
        const rad = (angleDeg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerGridX, centerGridY);
        ctx.lineTo(centerGridX + Math.cos(rad) * minSize, centerGridY + Math.sin(rad) * minSize);
        ctx.stroke();
      }
      ctx.restore();

      // --- Telescope Lens Reticle & Grid Zoom (Clipped inside Lens) ---
      const LENS_RADIUS = 240;       // wider telescope field of view
      ctx.save();
      ctx.beginPath();
      ctx.arc(rawMx, rawMy, LENS_RADIUS, 0, Math.PI * 2);
      ctx.clip();
      
      // Declination Rings (Brighter inside lens)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.09)';
      ctx.lineWidth = 0.5;
      for (let rFactor = 0.15; rFactor <= 0.85; rFactor += 0.15) {
        ctx.beginPath();
        ctx.arc(centerGridX, centerGridY, minSize * rFactor, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Right Ascension Lines
      for (let angleDeg = 0; angleDeg < 360; angleDeg += 30) {
        const rad = (angleDeg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerGridX, centerGridY);
        ctx.lineTo(centerGridX + Math.cos(rad) * minSize, centerGridY + Math.sin(rad) * minSize);
        ctx.stroke();
      }
      
      // Lens Center Reticle Crosshairs
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(rawMx - 18, rawMy); ctx.lineTo(rawMx + 18, rawMy);
      ctx.moveTo(rawMx, rawMy - 18); ctx.lineTo(rawMx, rawMy + 18);
      ctx.stroke();
      // Reticle Inner Coordinate Ring
      ctx.beginPath();
      ctx.arc(rawMx, rawMy, 25, 0, Math.PI * 2);
      ctx.stroke();
      
      // Reticle Outer Lens Ring
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(rawMx, rawMy, LENS_RADIUS - 1.5, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();

      // --- Nebulae (with subtle parallax & Offscreen Canvas cache) ---
      for (const n of nebulae) {
        n.x += n.speedX; n.y += n.speedY; n.phase += 0.003;
        if (n.x < -n.r) n.x = w + n.r; if (n.x > w + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = h + n.r; if (n.y > h + n.r) n.y = -n.r;

        // Parallax offset for nebula
        const nox = parallaxBaseX * n.parallaxFactor;
        const noy = parallaxBaseY * n.parallaxFactor;
        const drawNx = n.x + nox;
        const drawNy = n.y + noy;

        const alpha = n.opacity + Math.sin(n.phase) * 0.006;
        ctx.globalAlpha = Math.max(0.001, Math.min(1, alpha));
        ctx.drawImage(n.offCanvas, drawNx - n.r, drawNy - n.r);
      }
      ctx.globalAlpha = 1;

      // --- Mouse position for telescope lens effect ---
      const mx = rawMx;
      const my = rawMy;

      // Telescope lens parameters
      const LENS_MAGNIFY = 0.06;     // minimal position push (preserves constellation shapes)
      const LENS_SIZE_SCALE = 1.5;   // zoom-in magnification at lens center

      // Rolling pool of lens results to support multiple concurrent queries (avoiding GC thrashing)
      const lensPool = [
        { x: 0, y: 0, strength: 0, sizeScale: 1 },
        { x: 0, y: 0, strength: 0, sizeScale: 1 },
        { x: 0, y: 0, strength: 0, sizeScale: 1 }
      ];
      let poolIndex = 0;

      function lensTransform(px, py) {
        const cache = lensPool[poolIndex];
        poolIndex = (poolIndex + 1) % lensPool.length;

        const dx = px - mx, dy = py - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= LENS_RADIUS || dist === 0) {
          cache.x = px;
          cache.y = py;
          cache.strength = 0;
          cache.sizeScale = 1;
          return cache;
        }
        const t = 1 - dist / LENS_RADIUS;
        const strength = t * t; // quadratic falloff
        const pushAmount = strength * LENS_MAGNIFY * LENS_RADIUS;
        const angle = Math.atan2(dy, dx);
        
        cache.x = px + Math.cos(angle) * pushAmount;
        cache.y = py + Math.sin(angle) * pushAmount;
        cache.strength = strength;
        cache.sizeScale = 1 + strength * (LENS_SIZE_SCALE - 1);
        return cache;
      }

      // --- Regular Stars (depth-layered with parallax + lens distortion) ---
      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed;

        // Parallax offset: near stars move more
        const pox = parallaxBaseX * s.parallaxFactor;
        const poy = parallaxBaseY * s.parallaxFactor;
        let drawX = s.x + pox;
        let drawY = s.y + poy;

        // Scintillation model with multiple frequencies + micro-jitter
        const twinkleOffset = Math.sin(s.twinklePhase) * 0.12 + Math.cos(s.twinklePhase * 2.3) * 0.05 + (Math.random() - 0.5) * 0.03;
        let alpha = s.baseOpacity + twinkleOffset * (0.15 + s.depth * 0.35);

        // --- Telescope lens distortion ---
        const lens = lensTransform(drawX, drawY);
        drawX = lens.x;
        drawY = lens.y;
        let lensSizeMultiplier = lens.sizeScale;
        let sizeBonus = 0;

        if (lens.strength > 0) {
          // Brighten within lens
          alpha += lens.strength * 0.5;
          sizeBonus = lens.strength * (1.5 + s.depth);
        }

        // Core star
        const finalR = (s.r + sizeBonus) * lensSizeMultiplier;
        ctx.globalAlpha = Math.max(0.02, Math.min(1, alpha));
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, finalR, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction spikes for superbright stars magnified by telescope lens
        if (s.isSuperBright && sizeBonus > 0.3) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const spikeLength = finalR * 7.5 * (sizeBonus / 1.5);
          
          // Ultra-fine diffraction gradient
          const grad = ctx.createLinearGradient(drawX - spikeLength, drawY, drawX + spikeLength, drawY);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.7})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.45;
          
          // Horizontal spike
          ctx.beginPath();
          ctx.moveTo(drawX - spikeLength, drawY);
          ctx.lineTo(drawX + spikeLength, drawY);
          ctx.stroke();
          
          // Vertical spike
          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(-spikeLength, 0);
          ctx.lineTo(spikeLength, 0);
          ctx.stroke();
          ctx.restore();
          
          ctx.restore();
        }

        // Glow halo for near stars (depth > 0.7)
        if (s.glowRadius > 0) {
          const glowAlpha = s.depth * 0.06 + (sizeBonus > 0.3 ? sizeBonus * 0.08 : 0);
          ctx.globalAlpha = glowAlpha;
          ctx.beginPath();
          ctx.arc(drawX, drawY, (s.r + s.glowRadius + sizeBonus) * lensSizeMultiplier, 0, Math.PI * 2);
          ctx.fill();
        }

        // Telescope proximity glow (enhanced)
        if (sizeBonus > 0.8) {
          ctx.globalAlpha = (sizeBonus / 1.5) * 0.15;
          ctx.beginPath();
          ctx.arc(drawX, drawY, finalR + 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Zodiac Constellations ---
      // Fade in only after CI assembly completes
      const zodiacTarget = zodiacActiveRef.current ? 1 : 0;
      zodiacFade += (zodiacTarget - zodiacFade) * 0.015; // ~3s fade-in
      if (zodiacFade < 0.005) { /* skip rendering entirely */ }
      else {

      const REVEAL_RADIUS = 180;
      const LERP_IN = 0.06;
      const LERP_OUT = 0.03;

      // Time-based effects
      const now = performance.now() / 1000; // seconds

      // Sequential pulse: each constellation takes a turn to glow
      const PULSE_CYCLE = 4;     // seconds per constellation
      const TOTAL_CYCLE = PULSE_CYCLE * 12; // full cycle ~48s
      const cycleTime = now % TOTAL_CYCLE;

      for (let ci = 0; ci < constellations.length; ci++) {
        const c = constellations[ci];
        // Calculate distance from mouse to constellation center
        const dist = Math.hypot(mx - c.centerX, my - c.centerY);

        // When showAll: reveal to a softer level (0.5) for subtlety
        // Mouse proximity or direct reveal still goes to full 1.0
        let target;
        if (dist < REVEAL_RADIUS) {
          target = 1; // mouse proximity = full reveal
        } else if (zodiacShowAllRef.current) {
          target = 0.5; // scroll-triggered = soft reveal
        } else {
          target = 0;
        }
        c.revealAmount += (target - c.revealAmount) * (target > c.revealAmount ? LERP_IN : LERP_OUT);

        const reveal = c.revealAmount;

        // Sequential pulse: this constellation's turn to glow
        const pulseStart = ci * PULSE_CYCLE;
        const pulseProgress = (cycleTime - pulseStart + TOTAL_CYCLE) % TOTAL_CYCLE;
        const seqPulse = pulseProgress < PULSE_CYCLE
          ? Math.sin((pulseProgress / PULSE_CYCLE) * Math.PI) * 0.45
          : 0;

        // Random highlight pulse: unique per-constellation organic breathing
        // Each constellation has a different frequency and phase for natural feel
        const randFreqs = [0.37, 0.53, 0.29, 0.41, 0.61, 0.47, 0.31, 0.59, 0.43, 0.67, 0.39, 0.51];
               // --- IAU Constellation Boundary Box & Corner Ticks ---
        if (reveal > 0.12 || pulse > 0.1) {
          ctx.save();
          // Apply lens to boundary center for coordination
          const lCenter = lensTransform(c.centerX, c.centerY);
          const bScale = scale * 1.8 * lCenter.sizeScale;
          const bSize = 65 * bScale;
          
          const bx = lCenter.x, by = lCenter.y;
          const left = bx - bSize, right = bx + bSize;
          const top = by - bSize, bottom = by + bSize;
          
          ctx.globalAlpha = Math.max(0.015, Math.max(reveal * 0.22, pulse * 0.13)) * zodiacFade;
          ctx.strokeStyle = '#818CF8';
          ctx.lineWidth = 0.45;
          
          // Draw thin dotted coordinate box representing IAU boundary
          ctx.setLineDash([2, 5]);
          ctx.beginPath();
          ctx.rect(left, top, bSize * 2, bSize * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw corner L-brackets (ticks)
          ctx.strokeStyle = '#A5B4FC';
          ctx.lineWidth = 0.75;
          const tickLen = 5 * lCenter.sizeScale;
          
          // Top-Left corner
          ctx.beginPath();
          ctx.moveTo(left, top + tickLen); ctx.lineTo(left, top); ctx.lineTo(left + tickLen, top);
          ctx.stroke();
          // Top-Right corner
          ctx.beginPath();
          ctx.moveTo(right - tickLen, top); ctx.lineTo(right, top); ctx.lineTo(right, top + tickLen);
          ctx.stroke();
          // Bottom-Left corner
          ctx.beginPath();
          ctx.moveTo(left, bottom - tickLen); ctx.lineTo(left, bottom); ctx.lineTo(left + tickLen, bottom);
          ctx.stroke();
          // Bottom-Right corner
          ctx.beginPath();
          ctx.moveTo(right - tickLen, bottom); ctx.lineTo(right, bottom); ctx.lineTo(right, bottom - tickLen);
          ctx.stroke();
          
          ctx.restore();
        }

        // --- Hint lines (always visible, pulse adds brightness on turn) ---
        const hintAlpha = (0.15 + pulse + reveal * 0.35) * zodiacFade;
        ctx.globalAlpha = hintAlpha;

        ctx.strokeStyle = `rgba(165, 180, 252, ${0.45 + pulse * 0.4 + reveal * 0.35})`;
        ctx.lineWidth = 0.5 + pulse * 0.25 + reveal * 0.4;
        ctx.setLineDash(reveal < 0.5 ? [3, 5] : [4 + reveal * 4, 3 - reveal * 2]);
        for (const [a, b] of c.lines) {
          const sa = c.starPositions[a], sb = c.starPositions[b];
          // Apply lens distortion to constellation line endpoints
          const la = lensTransform(sa.x, sa.y);
          const lb = lensTransform(sb.x, sb.y);
          ctx.beginPath(); ctx.moveTo(la.x, la.y); ctx.lineTo(lb.x, lb.y); ctx.stroke();
        }
        ctx.setLineDash([]);

        // --- Constellation stars (with lens magnification & Bayer designations) ---
        const GREEK_DESIGNATIONS = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ'];
        for (const sp of c.starPositions) {
          const lsp = lensTransform(sp.x, sp.y);
          const baseR = 1.25;
          const starR = (baseR + pulse * 0.8 + reveal * 1.5) * lsp.sizeScale;

          // Glow (during pulse or reveal)
          if (pulse > 0.1 || reveal > 0.05) {
            ctx.globalAlpha = Math.max(pulse * 0.3, reveal * 0.25) * zodiacFade;
            ctx.fillStyle = '#C7D2FE';
            ctx.beginPath(); ctx.arc(lsp.x, lsp.y, starR + 4 * lsp.sizeScale, 0, Math.PI * 2); ctx.fill();
          }

          // Core star — always visible, brighter on reveal and pulse
          ctx.globalAlpha = (0.35 + pulse + reveal * 0.55 + lsp.strength * 0.3) * zodiacFade;
          ctx.fillStyle = (reveal > 0.3 || pulse > 0.2) ? '#FFFFFF' : '#E0E7FF';
          ctx.beginPath(); ctx.arc(lsp.x, lsp.y, starR, 0, Math.PI * 2); ctx.fill();

          // Bayer designations next to major constellation stars on reveal/pulse
          if (reveal > 0.25 || pulse > 0.2) {
            const starIndex = c.starPositions.indexOf(sp);
            const bayerLetter = GREEK_DESIGNATIONS[starIndex % GREEK_DESIGNATIONS.length];
            ctx.save();
            ctx.globalAlpha = Math.max(0.1, Math.max(reveal * 0.45, pulse * 0.35)) * zodiacFade;
            ctx.font = `italic ${Math.round(7.5 * lsp.sizeScale)}px 'Inter', serif`;
            ctx.fillStyle = '#A5B4FC';
            ctx.textAlign = 'left';
            ctx.fillText(`${bayerLetter}`, lsp.x + (starR + 4) * lsp.sizeScale, lsp.y - 2);
            ctx.restore();
          }
        }

        // --- Label (appears on telescope reveal OR during pulse peak) ---
        const showByReveal = reveal > 0.15;
        const showByPulse = pulse > 0.15;

        if (showByReveal || showByPulse) {
          const revealAlpha = showByReveal ? Math.min(1, (reveal - 0.15) / 0.45) : 0;
          const pulseAlpha = showByPulse ? (pulse - 0.15) / 0.30 : 0;
          const labelAlpha = Math.min(1, Math.max(revealAlpha, pulseAlpha)) * zodiacFade;

          // Apply lens to label position
          const lCenter = lensTransform(c.centerX, c.centerY);
          const labelScale = lCenter.sizeScale;

          // Name
          ctx.globalAlpha = labelAlpha * (showByReveal ? 0.85 : 0.55);
          ctx.font = `500 ${Math.round(11 * labelScale)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#E2E8F0';
          ctx.textAlign = 'center';
          ctx.fillText(c.name, lCenter.x, lCenter.y + 44 * labelScale);

          // Subtitle (only on full reveal, not pulse)
          if (showByReveal) {
            ctx.globalAlpha = revealAlpha * 0.45;
            ctx.font = `400 ${Math.round(9 * labelScale)}px 'Inter', sans-serif`;
            ctx.fillStyle = '#818CF8';
            ctx.fillText(c.sub, lCenter.x, lCenter.y + 57 * labelScale);

            // Technical Astronomical Coordinates (RA / DEC / Dist / Mag)
            const raHours = Math.floor(ci * 2).toString().padStart(2, '0');
            const decDegs = (ci * 7 - 35 >= 0 ? '+' : '') + (ci * 7 - 35);
            const distLy = 350 + ci * 85;
            const appMag = (1.1 + ci * 0.15).toFixed(1);
            
            ctx.globalAlpha = revealAlpha * 0.35 * zodiacFade;
            ctx.font = `${Math.round(7.5 * labelScale)}px 'Inter', sans-serif`;
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(`RA ${raHours}h 15m / DEC ${decDegs}° | Dist: ~${distLy} ly | Mag: ${appMag}`, lCenter.x, lCenter.y + 70 * labelScale);
          }

          // Symbol
          ctx.globalAlpha = labelAlpha * (showByReveal ? 0.2 : 0.12);
          ctx.font = `${Math.round(16 * labelScale)}px sans-serif`;
          ctx.fillStyle = '#818CF8';
          ctx.fillText(c.symbol, lCenter.x, lCenter.y - 38 * labelScale);
        }
      }
      } // end zodiacFade > 0.005

      // --- Shooting Stars ---
      if (Math.random() < 0.012 && shootingStars.length < 5) {
        const dirType = Math.random();
        let sx, sy, svx, svy;
        if (dirType < 0.55) {
          sx = Math.random() * w * 0.7; sy = Math.random() * h * 0.35;
          svx = 3 + Math.random() * 5; svy = 1 + Math.random() * 2.5;
        } else if (dirType < 0.8) {
          sx = w * 0.4 + Math.random() * w * 0.6; sy = Math.random() * h * 0.3;
          svx = -(3 + Math.random() * 4); svy = 1.5 + Math.random() * 2;
        } else {
          sx = Math.random() * w; sy = Math.random() * h * 0.15;
          svx = (Math.random() - 0.5) * 2; svy = 4 + Math.random() * 3;
        }
        const cr = Math.random();
        const color = cr < 0.65 ? '255,255,255' : cr < 0.85 ? '196,181,253' : '103,232,249';
        shootingStars.push({ x: sx, y: sy, vx: svx, vy: svy, life: 1,
          decay: 0.008 + Math.random() * 0.014, length: 35 + Math.random() * 60, color });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= ss.decay;
        if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }
        const tailX = ss.x - ss.vx * (ss.length / 5);
        const tailY = ss.y - ss.vy * (ss.length / 5);
        const c = ss.color;
        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(${c},0)`);
        grad.addColorStop(1, `rgba(${c},${ss.life * 0.7})`);
        ctx.globalAlpha = 1; ctx.strokeStyle = grad; ctx.lineWidth = 0.8 + Math.abs(ss.vx) * 0.1;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(ss.x, ss.y); ctx.stroke();
        ctx.globalAlpha = ss.life; ctx.fillStyle = `rgba(${c},1)`;
        ctx.beginPath(); ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    let isLooping = false;
    let isHeroVisible = true;

    function startLoop() {
      if (isLooping) return;
      isLooping = true;
      lastFrameTime = performance.now();
      frameId = requestAnimationFrame(draw);
    }

    function stopLoop() {
      if (!isLooping) return;
      isLooping = false;
      cancelAnimationFrame(frameId);
    }

    function draw(now) {
      if (!isLooping) return;
      frameId = requestAnimationFrame(draw);
      if (now - lastFrameTime < FPS_INTERVAL) return;
      lastFrameTime = now;
      drawFrame();
    }

    // IntersectionObserver to freeze canvas animation when Hero is scrolled out of view
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    }, { threshold: 0 });

    const heroElement = document.getElementById('hero');
    if (heroElement) {
      observer.observe(heroElement);
    } else {
      startLoop();
    }

    window.addEventListener('resize', handleResize);
    resize();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      observer.disconnect();
      stopLoop();
    };
  }, [rawMouseRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
