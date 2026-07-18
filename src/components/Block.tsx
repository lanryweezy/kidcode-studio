import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CommandBlock, CommandType } from '../types';
import { Trash2, GripVertical, Copy, StickyNote, PanelTop, Bug } from 'lucide-react';
import { AVAILABLE_BLOCKS } from '../constants';
import { useBlockStyling } from '../hooks/useBlockStyling';
import { useBlockDrag } from '../hooks/useBlockDrag';
import { useBlockAnimation } from '../hooks/useBlockAnimation';
import { playSoundEffect } from '../services/soundService';
import { isBlockNew } from '../services/blockDragManager';

interface BlockProps {
    block: CommandBlock;
    index: number;
    mode: string;
    onUpdate: (id: string, newParams: any) => void;
    onDelete: (id: string) => void;
    onDuplicate?: (id: string) => void;
    isDraggable?: boolean;
    onDragEnter?: (index: number) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onContextMenu?: (e: React.MouseEvent, id: string) => void;
    isActive?: boolean;
    isDragOver?: boolean;
    isSnapping?: boolean;
}

// O(1) Lookup Map
const BLOCK_DEF_MAP = Object.values(AVAILABLE_BLOCKS).flat().reduce((acc, def) => {
    acc[def.type] = def;
    return acc;
}, {} as Record<string, any>);

// --- OPTIMIZED INPUT COMPONENT ---
const DebouncedInput = React.memo(({
    value,
    onChange,
    className,
    type = 'text',
    placeholder,
    min,
    max,
    step
}: {
    value: any,
    onChange: (val: any) => void,
    className?: string,
    type?: string,
    placeholder?: string,
    min?: number | string,
    max?: number | string,
    step?: number | string
}) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef<number | undefined>(undefined);

    // Sync local state if parent value changes externally (e.g. undo/redo)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setLocalValue(newVal);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = window.setTimeout(() => {
            const finalVal = type === 'number' ? (parseFloat(newVal) || 0) : newVal;
            onChange(finalVal);
        }, 300); // 300ms debounce
    };

    const handleBlur = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const finalVal = type === 'number' ? (parseFloat(String(localValue)) || 0) : localValue;
        // Only trigger if different (though parent logic usually handles diff)
        if (finalVal !== value) onChange(finalVal);
    };

    return (
        <input
            type={type}
            className={className}
            value={localValue || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
        />
    );
});

