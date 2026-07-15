import { EngineEntity } from './types';

export function boxCollision(a: EngineEntity, b: EngineEntity): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

export function updateEnemyBehavior(
  enemy: EngineEntity,
  player: EngineEntity,
  dt: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  switch (enemy.behavior) {
    case 'patrol':
      enemy.x += enemy.vx;
      if (Math.abs(enemy.x - (enemy.data?.initialX as number || 0)) > (enemy.data?.range as number || 100)) {
        enemy.vx *= -1;
      }
      break;
    case 'chase': {
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        enemy.x += (dx / dist) * enemy.speed * 60 * dt;
        enemy.y += (dy / dist) * enemy.speed * 60 * dt;
      }
      break;
    }
    case 'float_h':
      enemy.x += Math.sin(Date.now() * 0.003) * enemy.speed;
      break;
    case 'float_v':
      enemy.y += Math.sin(Date.now() * 0.003) * enemy.speed;
      break;
    case 'shoot': {
      const sdx = player.x - enemy.x;
      const sdy = player.y - enemy.y;
      const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sdist < 300) {
        enemy.x += (sdx / sdist) * enemy.speed * 30 * dt;
        enemy.y += (sdy / sdist) * enemy.speed * 30 * dt;
      }
      break;
    }
  }

  enemy.x = Math.max(0, Math.min(canvasWidth - enemy.width, enemy.x));
  enemy.y = Math.max(0, Math.min(canvasHeight - enemy.height, enemy.y));
}

export function updateEnemyBoundary(enemy: EngineEntity, canvasWidth: number, canvasHeight: number): void {
  enemy.x = Math.max(0, Math.min(canvasWidth - enemy.width, enemy.x));
  enemy.y = Math.max(0, Math.min(canvasHeight - enemy.height, enemy.y));
}
