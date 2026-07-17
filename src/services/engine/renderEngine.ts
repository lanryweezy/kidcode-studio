import { EngineEntity, EngineTile, GameState } from './types';
import { SCENES } from '../../constants/actions';

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  scene: string,
  width: number,
  height: number
): void {
  const sceneColors: Record<string, string> = {
    [SCENES.SPACE]: '#0a0a1a',
    [SCENES.FOREST]: '#1a2e1a',
    [SCENES.GRID]: '#1a1a2e',
  };
  ctx.fillStyle = sceneColors[scene || SCENES.GRID] || '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  if (scene === SCENES.SPACE) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5) % width;
      const y = (i * 97.3) % height;
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (scene === 'forest') {
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < 8; i++) {
      const x = (i * 120 + 30) % width;
      ctx.fillText('🌲', x, height - 20);
    }
  }
}

export function renderTiles(
  ctx: CanvasRenderingContext2D,
  tiles: EngineTile[],
  tileSize: number
): void {
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  tiles.forEach(tile => {
    ctx.fillText(tile.emoji, tile.x + tileSize / 2, tile.y + tileSize / 2);
  });
}

export function renderItems(ctx: CanvasRenderingContext2D, items: EngineEntity[]): void {
  items.forEach(item => {
    if (!item.alive) return;
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, item.x + item.width / 2, item.y + item.height / 2);
  });
}

export function renderEnemies(ctx: CanvasRenderingContext2D, enemies: EngineEntity[]): void {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;
    const isBoss = enemy.data?.isBoss;
    ctx.font = `${isBoss ? 48 : 28}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(enemy.emoji, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

    const barWidth = isBoss ? 80 : 36;
    const barHeight = isBoss ? 6 : 3;
    const barY = isBoss ? enemy.y - 15 : enemy.y - 8;
    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(enemy.x + enemy.width / 2 - barWidth / 2, barY, barWidth, barHeight);
    ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(enemy.x + enemy.width / 2 - barWidth / 2, barY, barWidth * hpPercent, barHeight);
  });
}

export function renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: EngineEntity[]): void {
  projectiles.forEach(proj => {
    if (!proj.alive) return;
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(proj.emoji, proj.x + proj.width / 2, proj.y + proj.height / 2);
  });
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: EngineEntity[]): void {
  particles.forEach(p => {
    ctx.globalAlpha = p.hp;
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.emoji, p.x, p.y);
    ctx.globalAlpha = 1;
  });
}

export function renderPlayer(ctx: CanvasRenderingContext2D, player: EngineEntity): void {
  if (!player.alive) return;
  ctx.font = '32px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    player.emoji,
    player.x + player.width / 2,
    player.y + player.height / 2
  );

  if (player.data?.speech) {
    const speech = player.data.speech as string;
    const px = player.x + player.width / 2;
    const py = player.y - 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(px - 60, py - 30, 120, 30, 10);
    ctx.fill();

    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(speech.slice(0, 20), px, py - 15);
  }
}

export function renderFloatingTexts(
  ctx: CanvasRenderingContext2D,
  floatingTexts: GameState['floatingTexts']
): void {
  if (!floatingTexts) return;
  floatingTexts.forEach(ft => {
    const alpha = Math.max(0, ft.life / 1.2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.globalAlpha = 1;
  });
}

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number
): void {
  const hpPercent = Math.max(0, state.health / state.maxHealth);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 200, 20);
  ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(12, 12, 196 * hpPercent, 16);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`❤️ ${Math.round(state.health)}/${state.maxHealth}`, 16, 23);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`⭐ ${state.score}`, 10, 50);

  ctx.fillStyle = '#a78bfa';
  ctx.fillText(`🌊 Wave ${state.wave}`, 10, 75);

  if (state.combo > 1) {
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`x${state.combo} COMBO`, canvasWidth / 2, 40);
  }

  const boss = state.enemies.find(e => e.data?.isBoss);
  if (boss) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(canvasWidth / 2 - 100, canvasHeight - 40, 200, 20);
    const bossHp = boss.hp / boss.maxHp;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(canvasWidth / 2 - 98, canvasHeight - 38, 196 * bossHp, 16);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`🐲 BOSS ${Math.round(boss.hp)}/${boss.maxHp}`, canvasWidth / 2, canvasHeight - 27);
  }
}

export function renderWeather(
  ctx: CanvasRenderingContext2D,
  weather: string,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (weather === 'rain') {
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 10);
      ctx.stroke();
    }
  } else if (weather === 'snow') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (weather === 'storm') {
    if (Math.random() < 0.02) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + 15);
      ctx.stroke();
    }
  } else if (weather === 'fog') {
    ctx.fillStyle = 'rgba(200, 200, 200, 0.15)';
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, 60 + Math.random() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (weather === 'ash') {
    ctx.fillStyle = 'rgba(120, 113, 108, 0.5)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (weather === 'fireflies') {
    const glow = (Math.sin(Date.now() * 0.005) + 1) / 2;
    ctx.fillStyle = `rgba(250, 204, 21, ${glow * 0.8})`;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  } else if (weather === 'wind') {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 30, y);
      ctx.stroke();
    }
  }
}

export function renderDayNight(
  ctx: CanvasRenderingContext2D,
  dayTime: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  const hour = dayTime;
  let alpha = 0;
  if (hour < 6 || hour > 20) alpha = 0.4;
  else if (hour < 8 || hour > 18) alpha = 0.2;
  else alpha = 0;

  if (alpha > 0) {
    ctx.fillStyle = `rgba(0, 0, 30, ${alpha})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

export function renderEndScreen(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (state.victory) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px system-ui';
    ctx.fillText('🏆 VICTORY!', canvasWidth / 2, canvasHeight / 2 - 40);
    ctx.fillStyle = '#fff';
    ctx.font = '24px system-ui';
    ctx.fillText(`Score: ${state.score}`, canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.fillText(`Wave: ${state.wave}`, canvasWidth / 2, canvasHeight / 2 + 50);
    ctx.font = '16px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Press R to restart', canvasWidth / 2, canvasHeight / 2 + 90);
  } else {
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 48px system-ui';
    ctx.fillText('💀 GAME OVER', canvasWidth / 2, canvasHeight / 2 - 40);
    ctx.fillStyle = '#fff';
    ctx.font = '24px system-ui';
    ctx.fillText(`Final Score: ${state.score}`, canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.fillText(`Reached Wave: ${state.wave}`, canvasWidth / 2, canvasHeight / 2 + 50);
    ctx.font = '16px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Press R to restart', canvasWidth / 2, canvasHeight / 2 + 90);
  }
}

export function renderEnvironmentalHazards(
  ctx: CanvasRenderingContext2D,
  hazards: { x: number; y: number; width: number; height: number; type: string; damage: number; active: boolean }[]
): void {
  for (const hazard of hazards) {
    if (!hazard.active) continue;
    ctx.font = `${Math.min(hazard.width, hazard.height)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
    ctx.fillText(hazard.type, hazard.x + hazard.width / 2, hazard.y + hazard.height / 2);
    ctx.globalAlpha = 1;
  }
}
