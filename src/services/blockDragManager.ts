import { playSoundEffect } from './soundService';

const DRAG_THRESHOLD = 5;

interface DragConfig {
    type: 'workspace' | 'sidebar';
    sourceBlockId?: string;
    blockDef?: any;
    sourceElement: HTMLElement;
    clientX: number;
    clientY: number;
}

interface DragCallbacks {
    onDropIndexChange: (index: number | null) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDrop: (info: {
        type: 'move' | 'new' | 'trash';
        sourceBlockId?: string;
        blockDef?: any;
        dropIndex: number;
    }) => void;
}

let globalCallbacks: DragCallbacks | null = null;
let activeDrag: {
    config: DragConfig;
    callbacks: DragCallbacks;
    clone: HTMLElement;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    dropIndex: number | null;
    isDragging: boolean;
    rafId: number;
} | null = null;

let indicatorEl: HTMLElement | null = null;
let newBlockIds = new Set<string>();

export function setGlobalDragCallbacks(callbacks: DragCallbacks) {
    globalCallbacks = callbacks;
}

export function markBlockAsNew(id: string) {
    newBlockIds.add(id);
}

export function isBlockNew(id: string): boolean {
    return newBlockIds.delete(id);
}

export function startDrag(config: DragConfig) {
    if (activeDrag || !globalCallbacks) return;

    const el = config.sourceElement;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.classList.add('drag-clone');
    clone.style.width = `${el.offsetWidth}px`;
    clone.style.left = `${config.clientX - el.offsetWidth / 2}px`;
    clone.style.top = `${config.clientY - el.offsetHeight / 2}px`;
    clone.style.transform = 'scale(1.02)';
    document.body.appendChild(clone);

    createIndicator();

    activeDrag = {
        config,
        callbacks: globalCallbacks,
        clone,
        startX: config.clientX,
        startY: config.clientY,
        currentX: config.clientX,
        currentY: config.clientY,
        dropIndex: null,
        isDragging: false,
        rafId: 0,
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
}

function onPointerMove(e: PointerEvent) {
    if (!activeDrag) return;

    const dx = e.clientX - activeDrag.startX;
    const dy = e.clientY - activeDrag.startY;

    if (!activeDrag.isDragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        activeDrag.isDragging = true;
        activeDrag.clone.style.opacity = '0.9';
        activeDrag.callbacks.onDragStart();
    }

    activeDrag.currentX = e.clientX;
    activeDrag.currentY = e.clientY;

    if (activeDrag.rafId) cancelAnimationFrame(activeDrag.rafId);
    activeDrag.rafId = requestAnimationFrame(() => {
        if (!activeDrag) return;
        const { clone, currentX, currentY } = activeDrag;
        const hw = clone.offsetWidth / 2;
        const hh = clone.offsetHeight / 2;
        clone.style.transform = `translate(${currentX - activeDrag.startX}px, ${currentY - activeDrag.startY}px) scale(1.02)`;

        const newIndex = calculateDropIndex(currentY);
        if (newIndex !== activeDrag.dropIndex) {
            activeDrag.dropIndex = newIndex;
            activeDrag.callbacks.onDropIndexChange(newIndex);
            updateIndicator(newIndex);
        }
    });
}

function onPointerUp(e: PointerEvent) {
    if (!activeDrag) return;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);

    if (activeDrag.rafId) cancelAnimationFrame(activeDrag.rafId);

    const { config, callbacks, clone, dropIndex, isDragging } = activeDrag;

    clone.remove();
    removeIndicator();

    if (!isDragging) {
        callbacks.onDragEnd();
        activeDrag = null;
        return;
    }

    const trashEl = document.querySelector('[data-trash-zone]');
    const overTrash = trashEl
        ? isPointIn(e.clientX, e.clientY, trashEl as HTMLElement)
        : false;

    if (overTrash && config.type === 'workspace' && config.sourceBlockId) {
        playSoundEffect('click');
        callbacks.onDrop({
            type: 'trash',
            sourceBlockId: config.sourceBlockId,
            dropIndex: -1,
        });
    } else if (dropIndex !== null) {
        if (config.type === 'workspace' && config.sourceBlockId) {
            callbacks.onDrop({
                type: 'move',
                sourceBlockId: config.sourceBlockId,
                dropIndex,
            });
        } else if (config.type === 'sidebar' && config.blockDef) {
            callbacks.onDrop({
                type: 'new',
                blockDef: config.blockDef,
                dropIndex,
            });
        }
    }

    callbacks.onDragEnd();
    callbacks.onDropIndexChange(null);
    activeDrag = null;
}

function calculateDropIndex(clientY: number): number {
    const blocks = document.querySelectorAll('#block-workspace .block-wrapper');
    let closestIndex = blocks.length;
    let minDistance = Number.POSITIVE_INFINITY;

    blocks.forEach((block, index) => {
        const rect = block.getBoundingClientRect();
        const offset = clientY - (rect.top + rect.height / 2);
        if (Math.abs(offset) < minDistance) {
            minDistance = Math.abs(offset);
            closestIndex = offset < 0 ? index : index + 1;
        }
    });

    return closestIndex;
}

function isPointIn(x: number, y: number, el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function createIndicator() {
    if (indicatorEl) return;
    indicatorEl = document.createElement('div');
    indicatorEl.className = 'drop-indicator';
    document.body.appendChild(indicatorEl);
}

function updateIndicator(dropIndex: number) {
    if (!indicatorEl) return;

    const blocks = document.querySelectorAll('#block-workspace .block-wrapper');
    const workspace = document.getElementById('block-workspace');
    if (!workspace) return;

    const wsRect = workspace.getBoundingClientRect();

    if (blocks.length === 0) {
        indicatorEl.style.top = `${wsRect.top + 80}px`;
        indicatorEl.style.left = `${wsRect.left + 24}px`;
        indicatorEl.style.width = `${wsRect.width - 48}px`;
        return;
    }

    let targetRect: DOMRect;
    if (dropIndex >= blocks.length) {
        targetRect = (blocks[blocks.length - 1] as HTMLElement).getBoundingClientRect();
        indicatorEl.style.top = `${targetRect.bottom + 2}px`;
    } else {
        targetRect = (blocks[dropIndex] as HTMLElement).getBoundingClientRect();
        indicatorEl.style.top = `${targetRect.top - 2}px`;
    }

    indicatorEl.style.left = `${wsRect.left + 24}px`;
    indicatorEl.style.width = `${wsRect.width - 48}px`;
}

function removeIndicator() {
    if (indicatorEl) {
        indicatorEl.remove();
        indicatorEl = null;
    }
}

export function isDraggingActive(): boolean {
    return activeDrag !== null;
}

export { DRAG_THRESHOLD };
