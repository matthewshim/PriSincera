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

    let w, h, scale = 1, stars = [], stardust = [], nebulae = [], shootingStars = [], constellations = [], frameId, isAmbientMode = false;
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
      scale = Math.min(w, h) / 900; // 공용 scale 계산 추가
      smoothMx = w / 2;
      smoothMy = h / 2;
      createStars();
      createNebulae();
      createConstellations();
    }

    // Box-Muller transform for Gaussian distribution around Milky Way diagonal
    function randomNormal() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    // Soft falloff mask to protect brand text readability at center-middle region
    function getReadabilityShield(px, py) {
      const rx = px / w;
      const ry = py / h;
      // 텍스트 영역: x(25%~75%), y(40%~72%)
      if (rx >= 0.25 && rx <= 0.75 && ry >= 0.40 && ry <= 0.72) {
        const centerX = w / 2;
        const centerY = h * 0.56;
        const maxDistX = w * 0.25;
        const maxDistY = h * 0.16;
        
        const dx = Math.abs(px - centerX);
        const dy = Math.abs(py - centerY);
        
        if (dx < maxDistX && dy < maxDistY) {
          const tX = dx / maxDistX; // 0~1
          const tY = dy / maxDistY;
          const factor = Math.max(tX, tY); // 0 (중심) ~ 1 (경계)
          // 중심에 가까울수록 65% 디밍(0.35 배), 경계로 갈수록 서서히 100% 불투명도로 복구
          return 0.35 + factor * 0.65;
        }
      }
      return 1.0;
    }

    /**
     * Create stars with depth-based properties and ultra-dense stardust:
     * - Major Stars (stars): 200-400 major twinkling stellar classifications (O/B/A/F/G/K/M) with spikes
     * - Stardust (stardust): 1500-2200 background sub-pixel micro-stars clustered along diagonal Milky Way
     */
    function createStars() {
      stars = [];
      stardust = [];
      const isMobile = w <= 768;
      
      // 1. 일반 주요 항성들 생성 (대기 깜빡임, 회절 스파이크, glow가 풍부한 주성들 - 정예화)
      const starDensity = Math.floor((w * h) / (isMobile ? 8000 : 4000));
      const colorsByDepth = {
        far:  ['#E2ECFF', '#C9DFFE', '#A3C9FF'],
        mid:  ['#F8F9FA', '#F0F4F8', '#E6ECF5'],
        near: ['#FFFEE8', '#FFFAC7', '#FFE1C2', '#FFCFA3'],
      };

      for (let i = 0; i < starDensity; i++) {
        const rawDepth = Math.random();
        const depth = rawDepth * rawDepth * rawDepth; // 0~1, skewed toward 0

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
          r: 0.25 + depth * 1.9,
          color,
          twinkleSpeed: 0.003 + (1 - depth) * 0.025,
          twinklePhase: Math.random() * Math.PI * 2,
          baseOpacity: 0.05 + depth * 0.55,
          parallaxFactor: depth * 0.045,
          glowRadius: depth > 0.7 ? 2 + depth * 4 : 0,
          isSuperBright: depth > 0.86,
        });
      }

      // Sort by depth so far stars draw first (painter's algorithm)
      stars.sort((a, b) => a.depth - b.depth);

      // 2. 초고밀도 배경 아기별(Stardust) 생성 (1000 ~ 2200개)
      // 대각선 은하수 띠: 좌하단에서 우상단으로 흐르는 궤적 설정
      const stardustCount = isMobile ? 1000 : 2200;
      const stardustColors = ['#FFF3D6', '#E3EFFF', '#FFFFFF'];
      
      const x1 = -w * 0.15, y1 = h * 0.95;
      const x2 = w * 1.15, y2 = h * 0.05;

      for (let i = 0; i < stardustCount; i++) {
        let sX, sY;
        const isBelongToMilkyWay = Math.random() < 0.75; // 75%는 은하수 대각 벨트에 밀집

        if (isBelongToMilkyWay) {
          const t = Math.random();
          const axisX = x1 + t * (x2 - x1);
          const axisY = y1 + t * (y2 - y1);
          
          // 대각선 은하수 축 중심으로부터 가우시안 확률 분포
          const spreadWidth = Math.min(w, h) * 0.14;
          sX = axisX + randomNormal() * spreadWidth;
          sY = axisY + randomNormal() * spreadWidth;
        } else {
          // 25%는 밤하늘 전역에 은은하게 뽀얗고 고운 그레인 질감으로 분산
          sX = Math.random() * w;
          sY = Math.random() * h;
        }

        // 화면 영역을 너무 크게 벗어난 별 제외
        if (sX < -50 || sX > w + 50 || sY < -50 || sY > h + 50) continue;

        stardust.push({
          x: sX,
          y: sY,
          r: 0.08 + Math.random() * 0.35,
          color: stardustColors[Math.floor(Math.random() * stardustColors.length)],
          baseOpacity: 0.03 + Math.random() * 0.15,
          parallaxFactor: Math.random() * 0.012, // 은하수 뒤편의 깊은 원경 묘사
        });
      }
    }

    /**
     * Create organic gaseous nebulae aligned to the Milky Way diagonal axis:
     * Aligns golden-amber, deep magenta-purple, and dark dust lanes to create realistic 3D textures.
     */
    function createNebulae() {
      nebulae = [];
      
      // 몽골 밤하늘 감성의 성운 기하 구성: 황금갈색, 마젠타/딥퍼플, 차콜(암흑성운)
      // 육안 식별 및 WOW 포인트를 확실히 체감하도록 투명도(opacity)를 기존보다 4~5배 대폭 상향
      const nebulaConfigs = [
        { t: 0.20, color: { r:14, g:10, b:20 }, opacity: 0.16, scaleR: 0.52, isDark: true },  // 암흑 먼지띠 (별빛 가림 효과용)
        { t: 0.38, color: { r:215, g:140, b:75 }, opacity: 0.085, scaleR: 0.42, isDark: false }, // 황금빛 성운
        { t: 0.52, color: { r:110, g:75, b:185 }, opacity: 0.075, scaleR: 0.48, isDark: false }, // 마젠타/보라빛 성운
        { t: 0.68, color: { r:225, g:155, b:90 }, opacity: 0.085, scaleR: 0.40, isDark: false }, // 황금빛 성운
        { t: 0.82, color: { r:12, g:8, b:18 }, opacity: 0.18, scaleR: 0.55, isDark: true },  // 암흑 먼지띠
      ];

      const x1 = -w * 0.15, y1 = h * 0.95;
      const x2 = w * 1.15, y2 = h * 0.05;

      nebulaConfigs.forEach((cfg, idx) => {
        // 대각선 궤적 상의 좌표 계산
        const baseCenterX = x1 + cfg.t * (x2 - x1);
        const baseCenterY = y1 + cfg.t * (y2 - y1);
        
        // 성운 반경은 화면 최소 길이 기준 설정
        const minDimension = Math.min(w, h);
        const r = minDimension * cfg.scaleR;
        
        // 오프스크린 캔버스 더블 버퍼링 캐싱
        const offCanvas = document.createElement('canvas');
        offCanvas.width = r * 2;
        offCanvas.height = r * 2;
        const offCtx = offCanvas.getContext('2d');
        
        const grad = offCtx.createRadialGradient(r, r, 0, r, r, r);
        const col = cfg.color;
        
        if (cfg.isDark) {
          // 암흑 성운: 뽀얗게 뭉친 아기별 띠의 일부를 은은하게 지워내어 유기적 공간 깊이를 극대화
          grad.addColorStop(0, `rgba(${col.r},${col.g},${col.b},1)`);
          grad.addColorStop(0.6, `rgba(${col.r},${col.g},${col.b},0.6)`);
          grad.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
        } else {
          // 발광 성운
          grad.addColorStop(0, `rgba(${col.r},${col.g},${col.b},1)`);
          grad.addColorStop(0.4, `rgba(${col.r},${col.g},${col.b},0.45)`);
          grad.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
        }
        
        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(r, r, r, 0, Math.PI * 2);
        offCtx.fill();

        nebulae.push({
          x: baseCenterX + (Math.random() - 0.5) * 60,
          y: baseCenterY + (Math.random() - 0.5) * 60,
          r,
          color: col,
          isDark: cfg.isDark,
          speedX: (Math.random() - 0.5) * 0.05, // 은은한 흐름 드리프트
          speedY: (Math.random() - 0.5) * 0.03,
          opacity: cfg.opacity,
          phase: Math.random() * Math.PI * 2,
          depth: 0.05 + idx * 0.02,
          parallaxFactor: (0.05 + idx * 0.02) * 0.035,
          offCanvas,
        });
      });
    }

    function createConstellations() {
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

      const LENS_RADIUS = 240;       // wider telescope field of view

      // --- Background Celestial Grids & Telescope Lens (Only in active mode) ---
      if (!isAmbientMode) {
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
      }

      // --- Emission Nebulae (Sub-layered Background Gaseous Core) ---
      // Render colorful emission nebulae on the background canvas first
      for (const n of nebulae) {
        if (n.isDark) continue; // Skip dark dust lanes for later foreground pass

        n.x += n.speedX; n.y += n.speedY; n.phase += 0.002;
        if (n.x < -n.r) n.x = w + n.r; if (n.x > w + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = h + n.r; if (n.y > h + n.r) n.y = -n.r;

        // Parallax offset for nebula
        const nox = parallaxBaseX * n.parallaxFactor;
        const noy = parallaxBaseY * n.parallaxFactor;
        const drawNx = n.x + nox;
        const drawNy = n.y + noy;

        // 마우스 렌즈 영역 근처 가스 밝기 증폭 체크
        const dx = drawNx - rawMx;
        const dy = drawNy - rawMy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let lensBoost = 1.0;
        if (dist < LENS_RADIUS) {
          const t = 1 - dist / LENS_RADIUS;
          // 렌즈 조준선 내부에서 성운 가스가 극적으로 부각되는 WOW 포인트 (2.2배 증폭)
          lensBoost = 1.0 + t * t * 1.2; 
        }

        const alpha = (n.opacity + Math.sin(n.phase) * 0.004) * lensBoost;
        ctx.save();
        ctx.globalAlpha = Math.max(0.001, Math.min(0.9, alpha));
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(n.offCanvas, drawNx - n.r, drawNy - n.r);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // --- Mouse position for telescope lens effect ---
      const mx = rawMx;
      const my = rawMy;
      const LENS_RADIUS_SQ = LENS_RADIUS * LENS_RADIUS;

      // --- Super-dense Stardust Layer (Hybrid Draw Call Batching) ---
      // Batch drawing to achieve 60FPS with 2,200+ stars by minimizing context switches
      const stardustColors = ['#FFF3D6', '#E3EFFF', '#FFFFFF'];
      const stardustOpacities = [0.05, 0.10, 0.16];
      const stardustBuckets = {};

      stardustColors.forEach(c => {
        stardustOpacities.forEach(o => {
          stardustBuckets[`${c}_${o}`] = [];
        });
      });

      const lensInsideStardust = [];

      function getNearestOpacity(val) {
        if (val < 0.08) return 0.05;
        if (val < 0.13) return 0.10;
        return 0.16;
      }

      for (const s of stardust) {
        const pox = parallaxBaseX * s.parallaxFactor;
        const poy = parallaxBaseY * s.parallaxFactor;
        const drawX = s.x + pox;
        const drawY = s.y + poy;

        const dx = drawX - mx;
        const dy = drawY - my;
        const distSq = dx * dx + dy * dy;

        if (distSq < LENS_RADIUS_SQ) {
          // Inside lens: collect for individualized deep telescope zoom physics
          lensInsideStardust.push({ s, drawX, drawY });
        } else {
          // Outside lens: pool into bucket calls for single-pass drawing
          const mappedO = getNearestOpacity(s.baseOpacity);
          const key = `${s.color}_${mappedO}`;
          if (stardustBuckets[key]) {
            stardustBuckets[key].push({ x: drawX, y: drawY, r: s.r });
          }
        }
      }

      // 1. Render outside stars in just 9 batch draws
      ctx.save();
      for (const key of Object.keys(stardustBuckets)) {
        const list = stardustBuckets[key];
        if (list.length === 0) continue;

        const [color, opacityStr] = key.split('_');
        const opacity = parseFloat(opacityStr);

        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        for (const p of list) {
          ctx.moveTo(p.x + p.r, p.y);
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.restore();

      // 2. Telescope lens transformation parameters
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

      // 3. Render inside stardust with magnification physics (dense clusters resolve into starry grains)
      ctx.save();
      for (const item of lensInsideStardust) {
        const { s, drawX, drawY } = item;
        const lens = lensTransform(drawX, drawY);
        
        const sizeBonus = lens.strength * 1.6;
        const finalR = (s.r + sizeBonus) * lens.sizeScale;
        const finalAlpha = Math.min(1.0, s.baseOpacity + lens.strength * 0.45);

        ctx.fillStyle = s.color;
        ctx.globalAlpha = finalAlpha;
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, finalR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

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

      // --- Dark Nebulae / Dust Lanes (Foreground Blockade Pass) ---
      // Overlay dark dust lanes to block out the background stars, creating organic silhouette depth
      for (const n of nebulae) {
        if (!n.isDark) continue;

        n.x += n.speedX; n.y += n.speedY; n.phase += 0.002;
        if (n.x < -n.r) n.x = w + n.r; if (n.x > w + n.r) n.x = -n.r;
        if (n.y < -n.r) n.y = h + n.r; if (n.y > h + n.r) n.y = -n.r;

        // Parallax offset
        const nox = parallaxBaseX * n.parallaxFactor;
        const noy = parallaxBaseY * n.parallaxFactor;
        const drawNx = n.x + nox;
        const drawNy = n.y + noy;

        // 마우스 렌즈 영역 근처 체크
        const dx = drawNx - rawMx;
        const dy = drawNy - rawMy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let lensBoost = 1.0;
        if (dist < LENS_RADIUS) {
          const t = 1 - dist / LENS_RADIUS;
          // 망원경 렌즈 안에서는 암흑 가스가 흩어져 걷히며, 가려져 있던 미세 배경 아기별들이 뽀얗게 드러나는 기믹!
          lensBoost = 1.0 - t * t * 0.55; 
        }

        const alpha = (n.opacity + Math.sin(n.phase) * 0.004) * lensBoost;
        if (alpha > 0.002) {
          ctx.save();
          ctx.globalAlpha = Math.max(0.001, Math.min(0.85, alpha));
          ctx.globalCompositeOperation = 'source-over'; // 별빛 위에 어두운 텍스처를 얹어 은은하게 가림
          ctx.drawImage(n.offCanvas, drawNx - n.r, drawNy - n.r);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;

      // --- Zodiac Constellations ---
      // Skip rendering entirely in Ambient Mode to conserve CPU
      const zodiacTarget = zodiacActiveRef.current ? 1 : 0;
      zodiacFade += (zodiacTarget - zodiacFade) * 0.015; // ~3s fade-in
      if (isAmbientMode || zodiacFade < 0.005) { /* skip rendering entirely */ }
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
        const isFocused = dist < REVEAL_RADIUS;

        let target;
        if (isFocused) {
          target = 1; // mouse proximity = full reveal
        } else if (zodiacShowAllRef.current) {
          target = 0.5; // scroll-triggered = soft reveal
        } else {
          target = 0;
        }
        c.revealAmount += (target - c.revealAmount) * (target > c.revealAmount ? LERP_IN : LERP_OUT);

        const reveal = c.revealAmount;

        // Content Readability Shield: 디밍 계수 연산 (중앙 본문 영역 보호)
        const shield = getReadabilityShield(c.centerX, c.centerY);

        // Sequential pulse: this constellation's turn to glow
        const pulseStart = ci * PULSE_CYCLE;
        const pulseProgress = (cycleTime - pulseStart + TOTAL_CYCLE) % TOTAL_CYCLE;
        const seqPulse = pulseProgress < PULSE_CYCLE
          ? Math.sin((pulseProgress / PULSE_CYCLE) * Math.PI) * 0.45
          : 0;

        // Random highlight pulse: unique per-constellation organic breathing
        const randFreqs = [0.37, 0.53, 0.29, 0.41, 0.61, 0.47, 0.31, 0.59, 0.43, 0.67, 0.39, 0.51];
        const randPhases = [0, 2.1, 4.3, 1.5, 3.7, 5.2, 0.8, 2.9, 4.6, 1.2, 3.3, 5.8];
        const randIntensity = zodiacShowAllRef.current
          ? Math.max(0, Math.sin(now * randFreqs[ci] + randPhases[ci])) * 0.4
          : 0;

        // Combined pulse: pick the stronger of sequential and random
        const pulse = Math.max(seqPulse, randIntensity);

        // --- IAU Constellation Boundary Box & Corner Ticks (Smart Focused Pass) ---
        // Only draw coordinate boxes when actively focused (isFocused or heavy pulse) to protect clarity
        if ((reveal > 0.35 || pulse > 0.25) && isFocused) {
          ctx.save();
          const lCenter = lensTransform(c.centerX, c.centerY);
          const bScale = scale * 1.8 * lCenter.sizeScale;
          const bSize = 65 * bScale;
          
          const bx = lCenter.x, by = lCenter.y;
          const left = bx - bSize, right = bx + bSize;
          const top = by - bSize, bottom = by + bSize;
          
          // 쨍한 퍼플 블루 대신 따뜻하고 옅은 앤티크 골드-실버 톤으로 개편
          ctx.globalAlpha = Math.max(0.015, Math.max(reveal * 0.20, pulse * 0.12)) * zodiacFade * shield;
          ctx.strokeStyle = 'rgba(215, 202, 185, 0.8)';
          ctx.lineWidth = 0.35; // 극세선화
          
          // Draw thin dotted coordinate box representing IAU boundary
          ctx.setLineDash([2, 5]);
          ctx.beginPath();
          ctx.rect(left, top, bSize * 2, bSize * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw corner L-brackets (ticks)
          ctx.strokeStyle = 'rgba(215, 202, 185, 0.9)';
          ctx.lineWidth = 0.5; // 슬림화
          const tickLen = 4.5 * lCenter.sizeScale;
          
          // Top-Left
          ctx.beginPath(); ctx.moveTo(left, top + tickLen); ctx.lineTo(left, top); ctx.lineTo(left + tickLen, top); ctx.stroke();
          // Top-Right
          ctx.beginPath(); ctx.moveTo(right - tickLen, top); ctx.lineTo(right, top); ctx.lineTo(right, top + tickLen); ctx.stroke();
          // Bottom-Left
          ctx.beginPath(); ctx.moveTo(left, bottom - tickLen); ctx.lineTo(left, bottom); ctx.lineTo(left + tickLen, bottom); ctx.stroke();
          // Bottom-Right
          ctx.beginPath(); ctx.moveTo(right - tickLen, bottom); ctx.lineTo(right, bottom); ctx.lineTo(right, bottom - tickLen); ctx.stroke();
          
          ctx.restore();
        }

        // --- Hint lines (always visible, pulse adds brightness on turn) ---
        // 인공 형광 보라 대신 부드럽고 차분한 골드-실버(#D4C4B5/B0C4DE 매칭 앤티크 톤)로 통일
        const hintAlpha = (0.08 + pulse * 0.2 + reveal * 0.32) * zodiacFade * shield;
        ctx.globalAlpha = hintAlpha;

        ctx.strokeStyle = `rgba(210, 200, 185, ${0.35 + pulse * 0.3 + reveal * 0.3})`;
        ctx.lineWidth = 0.30 + pulse * 0.12 + reveal * 0.18; // 0.3px 극세 에칭 가이드선
        ctx.setLineDash(reveal < 0.5 ? [3, 5] : [4 + reveal * 4, 3 - reveal * 2]);
        for (const [a, b] of c.lines) {
          const sa = c.starPositions[a], sb = c.starPositions[b];
          const la = lensTransform(sa.x, sa.y);
          const lb = lensTransform(sb.x, sb.y);
          ctx.beginPath(); ctx.moveTo(la.x, la.y); ctx.lineTo(lb.x, lb.y); ctx.stroke();
        }
        ctx.setLineDash([]);

        // --- Constellation stars (with lens magnification & Bayer designations) ---
        const GREEK_DESIGNATIONS = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ'];
        for (const sp of c.starPositions) {
          const lsp = lensTransform(sp.x, sp.y);
          const baseR = 1.20;
          const starR = (baseR + pulse * 0.6 + reveal * 1.3) * lsp.sizeScale;

          // Glow (during pulse or reveal)
          if (pulse > 0.1 || reveal > 0.05) {
            ctx.globalAlpha = Math.max(pulse * 0.25, reveal * 0.22) * zodiacFade * shield;
            ctx.fillStyle = '#E8DFD8'; // 차분한 골드 크림 톤
            ctx.beginPath(); ctx.arc(lsp.x, lsp.y, starR + 3 * lsp.sizeScale, 0, Math.PI * 2); ctx.fill();
          }

          // Core star — always visible, brighter on reveal and pulse
          ctx.globalAlpha = (0.28 + pulse * 0.8 + reveal * 0.5 + lsp.strength * 0.3) * zodiacFade * shield;
          ctx.fillStyle = (reveal > 0.3 || pulse > 0.2) ? '#FFFFFF' : '#F5EBE0'; // 소프트 웜 화이트
          ctx.beginPath(); ctx.arc(lsp.x, lsp.y, starR, 0, Math.PI * 2); ctx.fill();

          // Bayer designations (Smart Focused details: only draw inside lens focusing for clean UX)
          if ((reveal > 0.35 || pulse > 0.25) && isFocused) {
            const starIndex = c.starPositions.indexOf(sp);
            const bayerLetter = GREEK_DESIGNATIONS[starIndex % GREEK_DESIGNATIONS.length];
            ctx.save();
            ctx.globalAlpha = Math.max(0.1, Math.max(reveal * 0.40, pulse * 0.30)) * zodiacFade * shield;
            ctx.font = `italic ${Math.round(7.5 * lsp.sizeScale)}px 'Inter', serif`;
            ctx.fillStyle = '#ACD4FF'; // 차분하고 선명한 성도 실버
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
          const labelAlpha = Math.min(1, Math.max(revealAlpha, pulseAlpha)) * zodiacFade * shield;

          // Apply lens to label position
          const lCenter = lensTransform(c.centerX, c.centerY);
          const labelScale = lCenter.sizeScale;

          // Name (언제나 뚜렷하되 shield 감쇄를 적용하여 중앙 본문 방해 방지)
          ctx.globalAlpha = labelAlpha * (showByReveal ? 0.75 : 0.45);
          ctx.font = `500 ${Math.round(10.5 * labelScale)}px 'Inter', sans-serif`;
          ctx.fillStyle = '#E2E8F0';
          ctx.textAlign = 'center';
          ctx.fillText(c.name, lCenter.x, lCenter.y + 44 * labelScale);

          // Subtitle & Coord HUD (Smart Focused HUD: only draw sub-labels under active lens focusing)
          if (showByReveal && isFocused) {
            // Subtitle
            ctx.globalAlpha = revealAlpha * 0.40;
            ctx.font = `400 ${Math.round(8.5 * labelScale)}px 'Inter', sans-serif`;
            ctx.fillStyle = '#B0C4DE'; // 앤티크 실버 스틸 블루
            ctx.fillText(c.sub, lCenter.x, lCenter.y + 56 * labelScale);

            // Technical Astronomical Coordinates (RA / DEC / Dist / Mag)
            const raHours = Math.floor(ci * 2).toString().padStart(2, '0');
            const decDegs = (ci * 7 - 35 >= 0 ? '+' : '') + (ci * 7 - 35);
            const distLy = 350 + ci * 85;
            const appMag = (1.1 + ci * 0.15).toFixed(1);
            
            ctx.globalAlpha = revealAlpha * 0.30 * zodiacFade * shield;
            ctx.font = `${Math.round(7.5 * labelScale)}px 'Inter', sans-serif`;
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(`RA ${raHours}h 15m / DEC ${decDegs}° | Dist: ~${distLy} ly | Mag: ${appMag}`, lCenter.x, lCenter.y + 68 * labelScale);
          }

          // Symbol (Smart Focused Symbol: only show under lens focusing)
          if (isFocused) {
            ctx.globalAlpha = labelAlpha * (showByReveal ? 0.18 : 0.10);
            ctx.font = `${Math.round(15 * labelScale)}px sans-serif`;
            ctx.fillStyle = '#B0C4DE';
            ctx.fillText(c.symbol, lCenter.x, lCenter.y - 38 * labelScale);
          }
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
      const currentInterval = isAmbientMode ? 83.33 : FPS_INTERVAL; // ~12fps cap in ambient mode
      if (now - lastFrameTime < currentInterval) return;
      lastFrameTime = now;
      drawFrame();
    }

    // IntersectionObserver to transition to Ambient Deep Space Mode when Hero is scrolled out of view
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isHeroVisible = entry.isIntersecting;
      isAmbientMode = !isHeroVisible;
      
      // Never stop loop completely; keep running at low frame rate for ambient background shooting stars
      startLoop();
    }, { threshold: 0 });

    const heroElement = document.getElementById('hero');
    if (heroElement) {
      observer.observe(heroElement);
    } else {
      startLoop();
    }

    function handleTriggerShootingStar(e) {
      const { x, y, width, height, color } = e.detail || {};
      if (typeof x !== 'number' || typeof y !== 'number') return;

      // Spawn a shooting star dynamically at coordinates
      // Since stars travel diagonally down-right (vx > 0, vy > 0),
      // we want the start position to be top-left relative to the card so it passes behind it.
      const cardWidth = width || 300;
      const cardHeight = height || 200;

      // Position start offset to the top-left of the card
      const sx = x - 80 - Math.random() * 80;
      const sy = y - 60 - Math.random() * 60;

      // Velocity: fast diagonal motion
      const svx = 7 + Math.random() * 4;
      const svy = 4.5 + Math.random() * 2.5;

      // Slower decay for scrolling trigger stars so they cross the card fully
      const decay = 0.010 + Math.random() * 0.008;
      const length = 45 + Math.random() * 40;

      const finalColor = color || '255,255,255';

      shootingStars.push({
        x: sx,
        y: sy,
        vx: svx,
        vy: svy,
        life: 1.0,
        decay,
        length,
        color: finalColor
      });
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('trigger-shooting-star', handleTriggerShootingStar);
    resize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('trigger-shooting-star', handleTriggerShootingStar);
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
