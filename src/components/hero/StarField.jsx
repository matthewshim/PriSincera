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

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      createStars();
      createNebulae();
      createConstellations();
    }

    function createStars() {
      stars = [];
      const density = Math.floor((w * h) / 3200);
      const colors = ['#FFFFFF', '#E9D5FF', '#C4B5FD', '#A78BFA', '#FDE68A', '#67E8F9'];
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          twinkleSpeed: Math.random() * 0.025 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          baseOpacity: Math.random() * 0.45 + 0.08,
        });
      }
    }

    function createNebulae() {
      nebulae = [];
      const colors = [{ r:124,g:58,b:237 }, { r:167,g:139,b:250 }, { r:240,g:171,b:252 }, { r:34,g:211,b:238 }];
      for (let i = 0; i < 4; i++) {
        nebulae.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 250 + 120, color: colors[i],
          speedX: (Math.random() - 0.5) * 0.12, speedY: (Math.random() - 0.5) * 0.08,
          opacity: 0.012 + Math.random() * 0.015, phase: Math.random() * Math.PI * 2,
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

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // --- Nebulae ---
      for (const n of nebulae) {
        n.x += n.speedX; n.y += n.speedY; n.phase += 0.003;
        if (n.x < -n.r) n.x = w + n.r; if (n.x > w + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = h + n.r; if (n.y > h + n.r) n.y = -n.r;
        const alpha = n.opacity + Math.sin(n.phase) * 0.006;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, `rgba(${n.color.r},${n.color.g},${n.color.b},${alpha})`);
        grad.addColorStop(1, `rgba(${n.color.r},${n.color.g},${n.color.b},0)`);
        ctx.globalAlpha = 1; ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }

      // --- Mouse position ---
      const mx = rawMouseRef?.current?.x ?? -200;
      const my = rawMouseRef?.current?.y ?? -200;

      // --- Regular Stars ---
      for (const s of stars) {
        s.twinklePhase += s.twinkleSpeed;
        let alpha = s.baseOpacity + Math.sin(s.twinklePhase) * 0.25;
        const dx = s.x - mx, dy = s.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const spotR = 150;
        let sizeBonus = 0;
        if (dist < spotR) {
          const proximity = 1 - dist / spotR;
          alpha += proximity * 0.5;
          sizeBonus = proximity * 1.5;
        }
        ctx.globalAlpha = Math.max(0.02, Math.min(1, alpha));
        ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r + sizeBonus, 0, Math.PI * 2); ctx.fill();
        if (sizeBonus > 0.8) {
          ctx.globalAlpha = (sizeBonus / 1.5) * 0.15;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r + sizeBonus + 3, 0, Math.PI * 2); ctx.fill();
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
        const randPhases = [0, 2.1, 4.3, 1.5, 3.7, 5.2, 0.8, 2.9, 4.6, 1.2, 3.3, 5.8];
        const randIntensity = zodiacShowAllRef.current
          ? Math.max(0, Math.sin(now * randFreqs[ci] + randPhases[ci])) * 0.4
          : 0;

        // Combined pulse: pick the stronger of sequential and random
        const pulse = Math.max(seqPulse, randIntensity);

        // --- Hint lines (always visible, pulse adds brightness on turn) ---
        const hintAlpha = (0.15 + pulse + reveal * 0.35) * zodiacFade;
        ctx.globalAlpha = hintAlpha;

        ctx.strokeStyle = `rgba(196, 181, 253, ${0.5 + pulse * 0.5 + reveal * 0.4})`;
        ctx.lineWidth = 0.6 + pulse * 0.3 + reveal * 0.5;
        ctx.setLineDash(reveal < 0.5 ? [3, 5] : [4 + reveal * 4, 3 - reveal * 2]);
        for (const [a, b] of c.lines) {
          const sa = c.starPositions[a], sb = c.starPositions[b];
          ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y); ctx.stroke();
        }
        ctx.setLineDash([]);

        // --- Constellation stars ---
        for (const sp of c.starPositions) {
          const baseR = 1.2;
          const starR = baseR + pulse * 0.8 + reveal * 1.5;

          // Glow (during pulse or reveal)
          if (pulse > 0.1 || reveal > 0.05) {
            ctx.globalAlpha = Math.max(pulse * 0.3, reveal * 0.25) * zodiacFade;
            ctx.fillStyle = '#C4B5FD';
            ctx.beginPath(); ctx.arc(sp.x, sp.y, starR + 4, 0, Math.PI * 2); ctx.fill();
          }

          // Core star — always visible, brighter on reveal and pulse
          ctx.globalAlpha = (0.35 + pulse + reveal * 0.55) * zodiacFade;
          ctx.fillStyle = (reveal > 0.3 || pulse > 0.2) ? '#E9D5FF' : '#C4B5FD';
          ctx.beginPath(); ctx.arc(sp.x, sp.y, starR, 0, Math.PI * 2); ctx.fill();
        }

        // --- Label (appears on telescope reveal OR during pulse peak) ---
        const showByReveal = reveal > 0.15;
        const showByPulse = pulse > 0.15;

        if (showByReveal || showByPulse) {
          const revealAlpha = showByReveal ? Math.min(1, (reveal - 0.15) / 0.45) : 0;
          const pulseAlpha = showByPulse ? (pulse - 0.15) / 0.30 : 0;
          const labelAlpha = Math.min(1, Math.max(revealAlpha, pulseAlpha)) * zodiacFade;

          // Name
          ctx.globalAlpha = labelAlpha * (showByReveal ? 0.85 : 0.55);
          ctx.font = `500 ${11}px 'Inter', sans-serif`;
          ctx.fillStyle = '#E9D5FF';
          ctx.textAlign = 'center';
          ctx.fillText(c.name, c.centerX, c.centerY + 44);

          // Subtitle (only on full reveal, not pulse)
          if (showByReveal) {
            ctx.globalAlpha = revealAlpha * 0.45;
            ctx.font = `400 ${9}px 'Inter', sans-serif`;
            ctx.fillStyle = '#A78BFA';
            ctx.fillText(c.sub, c.centerX, c.centerY + 57);
          }

          // Symbol
          ctx.globalAlpha = labelAlpha * (showByReveal ? 0.2 : 0.12);
          ctx.font = `${16}px sans-serif`;
          ctx.fillStyle = '#C4B5FD';
          ctx.fillText(c.symbol, c.centerX, c.centerY - 38);
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
      frameId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [rawMouseRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
