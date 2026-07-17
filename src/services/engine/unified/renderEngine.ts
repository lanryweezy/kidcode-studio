import { GameContext } from './types';

export function render(context: GameContext) {
  const { width, height } = context.canvas;
  const ctx = context.canvas.getContext('2d')!;
  const cam = context.state;

  ctx.save();
  ctx.translate(-cam.cameraX, -cam.cameraY);

  const bgColors: Record<string, string> = {
    space: '#0a0a1a', forest: '#1a2e1a', grid: '#1a1a2e',
  };
  ctx.fillStyle = bgColors[cam.background] || '#1a1a2e';
  ctx.fillRect(cam.cameraX, cam.cameraY, width, height);

  if (cam.background === 'space') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 100; i++) {
      const x = (i * 137.5 + cam.cameraX * 0.1) % (cam.worldWidth);
      const y = (i * 97.3) % (cam.worldHeight);
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.font = `${context.tileSize * 0.8}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  cam.tiles.forEach(tile => {
    ctx.fillText(tile.emoji, tile.x + context.tileSize / 2, tile.y + context.tileSize / 2);
  });

  ctx.font = '24px serif';
  cam.items.filter(i => !i.collected).forEach(item => {
    const bob = Math.sin(context.frameCount * 0.05 + item.x) * 3;
    ctx.fillText(item.emoji, item.x + 12, item.y + 12 + bob);
  });

  ctx.font = '28px serif';
  cam.npcs.forEach(npc => {
    ctx.fillText(npc.emoji, npc.x + 16, npc.y + 16);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(npc.x - 10, npc.y - 20, npc.name.length * 8 + 10, 16);
    ctx.fillStyle = '#fff';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x + 16, npc.y - 10);
    ctx.font = '28px serif';
  });

  cam.enemies.filter(e => e.alive).forEach(enemy => {
    const bob = Math.sin(context.frameCount * 0.1 + enemy.x) * 2;
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.emoji, enemy.x + 16, enemy.y + 16 + bob);

    if (enemy.hp < enemy.maxHp) {
      const barWidth = 30;
      const hpPercent = enemy.hp / enemy.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x + 1, enemy.y - 8, barWidth, 4);
      ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(enemy.x + 1, enemy.y - 8, barWidth * hpPercent, 4);
    }
  });

  ctx.font = '16px serif';
  cam.projectiles.filter(p => p.alive).forEach(proj => {
    ctx.fillText(proj.emoji, proj.x, proj.y);
  });

  cam.particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.font = '14px serif';
    ctx.fillText(p.emoji, p.x, p.y);
  });
  ctx.globalAlpha = 1;

  if (cam.playerHealth > 0) {
    const scale = cam.playerScale || 1;
    const fontSize = Math.round(32 * scale);
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    const playerBob = Math.sin(context.frameCount * 0.1) * 2;
    ctx.fillText(cam.playerEmoji, cam.playerX + 16 * scale, cam.playerY + 16 * scale + playerBob);

    if (cam.playerInvincible && Math.floor(context.frameCount / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
      ctx.fillText(cam.playerEmoji, cam.playerX + 16 * scale, cam.playerY + 16 * scale + playerBob);
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();

  renderHUD(context, ctx, width, height);
  renderWeather(ctx, cam.weather, width, height);

  if (cam.activeDialogue) {
    renderDialogue(ctx, cam, width, height);
  }
}

function renderHUD(context: GameContext, ctx: CanvasRenderingContext2D, width: number, height: number) {
  const p = context.state;

  const hpPercent = Math.max(0, p.playerHealth / p.playerMaxHealth);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 200, 24);
  ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(12, 12, 196 * hpPercent, 20);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`❤️ ${Math.round(p.playerHealth)}/${p.playerMaxHealth}`, 16, 26);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px system-ui';
  ctx.fillText(`⭐ ${p.score}`, 10, 55);

  ctx.fillStyle = '#a78bfa';
  ctx.fillText(`🌊 Wave ${p.wave}`, 10, 80);

  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`🪙 ${p.coins}`, 10, 105);

  if (p.combo > 1) {
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`x${p.combo} COMBO`, width / 2, 40);
  }

  const boss = p.enemies.find(e => e.hp > 50);
  if (boss) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(width / 2 - 120, height - 50, 240, 24);
    const bossHp = boss.hp / boss.maxHp;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width / 2 - 118, height - 48, 236 * bossHp, 20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`🐲 BOSS ${Math.round(boss.hp)}/${boss.maxHp}`, width / 2, height - 34);
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${Math.floor(p.timePlayed)}s`, width - 10, 20);
}

function renderWeather(ctx: CanvasRenderingContext2D, weather: string, width: number, height: number) {
  if (weather === 'rain') {
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 12);
      ctx.stroke();
    }
  } else if (weather === 'snow') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (weather === 'storm') {
    if (Math.random() < 0.03) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + 15);
      ctx.stroke();
    }
  } else if (weather === 'fog') {
    ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.arc(x, y, 50 + Math.random() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderDialogue(ctx: CanvasRenderingContext2D, state: GameContext['state'], width: number, height: number) {
  const d = state.activeDialogue;
  if (!d) return;

  const boxHeight = 120;
  const boxY = height - boxHeight - 10;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.beginPath();
  ctx.roundRect(20, boxY, width - 40, boxHeight, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#a78bfa';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(d.speaker, 40, boxY + 25);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px system-ui';
  const words = d.text.split(' ');
  let line = '';
  let lineY = boxY + 45;
  words.forEach(word => {
    const testLine = `${line + word  } `;
    if (ctx.measureText(testLine).width > width - 100) {
      ctx.fillText(line, 40, lineY);
      line = `${word  } `;
      lineY += 18;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, 40, lineY);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Press E to continue', width / 2, boxY + boxHeight - 10);
}
