import React, { Suspense, useState, useEffect } from 'react';
import { AppMode } from '../../types';
import { X } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { SkeletonCard } from '../ui/Skeleton';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { equipItem, useItem, unlockSkill, craftItem, Equipment } from '../../services/rpgSystemsExtended';
import { getCharacterStats } from '../../services/rpgEngine';
import { playSoundEffect } from '../../services/soundService';
import { useStore } from '../../store/useStore';
import ErrorBoundary from '../ErrorBoundary';
import type { useEditorController } from '../../hooks/useEditorController';

const NPCModal = React.lazy(() => import('../NPCModal'));
const GameOverModal = React.lazy(() => import('../GameOverModal'));
const ParticleEditor = React.lazy(() => import('../ParticleEditor'));
const HelpModal = React.lazy(() => import('../HelpModal'));
const ProjectStatsModal = React.lazy(() => import('../ProjectStatsModal'));
const QuestStoryEditor = React.lazy(() => import('../game/QuestStoryEditor').then(m => ({ default: m.QuestStoryEditor })));
const PixelEditor = React.lazy(() => import('../PixelEditor'));
const SoundEditor = React.lazy(() => import('../SoundEditor'));
const VariableMonitor = React.lazy(() => import('../VariableMonitor'));
const ProfileModal = React.lazy(() => import('../EnhancedProfileModal'));
const PricingModal = React.lazy(() => import('../PricingModal'));
const MissionOverlay = React.lazy(() => import('../MissionOverlay'));
const MusicStudio = React.lazy(() => import('../MusicStudio'));
const SoundRecorder = React.lazy(() => import('../SoundRecorder'));
const CodePageManager = React.lazy(() => import('../CodePageManager'));
const AI3DCreator = React.lazy(() => import('../AI3DCreator'));
const MusicGenerator = React.lazy(() => import('../MusicGenerator'));
const SpriteExtractor = React.lazy(() => import('../SpriteExtractor'));
const AssetManagerModal = React.lazy(() => import('../AssetManagerModal'));
const TutorialLauncher = React.lazy(() => import('../TutorialSystem'));
const FirstWinCelebration = React.lazy(() => import('../FirstWinCelebration'));
const XPNotification = React.lazy(() => import('../XPNotification'));
const EquipmentPanel = React.lazy(() => import('../game/EquipmentPanel').then(m => ({ default: m.default || m.EquipmentPanel })));
const CraftingPanel = React.lazy(() => import('../game/CraftingPanel').then(m => ({ default: m.default || m.CraftingPanel })));
const SkillTreePanel = React.lazy(() => import('../game/SkillTreePanel').then(m => ({ default: m.default || m.SkillTreePanel })));
const ShopOverlay = React.lazy(() => import('../game/ShopOverlay').then(m => ({ default: m.default || m.ShopOverlay })));
const AdminPanel = React.lazy(() => import('../AdminPanel'));
const TeacherDashboard = React.lazy(() => import('../TeacherDashboard'));

type ControllerProps = ReturnType<typeof useEditorController>;

type EditorModalsProps = ControllerProps;

