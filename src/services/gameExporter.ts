/**
 * Game Exporter - Improvements #93-100
 * Standalone HTML5, itch.io, mobile, embed code, analytics,
 * shareable URL, multi-engine export
 */

import JSZip from 'jszip';

// ─── Standalone HTML5 Export (#93) ───

export interface GameData {
  tiles?: Array<{ x: number; y: number; type: string }>;
  enemies?: Array<{ x: number; y: number; emoji?: string; vx?: number; initialX?: number; range?: number }>;
  player?: { emoji?: string; x?: number; y?: number };
  settings?: { name?: string; [key: string]: unknown };
}

export function generateStandaloneHTML5(gameData: GameData): string {
  const { tiles, enemies, player, settings } = gameData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${settings?.name || 'KidCode Game'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; font-family: system-ui; }
  canvas { border: 2px solid #334155; border-radius: 8px; image-rendering: pixelated; }
  #ui { position: absolute; top: 10px; left: 10px; color: white; font-size: 14px; }
  #controls { position: absolute; bottom: 20px; color: #94a3b8; font-size: 12px; text-align: center; }
  .btn { position: absolute; width: 50px; height: 50px; border-radius: 50%; border: none; font-size: 20px; cursor: pointer; opacity: 0.7; }
  .btn:active { opacity: 1; transform: scale(0.9); }
</style>
</head>
<body>
<canvas id="game" width="800" height="600"></canvas>
<div id="ui">
  <div id="hp">❤️ 100/100</div>
  <div id="score">⭐ 0</div>
  <div id="coins">🪙 0</div>
</div>
<div id="controls">Arrow Keys / WASD to move • Space to jump • X to attack</div>
<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const TILE = 40;
const tiles = ${JSON.stringify(tiles || [])};
const enemies = ${JSON.stringify(enemies || [])};

const player = { x: 80, y: 300, vx: 0, vy: 0, hp: 100, maxHp: 100, score: 0, coins: 0, onGround: false, facing: 1, emoji: '${player?.emoji || '🧙'}' };
const keys = {};
const GRAVITY = 0.6;
const JUMP = 13;
const SPEED = 4;

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

function update() {
  if (keys['ArrowLeft'] || keys['KeyA']) { player.vx = -SPEED; player.facing = -1; }
  else if (keys['ArrowRight'] || keys['KeyD']) { player.vx = SPEED; player.facing = 1; }
  else { player.vx *= 0.8; }

  if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.onGround) {
    player.vy = -JUMP;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  if (player.vy > 15) player.vy = 15;

  let nextX = player.x + player.vx;
  let nextY = player.y + player.vy;
  player.onGround = false;

  for (const tile of tiles) {
    const tx = tile.x * TILE, ty = tile.y * TILE;
    if (nextX + 30 > tx && nextX < tx + TILE && player.y + 30 > ty && player.y < ty + TILE) {
      if (['brick','grass','dirt','stone','crate'].includes(tile.type)) { nextX = player.x; player.vx = 0; }
    }
    if (player.x + 30 > tx && player.x < tx + TILE && nextY + 30 > ty && nextY < ty + TILE) {
      if (['brick','grass','dirt','stone','crate'].includes(tile.type)) {
        if (player.vy > 0) { nextY = ty - 30; player.onGround = true; }
        else { nextY = ty + TILE; }
        player.vy = 0;
      }
      if (tile.type === 'spike' || tile.type === 'lava') { player.hp -= 1; player.vy = -8; }
      if (tile.type === 'coin') { tile.type = 'removed'; player.coins++; player.score += 10; }
      if (tile.type === 'spring') { player.vy = -20; }
    }
  }

  player.x = nextX;
  player.y = nextY;
  if (player.x < 0) player.x = 0;
  if (player.y > 600) { player.hp = 0; player.y = 0; player.x = 80; }
}

function render() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 800, 600);

  for (const tile of tiles) {
    if (tile.type === 'removed') continue;
    const tx = tile.x * TILE, ty = tile.y * TILE;
    const colors = { brick:'#78350f', grass:'#22c55e', dirt:'#92400e', stone:'#64748b', lava:'#ef4444', spike:'#94a3b8', coin:'#fbbf24', water:'#3b82f6', spring:'#ec4899', key:'#f59e0b', crate:'#d97706', flag:'#22c55e' };
    ctx.fillStyle = colors[tile.type] || '#475569';
    ctx.fillRect(tx, ty, TILE - 1, TILE - 1);
    if (tile.type === 'coin') { ctx.font = '20px serif'; ctx.fillText('🪙', tx + 8, ty + 28); }
    if (tile.type === 'key') { ctx.font = '20px serif'; ctx.fillText('🔑', tx + 8, ty + 28); }
    if (tile.type === 'flag') { ctx.font = '20px serif'; ctx.fillText('🚩', tx + 8, ty + 28); }
  }

  ctx.save();
  ctx.translate(player.x + 15, player.y + 15);
  ctx.scale(player.facing, 1);
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(player.emoji, 0, 0);
  ctx.restore();

  for (const enemy of enemies) {
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.emoji || '👾', enemy.x, enemy.y);
    enemy.x += (enemy.vx || 0);
    if (Math.abs(enemy.x - (enemy.initialX || enemy.x)) > (enemy.range || 100)) enemy.vx = -(enemy.vx || 0);
  }

  document.getElementById('hp').textContent = '❤️ ' + player.hp + '/' + player.maxHp;
  document.getElementById('score').textContent = '⭐ ' + player.score;
  document.getElementById('coins').textContent = '🪙 ' + player.coins;
}

