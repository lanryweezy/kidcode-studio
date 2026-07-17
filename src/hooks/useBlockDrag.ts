import { useCallback, useRef, useEffect } from 'react';

interface UseBlockDragProps {
    onDragStart?: (e: React.DragEvent) => void;
    isDraggable?: boolean;
}

export function useBlockDrag({ onDragStart, isDraggable }: UseBlockDragProps) {
    const blockRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<number | undefined>(undefined);
    const isTouchDragging = useRef(false);
    const rafId = useRef<number | undefined>(undefined);

    useEffect(() => {
        const el = blockRef.current;
        if (!el || !isDraggable || !onDragStart) return;

        const handleTouchMove = () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = undefined;
            }
            isTouchDragging.current = false;
        };

        const handleTouchEnd = () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = undefined;
            }
            isTouchDragging.current = false;
        };

        el.addEventListener('touchmove', handleTouchMove, { passive: true });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [isDraggable, onDragStart]);

    const handleDragStart = useCallback((e: React.DragEvent) => {
        if (!isDraggable) return;

        if (blockRef.current) {
            const ghost = blockRef.current.cloneNode(true) as HTMLElement;
            ghost.style.opacity = '0.6';
            ghost.style.transform = 'scale(1.05) translateZ(0)';
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
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        isTouchDragging.current = true;
        longPressTimer.current = window.setTimeout(() => {
            if (!isTouchDragging.current) return;
            rafId.current = requestAnimationFrame(() => {
                onDragStart({
                    dataTransfer: {
                        setData: () => {},
                        setDragImage: () => {},
                        effectAllowed: 'move'
                    }
                } as unknown as React.DragEvent);
            });
        }, 300);
    }, [isDraggable, onDragStart]);

    return {
        blockRef,
        handleDragStart,
        handleTouchStart,
    };
}
