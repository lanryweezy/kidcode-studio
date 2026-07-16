import React, { Suspense, useCallback } from 'react';
import { Zap } from 'lucide-react';
import HomeScreen from './components/HomeScreen';
import LandingPage from './components/LandingPage';
import GalleryPage from './components/GalleryPage';
import { useStore } from './store/useStore';
import { useEditorController } from './hooks/useEditorController';
import { ShortcutsOverlay } from './components/ui/ShortcutsOverlay';
import { ToastProvider } from './components/ToastProvider';
import MatterPhysicsBridge from './components/MatterPhysicsBridge';
import ContextMenu from './components/ContextMenu';
import EditorLayout from './components/editor/EditorLayout';
import EditorModals from './components/editor/EditorModals';
import TycoonOverlay from './components/editor/TycoonOverlay';

const MatterPhysicsLazy = React.lazy(() => import('./components/MatterPhysicsBridge'));

export const App: React.FC = () => {
    const {
        showLanding, showHome, showGallery, hackerMode,
        showShortcuts, setShowShortcuts, advancedPhysics,
        spriteState, advancedPhysics: advPhysics, highContrast,
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
        <ToastProvider>
        <div className={`h-[100dvh] h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-800 ${hackerMode ? 'hacker-mode' : ''} ${highContrast ? 'high-contrast' : ''}`}>
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
            <Suspense fallback={
                <div className="h-[100dvh] h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-glow animate-float">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: '60%', animation: 'shimmer 1.5s infinite' }} />
                        </div>
                        <p className="text-sm text-slate-500 font-bold">Loading KidCode Studio...</p>
                    </div>
                </div>
            }>
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
                <div className={`fade-enter ${viewVisible ? 'fade-enter-active' : ''}`}>
                    {showLanding ? (
                        <LandingPage />
                    ) : showGallery ? (
                        <GalleryPage onBack={handleGalleryBack} />
                    ) : showHome ? (
                        <HomeScreen />
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
        </ToastProvider>
    );
};
export default App;