const Block: React.FC<BlockProps> = ({
    block,
    index,
    mode,
    onUpdate,
    onDelete,
    onDuplicate,
    isDraggable,
    onDragEnter,
    onMouseEnter,
    onMouseLeave,
    onContextMenu,
    isActive,
    isDragOver = false,
    isSnapping: externalSnapping,
}) => {
    const blockRef = useRef<HTMLDivElement>(null);
    const { isDeleting, isFlashing, handleDelete } = useBlockAnimation({
        blockId: block.id,
        params: block.params,
        onDelete,
        isActive,
    });

    const [internalSnapping, setInternalSnapping] = useState(false);
    const prevIndexRef = useRef(index);
    const mountedRef = useRef(true);

    const isSnapping = externalSnapping || internalSnapping;

    useEffect(() => {
        if (!mountedRef.current) {
            if (prevIndexRef.current !== index) {
                setInternalSnapping(true);
                playSoundEffect('click', 0);
                const timer = setTimeout(() => setInternalSnapping(false), 250);
                prevIndexRef.current = index;
                return () => clearTimeout(timer);
            }
        }
    }, [index]);

    useEffect(() => {
        if (isBlockNew(block.id)) {
            setInternalSnapping(true);
            playSoundEffect('click', 0);
            const timer = setTimeout(() => setInternalSnapping(false), 250);
            return () => clearTimeout(timer);
        }
    }, [block.id]);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const { handlePointerDown, handleTouchMove, handleTouchEnd } = useBlockDrag({
        blockId: block.id,
        isDraggable,
        sourceRef: blockRef,
    });

    const def = BLOCK_DEF_MAP[block.type];
    if (!def) return null;

    const Icon = def.icon;

    const handleParamChange = useCallback((key: string, value: any) => {
        onUpdate(block.id, { ...block.params, [key]: value });
    }, [block.id, block.params, onUpdate]);

    const toggleBreakpoint = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUpdate(block.id, { hasBreakpoint: !block.hasBreakpoint });
    };

    const isComment = block.type === CommandType.COMMENT;

    const notchVars: React.CSSProperties = (() => {
        const isControlBlock = block.type === CommandType.REPEAT || block.type === CommandType.END_REPEAT;
        const isLogicBlock = block.type === CommandType.IF || block.type === CommandType.END_IF || block.type === CommandType.ELSE || block.type === CommandType.WAIT_FOR_PRESS;
        const isDataBlock = block.type.startsWith('SET_VAR') || block.type.startsWith('CHANGE_VAR') || block.type.startsWith('LIST_') || block.type.startsWith('CALC_') || block.type.startsWith('STR_');
        const isNavBlock = block.type === CommandType.CREATE_SCREEN || block.type === CommandType.NAVIGATE;

        if (isControlBlock) return { '--block-notch-color': '#c4b5fd', '--block-notch-bg': '#f5f3ff' } as React.CSSProperties;
        if (isLogicBlock) return { '--block-notch-color': '#a5b4fc', '--block-notch-bg': '#eef2ff' } as React.CSSProperties;
        if (isDataBlock) return { '--block-notch-color': '#fed7aa', '--block-notch-bg': '#fff7ed' } as React.CSSProperties;
        if (isNavBlock) return { '--block-notch-color': '#475569', '--block-notch-bg': '#334155' } as React.CSSProperties;
        return { '--block-notch-color': '#e2e8f0', '--block-notch-bg': '#ffffff' } as React.CSSProperties;
    })();

    if (isComment) {
        return (
            <div
                id={`block-${block.id}`}
                ref={blockRef}
                className={`
                relative group flex flex-col p-4 rounded-xl mb-4 transition-shadow duration-200 select-none
                bg-yellow-200 border-b-4 border-r-4 border-yellow-300
                shadow-sm rotate-1 hover:rotate-0 hover:scale-[1.01] hover:shadow-md
                ${isDeleting ? 'animate-delete-flash' : ''}
                ${isSnapping ? 'block-snap block-glow-pulse' : ''}
                ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
            `}
                onPointerDown={handlePointerDown}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDragEnter={(e) => { e.preventDefault(); onDragEnter?.(index); }}
                onDragOver={(e) => e.preventDefault()}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContextMenu={(e) => { if (onContextMenu) { e.preventDefault(); onContextMenu(e, block.id); } }}
                tabIndex={0}
                role="article"
                aria-label={`Comment block`}
            >
                <div className="flex items-center gap-2 mb-2 text-yellow-800 opacity-60">
                    <StickyNote size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest font-sans">Note</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleDelete} className="hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                </div>
                <textarea
                    value={block.params.text || ''}
                    onChange={(e) => handleParamChange('text', e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-hand text-xl text-slate-800 placeholder-yellow-600/50 resize-none overflow-hidden leading-snug"
                    placeholder="Type your notes here..."
                    rows={Math.max(2, (block.params.text || '').split('\n').length)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        );
    }

    const { borderColor, bgColor, labelColor, isElse } = useBlockStyling(block);

    const activeStyle = isActive
        ? 'ring-4 ring-yellow-400 border-yellow-500 shadow-xl scale-[1.02] z-10'
        : 'hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-500 shadow-sm';

    const containerTypes = [CommandType.REPEAT, CommandType.IF, CommandType.FOREVER];
    const isContainerOpen = containerTypes.includes(block.type);

    return (
        <div className={`flex gap-2 items-center ${isContainerOpen ? 'block-notch-bottom' : ''} ${isSnapping ? 'block-snap' : ''}`} style={notchVars}>
            <button
                className={`w-4 h-4 rounded-full cursor-pointer flex items-center justify-center transition-all ${block.hasBreakpoint ? 'bg-red-500 hover:bg-red-600 scale-100' : 'bg-transparent hover:bg-red-200 scale-75'}`}
                onClick={toggleBreakpoint}
                title="Toggle Breakpoint"
                aria-label={block.hasBreakpoint ? 'Remove breakpoint' : 'Add breakpoint'}
            >
                {block.hasBreakpoint && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>

            <div
                id={`block-${block.id}`}
                ref={blockRef}
                className={`
            relative group flex-1 flex items-center gap-3 p-3 rounded-xl border-2 mb-3
            transition-shadow duration-200 select-none touch-none block-hover
            ${borderColor} ${bgColor} ${activeStyle}
            ${isDeleting ? 'animate-delete-flash' : ''}
            ${isFlashing ? 'ring-2 ring-emerald-400 border-emerald-400 animate-pulse' : ''}
            ${isSnapping ? 'block-glow-pulse' : ''}
            ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
            ${isDragOver ? 'ring-2 ring-violet-400 border-violet-400 scale-[1.01] animate-drop-zone-glow gpu-accelerated' : ''}
        `}
                onPointerDown={handlePointerDown}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDragEnter={(e) => { e.preventDefault(); onDragEnter?.(index); }}
                onDragOver={(e) => e.preventDefault()}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContextMenu={(e) => {
                    if (onContextMenu) {
                        e.preventDefault();
                        onContextMenu(e, block.id);
                    }
                }}
                tabIndex={0}
                role="article"
                aria-label={`Code block: ${def?.label}`}
            >
                {isDraggable && (
                    <div className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-600 cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} />
                    </div>
                )}

                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {index + 1}
                </div>

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0 ${def.color} ${isActive ? 'animate-pulse' : ''}`}>
                    <Icon size={20} />
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-2">
                    <div className="relative group">
                        <span className={`font-bold ${labelColor} cursor-help`}>{def.label}</span>
                        {/* Inline Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 pointer-events-none">
                            <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 w-64 shadow-xl border border-slate-700">
                                <p className="font-semibold mb-1">{def.label}</p>
                                <p className="text-slate-300 leading-snug">{def.description || 'No description available'}</p>
                                <div className="absolute bottom-0 left-4 transform translate-y-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-slate-900 border-r border-b border-slate-700"></div>
                            </div>
                        </div>
                    </div>

                    {block.type === CommandType.CREATE_SCREEN && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-300 font-bold">NAME:</span>
                            <DebouncedInput
                                value={block.params.text}
                                onChange={(val) => handleParamChange('text', val)}
                                className="w-32 bg-slate-800 text-white border border-slate-600 rounded px-2 py-1 outline-none text-sm font-bold"
                                placeholder="screen1"
                            />
                        </div>
                    )}

                    {(block.type.startsWith('CALC_') || block.type.startsWith('STR_')) && (
                        <div className="flex items-center gap-2 w-full mt-1">
                            <div className="flex items-center gap-1 bg-orange-100/50 rounded-lg px-2 py-1 border border-orange-200">
                                <span className="text-[10px] font-bold text-orange-400">SET VAR</span>
                                <DebouncedInput
                                    value={block.params.varName}
                                    onChange={(val) => handleParamChange('varName', val)}
                                    className="w-16 bg-transparent outline-none text-sm font-bold text-orange-700 placeholder-orange-300"
                                    placeholder="res"
                                />
                            </div>
                            <span className="text-slate-600 font-bold">=</span>

                            {block.type !== CommandType.CALC_RANDOM && !block.type.startsWith('STR_') && (
                                <DebouncedInput
                                    type="number"
                                    value={block.params.value}
                                    onChange={(val) => handleParamChange('value', val)}
                                    className="w-14 bg-white border border-orange-200 rounded px-1 py-1 text-center font-mono text-sm text-slate-700"
                                />
                            )}
                            {block.type.startsWith('STR_') && (
                                <DebouncedInput
                                    value={block.params.text}
                                    onChange={(val) => handleParamChange('text', val)}
                                    className="flex-1 min-w-[60px] bg-white border border-orange-200 rounded px-1 py-1 text-sm text-slate-700"
                                    placeholder="Text 1"
                                />
                            )}
                            {block.type === CommandType.CALC_RANDOM && (
                                <DebouncedInput
                                    type="number"
                                    value={block.params.value}
                                    onChange={(val) => handleParamChange('value', val)}
                                    className="w-14 bg-white border border-orange-200 rounded px-1 py-1 text-center font-mono text-sm text-slate-700"
                                    placeholder="min"
                                />
                            )}

                            <span className="text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded text-sm">
                                {block.type === CommandType.CALC_ADD ? '+' :
                                    block.type === CommandType.CALC_SUB ? '-' :
                                        block.type === CommandType.CALC_MUL ? '×' :
                                            block.type === CommandType.CALC_DIV ? '÷' :
                                                block.type === CommandType.CALC_MOD ? '%' :
                                                    block.type === CommandType.CALC_RANDOM ? 'TO' :
                                                        block.type === CommandType.STR_JOIN ? '+' :
                                                            block.type.includes('SIN') || block.type.includes('COS') ? 'of' : ''}
                            </span>

                            {(block.type === CommandType.CALC_ADD || block.type === CommandType.CALC_SUB ||
                                block.type === CommandType.CALC_MUL || block.type === CommandType.CALC_DIV ||
                                block.type === CommandType.CALC_MOD || block.type === CommandType.CALC_RANDOM) && (
                                    <DebouncedInput
                                        type="number"
                                        value={block.params.value2}
                                        onChange={(val) => handleParamChange('value2', val)}
                                        className="w-14 bg-white border border-orange-200 rounded px-1 py-1 text-center font-mono text-sm text-slate-700"
                                        placeholder={block.type === CommandType.CALC_RANDOM ? "max" : "0"}
                                    />
                                )}
                            {block.type === CommandType.STR_JOIN && (
                                <DebouncedInput
                                    value={block.params.text2}
                                    onChange={(val) => handleParamChange('text2', val)}
                                    className="flex-1 min-w-[60px] bg-white border border-orange-200 rounded px-1 py-1 text-sm text-slate-700"
                                    placeholder="Text 2"
                                />
                            )}
                        </div>
                    )}

                    {/* --- LIST BLOCKS UI --- */}
                    {block.type.startsWith('LIST_') && block.type !== CommandType.LIST_CLEAR && (
                        <div className="flex items-center gap-2 mt-1 w-full">
                            <div className="flex items-center gap-1 bg-yellow-100/50 rounded-lg px-2 py-1 border border-yellow-200">
                                <span className="text-[10px] font-bold text-yellow-600">LIST</span>
                                <DebouncedInput
                                    value={block.type === CommandType.LIST_GET ? (block.params.listName) : (block.params.varName)}
                                    onChange={(val) => handleParamChange(block.type === CommandType.LIST_GET ? 'listName' : 'varName', val)}
                                    className="w-16 bg-transparent outline-none text-sm font-bold text-yellow-800 placeholder-yellow-400"
                                    placeholder="myList"
                                />
                            </div>

                            {block.type === CommandType.LIST_ADD && (
                                <>
                                    <span className="text-xs font-bold text-yellow-600">ADD</span>
                                    <DebouncedInput value={block.params.value} onChange={(val) => handleParamChange('value', val)} className="flex-1 bg-white border border-yellow-200 rounded px-2 py-1 text-sm" placeholder="Value" />
                                </>
                            )}
                            {block.type === CommandType.LIST_REMOVE && (
                                <>
                                    <span className="text-xs font-bold text-yellow-600">DEL INDEX</span>
                                    <DebouncedInput type="number" value={block.params.value} onChange={(val) => handleParamChange('value', val)} className="w-12 bg-white border border-yellow-200 rounded px-2 py-1 text-sm font-mono text-center" />
                                </>
                            )}
                            {block.type === CommandType.LIST_GET && (
                                <>
                                    <span className="text-xs font-bold text-yellow-600">GET INDEX</span>
                                    <DebouncedInput type="number" value={block.params.value} onChange={(val) => handleParamChange('value', val)} className="w-12 bg-white border border-yellow-200 rounded px-2 py-1 text-sm font-mono text-center" />
                                    <span className="text-xs font-bold text-yellow-600">→</span>
                                    <DebouncedInput value={block.params.varName} onChange={(val) => handleParamChange('varName', val)} className="w-16 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-sm text-yellow-800 font-bold" placeholder="saveTo" />
                                </>
                            )}
                        </div>
                    )}

                    {(block.type === CommandType.SET_BACKGROUND || block.type === CommandType.SET_RGB) && (
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
                            <input
                                type="color"
                                value={block.params.color || '#ffffff'}
                                onChange={(e) => handleParamChange('color', e.target.value)}
                                className="w-12 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <span className="text-xs font-mono text-slate-600">{block.params.color}</span>
                        </div>
                    )}

                    {(block.type === CommandType.SET_TITLE ||
                        block.type === CommandType.SAY ||
                        block.type === CommandType.SPEAK ||
                        block.type === CommandType.SET_EMOJI ||
                        block.type === CommandType.LOG_DATA ||
                        block.type === CommandType.NAVIGATE ||
                        block.type === CommandType.SET_LCD) && (
                            <>
                                {block.type === CommandType.SET_LCD && (
                                    <>
                                        <div className="flex items-center gap-1 bg-white border border-lime-600 rounded px-2 py-1">
                                            <select
                                                value={block.params.row || 0}
                                                onChange={(e) => handleParamChange('row', parseInt(e.target.value))}
                                                className="bg-transparent outline-none text-xs font-bold text-lime-700 cursor-pointer"
                                            >
                                                <option value={0}>Line 1</option>
                                                <option value={1}>Line 2</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-1 bg-white border border-lime-600 rounded px-2 py-1">
                                            <span className="text-[10px] text-lime-600 font-bold">COL</span>
                                            <DebouncedInput
                                                type="number"
                                                min="0" max="15"
                                                value={block.params.col}
                                                onChange={(val) => handleParamChange('col', val)}
                                                className="w-8 bg-transparent outline-none text-xs font-bold text-lime-700"
                                            />
                                        </div>
                                    </>
                                )}
                                <DebouncedInput
                                    value={block.params.text}
                                    onChange={(val) => handleParamChange('text', val)}
                                    className={`
                    flex-1 min-w-[100px] rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200 
                    ${block.type === CommandType.SET_LCD
                                            ? 'bg-[#84cc16] text-slate-900 font-digital border border-lime-600 placeholder-lime-800'
                                            : 'bg-slate-100 font-mono'}
                    `}
                                    placeholder={block.type === CommandType.SET_LCD ? "LCD Text..." : block.type === CommandType.NAVIGATE ? "Screen Name" : "Text..."}
                                />
                            </>
                        )}

                    {block.type === CommandType.ADD_INPUT && (
                        <>
                            <DebouncedInput
                                value={block.params.text}
                                onChange={(val) => handleParamChange('text', val)}
                                className="flex-1 min-w-[100px] bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
                                placeholder="Placeholder..."
                            />
                            <span className="text-xs text-slate-600 font-bold">SAVE TO:</span>
                            <DebouncedInput
                                value={block.params.varName}
                                onChange={(val) => handleParamChange('varName', val)}
                                className="w-20 bg-orange-100 text-orange-800 font-bold rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-orange-300 placeholder-orange-300"
                                placeholder="myVar"
                            />
                        </>
                    )}

                    {block.type === CommandType.ADD_TEXT_BLOCK && (
                        <>
                            <DebouncedInput
                                value={block.params.text}
                                onChange={(val) => handleParamChange('text', val)}
                                className="flex-1 min-w-[100px] bg-slate-100 font-mono rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
                            />
                            <div className="flex items-center gap-1">
                                <input
                                    type="color"
                                    value={block.params.color || '#334155'}
                                    onChange={(e) => handleParamChange('color', e.target.value)}
                                    className="w-8 h-6 rounded cursor-pointer border border-slate-200 p-0"
                                />
                                <select
                                    value={block.params.textSize || 'md'}
                                    onChange={(e) => handleParamChange('textSize', e.target.value)}
                                    className="bg-slate-100 rounded px-1 py-1 text-xs font-bold text-slate-600 outline-none cursor-pointer"
                                >
                                    <option value="sm">Small</option>
                                    <option value="md">Normal</option>
                                    <option value="lg">Large</option>
                                    <option value="xl">Huge</option>
                                </select>
                            </div>
                        </>
                    )}

                    {(block.type === CommandType.ADD_SWITCH || block.type === CommandType.ADD_SLIDER || block.type === CommandType.ADD_CHECKBOX || block.type === CommandType.ADD_PROGRESS) && (
                        <>
                            <DebouncedInput
                                value={block.params.text}
                                onChange={(val) => handleParamChange('text', val)}
                                className="w-24 bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
                                placeholder="Label"
                            />
                            <span className="text-xs text-slate-600 font-bold">LINK VAR:</span>
                            <DebouncedInput
                                value={block.params.varName}
                                onChange={(val) => handleParamChange('varName', val)}
                                className="w-20 bg-orange-100 text-orange-800 font-bold rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-orange-300"
                                placeholder="myVar"
                            />
                            {block.type === CommandType.ADD_PROGRESS && (
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-600 font-bold">MAX:</span>
                                    <DebouncedInput
                                        type="number"
                                        value={block.params.value}
                                        onChange={(val) => handleParamChange('value', val)}
                                        className="w-12 bg-slate-100 rounded px-2 py-1 outline-none text-sm font-mono"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {block.type === CommandType.SET_SEGMENT && (
                        <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded px-2 py-1">
                            <span className="text-xs text-red-500 font-bold">NUM</span>
                            <DebouncedInput
                                type="number"
                                value={block.params.value}
                                onChange={(val) => handleParamChange('value', val)}
                                className="w-16 bg-transparent outline-none font-mono text-sm text-red-700 font-bold"
                                min="0" max="9"
                            />
                        </div>
                    )}

                    {block.type === CommandType.ADD_IMAGE && (
                        <DebouncedInput
                            value={block.params.text}
                            onChange={(val) => handleParamChange('text', val)}
                            className="flex-1 min-w-[150px] bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
                            placeholder="Image URL"
                        />
                    )}

                    {block.type === CommandType.SET_SCENE && (
                        <div className="flex items-center gap-1 bg-white border border-purple-200 rounded px-2 py-1">
                            <select
                                value={block.params.text}
                                onChange={(e) => handleParamChange('text', e.target.value)}
                                className="bg-transparent outline-none text-sm font-bold text-purple-700 cursor-pointer"
                            >
                                <option value="grid">⬜ Grid</option>
                                <option value="space">🚀 Space</option>
                                <option value="forest">🌲 Forest</option>
                                <option value="underwater">🌊 Ocean</option>
                                <option value="desert">🌵 Desert</option>
                            </select>
                        </div>
                    )}

                    {block.type === CommandType.SET_WEATHER && (
                        <div className="flex items-center gap-1 bg-white border border-blue-200 rounded px-2 py-1">
                            <select
                                value={block.params.text}
                                onChange={(e) => handleParamChange('text', e.target.value)}
                                className="bg-transparent outline-none text-sm font-bold text-blue-600 cursor-pointer"
                            >
                                <option value="none">☀️ Clear</option>
                                <option value="rain">🌧️ Rain</option>
                                <option value="snow">❄️ Snow</option>
                            </select>
                        </div>
                    )}

                    {block.type === CommandType.SET_CAMERA && (
                        <div className="flex items-center gap-1 bg-white border border-slate-600 rounded px-2 py-1">
                            <span className="text-xs text-slate-500 font-bold">ACTIVE</span>
                            <input
                                type="checkbox"
                                checked={block.params.condition === 'true'}
                                onChange={(e) => handleParamChange('condition', e.target.checked ? 'true' : 'false')}
                                className="accent-slate-700 w-4 h-4"
                            />
                        </div>
                    )}

                    {block.type === CommandType.ADD_BUTTON && (
                        <>
                            <DebouncedInput
                                value={block.params.text}
                                onChange={(val) => handleParamChange('text', val)}
                                className="w-24 bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
                                placeholder="Label"
                            />
                            <span className="text-xs text-slate-600 font-bold">MSG:</span>
                            <DebouncedInput
                                value={block.params.message}
                                onChange={(val) => handleParamChange('message', val)}
                                className="w-24 bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
                                placeholder="Alert Message"
                            />
                            <span className="text-xs text-slate-600 font-bold">GO TO:</span>
                            <DebouncedInput
                                value={block.params.screenName}
                                onChange={(val) => handleParamChange('screenName', val)}
                                className="flex-1 min-w-[80px] bg-blue-50 text-blue-800 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-blue-300 placeholder-blue-300 font-bold"
                                placeholder="screen name"
                            />
                        </>
                    )}

                    {(block.type === CommandType.MOVE_X || block.type === CommandType.MOVE_Y || block.type === CommandType.SET_VELOCITY_X || block.type === CommandType.SET_VELOCITY_Y) && (
                        <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1">
                            <span className="text-xs text-slate-500 font-bold">VAL</span>
                            <DebouncedInput
                                type="number"
                                value={block.params.value}
                                onChange={(val) => handleParamChange('value', val)}
                                className="w-16 bg-transparent outline-none font-mono text-sm"
                            />
                        </div>
                    )}

                    {(block.type === CommandType.CHANGE_SCORE || block.type === CommandType.SET_SCORE) && (
                        <div className="flex items-center gap-1 bg-yellow-50 rounded px-2 py-1 border border-yellow-200">
                            <span className="text-xs text-yellow-600 font-bold">PTS</span>
                            <DebouncedInput
                                type="number"
                                value={block.params.value}
                                onChange={(val) => handleParamChange('value', val)}
                                className="w-16 bg-transparent outline-none font-mono text-sm text-yellow-800 font-bold"
                            />
                        </div>
                    )}

                    {(block.type === CommandType.WAIT || block.type === CommandType.SLEEP || block.type === CommandType.SET_VIBRATION) && (
                        <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1">
                            <span className="text-xs text-slate-500 font-bold">SEC</span>
                            <DebouncedInput
                                type="number"
                                step="0.1"
                                value={block.params.value}
                                onChange={(val) => handleParamChange('value', val)}
                                className="w-16 bg-transparent outline-none font-mono text-sm"
                            />
                        </div>
                    )}

                    {block.type === CommandType.REPEAT && (
                        <div className="flex items-center gap-1 bg-white border border-violet-100 rounded px-2 py-1">
                            <span className="text-xs text-violet-500 font-bold">TIMES</span>
                            <DebouncedInput
                                type="number"
                                value={block.params.value}
                                onChange={(val) => handleParamChange('value', val)}
                                className="w-16 bg-transparent outline-none font-mono text-sm text-violet-700 font-bold"
                            />
                        </div>
                    )}

                    {(block.type === CommandType.SET_VAR || block.type === CommandType.CHANGE_VAR) && (
                        <>
                            <DebouncedInput
                                value={block.params.varName}
                                onChange={(val) => handleParamChange('varName', val)}
                                className="w-24 bg-orange-100 rounded px-2 py-1 outline-none text-sm font-bold text-orange-800 border border-orange-200 focus:ring-2 focus:ring-orange-300 placeholder-orange-300"
                                placeholder="Var Name"
                            />
                            <span className="text-xs text-orange-400 font-bold">
                                {block.type === CommandType.CHANGE_VAR ? "ADD" : "TO"}
                            </span>
                            <DebouncedInput
                                type="number"
                                value={block.params.value}
                                onChange={(val) => handleParamChange('value', val)}
                                className="w-20 bg-white border border-orange-200 rounded px-2 py-1 outline-none font-mono text-sm text-orange-800 font-bold"
                            />
                        </>
                    )}

                    {block.type === CommandType.IF && (
                        <>
                            <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded px-2 py-1 shadow-sm">
                                <select
                                    value={block.params.condition}
                                    onChange={(e) => handleParamChange('condition', e.target.value)}
                                    className="bg-transparent outline-none text-sm font-bold text-indigo-700 cursor-pointer pr-2"
                                >
                                    <option value="IS_PRESSED">Button Pressed</option>
                                    <option value="IS_SWITCH_ON">Switch is ON</option>
                                    <option value="KEY_IS">Keypad Key Is...</option>
                                    <option value="IS_DARK">Light Sensor (Dark)</option>
                                    <option value="IS_TEMP_HIGH">Temperature &gt;</option>
                                    <option value="IS_MOTION">Motion Detected</option>
                                    <option value="DIST_LESS_THAN">Distance &lt;</option>
                                    <option value="FAN_SPEED_GT">Fan Speed &gt;</option>
                                    <option value="PIN_HIGH">Custom Pin HIGH</option>
                                    <option value="PRESSURE_GT">Pressure &gt;</option>
                                    <option value="FLEX_GT">Flex Bend &gt;</option>
                                    <option value="IS_TILTED">Is Tilted</option>
                                    <option value="IS_MAGNET_NEAR">Magnet Near</option>
                                    <option value="IS_TOUCHING_EDGE">Touching Edge</option>
                                    <option value="IS_TOUCHING_ENEMY">Touching Enemy</option>
                                    <option value="IS_TOUCHING_ITEM">Touching Item</option>
                                    <option value="IS_TOUCHING_CLONE">Touching Self/Tail</option>
                                </select>
                            </div>

                            {(block.params.condition === 'PIN_HIGH' || block.params.condition === 'IS_PRESSED') && (
                                <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded px-2 py-1 animate-in fade-in zoom-in duration-200">
                                    <span className="text-xs text-indigo-400 font-bold">PIN</span>
                                    <DebouncedInput
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={block.params.pin}
                                        onChange={(val) => handleParamChange('pin', val)}
                                        className="w-12 bg-transparent outline-none font-mono text-sm text-indigo-600 font-bold"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {onDuplicate && (
                        <button onClick={() => onDuplicate(block.id)} className="p-1 text-slate-600 hover:text-blue-500 rounded bg-white shadow-sm" title="Duplicate">
                            <Copy size={12} />
                        </button>
                    )}
                    <button onClick={handleDelete} className="p-1 text-slate-600 hover:text-red-500 rounded bg-white shadow-sm" title="Delete">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Block, (prev, next) => {
    return (
        prev.block === next.block &&
        prev.isActive === next.isActive &&
        prev.isDragOver === next.isDragOver &&
        prev.index === next.index &&
        prev.isDraggable === next.isDraggable
    );
});
