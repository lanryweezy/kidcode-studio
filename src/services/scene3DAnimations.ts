import { Animation3D } from './scene3DPrimitives';

export type EasingFunction = (t: number) => number;

export const EASING_FUNCTIONS: Record<string, EasingFunction> = {
  Linear: (t) => t,
  'Ease In': (t) => t * t,
  'Ease Out': (t) => t * (2 - t),
  'Ease In-Out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  Bounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  Elastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },
};

export const EASING_NAMES = Object.keys(EASING_FUNCTIONS);

export function interpolateKeyframes(
  keyframes: Animation3D['keyframes'],
  time: number
): number | null {
  if (keyframes.length === 0) return null;
  if (keyframes.length === 1) return keyframes[0].value;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  let i = 0;
  while (i < sorted.length - 1 && sorted[i + 1].time <= time) i++;

  const kf0 = sorted[i];
  const kf1 = sorted[i + 1];
  const duration = kf1.time - kf0.time;
  const t = duration === 0 ? 0 : (time - kf0.time) / duration;

  const easingFn = EASING_FUNCTIONS[kf1.easing] || EASING_FUNCTIONS.Linear;
  const eased = easingFn(t);

  return kf0.value + (kf1.value - kf0.value) * eased;
}

export function evaluateAnimations(
  animations: Animation3D[],
  time: number
): Map<string, { property: string; channel: string; value: number }> {
  const results = new Map<string, { property: string; channel: string; value: number }>();

  for (const anim of animations) {
    const value = interpolateKeyframes(anim.keyframes, time);
    if (value !== null) {
      results.set(`${anim.objectId}_${anim.property}_${anim.channel}`, {
        property: anim.property,
        channel: anim.channel,
        value,
      });
    }
  }

  return results;
}

export function getAnimationDuration(animations: Animation3D[]): number {
  let maxTime = 0;
  for (const anim of animations) {
    for (const kf of anim.keyframes) {
      if (kf.time > maxTime) maxTime = kf.time;
    }
  }
  return maxTime;
}

export function addKeyframe(
  animation: Animation3D,
  time: number,
  value: number,
  easing: string = 'Linear'
): Animation3D {
  const existing = animation.keyframes.findIndex((kf) => Math.abs(kf.time - time) < 0.001);
  const newKeyframes = [...animation.keyframes];

  if (existing >= 0) {
    newKeyframes[existing] = { time, value, easing };
  } else {
    newKeyframes.push({ time, value, easing });
  }

  return { ...animation, keyframes: newKeyframes };
}

export function removeKeyframe(
  animation: Animation3D,
  time: number
): Animation3D {
  return {
    ...animation,
    keyframes: animation.keyframes.filter((kf) => Math.abs(kf.time - time) > 0.001),
  };
}
