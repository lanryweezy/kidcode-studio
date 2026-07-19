import { Composition } from 'remotion';
import { KidCodeFeeling } from './composition/KidCodeFeeling';
import { PHI } from './core/golden';
import React from 'react';

export const RemotionRoot: React.FC = () => {
  const durationInFrames = Math.round(300 * PHI);

  return (
    <>
      <Composition
        id="KidCodeFeeling"
        component={KidCodeFeeling}
        durationInFrames={durationInFrames}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
