/**
 * car.js — Canvas-based 3D-style Car Renderer
 * Draws a detailed sports car using Canvas 2D API.
 * Supports dynamic color, wheels, lighting, and tint overlays.
 */

const CarRenderer = (() => {
  let canvas, ctx;
  let state = {
    bodyColor: '#e63946',
    wheelStyle: 'sport',
    lighting: 'blue',
    tint: 30,
    animFrame: 0,
  };

  // Lighting color maps
  const LIGHTING = {
    blue:   { glow: '#3b82f6', ambient: 'rgba(59,130,246,0.18)', strip: '#1d4ed8' },
    red:    { glow: '#ef4444', ambient: 'rgba(239,68,68,0.18)',   strip: '#b91c1c' },
    green:  { glow: '#10b981', ambient: 'rgba(16,185,129,0.18)',  strip: '#065f46' },
    purple: { glow: '#8b5cf6', ambient: 'rgba(139,92,246,0.18)', strip: '#5b21b6' },
    white:  { glow: '#ffffff', ambient: 'rgba(255,255,255,0.1)',  strip: '#e2e8f0' },
    gold:   { glow: '#f59e0b', ambient: 'rgba(245,158,11,0.18)',  strip: '#92400e' },
  };

  // Wheel render configs
  const WHEEL_CONFIGS = {
    sport:   { spokes: 5, rimColor: '#c0c0c0', centerColor: '#888', hubSize: 0.35 },
    blade:   { spokes: 7, rimColor: '#1e293b', centerColor: '#334155', hubSize: 0.3 },
    luxury:  { spokes: 10, rimColor: '#d4af37', centerColor: '#a38828', hubSize: 0.4 },
    mesh:    { spokes: 16, rimColor: '#64748b', centerColor: '#475569', hubSize: 0.25 },
    offroad: { spokes: 4, rimColor: '#78716c', centerColor: '#57534e', hubSize: 0.45 },
    split:   { spokes: 6, rimColor: '#b0b0b0', centerColor: '#ddd', hubSize: 0.38 },
  };

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    startAnimation();
  }

  function setState(updates) {
    Object.assign(state, updates);
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return { r, g, b };
  }

  function lighten(hex, amt) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
  }

  function darken(hex, amt) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;
  }

  function drawWheel(cx, cy, radius, cfg) {
    ctx.save();
    // Tire
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.78, 0, Math.PI*2);
    ctx.fillStyle = cfg.rimColor;
    ctx.fill();

    // Spokes
    const spokeCount = cfg.spokes;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2 + state.animFrame * 0.01;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, radius * 0.15);
      ctx.lineTo(0, radius * 0.72);
      ctx.strokeStyle = darken(cfg.rimColor, 30);
      ctx.lineWidth = spokeCount > 10 ? 2 : 3.5;
      ctx.stroke();
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, radius * cfg.hubSize, 0, Math.PI*2);
    ctx.fillStyle = cfg.centerColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.12, 0, Math.PI*2);
    ctx.fillStyle = '#222';
    ctx.fill();

    // Tire highlight
    ctx.beginPath();
    ctx.arc(cx - radius*0.25, cy - radius*0.25, radius*0.22, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();

    ctx.restore();
  }

  function drawCar() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const lt = LIGHTING[state.lighting];
    const bodyColor = state.bodyColor;
    const bodyLight = lighten(bodyColor, 50);
    const bodyDark  = darken(bodyColor, 40);

    // Floor reflection glow
    const reflGrad = ctx.createRadialGradient(W/2, H-40, 0, W/2, H-40, 320);
    reflGrad.addColorStop(0, lt.ambient);
    reflGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = reflGrad;
    ctx.fillRect(0, 0, W, H);

    // ===== CAR BODY =====
    // Main car body origin
    const cx = W / 2;
    const carY = H * 0.62; // vertical center of car

    // -- Underbody shadow --
    const shadowGrad = ctx.createRadialGradient(cx, carY + 90, 5, cx, carY + 90, 280);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, carY + 90, 290, 40, 0, 0, Math.PI*2);
    ctx.fill();

    // -- CHASSIS (lower body) --
    ctx.save();
    const chassisGrad = ctx.createLinearGradient(cx-300, carY+10, cx-300, carY+80);
    chassisGrad.addColorStop(0, bodyColor);
    chassisGrad.addColorStop(1, bodyDark);
    ctx.fillStyle = chassisGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 290, carY + 35);
    ctx.lineTo(cx - 250, carY + 10);
    ctx.lineTo(cx + 250, carY + 10);
    ctx.lineTo(cx + 290, carY + 35);
    ctx.lineTo(cx + 300, carY + 75);
    ctx.lineTo(cx - 300, carY + 75);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darken(bodyColor, 60);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // -- MAIN CABIN roof --
    ctx.save();
    const cabinGrad = ctx.createLinearGradient(cx, carY-90, cx, carY+10);
    cabinGrad.addColorStop(0, bodyLight);
    cabinGrad.addColorStop(0.5, bodyColor);
    cabinGrad.addColorStop(1, bodyDark);
    ctx.fillStyle = cabinGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 100, carY + 10);
    ctx.lineTo(cx - 80, carY - 90);
    ctx.quadraticCurveTo(cx - 30, carY - 115, cx + 30, carY - 115);
    ctx.lineTo(cx + 80, carY - 90);
    ctx.lineTo(cx + 100, carY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darken(bodyColor, 70);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // -- HOOD (front) + TRUNK (rear) --
    ctx.save();
    const hoodGrad = ctx.createLinearGradient(cx, carY - 20, cx, carY + 10);
    hoodGrad.addColorStop(0, bodyLight);
    hoodGrad.addColorStop(1, bodyColor);
    ctx.fillStyle = hoodGrad;
    // Hood
    ctx.beginPath();
    ctx.moveTo(cx + 100, carY + 10);
    ctx.lineTo(cx + 80, carY - 90);
    ctx.lineTo(cx + 230, carY - 30);
    ctx.lineTo(cx + 250, carY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darken(bodyColor, 50);
    ctx.stroke();
    // Trunk
    ctx.beginPath();
    ctx.moveTo(cx - 100, carY + 10);
    ctx.lineTo(cx - 80, carY - 90);
    ctx.lineTo(cx - 230, carY - 30);
    ctx.lineTo(cx - 250, carY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // -- WINDSHIELD (front) --
    ctx.save();
    const tintAlpha = state.tint / 100;
    ctx.fillStyle = `rgba(160, 210, 255, ${0.55 - tintAlpha * 0.45})`;
    ctx.beginPath();
    ctx.moveTo(cx + 80, carY - 90);
    ctx.lineTo(cx + 100, carY + 10);
    ctx.lineTo(cx + 20, carY + 10);
    ctx.lineTo(cx + 30, carY - 112);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Glass tint overlay
    ctx.fillStyle = `rgba(10, 20, 60, ${tintAlpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(cx + 80, carY - 90);
    ctx.lineTo(cx + 100, carY + 10);
    ctx.lineTo(cx + 20, carY + 10);
    ctx.lineTo(cx + 30, carY - 112);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // -- REAR WINDSHIELD --
    ctx.save();
    ctx.fillStyle = `rgba(160, 210, 255, ${0.55 - tintAlpha * 0.45})`;
    ctx.beginPath();
    ctx.moveTo(cx - 80, carY - 90);
    ctx.lineTo(cx - 100, carY + 10);
    ctx.lineTo(cx - 20, carY + 10);
    ctx.lineTo(cx - 30, carY - 112);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(10, 20, 60, ${tintAlpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(cx - 80, carY - 90);
    ctx.lineTo(cx - 100, carY + 10);
    ctx.lineTo(cx - 20, carY + 10);
    ctx.lineTo(cx - 30, carY - 112);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // -- HEADLIGHTS (front) --
    ctx.save();
    const hlGrad = ctx.createRadialGradient(cx+270, carY+20, 0, cx+270, carY+20, 30);
    hlGrad.addColorStop(0, '#fffde7');
    hlGrad.addColorStop(0.5, '#fbbf24');
    hlGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = '#fffde7';
    // Headlight housing
    ctx.beginPath();
    ctx.ellipse(cx + 268, carY + 20, 22, 10, -0.3, 0, Math.PI*2);
    ctx.fill();
    // Headlight glow
    ctx.beginPath();
    ctx.arc(cx+268, carY+20, 30, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255, 253, 231, 0.12)';
    ctx.fill();
    // DRL strip
    ctx.beginPath();
    ctx.moveTo(cx+240, carY+32);
    ctx.lineTo(cx+290, carY+28);
    ctx.strokeStyle = '#fffde7';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#fffde7';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // -- TAIL LIGHTS (rear) --
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(cx - 268, carY + 20, 22, 10, 0.3, 0, Math.PI*2);
    ctx.fill();
    // LED strip
    ctx.beginPath();
    ctx.moveTo(cx-240, carY+32);
    ctx.lineTo(cx-290, carY+28);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // -- HOOD VENTS --
    ctx.save();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + 140 + i*18, carY - 10);
      ctx.lineTo(cx + 160 + i*18, carY - 5);
      ctx.strokeStyle = darken(bodyColor, 70);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    // -- SIDE SKIRT stripe --
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 250, carY + 55);
    ctx.lineTo(cx + 250, carY + 55);
    ctx.strokeStyle = darken(bodyColor, 30);
    ctx.lineWidth = 3;
    ctx.stroke();
    // glow line
    ctx.beginPath();
    ctx.moveTo(cx - 250, carY + 58);
    ctx.lineTo(cx + 250, carY + 58);
    ctx.strokeStyle = lt.glow;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = lt.glow;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // -- LIGHTING STRIPS under car --
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 280, carY + 74);
    ctx.lineTo(cx + 280, carY + 74);
    ctx.strokeStyle = lt.strip;
    ctx.lineWidth = 2;
    ctx.shadowColor = lt.glow;
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.restore();

    // -- SPOILER --
    ctx.save();
    const spoilerGrad = ctx.createLinearGradient(cx - 90, carY - 100, cx - 90, carY - 85);
    spoilerGrad.addColorStop(0, bodyLight);
    spoilerGrad.addColorStop(1, bodyDark);
    ctx.fillStyle = spoilerGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 60, carY - 95);
    ctx.lineTo(cx - 90, carY - 110);
    ctx.lineTo(cx - 90, carY - 100);
    ctx.lineTo(cx - 65, carY - 90);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darken(bodyColor, 50);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // -- WHEELS --
    const wheelCfg = WHEEL_CONFIGS[state.wheelStyle] || WHEEL_CONFIGS['sport'];
    const wheelRadius = 52;
    // Front wheel
    drawWheel(cx + 185, carY + 82, wheelRadius, wheelCfg);
    // Rear wheel
    drawWheel(cx - 185, carY + 82, wheelRadius, wheelCfg);

    // -- BODY SHINE highlight --
    ctx.save();
    const shineGrad = ctx.createLinearGradient(cx - 200, carY - 70, cx + 200, carY + 10);
    shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
    shineGrad.addColorStop(0.4, 'rgba(255,255,255,0.12)');
    shineGrad.addColorStop(0.6, 'rgba(255,255,255,0.05)');
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(cx - 300, carY - 120, 600, 200);
    ctx.restore();

    // -- BRAND BADGE --
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, carY + 12, 12, 0, Math.PI*2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = lt.glow;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = lt.glow;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.fillStyle = lt.glow;
    ctx.font = 'bold 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AV', cx, carY + 12);
    ctx.restore();

    // Floor glow line
    ctx.save();
    const floorGrad = ctx.createLinearGradient(cx - 320, carY + 135, cx + 320, carY + 135);
    floorGrad.addColorStop(0, 'transparent');
    floorGrad.addColorStop(0.3, lt.glow);
    floorGrad.addColorStop(0.7, lt.glow);
    floorGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = floorGrad;
    ctx.lineWidth = 1;
    ctx.shadowColor = lt.glow;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(cx - 310, carY + 135);
    ctx.lineTo(cx + 310, carY + 135);
    ctx.stroke();
    ctx.restore();
  }

  let animId = null;
  function startAnimation() {
    function frame() {
      state.animFrame++;
      drawCar();
      animId = requestAnimationFrame(frame);
    }
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(frame);
  }

  return { init, setState, drawCar };
})();
