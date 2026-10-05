/* =========================================================
   RETRO ARCADE DROP - PARTICLE & VISUAL EFFECTS SYSTEM
   Explosions, Sparks, Floating Text, Screen Shake & Trails
========================================================= */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeDecay = 0.9;
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }

  triggerShake(intensity = 8, duration = 12) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  // Confetti / Starburst on correct catch
  spawnSuccessBurst(x, y, count = 28) {
    const colors = ['#00f3ff', '#ffea00', '#39ff14', '#ffffff', '#ff007f'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        shape: Math.random() > 0.5 ? 'star' : 'square',
        spin: (Math.random() - 0.5) * 0.2,
        angle: 0
      });
    }
  }

  // Red/Dark Debris & Smoke on wrong catch
  spawnErrorDebris(x, y, count = 20) {
    const colors = ['#ff3344', '#ff7700', '#552233', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: 0.03 + Math.random() * 0.025,
        shape: 'smoke',
        spin: (Math.random() - 0.5) * 0.1,
        angle: 0
      });
    }
  }

  // Dash smoke & sparks
  spawnDashTrail(x, y, width, height) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * width,
        y: y + height * 0.5 + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 + 0.5,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#00f3ff' : '#ff007f',
        alpha: 0.8,
        life: 1,
        decay: 0.06,
        shape: 'square',
        spin: 0,
        angle: 0
      });
    }
  }

  // Bomb wipe explosion wave
  spawnBombExplosion(canvasWidth, canvasHeight) {
    this.triggerShake(14, 18);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * (canvasHeight * 0.75);
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: Math.random() > 0.4 ? '#ffea00' : '#ff3344',
        alpha: 1,
        life: 1,
        decay: 0.03,
        shape: 'star',
        spin: 0.1,
        angle: 0
      });
    }
  }

  // Add floating combat/score text
  addFloatingText(text, x, y, color = '#ffea00', size = 16) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      color: color,
      size: size,
      alpha: 1,
      vy: -1.6,
      life: 1,
      decay: 0.02
    });
  }

  update() {
    // Screen shake update
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // Gravity
      p.angle += p.spin;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= ft.decay;
      ft.alpha = Math.max(0, ft.life);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        // Draw 4-point retro sparkle star
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Pixel square
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }

    // Draw Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `900 ${ft.size}px "Orbitron", "Chakra Petch", sans-serif`;
      ctx.textAlign = 'center';
      
      // Crisp light stroke outline for contrast on light canvas
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);

      // Text Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  getShakeOffset() {
    if (this.shakeIntensity <= 0.1) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shakeIntensity * 2,
      y: (Math.random() - 0.5) * this.shakeIntensity * 2
    };
  }
}

window.particleSystem = new ParticleSystem();
