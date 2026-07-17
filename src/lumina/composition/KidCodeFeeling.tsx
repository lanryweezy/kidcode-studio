import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { PHI, goldenTime } from '../core/golden';
import { breathe, organicBreathe } from '../core/breath';
import { ease, curvedPath } from '../core/motion';
import { kidCodeDesignSystem } from '../core/designSystem';

// The Alien Architect: We are not selling a game engine. We are selling the dopamine hit of creation.
// The Five Movements:
// I. The Hook (1.2s): The spark of an idea. A blank canvas pulsing with potential.
// II. The World: The elements assembling organically.
// III. The Tension: The moment before the logic clicks. The 'what if?'
// IV. The Revelation: The system working. The game living.
// V. The Resonance: The feeling of "I made this."

export const KidCodeFeeling: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const gTime = goldenTime(durationInFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: kidCodeDesignSystem.colours.background }}>
      <Sequence from={0} durationInFrames={Math.ceil(gTime.hook)}>
        <TheHook frame={frame} fps={fps} />
      </Sequence>
      <Sequence from={Math.ceil(gTime.hook)} durationInFrames={Math.ceil(gTime.world - gTime.hook)}>
        <TheWorld frame={frame} fps={fps} gTime={gTime} />
      </Sequence>
      <Sequence from={Math.ceil(gTime.world)} durationInFrames={Math.ceil(gTime.revelation - gTime.world)}>
        <TheTensionAndRevelation frame={frame} fps={fps} gTime={gTime} />
      </Sequence>
      <Sequence from={Math.ceil(gTime.revelation)}>
        <TheResonance frame={frame} fps={fps} gTime={gTime} duration={durationInFrames} />
      </Sequence>
    </AbsoluteFill>
  );
};

const TheHook: React.FC<{frame: number, fps: number}> = ({frame, fps}) => {
  // First 1.2s (approx 36 frames at 30fps).
  // A single glowing dot that breathes intensely, representing the spark of an idea.
  // It suddenly expands asymmetrically (The Alien pass).

  const scale = interpolate(frame, [0, fps], [0, 1], { easing: ease.breath, extrapolateRight: 'clamp' });
  const pulse = organicBreathe(frame, fps);

  const opacity = interpolate(frame, [fps, fps + 6], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        width: 20, height: 20,
        borderRadius: '50%',
        backgroundColor: kidCodeDesignSystem.colours.primary,
        boxShadow: kidCodeDesignSystem.shadows.glow,
        transform: `scale(${(scale + pulse) * PHI})`,
        opacity
      }} />
    </AbsoluteFill>
  );
};

const TheWorld: React.FC<{frame: number, fps: number, gTime: any}> = ({frame, fps, gTime}) => {
  // Building the world. Abstract shapes (blocks) floating into golden ratio positions.
  const localFrame = frame - Math.ceil(gTime.hook);

  const block1Progress = interpolate(localFrame, [0, fps * 2], [0, 1], { easing: ease.emerge, extrapolateRight: 'clamp' });
  const block2Progress = interpolate(localFrame, [10, fps * 2 + 10], [0, 1], { easing: ease.emerge, extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const pos1 = curvedPath(block1Progress, {x: -200, y: -200}, {x: 1920 * (1 - 1/PHI), y: 1080 * (1 - 1/PHI)}, 0.4);
  const pos2 = curvedPath(block2Progress, {x: 2120, y: 1280}, {x: 1920 * (1/PHI), y: 1080 * (1/PHI)}, -0.4);

  return (
    <AbsoluteFill>
      <div style={{
        position: 'absolute',
        left: pos1.x, top: pos1.y,
        width: 120, height: 40,
        backgroundColor: kidCodeDesignSystem.colours.secondary,
        borderRadius: kidCodeDesignSystem.borderRadius.lg,
        transform: `scale(${breathe(localFrame, fps, {type: 'scale'})})`,
        opacity: interpolate(localFrame, [0, 15], [0, 1], {extrapolateRight: 'clamp'})
      }} />
       <div style={{
        position: 'absolute',
        left: pos2.x, top: pos2.y,
        width: 120 * PHI, height: 40 * PHI,
        backgroundColor: kidCodeDesignSystem.colours.accent.emerald,
        borderRadius: kidCodeDesignSystem.borderRadius.xl,
        transform: `scale(${breathe(localFrame, fps, {type: 'scale', phase: 15})})`,
        opacity: interpolate(localFrame, [10, 25], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'})
      }} />
    </AbsoluteFill>
  );
};

const TheTensionAndRevelation: React.FC<{frame: number, fps: number, gTime: any}> = ({frame, fps, gTime}) => {
  const localFrame = frame - Math.ceil(gTime.world);
  const turnLocalFrame = Math.ceil(gTime.turn - gTime.world);

  // Tension: The blocks are close but not connected.
  // The golden turn: They connect, and the "game" world explodes into view (particles/light).

  const isAfterTurn = localFrame >= turnLocalFrame;

  // Simplified revelation effect for now
  const bgFlash = interpolate(localFrame, [turnLocalFrame, turnLocalFrame + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flashFade = interpolate(localFrame, [turnLocalFrame + 10, turnLocalFrame + fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
        {isAfterTurn && (
           <AbsoluteFill style={{backgroundColor: kidCodeDesignSystem.colours.accent.sky, opacity: bgFlash * flashFade, mixBlendMode: 'screen'}} />
        )}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: `translate(-50%, -50%) scale(${interpolate(localFrame, [turnLocalFrame, turnLocalFrame + 60], [0.9, 1], {easing: ease.river, extrapolateLeft: 'clamp'})})`,
          color: kidCodeDesignSystem.colours.text.primary,
          fontFamily: kidCodeDesignSystem.typography.fontFamily.display,
          fontSize: kidCodeDesignSystem.typography.scale.xl.size,
          opacity: interpolate(localFrame, [turnLocalFrame, turnLocalFrame + 30], [0, 1], {extrapolateLeft: 'clamp'}),
        }}>
           The Feeling of Creation
        </div>
    </AbsoluteFill>
  );
};

const TheResonance: React.FC<{frame: number, fps: number, gTime: any, duration: number}> = ({frame, fps, gTime, duration}) => {
   const localFrame = frame - Math.ceil(gTime.revelation);
   const fadeOut = interpolate(frame, [duration - fps, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

   return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: fadeOut}}>
        <div style={{
          color: kidCodeDesignSystem.colours.primary,
          fontFamily: kidCodeDesignSystem.typography.fontFamily.display,
          fontSize: kidCodeDesignSystem.typography.scale.lg.size,
          filter: `blur(${interpolate(localFrame, [0, fps*2], [10, 0], {extrapolateRight: 'clamp'})}px)`,
          opacity: interpolate(localFrame, [0, fps], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `scale(${breathe(localFrame, fps, {type: 'scale'})})`
        }}>
           KidCode Studio
        </div>
    </AbsoluteFill>
   )
}
