import { useCallback, useRef } from 'react';

interface UseBlockDragProps {
    onDragStart?: (e: React.DragEvent) => void;
    isDraggable?: boolean;
}

export function useBlockDrag({ onDragStart, isDraggable }: UseBlockDragProps) {
    const blockRef = useRef<HTMLDivElement>(null);

    const handleDragStart = useCallback((e: React.DragEvent) => {
        if (!isDraggable) return;

        if (blockRef.current) {
            const ghost = blockRef.current.cloneNode(true) as HTMLElement;
            ghost.style.opacity = '0.6';
            ghost.style.transform = 'scale(1.05)';
            ghost.style.position = 'absolute';
            ghost.style.top = '-1000px';
            ghost.style.pointerEvents = 'none';
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
            requestAnimationFrame(() => document.body.removeChild(ghost));
        }
        onDragStart?.(e);
    }, [isDraggable, onDragStart]);

    const handleTouchStart = useCallback(() => {
        if (!isDraggable || !onDragStart) return;
        onDragStart({
            dataTransfer: {
                setData: () => {},
                setDragImage: () => {},
                effectAllowed: 'move'
            }
        } as unknown as React.DragEvent);
    }, [isDraggable, onDragStart]);

    return {
        blockRef,
        handleDragStart,
        handleTouchStart,
    };
}
