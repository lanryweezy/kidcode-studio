
let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playSoundEffect = (type: 'move' | 'turn' | 'ui' | 'click' | 'coin') => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'move':
        // Soft sine slide (retro movement sound)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'turn':
        // Quick ratchet/blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'ui':
        // Happy chime for messages/emojis
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'click':
        // Mechanical click for LEDs
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;

      case 'coin':
        // Coin sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.setValueAtTime(1200, now + 0.1); 
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.setValueAtTime(0.05, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const playTone = (duration: number, volume: number = 0.5) => {
    try {
        const ctx = getContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        // A buzzer sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now); 
        
        // Scale gain by volume
        const vol = Math.max(0, Math.min(1, volume));
        gain.gain.setValueAtTime(0.1 * vol, now);
        gain.gain.setValueAtTime(0.1 * vol, now + duration - 0.05);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
    } catch (e) {
        console.error("Tone playback failed", e);
    }
}

export const playSpeakerSound = (type: string, volume: number = 0.5): number => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Scale gain by volume
    const vol = Math.max(0, Math.min(1, volume));
    const baseGain = 0.1 * vol;

    if (type === 'siren') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.5);
        osc.frequency.linearRampToValueAtTime(400, now + 1.0);
        gain.gain.setValueAtTime(baseGain, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
        return 1;
    }
    if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(baseGain, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        return 0.3;
    }
    if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
        gain.gain.setValueAtTime(baseGain, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        return 0.5;
    }
    if (type === 'coin') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.setValueAtTime(1200, now + 0.1); 
        gain.gain.setValueAtTime(baseGain * 0.5, now);
        gain.gain.setValueAtTime(baseGain * 0.5, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        return 0.4;
    }
    
    // Default fallback (low beep)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
    return 0.2;
  } catch (e) {
      console.error(e);
      return 0;
  }
}
