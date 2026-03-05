/**
 * game.js — Main Game Controller
 * Manages all user interactions, UI state updates,
 * AI integration, real-time feedback, and score system.
 */

(function () {
    'use strict';

    // ── Game State ─────────────────────────────────────────────────────────────
    const state = {
        bodyColor: '#e63946',
        wheelStyle: 'sport',
        lighting: 'blue',
        tint: 30,
        theme: 'sporty',
        score: 0,
        appliedSuggestions: new Set(),
    };

    // ── Color Palette ──────────────────────────────────────────────────────────
    const COLORS = [
        { hex: '#e63946', name: 'Crimson Red' },
        { hex: '#f97316', name: 'Sunset Orange' },
        { hex: '#eab308', name: 'Solar Yellow' },
        { hex: '#22c55e', name: 'Lime Green' },
        { hex: '#06b6d4', name: 'Cyan Electric' },
        { hex: '#3b82f6', name: 'Ocean Blue' },
        { hex: '#8b5cf6', name: 'Deep Purple' },
        { hex: '#ec4899', name: 'Rose Pink' },
        { hex: '#ffffff', name: 'Pearl White' },
        { hex: '#94a3b8', name: 'Silver Metallic' },
        { hex: '#1e293b', name: 'Stealth Black' },
        { hex: '#d97706', name: 'Gold Rush' },
    ];

    // ── Wheel Options ──────────────────────────────────────────────────────────
    const WHEELS = [
        { id: 'sport', icon: '⚙️', label: 'Sport' },
        { id: 'blade', icon: '🔩', label: 'Blade' },
        { id: 'luxury', icon: '✨', label: 'Luxury' },
        { id: 'mesh', icon: '🔗', label: 'Mesh' },
        { id: 'offroad', icon: '🏔️', label: 'Off-Road' },
        { id: 'split', icon: '💎', label: 'Split' },
    ];

    // ── Lighting Options ───────────────────────────────────────────────────────
    const LIGHTINGS = [
        { id: 'blue', label: '🔵 Blue', },
        { id: 'red', label: '🔴 Red', },
        { id: 'green', label: '🟢 Green', },
        { id: 'purple', label: '🟣 Purple', },
        { id: 'white', label: '⚪ White', },
        { id: 'gold', label: '🟡 Gold', },
    ];

    // ── Quick Themes ───────────────────────────────────────────────────────────
    const QUICK_THEMES = {
        sporty: { color: '#e63946', wheel: 'sport', lighting: 'red', tint: 50 },
        luxury: { color: '#1a1a2e', wheel: 'luxury', lighting: 'gold', tint: 75 },
        stealth: { color: '#111111', wheel: 'blade', lighting: 'green', tint: 90 },
        neon: { color: '#00f5ff', wheel: 'mesh', lighting: 'blue', tint: 20 },
        offroad: { color: '#92400e', wheel: 'offroad', lighting: 'gold', tint: 40 },
    };

    // ── DOM References ─────────────────────────────────────────────────────────
    const $ = (id) => document.getElementById(id);
    const el = {
        loadingScreen: $('loading-screen'),
        loaderBar: $('loader-bar'),
        loaderText: $('loader-text'),
        app: $('app'),
        canvas: $('car-canvas'),
        colorPalette: $('color-palette'),
        wheelGrid: $('wheel-grid'),
        lightingOpts: $('lighting-options'),
        tintSlider: $('tint-slider'),
        customColor: $('custom-color'),
        btnApplyColor: $('btn-apply-color'),
        feedbackToast: $('feedback-toast'),
        aiInput: $('ai-input'),
        btnGenerate: $('btn-ai-generate'),
        aiThinking: $('ai-thinking'),
        aiSuggestions: $('ai-suggestions'),
        styleScore: $('style-score'),
        cfgColor: $('cfg-color'),
        cfgWheels: $('cfg-wheels'),
        cfgLighting: $('cfg-lighting'),
        cfgTint: $('cfg-tint'),
        btnScreenshot: $('btn-screenshot'),
        notifBar: $('notif-bar'),
    };

    // ── Loading Sequence ───────────────────────────────────────────────────────
    function runLoader() {
        const steps = [
            { pct: 15, text: 'Loading 3D Engine...' },
            { pct: 35, text: 'Initializing AI Model...' },
            { pct: 55, text: 'Loading Garage Environment...' },
            { pct: 72, text: 'Calibrating Customizer...' },
            { pct: 88, text: 'Polishing the Hood...' },
            { pct: 100, text: 'Ready to Roll! 🚗' },
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i >= steps.length) {
                clearInterval(interval);
                setTimeout(showApp, 500);
                return;
            }
            el.loaderBar.style.width = steps[i].pct + '%';
            el.loaderText.textContent = steps[i].text;
            i++;
        }, 350);
    }

    function showApp() {
        el.loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            el.loadingScreen.style.display = 'none';
            el.app.classList.remove('hidden');
            el.app.style.display = 'flex';
            CarRenderer.init(el.canvas);
            updateCarRenderer();
        }, 600);
    }

    // ── Build Color Palette ────────────────────────────────────────────────────
    function buildColorPalette() {
        el.colorPalette.innerHTML = '';
        COLORS.forEach((c, i) => {
            const sw = document.createElement('div');
            sw.className = 'color-swatch' + (c.hex === state.bodyColor ? ' active' : '');
            sw.style.background = c.hex;
            sw.title = c.name;
            sw.dataset.hex = c.hex;
            sw.id = 'swatch-' + i;
            sw.addEventListener('click', () => selectColor(c.hex, c.name, sw));
            el.colorPalette.appendChild(sw);
        });
    }

    function selectColor(hex, name, swatchEl) {
        // Deselect all
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        if (swatchEl) swatchEl.classList.add('active');
        state.bodyColor = hex;
        addScore(5);
        updateCarRenderer();
        showFeedback(`🎨 Color: ${name || hex}`);
        updateConfig();
    }

    // ── Build Wheel Options ────────────────────────────────────────────────────
    function buildWheelGrid() {
        el.wheelGrid.innerHTML = '';
        WHEELS.forEach(w => {
            const btn = document.createElement('button');
            btn.className = 'wheel-btn' + (w.id === state.wheelStyle ? ' active' : '');
            btn.innerHTML = `<span class="wheel-icon">${w.icon}</span>${w.label}`;
            btn.id = 'wheel-' + w.id;
            btn.dataset.wheel = w.id;
            btn.addEventListener('click', () => selectWheel(w.id, w.label, btn));
            el.wheelGrid.appendChild(btn);
        });
    }

    function selectWheel(id, label, btn) {
        document.querySelectorAll('.wheel-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.wheelStyle = id;
        addScore(8);
        updateCarRenderer();
        showFeedback(`🔧 Wheels: ${label}`);
        updateConfig();
    }

    // ── Build Lighting Options ─────────────────────────────────────────────────
    function buildLightingOptions() {
        el.lightingOpts.innerHTML = '';
        LIGHTINGS.forEach(l => {
            const btn = document.createElement('button');
            btn.className = 'light-btn' + (l.id === state.lighting ? ' active' : '');
            btn.textContent = l.label;
            btn.id = 'light-' + l.id;
            btn.dataset.light = l.id;
            btn.addEventListener('click', () => selectLighting(l.id, l.label, btn));
            el.lightingOpts.appendChild(btn);
        });
    }

    function selectLighting(id, label, btn) {
        document.querySelectorAll('.light-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.lighting = id;
        addScore(6);
        updateCarRenderer();
        showFeedback(`💡 Lighting: ${label}`);
        updateConfig();
    }

    // ── Tint Slider ────────────────────────────────────────────────────────────
    function initTintSlider() {
        el.tintSlider.addEventListener('input', () => {
            state.tint = parseInt(el.tintSlider.value);
            updateTintSliderFill();
            updateCarRenderer();
            el.cfgTint.textContent = state.tint + '%';
        });
        el.tintSlider.addEventListener('change', () => {
            addScore(3);
            showFeedback(`🪟 Tint: ${state.tint}%`);
            updateConfig();
        });
        updateTintSliderFill();
    }

    function updateTintSliderFill() {
        const pct = el.tintSlider.value;
        el.tintSlider.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, rgba(255,255,255,0.15) ${pct}%)`;
    }

    // ── Custom Color Picker ────────────────────────────────────────────────────
    el.btnApplyColor.addEventListener('click', () => {
        const hex = el.customColor.value;
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        state.bodyColor = hex;
        addScore(10);
        updateCarRenderer();
        showFeedback(`🎨 Custom Color Applied!`);
        updateConfig();
    });

    // ── Quick Theme Buttons ────────────────────────────────────────────────────
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            const cfg = QUICK_THEMES[theme];
            if (!cfg) return;

            state.bodyColor = cfg.color;
            state.wheelStyle = cfg.wheel;
            state.lighting = cfg.lighting;
            state.tint = cfg.tint;
            state.theme = theme;

            // Update UI elements
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.wheel-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.wheel === cfg.wheel);
            });
            document.querySelectorAll('.light-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.light === cfg.lighting);
            });
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            el.tintSlider.value = cfg.tint;
            updateTintSliderFill();

            addScore(15);
            updateCarRenderer();
            showFeedback(`🎯 Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} applied!`);
            updateConfig();
        });
    });

    // ── AI Generation ──────────────────────────────────────────────────────────
    el.btnGenerate.addEventListener('click', triggerAIGenerate);
    el.aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') triggerAIGenerate(); });

    function triggerAIGenerate() {
        const input = el.aiInput.value.trim();
        if (!input) {
            showFeedback('⚠️ Please enter a style description!', true);
            return;
        }

        // Show thinking state
        el.aiThinking.style.display = 'flex';
        el.aiSuggestions.innerHTML = '';
        el.btnGenerate.disabled = true;
        el.btnGenerate.textContent = '⏳ Thinking...';

        // Simulate AI "thinking" delay (300–900ms) for realism
        const delay = 400 + Math.random() * 500;
        setTimeout(() => {
            const result = AIEngine.generate(input);
            displaySuggestions(result);
            el.aiThinking.style.display = 'none';
            el.btnGenerate.disabled = false;
            el.btnGenerate.innerHTML = '<span class="ai-btn-icon">✨</span> Generate';
            addScore(20);
            showNotif(`🤖 AI generated ${result.suggestions.length} suggestions for "${input}"`);
        }, delay);
    }

    function displaySuggestions(result) {
        el.aiSuggestions.innerHTML = '';
        result.suggestions.forEach((s, i) => {
            const card = document.createElement('div');
            card.className = 'suggestion-card' + (state.appliedSuggestions.has(s.name) ? ' applied' : '');
            card.id = 'suggestion-' + i;

            const tags = s.tags.map(t => `<span class="suggestion-tag">${t}</span>`).join('');
            card.innerHTML = `
        <div class="suggestion-num">OPTION ${i + 1}</div>
        <div class="suggestion-name">${s.name}</div>
        <div class="suggestion-desc">${s.description}</div>
        <div class="suggestion-tags">${tags}</div>
        <button class="suggestion-apply-btn" id="apply-btn-${i}">
          ${state.appliedSuggestions.has(s.name) ? '✓ Applied' : '⚡ Apply This Look'}
        </button>
      `;

            card.querySelector('.suggestion-apply-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                applySuggestion(s, card, i);
            });
            card.addEventListener('click', () => applySuggestion(s, card, i));

            // Staggered entrance animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            el.aiSuggestions.appendChild(card);
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 90);
        });
    }

    function applySuggestion(s, cardEl, idx) {
        // Apply all config values
        state.bodyColor = s.color;
        state.wheelStyle = s.wheel;
        state.lighting = s.lighting;
        state.tint = s.tint;

        // Update UI controls
        document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
        document.querySelectorAll('.wheel-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.wheel === s.wheel);
        });
        document.querySelectorAll('.light-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.light === s.lighting);
        });
        el.tintSlider.value = s.tint;
        updateTintSliderFill();

        // Mark as applied
        document.querySelectorAll('.suggestion-card').forEach(c => c.classList.remove('applied'));
        cardEl.classList.add('applied');
        const applyBtn = cardEl.querySelector('.suggestion-apply-btn');
        if (applyBtn) applyBtn.textContent = '✓ Applied';
        state.appliedSuggestions.add(s.name);

        addScore(25);
        updateCarRenderer();
        showFeedback(`✨ Applied: ${s.name}`);
        updateConfig();
    }

    // ── Car Renderer Update ────────────────────────────────────────────────────
    function updateCarRenderer() {
        CarRenderer.setState({
            bodyColor: state.bodyColor,
            wheelStyle: state.wheelStyle,
            lighting: state.lighting,
            tint: state.tint,
        });
    }

    // ── Score System ───────────────────────────────────────────────────────────
    function addScore(pts) {
        state.score += pts;
        el.styleScore.textContent = state.score;
        el.styleScore.style.transform = 'scale(1.3)';
        setTimeout(() => { el.styleScore.style.transform = 'scale(1)'; el.styleScore.style.transition = 'transform 0.2s'; }, 200);
    }

    // ── Feedback Toast ─────────────────────────────────────────────────────────
    let toastTimer = null;
    function showFeedback(msg, isError = false) {
        el.feedbackToast.textContent = msg;
        el.feedbackToast.className = 'feedback-toast show' + (isError ? ' error' : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            el.feedbackToast.classList.remove('show');
        }, 2200);
    }

    // ── Notification Bar ───────────────────────────────────────────────────────
    let notifTimer = null;
    function showNotif(msg) {
        el.notifBar.textContent = msg;
        el.notifBar.style.display = 'block';
        clearTimeout(notifTimer);
        notifTimer = setTimeout(() => {
            el.notifBar.style.display = 'none';
        }, 3500);
    }

    // ── Config Display ─────────────────────────────────────────────────────────
    function updateConfig() {
        el.cfgColor.textContent = state.bodyColor.toUpperCase();
        el.cfgColor.style.color = state.bodyColor;
        const wh = WHEELS.find(w => w.id === state.wheelStyle);
        el.cfgWheels.textContent = wh ? wh.label : state.wheelStyle;
        const lt = LIGHTINGS.find(l => l.id === state.lighting);
        el.cfgLighting.textContent = lt ? lt.label.split(' ')[1] : state.lighting;
        el.cfgTint.textContent = state.tint + '%';
    }

    // ── Screenshot / Save Look ─────────────────────────────────────────────────
    el.btnScreenshot.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `autoverse-look-${Date.now()}.png`;
        link.href = el.canvas.toDataURL('image/png');
        link.click();
        addScore(10);
        showFeedback('📸 Look saved!');
    });

    // ── Init ───────────────────────────────────────────────────────────────────
    function init() {
        buildColorPalette();
        buildWheelGrid();
        buildLightingOptions();
        initTintSlider();
        updateConfig();
        runLoader();
    }

    init();
})();
