import { useState, useEffect, useRef, useCallback } from 'react';
import { ANIMATION_DURATIONS } from '../constants/actions';

interface UseBlockAnimationProps {
    blockId: string;
    params: Record<string, unknown>;
    onDelete: (id: string) => void;
    isActive?: boolean;
}

export function useBlockAnimation({ blockId, params, onDelete, isActive }: UseBlockAnimationProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);
    const prevParamsRef = useRef(JSON.stringify(params));
    const blockRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prev = prevParamsRef.current;
        const curr = JSON.stringify(params);
        if (prev !== curr) {
            prevParamsRef.current = curr;
            setIsFlashing(true);
            const timer = setTimeout(() => setIsFlashing(false), ANIMATION_DURATIONS.DELETE_FLASH);
            return () => clearTimeout(timer);
        }
    }, [params]);

    const handleDelete = useCallback(() => {
        setIsDeleting(true);
    }, []);

    useEffect(() => {
        if (isDeleting) {
            const timer = setTimeout(() => onDelete(blockId), ANIMATION_DURATIONS.DELETE_DELAY);
            return () => clearTimeout(timer);
        }
    }, [isDeleting, blockId, onDelete]);

    useEffect(() => {
        if (isActive && blockRef.current) {
            const el = blockRef.current;
            requestAnimationFrame(() => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    }, [isActive]);

    return {
        isDeleting,
        isFlashing,
        blockRef,
        handleDelete,
    };
}