function gameLoop() { update(); render(); requestAnimationFrame(gameLoop); }
gameLoop();
</script>
</body>
</html>`;
}

// ─── Level Data Export (#94) ───

export function generateLevelJSON(gameData: GameData): string {
  return JSON.stringify({
    version: '1.0',
    generator: 'KidCode Studio',
    timestamp: Date.now(),
    level: {
      tiles: gameData.tiles || [],
      enemies: gameData.enemies || [],
      player: gameData.player || {},
      settings: gameData.settings || {},
    },
  }, null, 2);
}

// ─── Old functions removed, replaced by enhanced versions below ───

// ─── Game Analytics (#100) ───

export interface GameAnalytics {
  sessionId: string;
  startTime: number;
  deaths: number;
  totalPlayTime: number;
  levelsCompleted: number;
  enemiesDefeated: number;
  itemsCollected: number;
  score: number;
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export class GameAnalyticsTracker {
  private analytics: GameAnalytics;

  constructor() {
    this.analytics = {
      sessionId: `session_${Date.now()}`,
      startTime: Date.now(),
      deaths: 0,
      totalPlayTime: 0,
      levelsCompleted: 0,
      enemiesDefeated: 0,
      itemsCollected: 0,
      score: 0,
      events: [],
    };
  }

  trackDeath(x: number, y: number, cause: string) {
    this.analytics.deaths++;
    this.analytics.events.push({
      type: 'death',
      timestamp: Date.now(),
      data: { x, y, cause },
    });
  }

  trackEnemyDefeated(enemyType: string, x: number, y: number) {
    this.analytics.enemiesDefeated++;
    this.analytics.events.push({
      type: 'enemy_defeated',
      timestamp: Date.now(),
      data: { enemyType, x, y },
    });
  }

  trackLevelComplete(levelId: string, time: number) {
    this.analytics.levelsCompleted++;
    this.analytics.events.push({
      type: 'level_complete',
      timestamp: Date.now(),
      data: { levelId, time },
    });
  }

  trackItemCollected(itemId: string, x: number, y: number) {
    this.analytics.itemsCollected++;
    this.analytics.events.push({
      type: 'item_collected',
      timestamp: Date.now(),
      data: { itemId, x, y },
    });
  }

  getReport(): GameAnalytics {
    this.analytics.totalPlayTime = Date.now() - this.analytics.startTime;
    return { ...this.analytics };
  }

  exportAsJSON(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }
}

// ═══════════════════════════════════════════════════════════
// NEW CYCLE 11 FEATURES
// ═══════════════════════════════════════════════════════════

// ─── itch.io Compatible Export ───

export function generateItchHTML(gameData: GameData): string {
  const { tiles, enemies, player, settings } = gameData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>${settings?.name || 'KidCode Game'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; touch-action: none; }
  canvas { max-width: 100vw; max-height: 100vh; }
  #loading { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-family: system-ui; }
</style>
</head>
<body>
<div id="loading">Loading...</div>
<canvas id="game" width="800" height="600"></canvas>
<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');
loading.style.display = 'none';

const TILE = 40;
const tiles = ${JSON.stringify(tiles || [])};
const enemies = ${JSON.stringify(enemies || [])};

const player = { x: 80, y: 300, vx: 0, vy: 0, hp: 100, maxHp: 100, score: 0, onGround: false, facing: 1, emoji: '${player?.emoji || '🧙'}' };
const keys = {};
const GRAVITY = 0.6;
const JUMP = 13;
const SPEED = 4;

document.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
document.addEventListener('keyup', e => { keys[e.code] = false; });

// Touch controls
let touchStartX = 0;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  if (touch.clientY < canvas.height / 2) {
    keys['Space'] = true;
  }
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  if (Math.abs(dx) > 20) {
    keys[dx > 0 ? 'ArrowRight' : 'ArrowLeft'] = true;
    keys[dx > 0 ? 'ArrowLeft' : 'ArrowRight'] = false;
  }
});
canvas.addEventListener('touchend', e => {
  keys['Space'] = false;
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
});

function update() {
  if (keys['ArrowLeft'] || keys['KeyA']) { player.vx = -SPEED; player.facing = -1; }
  else if (keys['ArrowRight'] || keys['KeyD']) { player.vx = SPEED; player.facing = 1; }
  else { player.vx *= 0.8; }

  if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.onGround) {
    player.vy = -JUMP;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  if (player.vy > 15) player.vy = 15;

  let nextX = player.x + player.vx;
  let nextY = player.y + player.vy;
  player.onGround = false;

  for (const tile of tiles) {
    const tx = tile.x * TILE, ty = tile.y * TILE;
    if (nextX + 30 > tx && nextX < tx + TILE && player.y + 30 > ty && player.y < ty + TILE) {
      if (['brick','grass','dirt','stone','crate'].includes(tile.type)) { nextX = player.x; player.vx = 0; }
    }
    if (player.x + 30 > tx && player.x < tx + TILE && nextY + 30 > ty && nextY < ty + TILE) {
      if (['brick','grass','dirt','stone','crate'].includes(tile.type)) {
        if (player.vy > 0) { nextY = ty - 30; player.onGround = true; }
        else { nextY = ty + TILE; }
        player.vy = 0;
      }
      if (tile.type === 'spike' || tile.type === 'lava') { player.hp -= 1; player.vy = -8; }
      if (tile.type === 'coin') { tile.type = 'removed'; player.score += 10; }
      if (tile.type === 'spring') { player.vy = -20; }
    }
  }

  player.x = nextX;
  player.y = nextY;
  if (player.x < 0) player.x = 0;
  if (player.y > 600) { player.hp = 0; player.y = 0; player.x = 80; }
}

function render() {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 800, 600);

  for (const tile of tiles) {
    if (tile.type === 'removed') continue;
    const tx = tile.x * TILE, ty = tile.y * TILE;
    const colors = { brick:'#78350f', grass:'#22c55e', dirt:'#92400e', stone:'#64748b', lava:'#ef4444', spike:'#94a3b8', coin:'#fbbf24', water:'#3b82f6', spring:'#ec4899', key:'#f59e0b', crate:'#d97706', flag:'#22c55e' };
    ctx.fillStyle = colors[tile.type] || '#475569';
    ctx.fillRect(tx, ty, TILE - 1, TILE - 1);
    if (tile.type === 'coin') { ctx.font = '20px serif'; ctx.fillText('🪙', tx + 8, ty + 28); }
    if (tile.type === 'key') { ctx.font = '20px serif'; ctx.fillText('🔑', tx + 8, ty + 28); }
    if (tile.type === 'flag') { ctx.font = '20px serif'; ctx.fillText('🚩', tx + 8, ty + 28); }
  }

  ctx.save();
  ctx.translate(player.x + 15, player.y + 15);
  ctx.scale(player.facing, 1);
  ctx.font = '30px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(player.emoji, 0, 0);
  ctx.restore();

  for (const enemy of enemies) {
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.emoji || '👾', enemy.x, enemy.y);
    enemy.x += (enemy.vx || 0);
    if (Math.abs(enemy.x - (enemy.initialX || enemy.x)) > (enemy.range || 100)) enemy.vx = -(enemy.vx || 0);
  }

  // UI
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 150, 60);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(15, 15, Math.max(0, (player.hp / player.maxHp) * 140), 8);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('HP: ' + player.hp + '/' + player.maxHp, 15, 35);
  ctx.fillText('Score: ' + player.score, 15, 55);

  if (player.hp <= 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 400, 280);
    ctx.fillStyle = 'white';
    ctx.font = '24px system-ui';
    ctx.fillText('Score: ' + player.score, 400, 320);
    ctx.fillText('Press R to restart', 400, 360);
  }
}

function gameLoop() { update(); render(); requestAnimationFrame(gameLoop); }
gameLoop();

document.addEventListener('keydown', e => {
  if (e.code === 'KeyR' && player.hp <= 0) {
    player.hp = 100; player.score = 0; player.x = 80; player.y = 300;
  }
});
</script>
</body>
</html>`;
}

