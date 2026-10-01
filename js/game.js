/* =========================================================
   RETRO ARCADE DROP - CORE GAME ENGINE
   Loop, Entities, Physics, Collisions, Modes & Controls
========================================================= */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWrapper = document.getElementById('canvas-wrapper');

    // UI Elements
    this.scoreEl = document.getElementById('score-display');
    this.highScoreEl = document.getElementById('high-score-display');
    this.comboEl = document.getElementById('combo-display');
    this.questionEl = document.getElementById('question-text');
    this.levelEl = document.getElementById('level-display');
    this.livesEl = document.getElementById('lives-display');
    this.streakFillEl = document.getElementById('streak-fill');

    // Overlays
    this.menuOverlay = document.getElementById('menu-overlay');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.gameOverOverlay = document.getElementById('gameover-overlay');
    this.floatingNotice = document.getElementById('floating-notice');
    this.powerupBadge = document.getElementById('powerup-badge');
    this.powerupIcon = document.getElementById('powerup-icon');
    this.powerupTitle = document.getElementById('powerup-title');
    this.powerupBar = document.getElementById('powerup-timer-bar');

    // State Variables
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.gameMode = 'arcade'; // 'arcade' | 'timeattack' | 'chill'
    this.category = 'all';

    this.score = 0;
    this.highScore = 0;
    this.loadHighScore();
    this.combo = 1;
    this.maxCombo = 1;
    this.stage = 1;
    this.lives = 3;
    this.timeRemaining = 60; // For Time Attack
    this.correctSolved = 0;
    this.totalAttempts = 0;

    // Power-up state
    this.shieldActive = false;
    this.doublePointsTimer = 0;
    this.slowMoTimer = 0;

    // Entities
    this.basket = null;
    this.fallingItems = [];
    this.currentProblem = null;
    this.spawnTimer = 0;
    this.spawnInterval = 75; // Frames between spawns

    // Controls
    this.keys = {
      left: false,
      right: false,
      dash: false
    };
    this.touchControlState = {
      left: false,
      right: false,
      dash: false
    };
    this.mouseControl = false;
    this.mouseX = 0;

    // Notice Timer
    this.noticeTimer = null;

    // Resize canvas to full screen wrapper immediately
    this.resizeCanvas();

    // Bindings
    this.initEntities();
    this.initEvents();
    this.updateHUD();

    // Start Animation Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  resizeCanvas() {
    if (!this.canvasWrapper) return;
    const rect = this.canvasWrapper.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (w > 0 && h > 0) {
      this.canvas.width = w;
      this.canvas.height = h;
      if (this.basket) {
        this.basket.y = this.canvas.height - 48;
        if (this.basket.x + this.basket.width > this.canvas.width) {
          this.basket.x = Math.max(0, this.canvas.width - this.basket.width - 10);
        }
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  loadHighScore() {
    this.highScore = parseInt(localStorage.getItem(`retro_catch_highscore_${this.gameMode}`) || '0', 10);
    if (this.highScoreEl) {
      this.highScoreEl.textContent = this.highScore.toString().padStart(5, '0');
    }
  }

  initEntities() {
    const defaultW = this.canvas.width > 0 ? this.canvas.width : 800;
    const defaultH = this.canvas.height > 0 ? this.canvas.height : 600;
    this.basket = {
      x: defaultW / 2 - 50,
      y: defaultH - 48,
      width: 100,
      height: 24,
      speed: 8,
      dashMultiplier: 2.2,
      tilt: 0,
      glowTimer: 0
    };
    this.fallingItems = [];
  }

  initEvents() {
    // Keyboard listeners
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code)) {
        this.keys.left = true;
        this.mouseControl = false;
      }
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code)) {
        this.keys.right = true;
        this.mouseControl = false;
      }
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        if (!this.keys.dash && this.state === 'PLAYING') {
          window.soundEngine.playDash();
        }
        this.keys.dash = true;
      }
      // Start / Restart trigger from overlays
      if (['Space', 'Enter', 'KeyR'].includes(e.code)) {
        if (this.state === 'MENU' || this.state === 'GAMEOVER') {
          this.startGame();
        }
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
      if (e.code === 'KeyM') {
        this.toggleSoundUI();
      }
      if (e.code === 'KeyN') {
        this.toggleMusicUI();
      }
      if (e.code === 'KeyC') {
        this.toggleCRT();
      }
      if (e.code === 'KeyF') {
        this.toggleFullscreen();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'KeyA', 'a', 'A'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD', 'd', 'D'].includes(e.code)) this.keys.right = false;
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) this.keys.dash = false;
    });

    // Window Resize for Fullscreen responsiveness
    window.addEventListener('resize', () => this.resizeCanvas());

    // Mouse / Touch on Canvas
    const updatePointerPos = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = clientX - rect.left;
      this.mouseControl = true;
    };

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state === 'PLAYING') {
        updatePointerPos(e.clientX);
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state === 'PLAYING') {
        this.keys.dash = true;
        window.soundEngine.playDash();
      }
    });

    window.addEventListener('mouseup', () => {
      this.keys.dash = false;
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (this.state === 'PLAYING' && e.touches.length > 0) {
        updatePointerPos(e.touches[0].clientX);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.state === 'PLAYING' && e.touches.length > 0) {
        updatePointerPos(e.touches[0].clientX);
      }
    }, { passive: true });

    // Touch Buttons
    const setupTouchBtn = (id, keyName) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const release = (e) => {
        if (e && e.cancelable) e.preventDefault();
        this.touchControlState[keyName] = false;
      };
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.touchControlState[keyName] = true;
        this.mouseControl = false;
        if (keyName === 'dash') window.soundEngine.playDash();
      });
      btn.addEventListener('touchend', release);
      btn.addEventListener('touchcancel', release);
      btn.addEventListener('mousedown', () => {
        this.touchControlState[keyName] = true;
        this.mouseControl = false;
        if (keyName === 'dash') window.soundEngine.playDash();
      });
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
    };

    setupTouchBtn('touch-left', 'left');
    setupTouchBtn('touch-right', 'right');
    setupTouchBtn('touch-dash', 'dash');

    // UI Buttons
    document.getElementById('btn-start-game').addEventListener('click', () => this.startGame());
    document.getElementById('btn-play-again').addEventListener('click', () => this.startGame());
    document.getElementById('btn-return-menu').addEventListener('click', () => this.showMenu());
    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-restart-paused').addEventListener('click', () => this.startGame());
    document.getElementById('btn-menu-paused').addEventListener('click', () => this.showMenu());

    // Sound / Music / CRT / Fullscreen Buttons
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }

    const btnSound = document.getElementById('btn-sound');
    btnSound.addEventListener('click', () => this.toggleSoundUI());

    const btnMusic = document.getElementById('btn-music');
    btnMusic.addEventListener('click', () => this.toggleMusicUI());

    const btnCrt = document.getElementById('btn-crt');
    btnCrt.addEventListener('click', () => this.toggleCRT());

    // Mode Selection Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.gameMode = e.currentTarget.dataset.mode;
        this.loadHighScore();
      });
    });

    // Category Selection Buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.category = e.currentTarget.dataset.cat;
      });
    });
  }

  toggleSoundUI() {
    const enabled = window.soundEngine.toggleSound();
    const btn = document.getElementById('btn-sound');
    btn.textContent = enabled ? '🔊' : '🔇';
    btn.title = enabled ? 'Mute Sound (M)' : 'Unmute Sound (M)';
  }

  toggleMusicUI() {
    const enabled = window.soundEngine.toggleMusic();
    const btn = document.getElementById('btn-music');
    btn.textContent = enabled ? '🎵' : '🎼';
    btn.classList.toggle('active', enabled);
  }

  toggleCRT() {
    const overlay = document.getElementById('crt-overlay');
    overlay.classList.toggle('disabled');
    const btn = document.getElementById('btn-crt');
    if (btn) {
      btn.classList.toggle('active', !overlay.classList.contains('disabled'));
    }
  }

  showNotice(text, color = '#ff007f', duration = 1200) {
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.floatingNotice.textContent = text;
    this.floatingNotice.style.borderColor = color;
    this.floatingNotice.style.color = color;
    this.floatingNotice.classList.remove('hidden');
    this.noticeTimer = setTimeout(() => {
      this.floatingNotice.classList.add('hidden');
    }, duration);
  }

  startGame() {
    window.soundEngine.init();
    this.state = 'PLAYING';
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.stage = 1;
    this.correctSolved = 0;
    this.totalAttempts = 0;
    this.shieldActive = false;
    this.doublePointsTimer = 0;
    this.slowMoTimer = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 75;

    this.loadHighScore();

    if (this.gameMode === 'arcade') {
      this.lives = 3;
    } else if (this.gameMode === 'timeattack') {
      this.timeRemaining = 60;
      this.lives = '∞';
    } else {
      // Zen
      this.lives = 'ZEN';
    }

    this.initEntities();
    window.particleSystem.reset();
    window.soundEngine.setBGMTempo(this.stage);
    if (window.soundEngine.musicEnabled) {
      window.soundEngine.startBGM();
    }

    this.menuOverlay.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.gameOverOverlay.classList.add('hidden');

    this.nextProblem();
    this.updateHUD();
    this.showNotice(`STAGE ${this.stage} START!`, '#00f3ff', 1200);
  }

  showMenu() {
    this.state = 'MENU';
    this.menuOverlay.classList.remove('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.gameOverOverlay.classList.add('hidden');
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseOverlay.classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseOverlay.classList.add('hidden');
    }
  }

  nextProblem() {
    this.currentProblem = window.mathGenerator.generate(this.category, this.stage);
    this.questionEl.textContent = this.currentProblem.prompt;

    // Visual bump on question marquee
    this.questionEl.classList.remove('pulse-question');
    void this.questionEl.offsetWidth; // Trigger reflow for animation restart
    this.questionEl.classList.add('pulse-question');

    // Spawn the target answer immediately
    this.spawnFallingItem(true);
  }

  spawnFallingItem(forceCorrect = false) {
    if (!this.currentProblem) return;

    // Decide if powerup should spawn (approx 8% chance if not forcing correct)
    if (!forceCorrect && Math.random() < 0.08) {
      this.spawnPowerUp();
      return;
    }

    let isCorrect = forceCorrect;
    if (!forceCorrect) {
      // Guarantee exactly ONE correct answer falling at any time
      const hasCorrectOnScreen = this.fallingItems.some(item => item.isCorrect);
      if (!hasCorrectOnScreen) {
        isCorrect = true;
      } else {
        isCorrect = false;
      }
    }

    // Determine value
    let val;
    if (isCorrect) {
      val = this.currentProblem.answer;
    } else {
      const activeValues = this.fallingItems.map(i => i.value);
      activeValues.push(this.currentProblem.answer);
      val = this.currentProblem.getDecoy(activeValues);
    }

    const radius = 24;
    // Prevent spawning directly on top of another item's X
    let posX = radius + Math.random() * (this.canvas.width - radius * 2);
    let attempts = 0;
    while (attempts < 5 && this.fallingItems.some(i => Math.abs(i.x - posX) < radius * 2.2 && i.y < 80)) {
      posX = radius + Math.random() * (this.canvas.width - radius * 2);
      attempts++;
    }

    // Speed scales with stage
    const baseSpeed = 1.8 + Math.min(3.5, this.stage * 0.35);
    const speedVariation = (Math.random() - 0.5) * 0.5;

    // Palette of bright, crisp, high-contrast badges for light theme
    const palettes = [
      { border: '#0284c7', bg: '#f0f9ff', text: '#0369a1' },
      { border: '#4361ee', bg: '#eef2ff', text: '#312e81' },
      { border: '#059669', bg: '#ecfdf5', text: '#065f46' },
      { border: '#d97706', bg: '#fffbeb', text: '#92400e' },
      { border: '#7c3aed', bg: '#f5f3ff', text: '#5b21b6' },
      { border: '#e11d48', bg: '#fff1f2', text: '#9f1239' },
      { border: '#0d9488', bg: '#f0fdfa', text: '#115e59' }
    ];
    const chosenTheme = palettes[Math.floor(Math.random() * palettes.length)];

    this.fallingItems.push({
      type: 'number',
      value: val,
      isCorrect: isCorrect,
      x: posX,
      y: -radius,
      radius: 27,
      speed: Math.max(1.5, baseSpeed + speedVariation),
      wobbleOffset: Math.random() * Math.PI * 2,
      border: chosenTheme.border,
      bgColor: chosenTheme.bg,
      textColor: chosenTheme.text
    });
  }

  spawnPowerUp() {
    const types = ['star', 'slow', 'bomb', 'shield'];
    if (this.gameMode === 'arcade' && this.lives < 3) {
      types.push('heart');
    }
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const radius = 20;
    const posX = radius + Math.random() * (this.canvas.width - radius * 2);

    this.fallingItems.push({
      type: 'powerup',
      powerType: chosenType,
      x: posX,
      y: -radius,
      radius: radius,
      speed: 2.2,
      wobbleOffset: Math.random() * Math.PI * 2
    });
  }

  // --- Main Update Loop ---
  update(dt) {
    if (this.state !== 'PLAYING') return;

    // Time Attack Clock
    if (this.gameMode === 'timeattack') {
      this.timeRemaining -= dt / 1000;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.gameOver('TIME UP!');
        return;
      }
    }

    // Power-up Timers
    if (this.doublePointsTimer > 0) {
      this.doublePointsTimer -= dt / 1000;
      if (this.doublePointsTimer <= 0) {
        this.doublePointsTimer = 0;
        this.hidePowerupBadge();
      } else {
        this.updatePowerupBadge('⭐', 'DOUBLE POINTS', this.doublePointsTimer / 8);
      }
    }

    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= dt / 1000;
      if (this.slowMoTimer <= 0) {
        this.slowMoTimer = 0;
        this.hidePowerupBadge();
      } else {
        this.updatePowerupBadge('⏱️', 'SLOW-MO', this.slowMoTimer / 6);
      }
    }

    // Update Basket Movement
    let moveLeft = this.keys.left || this.touchControlState.left;
    let moveRight = this.keys.right || this.touchControlState.right;
    let isDashing = this.keys.dash || this.touchControlState.dash;

    let currentSpeed = this.basket.speed * (isDashing ? this.basket.dashMultiplier : 1);

    if (this.mouseControl) {
      const targetX = this.mouseX - this.basket.width / 2;
      const dx = targetX - this.basket.x;
      const lerpSpeed = isDashing ? 0.45 : 0.32;
      this.basket.x += dx * lerpSpeed;
      this.basket.tilt = Math.max(-0.25, Math.min(0.25, (dx / 25) * 0.18));
    } else {
      if (moveLeft) {
        this.basket.x -= currentSpeed;
        this.basket.tilt = isDashing ? -0.25 : -0.12;
      } else if (moveRight) {
        this.basket.x += currentSpeed;
        this.basket.tilt = isDashing ? 0.25 : 0.12;
      } else {
        this.basket.tilt *= 0.8;
      }
    }

    // Clamp Basket to Canvas
    if (this.basket.x < 5) this.basket.x = 5;
    if (this.basket.x + this.basket.width > this.canvas.width - 5) {
      this.basket.x = this.canvas.width - 5 - this.basket.width;
    }

    // Spawn Dash Trail
    if (isDashing && (moveLeft || moveRight || Math.abs(this.basket.tilt) > 0.1)) {
      window.particleSystem.spawnDashTrail(this.basket.x + this.basket.width / 2, this.basket.y, this.basket.width, this.basket.height);
    }

    // Spawn Timer
    this.spawnTimer++;
    const activeInterval = Math.max(35, this.spawnInterval - this.stage * 4);
    if (this.spawnTimer >= activeInterval) {
      this.spawnTimer = 0;
      this.spawnFallingItem(false);
    }

    // Update Falling Items
    const speedMult = this.slowMoTimer > 0 ? 0.5 : 1.0;

    for (let i = this.fallingItems.length - 1; i >= 0; i--) {
      const item = this.fallingItems[i];
      item.y += item.speed * speedMult;
      item.wobbleOffset += 0.05;

      // Basket Catch Collision Check
      // Precise rim bounds so dodging decoys never causes accidental catches
      const basketLeft = this.basket.x - 4;
      const basketRight = this.basket.x + this.basket.width + 4;
      const inX = item.x >= basketLeft && item.x <= basketRight;
      const inY = (item.y + item.radius * 0.6 >= this.basket.y) && 
                  (item.y - item.radius * 0.3 <= this.basket.y + this.basket.height);

      if (inX && inY) {
        this.handleCatch(item, i);
        continue;
      }

      // Check Bottom Screen Miss
      if (item.y - item.radius > this.canvas.height) {
        this.handleMiss(item, i);
      }
    }

    // Update Visual Systems
    window.particleSystem.update();
    this.updateHUD();
  }

  handleCatch(item, index) {
    this.fallingItems.splice(index, 1);

    if (item.type === 'powerup') {
      this.applyPowerUp(item.powerType, item.x, item.y);
      return;
    }

    // Item is a Number (count towards player accuracy)
    this.totalAttempts++;

    const isCorrect = (this.currentProblem.type === 'rule' && this.currentProblem.validator)
      ? this.currentProblem.validator(item.value)
      : (item.value === this.currentProblem.answer);

    if (isCorrect) {
      // SUCCESS!
      window.soundEngine.playCoin();
      window.particleSystem.spawnSuccessBurst(item.x, item.y, 30);

      const pts = 100 * this.combo * (this.doublePointsTimer > 0 ? 2 : 1);
      this.score += pts;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem(`retro_catch_highscore_${this.gameMode}`, this.highScore.toString());
      }

      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      window.particleSystem.addFloatingText(`+${pts}!`, item.x, item.y - 15, '#ffea00', 18);
      if (this.combo > 2) {
        window.particleSystem.addFloatingText(`${this.combo}x COMBO!`, this.basket.x + this.basket.width / 2, this.basket.y - 35, '#ff007f', 14);
      }

      // Time Attack bonus time
      if (this.gameMode === 'timeattack') {
        this.timeRemaining += 3;
        window.particleSystem.addFloatingText('+3 SECONDS! ⏱️', item.x, item.y - 35, '#39ff14', 14);
      }

      this.correctSolved++;

      // Stage Progression Check (every 5 problems solved)
      if (this.correctSolved % 5 === 0) {
        this.stageUp();
      }

      // Clear remaining numbers of previous question with spark trails and get new problem
      this.clearCurrentNumbersToSparks();
      this.nextProblem();

    } else {
      // WRONG ANSWER DECOY!
      if (this.shieldActive) {
        this.shieldActive = false;
        window.soundEngine.playDash();
        window.particleSystem.triggerShake(5, 8);
        window.particleSystem.addFloatingText('SHIELD BLOCKED!', item.x, item.y - 20, '#00f3ff', 16);
        return;
      }

      window.soundEngine.playError();
      window.particleSystem.spawnErrorDebris(item.x, item.y, 25);
      window.particleSystem.triggerShake(10, 15);
      this.combo = 1;

      if (this.gameMode === 'arcade') {
        this.lives--;
        window.particleSystem.addFloatingText('WRONG! -1 ❤️', item.x, item.y - 20, '#ff3344', 16);
        if (this.lives <= 0) {
          this.lives = 0;
          this.gameOver('DEFEATED BY DECOYS!');
        }
      } else if (this.gameMode === 'timeattack') {
        this.timeRemaining = Math.max(0, this.timeRemaining - 4);
        window.particleSystem.addFloatingText('-4 SECONDS!', item.x, item.y - 20, '#ff3344', 16);
      } else {
        // Zen
        this.score = Math.max(0, this.score - 50);
        window.particleSystem.addFloatingText('WRONG! -50', item.x, item.y - 20, '#ff7700', 16);
      }
    }
  }

  handleMiss(item, index) {
    this.fallingItems.splice(index, 1);

    // If a correct answer fell off screen without being caught
    if (item.type === 'number' && item.isCorrect) {
      this.combo = 1;
      window.particleSystem.addFloatingText('MISSED!', item.x, this.canvas.height - 30, '#ff7700', 14);

      if (this.gameMode === 'arcade') {
        this.lives--;
        window.soundEngine.playError();
        window.particleSystem.triggerShake(6, 10);
        if (this.lives <= 0) {
          this.lives = 0;
          this.gameOver('ANSWER MISSED!');
          return;
        }
      }

      // Respawn the answer or rotate to new problem
      this.spawnFallingItem(true);
    }
  }

  applyPowerUp(type, x, y) {
    window.soundEngine.playPowerup();
    window.particleSystem.spawnSuccessBurst(x, y, 20);

    if (type === 'star') {
      this.doublePointsTimer = 8;
      window.particleSystem.addFloatingText('2X POINTS! 🌟', x, y - 20, '#ffea00', 16);
      this.updatePowerupBadge('⭐', '2X POINTS', 1);
    } else if (type === 'slow') {
      this.slowMoTimer = 6;
      window.particleSystem.addFloatingText('SLOW-MO! ⏱️', x, y - 20, '#00f3ff', 16);
      this.updatePowerupBadge('⏱️', 'SLOW-MO', 1);
    } else if (type === 'bomb') {
      window.soundEngine.playExplosion();
      window.particleSystem.spawnBombExplosion(this.canvas.width, this.canvas.height);
      window.particleSystem.addFloatingText('DECOYS WIPED! 💣', this.canvas.width / 2, this.canvas.height / 2, '#ff3344', 20);
      // Remove all decoys currently on screen
      this.fallingItems = this.fallingItems.filter(item => item.isCorrect || item.type === 'powerup');
    } else if (type === 'shield') {
      this.shieldActive = true;
      window.particleSystem.addFloatingText('SHIELD ACTIVE! 🛡️', x, y - 20, '#00f3ff', 16);
    } else if (type === 'heart') {
      if (this.gameMode === 'arcade' && this.lives < 3) {
        this.lives++;
        window.particleSystem.addFloatingText('+1 LIFE! 💖', x, y - 20, '#ff007f', 16);
      }
    }
  }

  updatePowerupBadge(icon, title, ratio) {
    this.powerupIcon.textContent = icon;
    this.powerupTitle.textContent = title;
    this.powerupBar.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
    this.powerupBadge.classList.remove('hidden');
  }

  hidePowerupBadge() {
    this.powerupBadge.classList.add('hidden');
  }

  clearCurrentNumbersToSparks() {
    const retained = [];
    for (const item of this.fallingItems) {
      if (item.type === 'number') {
        window.particleSystem.spawnSuccessBurst(item.x, item.y, 8);
      } else {
        retained.push(item);
      }
    }
    this.fallingItems = retained;
  }

  stageUp() {
    this.stage++;
    window.soundEngine.playLevelUp();
    window.soundEngine.setBGMTempo(this.stage);
    this.showNotice(`STAGE ${this.stage}! SPEED UP!`, '#ffea00', 1600);
  }

  gameOver(reason = 'GAME OVER') {
    this.state = 'GAMEOVER';
    window.soundEngine.playGameOver();
    window.soundEngine.stopBGM();

    document.getElementById('gameover-title').textContent = reason;
    document.getElementById('final-score').textContent = this.score.toString().padStart(5, '0');
    document.getElementById('final-combo').textContent = `x${this.maxCombo}`;
    document.getElementById('final-solved').textContent = this.correctSolved;

    const acc = this.totalAttempts > 0 
      ? Math.round((this.correctSolved / this.totalAttempts) * 100) 
      : 100;
    document.getElementById('final-accuracy').textContent = `${acc}%`;

    const highBanner = document.getElementById('new-high-score-banner');
    if (this.score >= this.highScore && this.score > 0) {
      highBanner.classList.remove('hidden');
    } else {
      highBanner.classList.add('hidden');
    }

    this.gameOverOverlay.classList.remove('hidden');
  }

  updateHUD() {
    this.scoreEl.textContent = this.score.toString().padStart(5, '0');
    this.highScoreEl.textContent = this.highScore.toString().padStart(5, '0');
    this.comboEl.textContent = `x${this.combo}`;
    this.levelEl.textContent = this.stage.toString().padStart(2, '0');

    if (this.gameMode === 'arcade') {
      let hearts = '';
      for (let i = 0; i < this.lives; i++) hearts += '❤️';
      for (let i = this.lives; i < 3; i++) hearts += '🖤';
      this.livesEl.textContent = hearts;
    } else if (this.gameMode === 'timeattack') {
      this.livesEl.textContent = `⏱️ ${Math.ceil(this.timeRemaining)}s`;
    } else {
      this.livesEl.textContent = 'ZEN 🧘';
    }

    // Combo streak bar (fills up to 5x streak cycle)
    const comboProgress = Math.min(100, ((this.combo - 1) % 5) * 25);
    this.streakFillEl.style.width = `${comboProgress}%`;
  }

  // --- Rendering Loop ---
  render() {
    const shake = window.particleSystem.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(shake.x, shake.y);

    // Clear background to clean light canvas
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw light grid background lines
    this.drawGrid();

    // Draw Falling Items
    for (const item of this.fallingItems) {
      if (item.type === 'number') {
        this.drawFallingNumber(item);
      } else if (item.type === 'powerup') {
        this.drawPowerUp(item);
      }
    }

    // Draw Basket
    if (this.basket) {
      this.drawBasket();
    }

    // Draw Particle System & Texts
    window.particleSystem.draw(this.ctx);

    this.ctx.restore();
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    this.ctx.lineWidth = 1;
    const step = 45;
    for (let x = 0; x < this.canvas.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawFallingNumber(item) {
    const ctx = this.ctx;
    ctx.save();

    // Gentle float wobble
    const wobbleX = Math.sin(item.wobbleOffset) * 2;
    const drawX = item.x + wobbleX;
    const drawY = item.y;
    const border = item.border || '#4361ee';
    const bg = item.bgColor || '#ffffff';
    const text = item.textColor || '#0f172a';

    // Soft drop shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // Outer Bubble Surface
    ctx.beginPath();
    ctx.arc(drawX, drawY, item.radius, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();

    // Vibrant Crisp Border
    ctx.shadowColor = border;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = border;
    ctx.stroke();

    // Top Gloss Highlight
    ctx.beginPath();
    ctx.arc(drawX, drawY - item.radius * 0.45, item.radius * 0.45, Math.PI, 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    // Render Number Text - Modern, Bold, Ultra-Legible
    const str = item.value.toString();
    const fontSize = str.length > 2 ? 15 : (str.length > 1 ? 18 : 22);
    ctx.shadowBlur = 0;
    ctx.fillStyle = text;
    ctx.font = `700 ${fontSize}px "Outfit", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, drawX, drawY + 1);

    ctx.restore();
  }

  drawPowerUp(item) {
    const ctx = this.ctx;
    ctx.save();
    const drawX = item.x;
    const drawY = item.y + Math.sin(item.wobbleOffset) * 3;

    let color = '#f59e0b';
    let icon = '⭐';
    if (item.powerType === 'slow') {
      color = '#0284c7';
      icon = '⏱️';
    } else if (item.powerType === 'bomb') {
      color = '#ef4444';
      icon = '💣';
    } else if (item.powerType === 'shield') {
      color = '#10b981';
      icon = '🛡️';
    } else if (item.powerType === 'heart') {
      color = '#f43f5e';
      icon = '💖';
    }

    ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.arc(drawX, drawY, item.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, drawX, drawY + 1);

    ctx.restore();
  }

  drawBasket() {
    const ctx = this.ctx;
    const b = this.basket;

    ctx.save();
    ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
    ctx.rotate(b.tilt);

    const halfW = b.width / 2;
    const halfH = b.height / 2;

    // Shield Aura if active
    if (this.shieldActive) {
      ctx.beginPath();
      ctx.ellipse(0, 0, halfW + 16, halfH + 18, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
      ctx.stroke();
    }

    // Shadow underneath basket
    ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Sleek Modern Basket Hull
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-halfW, -halfH, b.width, b.height, [8, 8, 12, 12]);
    } else {
      ctx.rect(-halfW, -halfH, b.width, b.height);
    }
    ctx.fill();

    // Top Rim Catching Aperture Sensor
    ctx.shadowColor = '#4361ee';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4361ee';
    ctx.beginPath();
    ctx.moveTo(-halfW + 6, -halfH);
    ctx.lineTo(halfW - 6, -halfH);
    ctx.stroke();

    // Thruster Jets
    const thrusterColor = this.keys.dash || this.touchControlState.dash ? '#f59e0b' : '#38bdf8';
    ctx.fillStyle = thrusterColor;
    ctx.shadowColor = thrusterColor;
    ctx.shadowBlur = 10;
    ctx.fillRect(-halfW + 14, halfH, 12, 5 + Math.random() * 5);
    ctx.fillRect(halfW - 26, halfH, 12, 5 + Math.random() * 5);

    // Center Label "CATCH"
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CATCH', 0, 1);

    ctx.restore();
  }

  loop(currentTime) {
    const dt = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
