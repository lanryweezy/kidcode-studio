import React, { useEffect } from 'react';
import { useMatterPhysics } from '../hooks/useMatterPhysics';
import { SpriteState } from '../types';

interface MatterPhysicsBridgeProps {
    spriteState: SpriteState;
    setSpriteState: React.Dispatch<React.SetStateAction<SpriteState>>;
    spriteStateRef: React.MutableRefObject<SpriteState>;
    gameCanvasSizeRef: React.MutableRefObject<{ w: number; h: number }>;
    isExecuting: boolean;
    onTick: (tick: () => void) => void;
}

const MatterPhysicsBridgeInner: React.FC<MatterPhysicsBridgeProps> = (props) => {
    const { tick } = useMatterPhysics({
        spriteState: props.spriteState,
        setSpriteState: props.setSpriteState,
        spriteStateRef: props.spriteStateRef,
        gameCanvasSizeRef: props.gameCanvasSizeRef,
        isExecuting: props.isExecuting
    });

    useEffect(() => {
        props.onTick(tick);
    }, [tick, props.onTick]);

    return null;
};

export { MatterPhysicsBridgeInner };
