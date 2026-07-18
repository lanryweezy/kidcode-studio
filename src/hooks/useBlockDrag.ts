import { useCallback, useRef, useEffect } from 'react';
import { startDrag, isDraggingActive, DRAG_THRESHOLD } from '../services/blockDragManager';

interface UseBlockDragProps {
    blockId?: string;
    blockDef?: any;
    isDraggable?: boolean;
    sourceRef?: React.RefObject<HTMLElement>;
}

export function useBlockDrag({
    blockId,
    blockDef,
    isDraggable = false,
    sourceRef,
}: UseBlockDragProps) {
    const longPressTimer = useRef<number | undefined>(undefined);
    const isPointerDown = useRef(false);
    const startRef = useRef({ x: 0, y: 0 });
    const pendingMoveHandler = useRef<((e: PointerEvent) => void) | null>(null);
    const pendingUpHandler = useRef<((e: PointerEvent) => void) | null>(null);

    const cleanup = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = undefined;
        }
        if (pendingMoveHandler.current) {
            document.removeEventListener('pointermove', pendingMoveHandler.current);
            pendingMoveHandler.current = null;
        }
        if (pendingUpHandler.current) {
            document.removeEventListener('pointerup', pendingUpHandler.current);
            document.removeEventListener('pointercancel', pendingUpHandler.current);
            pendingUpHandler.current = null;
        }
        isPointerDown.current = false;
    }, []);

    const beginDrag = useCallback(() => {
        const el = sourceRef?.current;
        if (!el || !isDraggable || isDraggingActive()) return;

        startDrag({
            type: blockDef ? 'sidebar' : 'workspace',
            sourceBlockId: blockId,
            blockDef,
            sourceElement: el,
            clientX: startRef.current.x,
            clientY: startRef.current.y,
        });
    }, [blockId, blockDef, isDraggable, sourceRef]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!isDraggable || isDraggingActive()) return;
        if (e.button !== 0) return;

        const el = sourceRef?.current || (e.currentTarget as HTMLElement);
        if (!el) return;

        cleanup();
        isPointerDown.current = true;
        startRef.current = { x: e.clientX, y: e.clientY };

        if (e.pointerType === 'touch') {
            longPressTimer.current = window.setTimeout(() => {
                if (!isPointerDown.current) return;
                isPointerDown.current = false;
                beginDrag();
            }, 300);
        } else {
            const moveHandler = (me: PointerEvent) => {
                if (!isPointerDown.current) return;
                const dx = me.clientX - startRef.current.x;
                const dy = me.clientY - startRef.current.y;
                if (Math.abs(dx) >= DRAG_THRESHOLD || Math.abs(dy) >= DRAG_THRESHOLD) {
                    cleanup();
                    isPointerDown.current = false;
                    beginDrag();
                }
            };
            const upHandler = () => {
                cleanup();
            };

            pendingMoveHandler.current = moveHandler;
            pendingUpHandler.current = upHandler;
            document.addEventListener('pointermove', moveHandler);
            document.addEventListener('pointerup', upHandler);
            document.addEventListener('pointercancel', upHandler);
        }
    }, [isDraggable, sourceRef, cleanup, beginDrag]);

    const handleTouchMove = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = undefined;
        }
        isPointerDown.current = false;
    }, []);

    const handleTouchEnd = useCallback(() => {
        cleanup();
    }, [cleanup]);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        handlePointerDown,
        handleTouchMove,
        handleTouchEnd,
    };
}