// ─── JSON Export ───

export function generateGameJSON(gameData: GameData): string {
  return JSON.stringify({
    version: '1.0',
    generator: 'KidCode Studio',
    timestamp: Date.now(),
    game: {
      name: gameData.settings?.name || 'Untitled Game',
      tiles: gameData.tiles || [],
      enemies: gameData.enemies || [],
      player: gameData.player || { emoji: '🧙', x: 80, y: 300 },
      settings: gameData.settings || {},
    },
  }, null, 2);
}

// ─── Embed Code Generator ───

export function generateEmbedCode(gameUrl: string, width: number = 800, height: number = 600): string {
  return `<!-- KidCode Studio Game Embed -->
<iframe 
  src="${gameUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allowfullscreen
  allow="gamepad; microphone"
  style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"
></iframe>
<!-- End KidCode Studio Game Embed -->`;
}

// ─── Project Bundle Export ───

export async function exportProjectBundle(gameData: GameData, projectName: string): Promise<Blob> {
  const zip = new JSZip();

  // HTML5 game
  const html = generateStandaloneHTML5(gameData);
  zip.file('game.html', html);

  // itch.io version
  const itchHtml = generateItchHTML(gameData);
  zip.file('game-itch.html', itchHtml);

  // Level data
  const json = generateGameJSON(gameData);
  zip.file('level.json', json);

  // Metadata
  zip.file('meta.json', JSON.stringify({
    name: projectName,
    created: new Date().toISOString(),
    version: '1.0',
    generator: 'KidCode Studio',
    itchCompatible: true,
  }, null, 2));

  // README
  zip.file('README.md', `# ${projectName}

Created with KidCode Studio.

## How to Play
Open game.html in any modern browser.

## itch.io Upload
1. Go to https://itch.io/game/new
2. Upload game-itch.html as your HTML file
3. Set the viewport to 800x600
4. Enable "Click to launch fullscreen"

## Controls
- Arrow Keys / WASD: Move
- Space: Jump
- X: Attack

## Mobile
Touch controls are included in the itch.io version.`);

  return zip.generateAsync({ type: 'blob' });
}

