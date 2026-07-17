import confetti from 'canvas-confetti';

const TILE = 40;

const ROUNDED_TILE_TYPES = new Set([
    'brick', 'crate', 'stone', 'dirt', 'sand', 'water', 'lava',
    'platform_wood', 'platform_stone', 'platform_metal',
    'wall_metal', 'barrel', 'barricade', 'sandbag',
    'race_road', 'race_sand', 'race_water',
    'arena_floor', 'stone_floor', 'metal_floor', 'ice_floor',
    'field_grass', 'court_wood', 'pitch_grass',
    'track', 'lane', 'path', 'bridge', 'carpet',
]);

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function addTileDepth(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const innerGrad = ctx.createLinearGradient(0, 0, 0, h);
    innerGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    innerGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    innerGrad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = innerGrad;
    roundRect(ctx, 2, 2, w - 4, h - 4, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(3, 2, w - 6, 2);
}

export function drawTile(ctx: CanvasRenderingContext2D, tile: any, time: number) {
    const x = tile.x * TILE;
    const y = tile.y * TILE;
    ctx.save();
    ctx.translate(x, y);

    const t = tile.type;

    if (t === 'brick') {
        const grad = ctx.createLinearGradient(0, 0, 0, TILE);
        grad.addColorStop(0, '#a0522d');
        grad.addColorStop(1, '#6b3410');
        ctx.fillStyle = grad;
        roundRect(ctx, 0, 0, TILE, TILE, 3);
        ctx.fill();
        ctx.fillStyle = '#cd853f';
        ctx.fillRect(2, 2, 17, 16);
        ctx.fillRect(21, 2, 17, 16);
        ctx.fillRect(2, 20, 8, 18);
        ctx.fillRect(12, 20, 17, 18);
        ctx.fillRect(31, 20, 7, 18);
        addTileDepth(ctx, TILE, TILE);
    } else if (t === 'grass') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 10, TILE, 30);
        const wave1 = Math.sin(time * 0.003 + x * 0.1) * 3;
        const wave2 = Math.sin(time * 0.004 + x * 0.15) * 2;
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.quadraticCurveTo(5, 8 + wave1, 10, 10);
        ctx.quadraticCurveTo(15, 6 + wave2, 20, 8);
        ctx.quadraticCurveTo(25, 11 + wave1, 30, 9);
        ctx.quadraticCurveTo(35, 7 + wave2, 40, 10);
        ctx.lineTo(40, 20);
        ctx.lineTo(0, 20);
        ctx.fill();
        ctx.fillStyle = '#4ade80';
        for (let i = 0; i < 3; i++) {
            const bx = 8 + i * 12;
            const bwave = Math.sin(time * 0.005 + i) * 2;
            ctx.beginPath();
            ctx.moveTo(bx, 10);
            ctx.quadraticCurveTo(bx + 2, 3 + bwave, bx + 4, 10);
            ctx.fill();
        }
        addTileDepth(ctx, TILE, TILE);
    } else if (t === 'lava') {
        const p1 = Math.sin(time * 0.003) * 3;
        const p2 = Math.sin(time * 0.005 + 1) * 2;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, 8 + p1);
        ctx.quadraticCurveTo(TILE / 4, 4 + p2, TILE / 2, 8 + p1);
        ctx.quadraticCurveTo(TILE * 3 / 4, 12 - p2, TILE, 8 + p1);
        ctx.lineTo(TILE, TILE);
        ctx.lineTo(0, TILE);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(0, 14 + p2);
        ctx.quadraticCurveTo(TILE / 3, 10 + p1, TILE * 2 / 3, 14 + p2);
        ctx.quadraticCurveTo(TILE * 5 / 6, 18 - p1, TILE, 14 + p2);
        ctx.lineTo(TILE, TILE);
        ctx.lineTo(0, TILE);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
            const bx = (i * 15 + (time * 0.02)) % TILE;
            const by = 5 + Math.sin(time * 0.008 + i * 2) * 4;
            ctx.fillStyle = `rgba(255,200,0,${0.4 + Math.sin(time * 0.01 + i) * 0.3})`;
            ctx.beginPath();
            ctx.arc(bx, by, 2 + Math.sin(time * 0.01 + i) * 1, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (t === 'spike' || t === 'spike_up') {
        const pulse = Math.abs(Math.sin(time * 0.01)) * 3;
        const grad = ctx.createLinearGradient(20, 10 - pulse, 20, 40);
        grad.addColorStop(0, '#e2e8f0');
        grad.addColorStop(0.3, '#94a3b8');
        grad.addColorStop(1, '#475569');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(2, 40);
        ctx.lineTo(20, 8 - pulse);
        ctx.lineTo(38, 40);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(10, 38);
        ctx.lineTo(18, 12 - pulse);
        ctx.lineTo(22, 12 - pulse);
        ctx.lineTo(14, 38);
        ctx.fill();
    } else if (t === 'spike_down') {
        const pulse = Math.abs(Math.sin(time * 0.01)) * 3;
        const grad = ctx.createLinearGradient(20, 0, 20, 32 + pulse);
        grad.addColorStop(0, '#475569');
        grad.addColorStop(0.7, '#94a3b8');
        grad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(20, 32 + pulse);
        ctx.lineTo(38, 0);
        ctx.closePath();
        ctx.fill();
    } else if (t === 'coin') {
        const spin = Math.abs(Math.sin(time * 0.004));
        const bob = Math.sin(time * 0.003) * 3;
        const glow = 0.3 + Math.sin(time * 0.005) * 0.15;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8 + Math.sin(time * 0.005) * 4;
        const grad = ctx.createRadialGradient(20, 20 + bob, 2, 20, 20 + bob, 12);
        grad.addColorStop(0, '#fef3c7');
        grad.addColorStop(0.4, '#fbbf24');
        grad.addColorStop(1, '#b45309');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(20, 20 + bob, 10 * spin, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (spin > 0.3) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.ellipse(20, 20 + bob, 5 * spin, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (t === 'flag') {
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(4, 0, 4, TILE);
        const flagGrad = ctx.createLinearGradient(8, 0, TILE, 0);
        flagGrad.addColorStop(0, '#dc2626');
        flagGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = flagGrad;
        ctx.beginPath();
        ctx.moveTo(8, 2);
        for (let i = 0; i <= 5; i++) {
            const fx = 8 + i * 6;
            const fy = 2 + Math.sin(time * 0.008 + i * 0.8) * 3;
            if (i === 0) ctx.moveTo(fx, fy);
            else ctx.lineTo(fx, fy);
        }
        ctx.lineTo(38, 18);
        for (let i = 5; i >= 0; i--) {
            const fx = 8 + i * 6;
            const fy = 18 + Math.sin(time * 0.008 + i * 0.8 + 1) * 3;
            ctx.lineTo(fx, fy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(22, 10, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (t === 'spring') {
        ctx.fillStyle = '#64748b';
        roundRect(ctx, 4, 32, 32, 8, 2);
        ctx.fill();
        const compression = Math.sin(time * 0.02) * 4;
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const sy = 30 - i * 6 + compression;
            ctx.moveTo(10, sy);
            ctx.lineTo(30, sy);
        }
        ctx.stroke();
        ctx.fillStyle = '#f472b6';
        roundRect(ctx, 8, 4 + compression, 24, 6, 3);
        ctx.fill();
    } else if (t === 'water') {
        const p = Math.sin(time * 0.003) * 2;
        ctx.fillStyle = 'rgba(56,189,248,0.5)';
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.fillStyle = 'rgba(125,211,252,0.6)';
        ctx.beginPath();
        ctx.moveTo(0, 8 + p);
        ctx.quadraticCurveTo(TILE / 4, 4 - p, TILE / 2, 8 + p);
        ctx.quadraticCurveTo(TILE * 3 / 4, 12 + p, TILE, 8 + p);
        ctx.lineTo(TILE, TILE);
        ctx.lineTo(0, TILE);
        ctx.fill();
    } else if (t === 'crate') {
        const grad = ctx.createLinearGradient(0, 0, 0, TILE);
        grad.addColorStop(0, '#a16207');
        grad.addColorStop(1, '#78350f');
        ctx.fillStyle = grad;
        roundRect(ctx, 0, 0, TILE, TILE, 4);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, TILE / 2);
        ctx.lineTo(TILE, TILE / 2);
        ctx.moveTo(TILE / 2, 0);
        ctx.lineTo(TILE / 2, TILE);
        ctx.stroke();
        addTileDepth(ctx, TILE, TILE);
    } else if (t === 'stone' || t === 'stone_floor') {
        const grad = ctx.createLinearGradient(0, 0, 0, TILE);
        grad.addColorStop(0, '#6b7280');
        grad.addColorStop(1, '#4b5563');
        ctx.fillStyle = grad;
        roundRect(ctx, 0, 0, TILE, TILE, 4);
        ctx.fill();
        addTileDepth(ctx, TILE, TILE);
    } else if (t === 'dirt') {
        const grad = ctx.createLinearGradient(0, 0, 0, TILE);
        grad.addColorStop(0, '#92400e');
        grad.addColorStop(1, '#78350f');
        ctx.fillStyle = grad;
        roundRect(ctx, 0, 0, TILE, TILE, 4);
        ctx.fill();
        addTileDepth(ctx, TILE, TILE);
    } else if (t === 'key') {
        const bob = Math.sin(time * 0.005) * 3;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔑', 20, 20 + bob);
        ctx.shadowBlur = 0;
    } else if (t === 'door') {
        ctx.fillStyle = '#78350f';
        roundRect(ctx, 4, 0, 32, 40, 4);
        ctx.fill();
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(30, 22, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (t === 'door_locked') {
        ctx.fillStyle = '#64748b';
        roundRect(ctx, 4, 0, 32, 40, 4);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(20, 20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(18, 20, 4, 8);
    } else if (t === 'chest') {
        const grad = ctx.createLinearGradient(0, 0, 0, TILE);
        grad.addColorStop(0, '#ca8a04');
        grad.addColorStop(1, '#92400e');
        ctx.fillStyle = grad;
        roundRect(ctx, 2, 10, 36, 28, 6);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(2, 16, 36, 4);
        ctx.beginPath();
        ctx.arc(20, 20, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (ROUNDED_TILE_TYPES.has(t)) {
        const baseColor = getTileColor(t);
        const grad = ctx.createLinearGradient(0, 0, 0, TILE);
        grad.addColorStop(0, lighten(baseColor, 20));
        grad.addColorStop(1, baseColor);
        ctx.fillStyle = grad;
        roundRect(ctx, 0, 0, TILE, TILE, 4);
        ctx.fill();
        addTileDepth(ctx, TILE, TILE);
    } else {
        ctx.fillStyle = '#64748b';
        roundRect(ctx, 0, 0, TILE, TILE, 4);
        ctx.fill();
        addTileDepth(ctx, TILE, TILE);
    }

    ctx.restore();
}

function getTileColor(type: string): string {
    const map: Record<string, string> = {
        sand: '#d4a574',
        ice_floor: '#bfdbfe',
        metal_floor: '#94a3b8',
        arena_floor: '#a78bfa',
        field_grass: '#22c55e',
        court_wood: '#b45309',
        pitch_grass: '#16a34a',
        race_road: '#475569',
        race_sand: '#d4a574',
        race_water: '#38bdf8',
        path: '#a8a29e',
        bridge: '#92400e',
        platform_wood: '#a16207',
        platform_stone: '#6b7280',
        platform_metal: '#94a3b8',
        platform_cloud: '#f1f5f9',
        platform_ice: '#bfdbfe',
        wall_metal: '#64748b',
        barrel: '#78350f',
        barricade: '#92400e',
        sandbag: '#d4a574',
        carpet: '#9333ea',
    };
    return map[type] || '#64748b';
}

function lighten(hex: string, pct: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + pct);
    const g = Math.min(255, ((num >> 8) & 0xff) + pct);
    const b = Math.min(255, (num & 0xff) + pct);
    return `rgb(${r},${g},${b})`;
}

export function drawPlayer(
    ctx: CanvasRenderingContext2D,
    current: any,
    textureImg: HTMLImageElement | null,
    time: number,
    trailHistory: { x: number; y: number }[],
    squash: number,
    isIdle: boolean
) {
    const speed = Math.sqrt((current.vx || 0) ** 2 + (current.vy || 0) ** 2);

    for (let i = 0; i < trailHistory.length; i++) {
        const t = trailHistory[i];
        const alpha = (i / trailHistory.length) * 0.3;
        const size = (i / trailHistory.length) * 16;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.ellipse(t.x, t.y + 16, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(current.x, current.y + 18, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(current.x, current.y);

    const sx = squash > 0 ? 1 + squash * 0.15 : 1;
    const sy = squash > 0 ? 1 - squash * 0.1 : 1;
    ctx.scale(sx, sy);

    const rotTarget = (current.rotation || 0) * Math.PI / 180;
    const rotSmooth = rotTarget;
    ctx.rotate(rotSmooth);

    if (textureImg && textureImg.complete && textureImg.naturalWidth > 0) {
        ctx.drawImage(textureImg, -20, -20, 40, 40);
    } else {
        const breathe = isIdle ? Math.sin(time * 0.003) * 0.03 : 0;
        ctx.scale(1 + breathe, 1 - breathe * 0.5);
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(current.emoji || '🧑', 0, 0);
    }

    if (current.powerups?.shield) {
        ctx.strokeStyle = `rgba(59,130,246,${0.4 + Math.sin(time * 0.005) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

export function drawHUD(
    ctx: CanvasRenderingContext2D,
    state: any,
    width: number,
    height: number,
    fps: number,
    time: number,
    startTime: number
) {
    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, 12, 12, 160, 44, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, 12, 12, 160, 44, 12);
    ctx.stroke();

    const scoreText = `⭐ ${state.score || 0}`;
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(scoreText, 22, 34);

    const coinText = `🪙 ${state.keys || 0}`;
    ctx.fillStyle = '#22c55e';
    ctx.fillText(coinText, 90, 34);

    const maxHp = state.maxHealth || 5;
    const hp = state.health ?? maxHp;
    const barW = 120;
    const barH = 10;
    const barX = width - barW - 16;
    const barY = 16;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, barX - 6, barY - 6, barW + 12, barH + 12, 8);
    ctx.fill();

    ctx.fillStyle = '#374151';
    roundRect(ctx, barX, barY, barW, barH, 5);
    ctx.fill();

    const hpPct = Math.max(0, hp / maxHp);
    const hpColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    if (hpPct > 0) {
        ctx.fillStyle = hpColor;
        roundRect(ctx, barX, barY, barW * hpPct, barH, 5);
        ctx.fill();
        const hpGrad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
        hpGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
        hpGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hpGrad;
        roundRect(ctx, barX, barY, barW * hpPct, barH, 5);
        ctx.fill();
    }

    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`♥ ${hp}/${maxHp}`, barX + barW / 2, barY + barH / 2 + 1);

    const heartsY = barY + barH + 8;
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    const lives = state.variables?._lives ?? 3;
    let heartsStr = '';
    for (let i = 0; i < lives; i++) heartsStr += '❤️';
    ctx.fillText(heartsStr, width - 16, heartsY + 12);

    if (startTime > 0) {
        const elapsed = Math.floor((time - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timerText = `${mins}:${secs.toString().padStart(2, '0')}`;
        ctx.font = 'bold 16px "Segoe UI", monospace';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const tw = ctx.measureText(timerText).width;
        roundRect(ctx, width / 2 - tw / 2 - 10, 10, tw + 20, 28, 10);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(timerText, width / 2, 28);
    }

    const levelName = state.scene || state.variables?._levelName || '';
    if (levelName) {
        ctx.font = '12px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'left';
        ctx.fillText(levelName, 16, height - 12);
    }

    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'right';
    ctx.fillText(`${fps} FPS`, width - 8, height - 8);

    ctx.restore();
}

export function drawMinimap(
    ctx: CanvasRenderingContext2D,
    tilemap: any[],
    enemies: any[],
    items: any[],
    playerX: number,
    playerY: number,
    canvasWidth: number,
    canvasHeight: number,
    time: number
) {
    if (!tilemap || tilemap.length === 0) return;

    const mmW = 140;
    const mmH = 90;
    const mmX = canvasWidth - mmW - 12;
    const mmY = 56;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of tilemap) {
        minX = Math.min(minX, t.x);
        maxX = Math.max(maxX, t.x);
        minY = Math.min(minY, t.y);
        maxY = Math.max(maxY, t.y);
    }
    const worldW = (maxX - minX + 1) * TILE;
    const worldH = (maxY - minY + 1) * TILE;
    const scale = Math.min((mmW - 8) / worldW, (mmH - 8) / worldH);

    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, mmX - 2, mmY - 2, mmW + 4, mmH + 4, 6);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    roundRect(ctx, mmX, mmY, mmW, mmH, 4);
    ctx.clip();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mmX, mmY, mmW, mmH);

    for (const t of tilemap) {
        const tx = mmX + 4 + (t.x - minX) * TILE * scale;
        const ty = mmY + 4 + (t.y - minY) * TILE * scale;
        const ts = Math.max(1.5, TILE * scale);
        ctx.fillStyle = getMinimapTileColor(t.type);
        ctx.fillRect(tx, ty, ts, ts);
    }

    ctx.fillStyle = '#fbbf24';
    for (const item of items) {
        const ix = mmX + 4 + ((item.x / TILE) - minX) * TILE * scale;
        const iy = mmY + 4 + ((item.y / TILE) - minY) * TILE * scale;
        ctx.beginPath();
        ctx.arc(ix, iy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#ef4444';
    for (const e of enemies) {
        const ex = mmX + 4 + ((e.x / TILE) - minX) * TILE * scale;
        const ey = mmY + 4 + ((e.y / TILE) - minY) * TILE * scale;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    const px = mmX + 4 + ((playerX / TILE) - minX) * TILE * scale;
    const py = mmY + 4 + ((playerY / TILE) - minY) * TILE * scale;
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(px, py, 2.5 + Math.sin(time * 0.005) * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
}

function getMinimapTileColor(type: string): string {
    const map: Record<string, string> = {
        brick: '#92400e',
        grass: '#16a34a',
        lava: '#dc2626',
        spike: '#64748b',
        coin: '#eab308',
        flag: '#ef4444',
        water: '#0ea5e9',
        stone: '#6b7280',
        dirt: '#78350f',
        crate: '#a16207',
        sand: '#d4a574',
        path: '#a8a29e',
        bridge: '#92400e',
        platform_wood: '#a16207',
        platform_stone: '#6b7280',
        platform_metal: '#94a3b8',
        wall_metal: '#64748b',
    };
    return map[type] || '#475569';
}

export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

export function drawDamageFlash(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
    if (alpha <= 0) return;
    ctx.fillStyle = `rgba(220,38,38,${alpha * 0.3})`;
    ctx.fillRect(0, 0, w, h);
}

export function drawDustParticles(
    ctx: CanvasRenderingContext2D,
    particles: { x: number; y: number; vx: number; vy: number; life: number; size: number }[]
) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.02;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.6;
        ctx.fillStyle = '#d4d4d8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

export function drawSpeedLines(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    speed: number,
    time: number
) {
    if (speed < 3) return;
    const intensity = Math.min((speed - 3) / 5, 1);
    ctx.save();
    ctx.globalAlpha = intensity * 0.3;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const y = (h * 0.15) + (i * h * 0.1);
        const offset = (time * 0.1 + i * 50) % w;
        ctx.beginPath();
        ctx.moveTo(w - offset, y);
        ctx.lineTo(w - offset - 30 - speed * 5, y);
        ctx.stroke();
    }
    ctx.restore();
}

export function drawDeathOverlay(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    deathTimer: number
) {
    if (deathTimer <= 0) return;
    const alpha = Math.min(deathTimer / 30, 1);
    ctx.save();
    ctx.fillStyle = `rgba(220,38,38,${alpha * 0.4})`;
    ctx.fillRect(0, 0, w, h);
    if (deathTimer > 20) {
        ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Try Again!', w / 2, h / 2);
    }
    ctx.restore();
}

export function drawLevelComplete(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    completeTimer: number,
    coins: number,
    timeTaken: number,
    stars: number
) {
    if (completeTimer <= 0) return;
    const progress = Math.min(completeTimer / 60, 1);
    const scale = 0.5 + progress * 0.5;
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${progress * 0.5})`;
    ctx.fillRect(0, 0, w, h);

    ctx.translate(w / 2, h / 2 - 40);
    ctx.scale(scale, scale);
    ctx.globalAlpha = progress;

    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 Level Complete! 🎉', 0, 0);

    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#fff';
    const secs = Math.floor(timeTaken / 1000);
    ctx.fillText(`Time: ${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}  🪙 Coins: ${coins}`, 0, 40);

    ctx.font = '28px Arial';
    let starStr = '';
    for (let i = 0; i < 3; i++) starStr += i < stars ? '⭐' : '☆';
    ctx.fillText(starStr, 0, 75);

    ctx.restore();
}

export function fireConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#fbbf24', '#22c55e', '#3b82f6', '#ef4444', '#a855f7']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#fbbf24', '#22c55e', '#3b82f6', '#ef4444', '#a855f7']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
}

export function createLandingDust(x: number, y: number, particles: any[]) {
    for (let i = 0; i < 6; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y + 16,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 1.5 - 0.5,
            life: 1,
            size: 2 + Math.random() * 3
        });
    }
}

export function createCoinCollectParticles(x: number, y: number, particles: any[]) {
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * (2 + Math.random()),
            vy: Math.sin(angle) * (2 + Math.random()),
            life: 1,
            size: 2 + Math.random() * 2,
            color: ['#fbbf24', '#f59e0b', '#fcd34d'][Math.floor(Math.random() * 3)]
        });
    }
}