const EditorModals: React.FC<EditorModalsProps> = React.memo((props) => {
    const { toast } = useToast();
    const [showAdmin, setShowAdmin] = useState(false);
    const [showTeacherDashboard, setShowTeacherDashboard] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                setShowAdmin(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const {
        showProfile, setShowProfile, userProfile, setUserProfile, setProject,
        showPricing, setShowPricing, handleUpgrade,
        showPixelEditor, setShowPixelEditor, spriteState, updateSpriteState,
        showSoundEditor, setShowSoundEditor,
        showMusicStudio, setShowMusicStudio,
        showSoundRecorder, setShowSoundRecorder,
        showAssetManager, setShowAssetManager,
        showVariables, setShowVariables, mode, appState,
        showMissions, setShowMissions, activeMission,
        showFirstWinCelebration, setShowFirstWinCelebration, currentProject,
        xpNotifications, setXpNotifications,
        showCodePageManager, setShowCodePageManager, commands,
        handleScreenChange, handleCreateScreen, handleDeleteScreen,
        showAI3DCreator, setShowAI3DCreator, handle3DAssetGenerated,
        showMusicGenerator, setShowMusicGenerator,
        showSpriteExtractor, setShowSpriteExtractor,
        showTutorial, setShowTutorial,
        showSpritePrompt, setShowSpritePrompt,
        spritePromptText, setSpritePromptText,
        handleConfirmSprite, localIsGeneratingSprite,
        showStats, setShowStats,
        showQuestEditor, setShowQuestEditor,
        showEquipment, setShowEquipment,
        showCrafting, setShowCrafting,
        showSkillTree, setShowSkillTree,
        showShopOverlay, setShowShopOverlay,
    } = props;

    return (
        <>
            <ErrorBoundary>
                <Suspense fallback={
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-slate-200 rounded-full border-t-violet-500 animate-spin" />
                    </div>
                }>
                    {showProfile && <ProfileModal user={userProfile} onClose={() => setShowProfile(false)} onUpdateUser={setUserProfile} onLoadProject={(p) => setProject(p)} />}
                    {showPricing && <PricingModal currentPlan={userProfile.plan} onClose={() => setShowPricing(false)} onUpgrade={handleUpgrade} />}
                    {showPixelEditor && <PixelEditor onClose={() => setShowPixelEditor(false)} onSave={(img) => { updateSpriteState({ texture: img, emoji: '' }); setShowPixelEditor(false); }} initialTexture={spriteState.texture} />}
                    {showSoundEditor && <SoundEditor onClose={() => setShowSoundEditor(false)} />}
                    {showMusicStudio && <MusicStudio onClose={() => setShowMusicStudio(false)} />}
                    {showSoundRecorder && <SoundRecorder onClose={() => setShowSoundRecorder(false)} />}
                    {showAssetManager && <AssetManagerModal onClose={() => setShowAssetManager(false)} />}
                    {showVariables && <VariableMonitor variables={spriteState.variables} isVisible={showVariables} onClose={() => setShowVariables(false)} />}
                    {showMissions && <MissionOverlay activeMission={activeMission} mode={mode} onSelectMission={(m) => { useStore.getState().setActiveMission(m); }} onClose={() => setShowMissions(false)} />}
                    {showFirstWinCelebration && (
                        <FirstWinCelebration
                            projectName={currentProject?.name || 'Project'}
                            xpEarned={50}
                            onClose={() => setShowFirstWinCelebration(false)}
                        />
                    )}
                    {xpNotifications.map((notification, index) => (
                        <XPNotification
                            key={notification.id}
                            notification={notification}
                            onComplete={() => setXpNotifications(prev => prev.filter((_, i) => i !== index))}
                        />
                    ))}
                    {showCodePageManager && (
                        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-[100] overflow-y-auto">
                            <CodePageManager
                                commands={commands}
                                appState={appState}
                                activeScreen={appState.activeScreen}
                                onScreenChange={handleScreenChange}
                                onCreateScreen={handleCreateScreen}
                                onDeleteScreen={handleDeleteScreen}
                            />
                            <button
                                onClick={() => setShowCodePageManager(false)}
                                className="absolute top-4 right-4 p-3 bg-white hover:bg-red-500 hover:text-white rounded-full shadow-2xl transition-all z-50"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    )}
                    {showAI3DCreator && (
                        <AI3DCreator
                            onAssetGenerated={handle3DAssetGenerated}
                            onClose={() => setShowAI3DCreator(false)}
                        />
                    )}
                    {showMusicGenerator && (
                        <MusicGenerator
                            onMusicGenerated={(music) => {}}
                            onClose={() => setShowMusicGenerator(false)}
                        />
                    )}
                    {showSpriteExtractor && (
                        <SpriteExtractor
                            onSpriteExtracted={(result) => {}}
                            onClose={() => setShowSpriteExtractor(false)}
                        />
                    )}
                    {showTutorial && <TutorialLauncher onClose={() => setShowTutorial(false)} />}
                    <Modal open={showSpritePrompt} onClose={() => setShowSpritePrompt(false)} title="Generate a Sprite" size="sm">
                        <div className="space-y-4">
                            <p className="text-slate-600 text-sm">Describe what your sprite should look like!</p>
                            <input
                                type="text"
                                value={spritePromptText}
                                onChange={(e) => setSpritePromptText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSprite(); }}
                                placeholder="e.g. a blue robot with big eyes"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setShowSpritePrompt(false)}>Never mind</Button>
                                <Button variant="primary" size="sm" onClick={handleConfirmSprite} loading={localIsGeneratingSprite}>Generate</Button>
                            </div>
                        </div>
                    </Modal>
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
                <Suspense fallback={<SkeletonCard />}>
                    <NPCModal />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
                <Suspense fallback={<SkeletonCard />}>
                    <GameOverModal onRestart={() => {}} />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
                <Suspense fallback={<SkeletonCard />}>
                    <ParticleEditor />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
                <Suspense fallback={<SkeletonCard />}>
                    <HelpModal />
                </Suspense>
            </ErrorBoundary>
            {showStats && (
                <ErrorBoundary>
                    <Suspense fallback={<SkeletonCard />}>
                        <ProjectStatsModal onClose={() => setShowStats(false)} />
                    </Suspense>
                </ErrorBoundary>
            )}
            {showQuestEditor && (
                <ErrorBoundary>
                    <Suspense fallback={<SkeletonCard />}>
                        <QuestStoryEditor onClose={() => setShowQuestEditor(false)} onSave={(nodes) => { toast('success', `Quest saved with ${nodes.length} nodes!`); setShowQuestEditor(false); }} />
                    </Suspense>
                </ErrorBoundary>
            )}

            {showEquipment && (
                <ErrorBoundary>
                    <Suspense fallback={null}>
                        <EquipmentPanel
                            equipment={(spriteState.variables.equipment as Equipment) || { weapon: null, armor: null, accessory: null, cosmetic: null }}
                            inventory={spriteState.inventory}
                            stats={getCharacterStats(spriteState)}
                            onEquip={(item, slot) => {
                                updateSpriteState(equipItem(spriteState, item, slot));
                                playSoundEffect('powerup');
                            }}
                            onUnequip={(slot) => {
                                const equipment = (spriteState.variables.equipment as Equipment) || { weapon: null, armor: null, accessory: null, cosmetic: null };
                                const item = equipment[slot];
                                if (item) {
                                    updateSpriteState(equipItem(spriteState, item, slot));
                                    playSoundEffect('click');
                                }
                            }}
                            onClose={() => setShowEquipment(false)}
                        />
                    </Suspense>
                </ErrorBoundary>
            )}
            {showCrafting && (
                <ErrorBoundary>
                    <Suspense fallback={null}>
                        <CraftingPanel
                            inventory={spriteState.inventory}
                            onCraft={(recipe) => {
                                const result = craftItem(spriteState, recipe);
                                if (result.success) {
                                    updateSpriteState(result.state);
                                    playSoundEffect('powerup');
                                }
                            }}
                            onClose={() => setShowCrafting(false)}
                        />
                    </Suspense>
                </ErrorBoundary>
            )}
            {showSkillTree && (
                <ErrorBoundary>
                    <Suspense fallback={null}>
                        <SkillTreePanel
                            state={spriteState}
                            onUnlock={(skillId) => {
                                const result = unlockSkill(spriteState, skillId);
                                if (result.success) {
                                    updateSpriteState(result.state);
                                    playSoundEffect('powerup');
                                }
                            }}
                            onClose={() => setShowSkillTree(false)}
                        />
                    </Suspense>
                </ErrorBoundary>
            )}
            {showShopOverlay && (
                <ErrorBoundary>
                    <Suspense fallback={null}>
                        <ShopOverlay
                            gold={(spriteState.variables.gold as number) || 0}
                            onBuy={(itemId, price) => {
                                const result = useItem({ ...spriteState, variables: { ...spriteState.variables, gold: ((spriteState.variables.gold as number) || 0) - price } }, itemId);
                                if (result.state) {
                                    updateSpriteState(result.state);
                                    playSoundEffect('coin');
                                }
                            }}
                            onClose={() => setShowShopOverlay(false)}
                        />
                    </Suspense>
                </ErrorBoundary>
            )}
            {showAdmin && (
                <ErrorBoundary>
                    <Suspense fallback={<SkeletonCard />}>
                        <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />
                    </Suspense>
                </ErrorBoundary>
            )}
            {showTeacherDashboard && (
                <ErrorBoundary>
                    <Suspense fallback={<SkeletonCard />}>
                        <TeacherDashboard open={showTeacherDashboard} onClose={() => setShowTeacherDashboard(false)} />
                    </Suspense>
                </ErrorBoundary>
            )}
        </>
    );
});

EditorModals.displayName = 'EditorModals';
export default EditorModals;
