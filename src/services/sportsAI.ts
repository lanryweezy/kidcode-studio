import { GameEntity, SpriteState } from '../types';

export const updateSportsAI = (state: SpriteState, canvasW: number, canvasH: number) => {
  const ball = state.items.find(it => it.emoji === '⚽' || it.emoji === '🏀' || it.emoji === '🎾');
  if (!ball) return;

  state.enemies.forEach(enemy => {
    if ((enemy.behavior as string) === 'teammate') {
      const dx = ball.x - enemy.x;
      const dy = ball.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 100) {
        enemy.vx = (dx / dist) * 1.5;
        enemy.vy = (dy / dist) * 1.5;
      } else {
        enemy.vx = Math.sin(Date.now() / 1000 + enemy.x) * 1;
        enemy.vy = Math.cos(Date.now() / 1000 + enemy.y) * 1;
      }
    } else if (enemy.behavior === 'chase') {
      const targetX = state.x;
      const targetY = state.y;
      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        enemy.vx = (dx / dist) * 2;
        enemy.vy = (dy / dist) * 2;
      }
    } else {
      if (!enemy.initialX) enemy.initialX = enemy.x;
      const range = enemy.range || 100;
      const diff = enemy.x - enemy.initialX;
      if (Math.abs(diff) > range) {
        enemy.vx = -(enemy.vx ?? 0);
      }
    }

    enemy.x += enemy.vx ?? 0;
    enemy.y += enemy.vy ?? 0;

    enemy.x = Math.max(20, Math.min(canvasW - 20, enemy.x));
    enemy.y = Math.max(20, Math.min(canvasH - 20, enemy.y));
  });

  const bvx = (ball.vx || 0) * 0.98;
  const bvy = (ball.vy || 0) * 0.98;
  ball.vx = bvx;
  ball.vy = bvy;
  ball.x += bvx;
  ball.y += bvy;

  if (ball.x < 10 || ball.x > canvasW - 10) ball.vx = -bvx * 0.8;
  if (ball.y < 10 || ball.y > canvasH - 10) ball.vy = -bvy * 0.8;
  ball.x = Math.max(10, Math.min(canvasW - 10, ball.x));
  ball.y = Math.max(10, Math.min(canvasH - 10, ball.y));
};

export const checkGoalCollision = (
  ball: GameEntity,
  goals: { x: number; y: number; w: number; h: number }[],
  _isOpponentGoal: boolean
): boolean => {
  for (const goal of goals) {
    if (
      ball.x > goal.x && ball.x < goal.x + goal.w &&
      ball.y > goal.y && ball.y < goal.y + goal.h
    ) {
      return true;
    }
  }
  return false;
};
