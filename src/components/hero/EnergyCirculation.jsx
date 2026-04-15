import { useEffect, useRef } from 'react';

const EDGE_PATHS = [
  [{ x:250,y:75 },{ x:406,y:346 },{ x:94,y:346 },{ x:250,y:75 }],
  [{ x:250,y:425 },{ x:94,y:154 },{ x:406,y:154 },{ x:250,y:425 }],
];

const VERTEX_POS = [
  { x:250,y:75 },{ x:406,y:346 },{ x:94,y:346 },
  { x:250,y:425 },{ x:94,y:154 },{ x:406,y:154 },
];

/**
 * Energy Circulation canvas — glowing runners along orbit + triangle edges.
 * Mouse proximity accelerates the flow.
 */
export default function EnergyCirculation({ rawMouseRef, active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = document.getElementById('energyCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const stage = document.getElementById('starConstellation');
    if (!stage) return;

    let cw, ch, offsetX, offsetY, frameId;

    function resize() {
      const rect = stage.getBoundingClientRect();
      cw = canvas.width = rect.width * 1.2;
      ch = canvas.height = rect.height * 1.2;
      offsetX = cw * (0.1 / 1.2);
      offsetY = ch * (0.1 / 1.2);
    }

    resize();
    window.addEventListener('resize', resize);

    function svgToCanvas(sx, sy) {
      const s = (cw * (1 / 1.2)) / 500;
      return { x: sx * s + offsetX, y: sy * s + offsetY };
    }

    const orbitRunners = [
      { angle: 0, speed: 0.008, r: 3, color: { r:103,g:232,b:249 }, trail: [] },
      { angle: Math.PI*0.66, speed: 0.006, r: 2.5, color: { r:34,g:211,b:238 }, trail: [] },
      { angle: Math.PI*1.33, speed: 0.01, r: 2, color: { r:165,g:243,b:252 }, trail: [] },
    ];

    const edgeRunners = [];
    const edgeColors = [{ r:196,g:181,b:253 }, { r:167,g:139,b:250 }];
    EDGE_PATHS.forEach((path, pi) => {
      for (let i = 0; i < 3; i++) {
        edgeRunners.push({
          path, progress: i / 3, speed: 0.002 + Math.random() * 0.001,
          r: 2 + Math.random(), color: edgeColors[pi], trail: [],
        });
      }
    });

    const vertexPulses = VERTEX_POS.map(() => ({ intensity: 0 }));

    function getPos(path, prog) {
      const n = path.length - 1;
      const sp = prog * n;
      const idx = Math.floor(sp) % n;
      const t = sp - Math.floor(sp);
      const f = path[idx], to = path[(idx + 1) % path.length];
      return { x: f.x + (to.x - f.x) * t, y: f.y + (to.y - f.y) * t };
    }

    function draw() {
      ctx.clearRect(0, 0, cw, ch);
      const sr = stage.getBoundingClientRect();
      const scx = sr.left + sr.width / 2, scy = sr.top + sr.height / 2;
      const mx = rawMouseRef?.current?.x ?? -200;
      const my = rawMouseRef?.current?.y ?? -200;
      const md = Math.hypot(mx - scx, my - scy);
      const prox = Math.max(0, 1 - md / (sr.width * 0.8));
      const spMul = 1 + prox * 2;

      const oc = svgToCanvas(250, 250);
      const oR = (cw * (1/1.2)) / 500 * 219;

      for (const r of orbitRunners) {
        r.angle += r.speed * spMul;
        const x = oc.x + Math.cos(r.angle) * oR;
        const y = oc.y + Math.sin(r.angle) * oR;
        r.trail.push({ x, y }); if (r.trail.length > 25) r.trail.shift();
        for (let i = 0; i < r.trail.length; i++) {
          const t = r.trail[i]; const a = (i / r.trail.length) * 0.4;
          ctx.globalAlpha = a; ctx.fillStyle = `rgb(${r.color.r},${r.color.g},${r.color.b})`;
          ctx.beginPath(); ctx.arc(t.x, t.y, r.r * (i / r.trail.length), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 0.9;
        const hg = ctx.createRadialGradient(x, y, 0, x, y, r.r * 4);
        hg.addColorStop(0, `rgba(${r.color.r},${r.color.g},${r.color.b},0.5)`);
        hg.addColorStop(1, `rgba(${r.color.r},${r.color.g},${r.color.b},0)`);
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = `rgb(${r.color.r},${r.color.g},${r.color.b})`;
        ctx.beginPath(); ctx.arc(x, y, r.r, 0, Math.PI * 2); ctx.fill();
      }

      for (const r of edgeRunners) {
        r.progress += r.speed * spMul;
        if (r.progress >= 1) r.progress -= 1;
        const pos = getPos(r.path, r.progress);
        const cp = svgToCanvas(pos.x, pos.y);
        for (let vi = 0; vi < VERTEX_POS.length; vi++) {
          const vp = svgToCanvas(VERTEX_POS[vi].x, VERTEX_POS[vi].y);
          if (Math.hypot(cp.x - vp.x, cp.y - vp.y) < 8) vertexPulses[vi].intensity = 1;
        }
        r.trail.push({ x: cp.x, y: cp.y }); if (r.trail.length > 15) r.trail.shift();
        for (let i = 0; i < r.trail.length; i++) {
          const t = r.trail[i]; const a = (i / r.trail.length) * 0.3;
          ctx.globalAlpha = a; ctx.fillStyle = `rgb(${r.color.r},${r.color.g},${r.color.b})`;
          ctx.beginPath(); ctx.arc(t.x, t.y, r.r * (i / r.trail.length), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 0.8; ctx.fillStyle = `rgb(${r.color.r},${r.color.g},${r.color.b})`;
        ctx.beginPath(); ctx.arc(cp.x, cp.y, r.r, 0, Math.PI * 2); ctx.fill();
      }

      for (let vi = 0; vi < VERTEX_POS.length; vi++) {
        const p = vertexPulses[vi];
        if (p.intensity > 0.01) {
          const vp = svgToCanvas(VERTEX_POS[vi].x, VERTEX_POS[vi].y);
          const pr = 8 + p.intensity * 12;
          ctx.globalAlpha = p.intensity * 0.5;
          const g = ctx.createRadialGradient(vp.x, vp.y, 0, vp.x, vp.y, pr);
          g.addColorStop(0, 'rgba(196,181,253,0.6)'); g.addColorStop(1, 'rgba(196,181,253,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(vp.x, vp.y, pr, 0, Math.PI * 2); ctx.fill();
          p.intensity *= 0.93;
        }
      }

      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(draw);
    }

    frameId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [active, rawMouseRef]);

  return null; // Canvas element is inside ConstellationAssembly's SVG container
}
