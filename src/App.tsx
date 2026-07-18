import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const FUN_LOADING_MESSAGES = [
    'Warming up the pixels...',
    'Teaching blocks to stack...',
    'Greasing the gears...',
    'Fetching the fun stuff...',
    'Loading creativity modules...',
    'Assembling the magic...',
    'Waking up the sprites...',
    'Compiling imagination...',
    'Charging the battery...',
    'Polishing the UI...',
    'Feeding the code hamsters...',
    'Downloading more RAM... just kidding!',
    'Calibrating the awesome-meter...',
    'Assembling pixel rockets...',
    'Teaching robots to dance...',
    'Warming up the laser cannons...',
    'Polishing the pixel stars...',
    'Loading epic adventure mode...',
    'Syncing the fun frequencies...',
    'Revving up the creativity engine...',
];
import HomeScreen from './components/HomeScreen';
import LandingPage from './components/LandingPage';
import GalleryPage from './components/GalleryPage';
import { useStore } from './store/useStore';
import { AppMode } from './types';
import { useEditorController } from './hooks/useEditorController';
import { ShortcutsOverlay } from './components/ui/ShortcutsOverlay';
import { ToastProvider } from './components/ui/Toast';
import MatterPhysicsBridge from './components/MatterPhysicsBridge';
import ContextMenu from './components/ContextMenu';
import EditorLayout from './components/editor/EditorLayout';
import EditorModals from './components/editor/EditorModals';
import TycoonOverlay from './components/editor/TycoonOverlay';
const CADLayout = React.lazy(() => import('./components/cad/CADLayout'));

const MatterPhysicsLazy = React.lazy(() => import('./components/MatterPhysicsBridge'));

const LoadingScreen: React.FC = () => {
    const [msgIdx, setMsgIdx] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setMsgIdx(i => (i + 1) % FUN_LOADING_MESSAGES.length), 2200);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="h-[100dvh] h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-glow animate-float">
                <Zap size={32} fill="currentColor" />
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full progress-fill" style={{ width: '60%', animation: 'shimmer 1.5s infinite' }} />
                </div>
                <p className="text-sm text-slate-500 font-bold transition-opacity duration-300">{FUN_LOADING_MESSAGES[msgIdx]}</p>
            </div>
        </div>
    );
};

// Inner component that runs INSIDE ToastProvider
const AppInner: React.FC = () => {
    const {
        showLanding, showHome, showGallery, hackerMode,
        showShortcuts, setShowShortcuts, advancedPhysics,
        spriteState, advancedPhysics: advPhysics, highContrast,
        mode, showHome: showHomeState,
    } = useStore();

    const controller = useEditorController();
    const {
        viewVisible,
        contextMenu, setContextMenu,
        handleDuplicateBlock, handleDeleteBlock,
        showShortcuts: showShortcutsLocal,
        setShowShortcuts: setShowShortcutsLocal,
        spriteState: spriteStateFromController,
        adaptedSetSpriteState,
        spriteStateRef,
        gameCanvasSizeRef,
        isPlaying,
        matterTick, setMatterTick,
    } = controller;

    const handleGalleryBack = useCallback(() => {
        useStore.getState().setShowGallery(false);
    }, []);

    const handleShortcutsClose = useCallback(() => {
        setShowShortcuts(false);
        setShowShortcutsLocal(false);
    }, [setShowShortcuts, setShowShortcutsLocal]);

    const handleContextMenuClose = useCallback(() => {
        setContextMenu(null);
    }, [setContextMenu]);

    const handleContextMenuDuplicate = useCallback(() => {
        if (contextMenu) {
            handleDuplicateBlock(contextMenu.blockId);
            setContextMenu(null);
        }
    }, [contextMenu, handleDuplicateBlock, setContextMenu]);

    const handleContextMenuDelete = useCallback(() => {
        if (contextMenu) {
            handleDeleteBlock(contextMenu.blockId);
            setContextMenu(null);
        }
    }, [contextMenu, handleDeleteBlock, setContextMenu]);

    return (
        <div className={`h-[100dvh] h-screen flex flex-col bg-slate-50 text-slate-800 noise-overlay ${hackerMode ? 'hacker-mode' : ''} ${highContrast ? 'high-contrast' : ''}`}>
            <a href="#block-workspace" className="skip-nav">
                Skip to block workspace
            </a>
            <a href="#game-canvas" className="skip-nav">
                Skip to game canvas
            </a>
            <a href="#sidebar" className="skip-nav">
                Skip to sidebar
            </a>
            {hackerMode && <div className="hacker-scanline" />}
            <Suspense fallback={<LoadingScreen />}>
                {advancedPhysics && (
                    <React.Suspense fallback={null}>
                        <MatterPhysicsBridge
                            spriteState={spriteStateFromController}
                            setSpriteState={adaptedSetSpriteState}
                            spriteStateRef={spriteStateRef}
                            gameCanvasSizeRef={gameCanvasSizeRef}
                            isExecuting={isPlaying}
                            onTick={(t: () => void) => setMatterTick(() => t)}
                        />
                    </React.Suspense>
                )}
                <div className={`flex-1 min-h-0 fade-enter ${viewVisible ? 'fade-enter-active' : ''}`}>
                    {showLanding ? (
                        <LandingPage />
                    ) : showGallery ? (
                        <GalleryPage onBack={handleGalleryBack} />
                    ) : showHome ? (
                        <HomeScreen />
                    ) : mode === AppMode.CAD ? (
                        <React.Suspense fallback={<LoadingScreen />}>
                            <CADLayout onBack={() => useStore.getState().setShowHome(true)} />
                        </React.Suspense>
                    ) : (
                        <EditorLayout {...controller} />
                    )}
                </div>

                <EditorModals {...controller} />
                <TycoonOverlay activeTycoonGame={controller.activeTycoonGame} setActiveTycoonGame={controller.setActiveTycoonGame} />
            </Suspense>

            {(showShortcuts || showShortcutsLocal) && <ShortcutsOverlay onClose={handleShortcutsClose} />}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={handleContextMenuClose}
                    onDuplicate={handleContextMenuDuplicate}
                    onDelete={handleContextMenuDelete}
                />
            )}
        </div>
    );
};

// Outer shell — wraps with ToastProvider
export const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppInner />
        </ToastProvider>
    );
};

export default App;
// force rebuild
