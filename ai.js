/**
 * ai.js — Generative AI Suggestion Engine
 * Implements a rule-based generative AI that produces
 * 3-5 unique car customization suggestions based on user keyword input.
 * Uses seed-based variation for diversity on each call.
 */

const AIEngine = (() => {

    // ── Knowledge Base ──────────────────────────────────────────────────────────
    const THEMES = {
        sporty: {
            keywords: ['sport', 'sporty', 'race', 'racing', 'fast', 'speed', 'track', 'agile', 'performance', 'gt'],
            configs: [
                { name: 'Track Dominator', color: '#ff2222', wheel: 'blade', lighting: 'red', tint: 70, tags: ['Race-Ready', 'Aggressive'] },
                { name: 'Sprint Edition', color: '#f97316', wheel: 'sport', lighting: 'red', tint: 50, tags: ['Dynamic', 'Bold'] },
                { name: 'Circuit Pro', color: '#eab308', wheel: 'split', lighting: 'gold', tint: 40, tags: ['GT Style', 'Pro'] },
                { name: 'Speed Devil', color: '#ffffff', wheel: 'blade', lighting: 'blue', tint: 60, tags: ['Stealth', 'Fast'] },
                { name: 'Adrenaline Rush', color: '#22c55e', wheel: 'sport', lighting: 'green', tint: 55, tags: ['Unique', 'Sporty'] },
            ]
        },
        luxury: {
            keywords: ['luxury', 'premium', 'elegant', 'exclusive', 'prestige', 'gold', 'vip', 'rich', 'classy', 'high-end'],
            configs: [
                { name: 'Prestige Black', color: '#1a1a2e', wheel: 'luxury', lighting: 'gold', tint: 80, tags: ['VIP', 'Exclusive'] },
                { name: 'Pearl White Grand', color: '#f8fafc', wheel: 'luxury', lighting: 'white', tint: 45, tags: ['Elegant', 'Pure'] },
                { name: 'Midnight Velvet', color: '#2d1b69', wheel: 'mesh', lighting: 'purple', tint: 75, tags: ['Opulent', 'Rare'] },
                { name: 'Golden Hour', color: '#c9a84c', wheel: 'luxury', lighting: 'gold', tint: 50, tags: ['Premium', 'Bold'] },
                { name: 'Executive Navy', color: '#1e3a5f', wheel: 'split', lighting: 'blue', tint: 70, tags: ['Corporate', 'Elite'] },
            ]
        },
        stealth: {
            keywords: ['stealth', 'dark', 'black', 'night', 'shadow', 'ghost', 'ninja', 'hidden', 'minimal', 'matte'],
            configs: [
                { name: 'Shadow Operative', color: '#111111', wheel: 'blade', lighting: 'green', tint: 95, tags: ['Ghost', 'Tactical'] },
                { name: 'Matte Phantom', color: '#1e2022', wheel: 'mesh', lighting: 'purple', tint: 90, tags: ['Dark', 'Matte'] },
                { name: 'Dark Matter', color: '#0d0d0d', wheel: 'sport', lighting: 'blue', tint: 85, tags: ['Minimal', 'Clean'] },
                { name: 'Nightfall Special', color: '#2c2c54', wheel: 'blade', lighting: 'purple', tint: 80, tags: ['Night', 'Mysterious'] },
                { name: 'Eclipse Edition', color: '#16213e', wheel: 'luxury', lighting: 'white', tint: 88, tags: ['Sleek', 'Refined'] },
            ]
        },
        neon: {
            keywords: ['neon', 'glow', 'rgb', 'colorful', 'vibrant', 'bright', 'electric', 'cyber', 'futuristic', 'gaming'],
            configs: [
                { name: 'Cyber Pulse', color: '#00f5ff', wheel: 'mesh', lighting: 'blue', tint: 30, tags: ['Cyberpunk', 'Electric'] },
                { name: 'Neon Blaze', color: '#ff006e', wheel: 'sport', lighting: 'red', tint: 25, tags: ['Vivid', 'Loud'] },
                { name: 'Ultraviolet Dreams', color: '#8b00ff', wheel: 'split', lighting: 'purple', tint: 35, tags: ['UV', 'Glow'] },
                { name: 'Laser Lime', color: '#39ff14', wheel: 'blade', lighting: 'green', tint: 20, tags: ['Acid', 'Bright'] },
                { name: 'Holographic Drift', color: '#ff9500', wheel: 'mesh', lighting: 'gold', tint: 28, tags: ['Iridescent', 'Futuristic'] },
            ]
        },
        offroad: {
            keywords: ['off-road', 'offroad', 'rugged', 'mud', 'dirt', 'terrain', 'mountain', 'wilderness', 'truck', 'adventure', 'outdoor'],
            configs: [
                { name: 'Desert Conqueror', color: '#92400e', wheel: 'offroad', lighting: 'gold', tint: 40, tags: ['Rugged', 'Desert'] },
                { name: 'Army Trail Blazer', color: '#3f6212', wheel: 'offroad', lighting: 'green', tint: 55, tags: ['Military', 'Tough'] },
                { name: 'Mountain Storm', color: '#475569', wheel: 'offroad', lighting: 'white', tint: 35, tags: ['Adventure', 'Solid'] },
                { name: 'Mud King Pro', color: '#57534e', wheel: 'offroad', lighting: 'gold', tint: 50, tags: ['Heavy-Duty', 'Beast'] },
                { name: 'Canyon Raider', color: '#b45309', wheel: 'mesh', lighting: 'red', tint: 45, tags: ['Canyon', 'Dynamic'] },
            ]
        },
    };

    // Generic / fallback configs for unrecognized input
    const GENERIC_CONFIGS = [
        { name: 'Classic Red Racer', color: '#dc2626', wheel: 'sport', lighting: 'red', tint: 40, tags: ['Classic', 'Bold'] },
        { name: 'Ocean Blue Drift', color: '#0284c7', wheel: 'split', lighting: 'blue', tint: 50, tags: ['Cool', 'Smooth'] },
        { name: 'Midnight Black Edition', color: '#0f172a', wheel: 'luxury', lighting: 'white', tint: 80, tags: ['Dark', 'Sleek'] },
        { name: 'Forest Green GT', color: '#166534', wheel: 'blade', lighting: 'green', tint: 45, tags: ['Natural', 'GT'] },
        { name: 'Platinum Silver Pro', color: '#94a3b8', wheel: 'mesh', lighting: 'white', tint: 35, tags: ['Clean', 'Modern'] },
        { name: 'Solar Orange Turbo', color: '#ea580c', wheel: 'sport', lighting: 'gold', tint: 30, tags: ['Vibrant', 'Turbo'] },
        { name: 'Candy Purple VIP', color: '#7c3aed', wheel: 'luxury', lighting: 'purple', tint: 65, tags: ['Luxury', 'Rare'] },
    ];

    // ── Keyword Matcher ─────────────────────────────────────────────────────────
    function detectTheme(input) {
        const lower = input.toLowerCase();
        let bestTheme = null, bestScore = 0;
        for (const [theme, data] of Object.entries(THEMES)) {
            const score = data.keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
            if (score > bestScore) { bestScore = score; bestTheme = theme; }
        }
        return bestScore > 0 ? bestTheme : null;
    }

    // ── Color Mixer (blend keywords into color) ─────────────────────────────────
    const COLOR_KEYWORDS = {
        red: '#dc2626', crimson: '#b91c1c', scarlet: '#e11d48',
        blue: '#2563eb', navy: '#1e3a8a', cyan: '#06b6d4', sapphire: '#1d4ed8',
        green: '#16a34a', lime: '#84cc16', emerald: '#059669', forest: '#166534',
        yellow: '#ca8a04', gold: '#d97706', amber: '#f59e0b',
        orange: '#ea580c', sunset: '#f97316',
        purple: '#7c3aed', violet: '#6d28d9', magenta: '#db2777',
        pink: '#ec4899', rose: '#f43f5e',
        white: '#f8fafc', silver: '#94a3b8', grey: '#6b7280', gray: '#6b7280',
        black: '#0f172a', midnight: '#111827', dark: '#1e293b',
        brown: '#92400e', tan: '#d97706', cream: '#fef3c7',
    };

    function extractColor(input) {
        const lower = input.toLowerCase();
        for (const [kw, hex] of Object.entries(COLOR_KEYWORDS)) {
            if (lower.includes(kw)) return hex;
        }
        return null;
    }

    // ── Seed-based random for variation ────────────────────────────────────────
    function seededShuffle(arr, seed) {
        const a = [...arr];
        let s = seed;
        for (let i = a.length - 1; i > 0; i--) {
            s = (s * 9301 + 49297) % 233280;
            const j = Math.floor((s / 233280) * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ── Description Generator ──────────────────────────────────────────────────
    const DESCS = {
        sporty: [
            'Engineered for apex performance with race-tuned aerodynamics.',
            'Track-inspired design for maximum speed and grip.',
            'Built to dominate every straight and corner.',
            'Aggressive stance meets precision engineering.',
            'Pure adrenaline wrapped in sheet metal.',
        ],
        luxury: [
            'Handcrafted elegance meets cutting-edge technology.',
            'The pinnacle of automotive prestige and exclusivity.',
            'Every detail perfected for the discerning driver.',
            'Unmatched refinement in a world-class package.',
            'Where opulence meets performance.',
        ],
        stealth: [
            'Invisible on the street, unforgettable on the road.',
            'Darkness engineered to perfection.',
            'No chrome. No noise. Just presence.',
            'The art of disappearing in plain sight.',
            'Minimalist design with maximum impact.',
        ],
        neon: [
            'Light up the night with this electrifying build.',
            'Cyberpunk aesthetics for the streets of tomorrow.',
            'Where RGB culture meets road culture.',
            'Vivid, wild, and utterly unforgettable.',
            'A rolling light show that commands attention.',
        ],
        offroad: [
            'No road? No problem. Built for the untamed.',
            'Conquer any terrain with this beast of a build.',
            'Mountain-tested, street-approved.',
            'Peak off-road performance in rugged form.',
            'From canyon to highway, this one does it all.',
        ],
        generic: [
            'A perfectly balanced build for every occasion.',
            'Timeless style meets modern performance.',
            'Versatile configuration ready for any driver.',
            'Classic appeal with a contemporary edge.',
            'A clean, confident statement on the road.',
        ],
    };

    // ── Main Generator ─────────────────────────────────────────────────────────
    function generate(userInput) {
        const detectedTheme = detectTheme(userInput);
        const extractedColor = extractColor(userInput);
        const seed = userInput.split('').reduce((s, c) => s + c.charCodeAt(0), Date.now() % 1000);
        const count = 5;

        let pool;
        let descPool;

        if (detectedTheme) {
            pool = seededShuffle(THEMES[detectedTheme].configs, seed);
            descPool = DESCS[detectedTheme];
        } else {
            pool = seededShuffle(GENERIC_CONFIGS, seed);
            descPool = DESCS.generic;
        }

        // Optionally override first suggestion color with extracted keyword color
        const results = pool.slice(0, count).map((cfg, i) => {
            const color = (i === 0 && extractedColor) ? extractedColor : cfg.color;
            return {
                ...cfg,
                color,
                description: descPool[i % descPool.length],
            };
        });

        return { suggestions: results, theme: detectedTheme || 'custom', input: userInput };
    }

    return { generate };
})();
