import React, { Suspense, useState, useCallback } from 'react';
import { AppMode, CommandBlock } from '../../types';
import { Box, Trash, Share2, ChevronRight } from 'lucide-react';
import TopBar from '../TopBar';
import Sidebar from '../Sidebar';
import Block from '../Block';
import Stage from '../Stage';
const Stage3D = React.lazy(() => import('../Stage3D'));
import type { Stage3DHandle } from '../Stage3D';
import type { useEditorController } from '../../hooks/useEditorController';
import { useStore } from '../../store/useStore';
import AIAssistButton from '../AIAssistButton';
import ErrorBoundary from '../ErrorBoundary';

type ControllerProps = ReturnType<typeof useEditorController>;

type EditorLayoutProps = ControllerProps;

const EditorLayout: React.FC<EditorLayoutProps> = React.memo((props) => {
    const { initCollaboration, destroyCollaboration, collaborators, workspaceZoom, setWorkspaceZoom, customAccentColor } = useStore();
    const [showShareInput, setShowShareInput] = useState(false);
    const [transportUrl, setTransportUrl] = useState('');
    const [isCollaborating, setIsCollaborating] = useState(false);

    const handleShareClick = useCallback(() => {
        if (isCollaborating) {
            destroyCollaboration();
            setIsCollaborating(false);
            return;
        }
        setShowShareInput(true);
    }, [isCollaborating, destroyCollaboration]);

    const handleStartCollab = useCallback(() => {
        const projectId = props.currentProject?.id || 'default-project';
        initCollaboration(projectId, transportUrl || undefined);
        setIsCollaborating(true);
        setShowShareInput(false);
    }, [props.currentProject, initCollaboration, transportUrl]);
    const {
        isMobile, viewVisible,
        isPlaying, debugMode, setDebugMode, isPaused, runCode, stopCode, resumeCode,
        currentProject, setProject, saveStatus,
        mode, commands,
        dropIndex, draggedBlockId, isOverTrash, setIsOverTrash,
        handleUpdateBlock, handleDeleteBlock, handleDuplicateBlock,
        setContextMenu,
        handleWorkspaceDragOver, handleWorkspaceDragLeave, handleWorkspaceDrop,
        handleTrashDragOver, handleTrashDrop,
        workspaceRef, stageRef, canvasRef,
        rightPanelWidth,
        hardwareState, hardwareStateRef, spriteState, spriteStateRef,
        appState, circuitComponents, setCircuitComponents,
        pcbColor, setPcbColor, wires, setWires,
        handleNavigate, highlightedPin, handleHardwareInput,
        updateSpriteState, shakeAmount, handleAppInteraction,
        tick, matterTick, advancedPhysics,
        gameCanvasSize,
        showConsole, consoleLogs, clearLogs,
        handleMouseDownLeft, handleMouseDownRight,
        handleAppendCode, handleReplaceCode,
        handleGenerateSprite, localIsGeneratingSprite,
        setShowCodePageManager, is3DMode, setIs3DMode,
        setShowQuestEditor,
    } = props;

    return (
        <>
            <TopBar
                isPlaying={isPlaying}
                debugMode={debugMode}
                setDebugMode={setDebugMode}
                isPaused={isPaused}
                runCode={runCode}
                stopCode={stopCode}
                resumeCode={resumeCode}
                currentProject={currentProject}
                setProject={setProject}
                saveStatus={saveStatus}
                onOpenCodePages={() => setShowCodePageManager(true)}
                is3DMode={is3DMode}
                onToggle3D={() => setIs3DMode(!is3DMode)}
            />

            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                <ErrorBoundary>
                    <Sidebar
                        handleAppendCode={(cmds: CommandBlock[]) => handleAppendCode(cmds.map((c: CommandBlock) => ({ ...c, id: crypto.randomUUID() })))}
                        handleReplaceCode={(cmds: CommandBlock[]) => handleReplaceCode(cmds.map((c: CommandBlock) => ({ ...c, id: crypto.randomUUID() })))}
                        handleGenerateSprite={handleGenerateSprite}
                        isGeneratingSprite={localIsGeneratingSprite}
                        setShowQuestEditor={() => setShowQuestEditor(true)}
                    />
                </ErrorBoundary>

                <div key={`workspace-${mode}`} id="block-workspace" className="flex-1 bg-slate-100 relative flex flex-col min-h-0 animate-in fade-in zoom-in-95 duration-300">
                    <ErrorBoundary>
                    <div className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-violet-500 bg-slate-300 transition-colors z-50 hidden lg:flex items-center justify-center opacity-40 hover:opacity-100" onMouseDown={handleMouseDownLeft}>
                        <div className="w-0.5 h-8 bg-current rounded-full" />
                    </div>

                    <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
                        <button
                            onClick={handleShareClick}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isCollaborating ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-600 border border-slate-200'}`}
                            aria-label="Share or collaborate"
                        >
                            <Share2 size={14} />
                            {isCollaborating ? `Live (${collaborators.length})` : 'Share'}
                        </button>
                        <AIAssistButton currentMode={mode} onAppendCode={handleAppendCode} />
                        <nav className="flex items-center gap-1 px-2 py-1 bg-white/80 backdrop-blur rounded-lg text-[10px] text-slate-500 font-medium border border-slate-200" aria-label="Breadcrumb">
                            <span>{mode === AppMode.GAME ? 'Game' : mode === AppMode.APP ? 'App' : 'Hardware'}</span>
                            <ChevronRight size={10} className="text-slate-400" />
                            <span className="text-slate-700 font-bold">{currentProject?.name || 'Untitled'}</span>
                        </nav>
                        {showShareInput && (
                            <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-lg border border-slate-200 z-40 flex flex-col gap-2 min-w-[250px]">
                                <input
                                    type="text"
                                    value={transportUrl}
                                    onChange={(e) => setTransportUrl(e.target.value)}
                                    placeholder="wss://your-server.com/ws (optional)"
                                    className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-violet-400"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleStartCollab} className="flex-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors">Start</button>
                                    <button onClick={() => setShowShareInput(false)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {draggedBlockId && (
                        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 p-3 rounded-xl transition-all z-40 flex items-center gap-2 ${isOverTrash ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-white text-slate-400 shadow-md border border-slate-200'}`}
                            onDragEnter={() => setIsOverTrash(true)}
                            onDragLeave={() => setIsOverTrash(false)}
                            onDragOver={handleTrashDragOver}
                            onDrop={handleTrashDrop}
                        >
                            <Trash size={20} className={isOverTrash ? "animate-bounce" : ""} />
                            {isOverTrash && <span className="font-bold text-sm">Drop to Delete</span>}
                        </div>
                    )}

                    <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                        <button onClick={() => setWorkspaceZoom(Math.max(0.5, workspaceZoom - 0.1))} className="bg-white text-slate-500 hover:text-slate-700 shadow-sm p-1.5 rounded-lg text-sm font-bold active:scale-95 transition-colors border border-slate-200" aria-label="Zoom Out">-</button>
                        <button onClick={() => setWorkspaceZoom(1)} className="bg-white text-slate-500 hover:text-slate-700 shadow-sm px-2.5 py-1.5 rounded-lg font-bold text-xs active:scale-95 transition-colors border border-slate-200">{(workspaceZoom * 100).toFixed(0)}%</button>
                        <button onClick={() => setWorkspaceZoom(Math.min(2, workspaceZoom + 0.1))} className="bg-white text-slate-500 hover:text-slate-700 shadow-sm p-1.5 rounded-lg text-sm font-bold active:scale-95 transition-colors border border-slate-200" aria-label="Zoom In">+</button>
                    </div>
                    <div ref={workspaceRef} className={`flex-1 p-3 lg:p-6 custom-scrollbar relative overflow-y-auto overflow-x-hidden transition-all duration-200 ${draggedBlockId ? 'bg-violet-50/50 ring-2 ring-inset ring-violet-300' : ''}`} onDragOver={handleWorkspaceDragOver} onDragLeave={handleWorkspaceDragLeave} onDrop={handleWorkspaceDrop}>
                        <div style={{ transform: `scale(${workspaceZoom})`, transformOrigin: 'top left', minHeight: '100%' }} className="space-y-1">
                            {commands.length === 0 && (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 opacity-60 pointer-events-none animate-in zoom-in duration-500">
                                    <Box size={56} className={`mb-4 text-slate-300 ${draggedBlockId ? 'animate-bounce text-violet-400' : 'animate-bounce-sm'}`} />
                                    <p className={`font-bold text-lg text-center px-4 ${draggedBlockId ? 'text-violet-500' : ''}`}>
                                        {draggedBlockId ? 'Drop your block here!' : 'Drag blocks here to start coding!'}
                                    </p>
                                </div>
                            )}
                            {draggedBlockId && commands.length > 0 && (
                                <div className="absolute inset-0 border-2 border-dashed border-violet-400 bg-violet-500/10 rounded-xl flex items-center justify-center pointer-events-none z-10">
                                    <div className="text-violet-600 font-bold text-base animate-pulse">
                                        Drop block here
                                    </div>
                                </div>
                            )}
                            {commands.map((cmd, idx) => (
                            <div key={cmd.id} className="block-wrapper">
                                {dropIndex === idx && (
                                    <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl h-12 mb-2 flex items-center justify-center animate-pulse transition-all">
                                        <span className="text-blue-500 font-bold text-xs tracking-widest">+ SNAP HERE</span>
                                    </div>
                                )}
                                <Block block={cmd} index={idx} mode={mode} onUpdate={handleUpdateBlock} onDelete={handleDeleteBlock} onDuplicate={handleDuplicateBlock} isDraggable={!isPlaying} onDragStart={(e) => { props.setDraggedBlockId(cmd.id); e.dataTransfer.effectAllowed = 'move'; const img = new Image(); img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; e.dataTransfer.setDragImage(img, 0, 0); }} isActive={false} onContextMenu={(e, id) => setContextMenu({ x: e.clientX, y: e.clientY, blockId: id })} />
                            </div>
                            ))}
                            {dropIndex === commands.length && (
                                <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl h-12 mb-2 flex items-center justify-center animate-pulse transition-all">
                                    <span className="text-blue-500 font-bold text-xs tracking-widest">+ SNAP HERE</span>
                                </div>
                            )}
                            <div className="h-40" />
                        </div>
                    </div>
                </ErrorBoundary>
                </div>

                <div key={`stage-${mode}`} className="bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col relative z-20 shrink-0 min-h-0 animate-in fade-in slide-in-from-right-4 duration-500" style={{ width: isMobile ? '100%' : rightPanelWidth }}>
                    <div className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-violet-500 bg-slate-300 transition-colors z-50 hidden lg:flex items-center justify-center opacity-40 hover:opacity-100" onMouseDown={handleMouseDownRight}>
                        <div className="w-0.5 h-8 bg-current rounded-full" />
                    </div>
                    <div className="flex-1 p-4 bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative min-h-[300px]">
                        <ErrorBoundary>
                            {is3DMode && mode === AppMode.GAME ? (
                                <React.Suspense fallback={<div className="flex items-center justify-center h-full bg-slate-900"><span className="text-white">Loading 3D...</span></div>}>
                                    <Stage3D
                                        ref={stageRef as unknown as React.RefObject<Stage3DHandle>}
                                        spriteState={spriteState}
                                        spriteStateRef={spriteStateRef}
                                        isExecuting={isPlaying}
                                        shakeAmount={shakeAmount}
                                        gameCanvasSize={gameCanvasSize}
                                        onInput={() => { }}
                                    />
                                </React.Suspense>
                            ) : (
                                <Stage
                                    ref={stageRef}
                                    mode={mode}
                                    hardwareState={hardwareState}
                                    hardwareStateRef={hardwareStateRef}
                                    spriteState={spriteState}
                                    spriteStateRef={spriteStateRef}
                                    appState={appState}
                                    canvasRef={canvasRef}
                                    circuitComponents={circuitComponents}
                                    onCircuitUpdate={setCircuitComponents}
                                    pcbColor={pcbColor}
                                    setPcbColor={setPcbColor}
                                    isExecuting={isPlaying}
                                    onNavigate={handleNavigate}
                                    highlightPin={highlightedPin}
                                    inputState={null}
                                    onInput={() => { }}
                                    onHardwareInput={handleHardwareInput}
                                    onUpdateSpriteState={updateSpriteState}
                                    shakeAmount={shakeAmount}
                                    onAppInteraction={handleAppInteraction}
                                    onTick={advancedPhysics && matterTick ? matterTick : tick}
                                    wires={wires}
                                    onWiresUpdate={setWires}
                                />
                            )}
                        </ErrorBoundary>
                    </div>
                </div>
            </div>

            {showConsole && (
                <ErrorBoundary>
                    <div className="h-40 bg-slate-900 text-slate-300 font-mono text-xs overflow-y-auto p-2 border-t border-slate-700 shrink-0">
                        <div className="flex justify-between items-center mb-1 text-slate-500 text-[10px] uppercase font-bold sticky top-0 bg-slate-900">
                            <span>Console Output</span>
                            <button onClick={clearLogs} className="hover:text-white" aria-label="Clear console logs">Clear</button>
                        </div>
                        {consoleLogs.map((log, i) => <div key={i} className="border-b border-white/5 py-0.5">{log}</div>)}
                    </div>
                </ErrorBoundary>
            )}
        </>
    );
});

EditorLayout.displayName = 'EditorLayout';
export default EditorLayout;
