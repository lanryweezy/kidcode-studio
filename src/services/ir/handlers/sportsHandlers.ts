import { IRNode } from '../types';
import { ExecutionContext } from '../context';

export function handleIRNode(node: IRNode, ctx: ExecutionContext): boolean {
  const { spriteState: state, playSound } = ctx;

  switch (node.kind) {
    case 'kick_ball': {
      const kickForce = node.force;
      const ball = state.items.find(it => it.emoji === node.emoji);
      if (ball) {
        ball.vx = Math.cos((state.rotation - 90) * Math.PI / 180) * kickForce;
        ball.vy = Math.sin((state.rotation - 90) * Math.PI / 180) * kickForce;
      }
      playSound?.('kick');
      return true;
    }
    case 'pass_ball': {
      const teammates = state.enemies.filter(e => e.behavior === 'teammate');
      if (teammates.length > 0) {
        const nearest = teammates.reduce((a, b) => {
          const da = Math.abs(a.x - state.x) + Math.abs(a.y - state.y);
          const db = Math.abs(b.x - state.x) + Math.abs(b.y - state.y);
          return da < db ? a : b;
        });
        const passBall = state.items.find(it => it.emoji === '⚽' || it.emoji === '🏀');
        if (passBall) {
          const dx = nearest.x - passBall.x;
          const dy = nearest.y - passBall.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          passBall.vx = (dx / dist) * 8;
          passBall.vy = (dy / dist) * 8;
        }
      }
      playSound?.('pass');
      return true;
    }
    case 'dribble': {
      state.vx += node.speed;
      const dribbleBall = state.items.find(it => it.emoji === '⚽' || it.emoji === '🏀');
      if (dribbleBall) {
        dribbleBall.x = state.x + 15;
        dribbleBall.y = state.y;
      }
      return true;
    }
    case 'shoot_ball': {
      const shootBall = state.items.find(it => it.emoji === node.emoji);
      if (shootBall) {
        shootBall.vx = Math.cos((state.rotation - 90) * Math.PI / 180) * node.force;
        shootBall.vy = Math.sin((state.rotation - 90) * Math.PI / 180) * node.force;
      }
      playSound?.('shoot');
      return true;
    }
    case 'set_timer':
      state.variables['_timer'] = node.seconds;
      return true;
    case 'tick_timer':
      if (typeof state.variables['_timer'] === 'number') {
        state.variables['_timer']--;
        if (state.variables['_timer'] <= 0) {
          state.variables['_timer'] = 0;
        }
      }
      return true;
    case 'stop_timer':
      state.variables['_timer_paused'] = true;
      return true;
    case 'score_goal': {
      const currentHome = Number(state.variables['home_score'] || 0);
      state.variables['home_score'] = currentHome + node.points;
      state.score += node.points * 100;
      return true;
    }
    case 'add_period':
      state.variables['_period'] = node.name;
      return true;
    case 'end_period':
      state.variables['_period'] = null;
      return true;
    case 'spawn_ball':
      state.items.push({
        id: crypto.randomUUID(),
        x: 400, y: 300,
        type: 'item',
        emoji: node.emoji,
        width: 24, height: 24,
        vx: 0, vy: 0
      });
      return true;
    case 'spawn_teammate':
      state.enemies.push({
        id: crypto.randomUUID(),
        x: state.x + (Math.random() * 100 - 50),
        y: state.y + (Math.random() * 100 - 50),
        type: 'enemy',
        emoji: node.emoji,
        width: 30, height: 30,
        behavior: 'teammate'
      });
      return true;
    case 'spawn_opponent':
      state.enemies.push({
        id: crypto.randomUUID(),
        x: 200 + Math.random() * 400,
        y: 150 + Math.random() * 300,
        type: 'enemy',
        emoji: node.emoji,
        width: 30, height: 30,
        behavior: 'chase',
        vx: 1, vy: 0
      });
      return true;
    case 'switch_control': {
      if (state.enemies.length > 0) {
        const idx = Math.floor(Math.random() * state.enemies.length);
        const oldX = state.x;
        const oldY = state.y;
        state.x = state.enemies[idx].x;
        state.y = state.enemies[idx].y;
        state.enemies[idx].x = oldX;
        state.enemies[idx].y = oldY;
      }
      return true;
    }
    case 'set_formation':
      state.variables['_formation'] = node.formation;
      return true;
    case 'foul':
      state.variables['_foul'] = node.type;
      playSound?.('whistle');
      return true;
    case 'yellow_card': {
      const yc = Number(state.variables['yellow_cards'] || 0);
      state.variables['yellow_cards'] = yc + 1;
      return true;
    }
    case 'red_card':
      state.variables['red_card'] = true;
      return true;

    // === Advanced Sports ===
    case 'cry_foul':
      state.variables['_foul_protest'] = node.text;
      playSound?.('whistle');
      return true;
    case 'celebrate_goal':
      state.effectTrigger = { type: 'sparkle', x: state.x, y: state.y, color: '#fbbf24' };
      state.score += 500;
      playSound?.('victory');
      return true;
    case 'substitution': {
      const subIdx = state.enemies.findIndex(e => e.behavior === 'teammate');
      if (subIdx >= 0) {
        state.enemies[subIdx].emoji = node.player;
      }
      return true;
    }
    case 'extra_time': {
      const et = Number(state.variables['_timer'] || 0);
      state.variables['_timer'] = et + node.seconds;
      return true;
    }
    case 'penalty_kick':
      state.vx = 20;
      playSound?.('kick');
      return true;
    case 'corner_kick':
      state.vy = -15;
      state.vx = 10;
      playSound?.('kick');
      return true;
    case 'free_kick':
      state.vx = node.force;
      playSound?.('kick');
      return true;
    case 'injury_time': {
      const it = Number(state.variables['_timer'] || 0);
      state.variables['_timer'] = it + node.seconds;
      return true;
    }
    case 'water_break':
      playSound?.('powerup');
      return true;
    case 'team_talk':
      state.variables['_team_morale'] = 100;
      return true;
    case 'set_piece':
      playSound?.('whistle');
      return true;
    case 'man_mark':
      state.variables['_man_marking'] = true;
      return true;

    default:
      return false;
  }
}
