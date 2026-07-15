import { HandlerContext } from './types';
import { commandBlockToIR, executeIRNode } from '../../services/ir';

export const handlePuzzleCommand = async (ctx: HandlerContext): Promise<boolean> => {
    const { cmd, spriteStateRef, playSound, setNpcChat, wait, stopExecution, setGameState, particleSettings } = ctx;

    const irNode = commandBlockToIR(cmd);
    if (irNode) {
        return executeIRNode(irNode, {
            spriteState: spriteStateRef.current,
            playSound: playSound as (type: string) => void,
            setNpcChat,
            wait: wait as (ms: number) => Promise<void>,
            stopExecution,
            setGameState: setGameState as (state: string) => void,
            particleSettings
        });
    }
    return false;
};
