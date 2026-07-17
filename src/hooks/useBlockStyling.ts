import { useMemo } from 'react';
import { CommandBlock, CommandType } from '../types';

interface BlockStyling {
    borderColor: string;
    bgColor: string;
    labelColor: string;
    isControlBlock: boolean;
    isLogicBlock: boolean;
    isDataBlock: boolean;
    isNavBlock: boolean;
    isElse: boolean;
}

export function useBlockStyling(block: CommandBlock): BlockStyling {
    return useMemo(() => {
        const isControlBlock = block.type === CommandType.REPEAT || block.type === CommandType.END_REPEAT;
        const isLogicBlock = block.type === CommandType.IF || block.type === CommandType.END_IF || block.type === CommandType.ELSE || block.type === CommandType.WAIT_FOR_PRESS;
        const isDataBlock = block.type.startsWith('SET_VAR') || block.type.startsWith('CHANGE_VAR') || block.type.startsWith('LIST_') || block.type.startsWith('CALC_') || block.type.startsWith('STR_');
        const isNavBlock = block.type === CommandType.CREATE_SCREEN || block.type === CommandType.NAVIGATE;
        const isElse = block.type === CommandType.ELSE;

        let borderColor = 'border-slate-200';
        let bgColor = 'bg-white';
        let labelColor = 'text-slate-700';

        if (isControlBlock) {
            borderColor = 'border-violet-200';
            bgColor = 'bg-violet-50';
            labelColor = 'text-violet-700';
        } else if (isLogicBlock) {
            borderColor = 'border-indigo-200';
            bgColor = 'bg-indigo-50';
            labelColor = 'text-indigo-700';
        } else if (isDataBlock) {
            borderColor = 'border-orange-200';
            bgColor = 'bg-orange-50';
            labelColor = 'text-orange-700';
        } else if (isNavBlock) {
            borderColor = 'border-slate-600';
            bgColor = 'bg-slate-700';
            labelColor = 'text-white';
        }

        if (isElse) {
            bgColor = 'bg-indigo-100';
            borderColor = 'border-indigo-300';
        }

        return {
            borderColor,
            bgColor,
            labelColor,
            isControlBlock,
            isLogicBlock,
            isDataBlock,
            isNavBlock,
            isElse,
        };
    }, [block.type]);
}