// ─── Game Thumbnail Generator ───

export function generateGameThumbnail(gameData: GameData): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 400, 300);

  // Draw some tiles
  const tiles = gameData.tiles || [];
  for (let i = 0; i < Math.min(tiles.length, 50); i++) {
    const tile = tiles[i];
    const tx = (tile.x / 25) * 400;
    const ty = (tile.y / 15) * 300;
    const colors: Record<string, string> = {
      brick: '#78350f', grass: '#22c55e', dirt: '#92400e',
      stone: '#64748b', lava: '#ef4444', coin: '#fbbf24',
    };
    ctx.fillStyle = colors[tile.type] || '#475569';
    ctx.fillRect(tx, ty, 16, 16);
  }

  // Draw player
  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.fillText(gameData.player?.emoji || '🧙', 200, 150);

  // Title
  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px system-ui';
  ctx.fillText(gameData.settings?.name || 'My Game', 200, 280);

  return canvas.toDataURL('image/png');
}

// ─── Game Stats Summary ───

export function generateGameStatsSummary(gameData: GameData): string {
  const tiles = gameData.tiles || [];
  const enemies = gameData.enemies || [];

  const stats = {
    totalTiles: tiles.length,
    tilesByType: {} as Record<string, number>,
    totalEnemies: enemies.length,
    enemyTypes: {} as Record<string, number>,
  };

  for (const tile of tiles) {
    stats.tilesByType[tile.type] = (stats.tilesByType[tile.type] || 0) + 1;
  }

  for (const enemy of enemies) {
    const type = enemy.emoji || '👾';
    stats.enemyTypes[type] = (stats.enemyTypes[type] || 0) + 1;
  }

  return JSON.stringify(stats, null, 2);
}
