/**
 * IR Module — Intermediate Representation for KidCode Studio
 * 
 * Exports the typed IR nodes, converter, interpreter, and code generator.
 * 
 * Usage:
 *   import { commandBlockToIR, executeIRNode, generateCodeFromIR } from './ir';
 * 
 * The IR sits between:
 *   Blocks (CommandBlock[]) → IR (IRNode[]) → [Interpreter] + [CodeGenerator]
 */

export type {
  IRNode,
  // Movement
  MoveXNode, MoveYNode, SetVelocityXNode, SetVelocityYNode,
  SetGravityNode, SetFrictionNode, SetBouncinessNode, JumpNode,
  // Appearance
  SetEmojiNode, SetSizeNode, SetOpacityNode, SayNode, ThinkNode, ShowNode, HideNode,
  // Spawning
  SpawnEnemyNode, SpawnItemNode, SpawnParticlesNode,
  // Game State
  ChangeScoreNode, SetScoreNode, ChangeHealthNode, SetHealthNode, GameOverNode, WinGameNode,
  // Camera
  SetCameraNode, ShakeScreenNode,
  // Audio
  PlaySoundNode, SetBGMNode, StopMusicNode,
  // Inventory
  AddToInventoryNode, RemoveFromInventoryNode,
  // Cutscene
  TriggerCutsceneNode, FadeInNode, FadeOutNode,
  // Boss
  SpawnBossNode, SetBossHealthNode, BossAttackNode, BossPhaseNode,
  // Advanced Movement
  DashNode, DoubleJumpNode, WallJumpNode, GrappleNode,
  // Checkpoints
  CreateCheckpointNode, LoadCheckpointNode,
  // Dialogue
  CreateDialogueNode, EndDialogueNode, NPCTalkNode,
  // Game Objects
  ShootNode, AddPlatformNode, CreateCloneNode, DeleteCloneNode,
  // Weather
  SetWeatherNode,
  // Sports
  KickBallNode, PassBallNode, DribbleNode, ShootBallNode,
  SetTimerNode, TickTimerNode, StopTimerNode, ScoreGoalNode,
  AddPeriodNode, EndPeriodNode, SpawnBallNode, SpawnTeammateNode,
  SpawnOpponentNode, SwitchControlNode, SetFormationNode,
  FoulNode, YellowCardNode, RedCardNode,
  // Advanced Sports
  CryFoulNode, CelebrateGoalNode, SubstitutionNode, ExtraTimeNode,
  PenaltyKickNode, CornerKickNode, FreeKickNode, InjuryTimeNode,
  WaterBreakNode, TeamTalkNode, SetPieceNode, ManMarkNode,
  // Action
  SwingWeaponNode, ComboAttackNode, DodgeRollNode, BlockAttackNode,
  SpecialMoveNode, SwitchWeaponNode, ChargeAttackNode,
  // Adventure
  ExamineNode, UseItemNode, CombineItemsNode, TalkToNode,
  AddQuestNode, CompleteQuestNode, DiscoverNode, TriggerPuzzleNode,
  // Shooter
  ReloadNode, ThrowGrenadeNode, TakeCoverNode, AimNode,
  SwapWeaponNode, DropWeaponNode, PickupWeaponNode,
  // Survival
  GatherNode, CraftNode, EatNode, DrinkNode, BuildNode, PlaceTorchNode, ShelterNode,
  // Puzzle
  SwapTilesNode, RotateBlockNode, SlidePuzzleNode, FillColorNode,
  ConnectDotsNode, SortItemsNode, UnlockPatternNode, MirrorPuzzleNode,
  FlipCardNode, CheckMatchNode,
  // Racing
  BoostNode, DriftNode, LapCompleteNode, StartRaceNode,
  SetCheckpointNode, UpgradeCarNode, PitStopNode, UseBoostPadNode,
  // Save/Load
  SaveGameNode, LoadGameNode,
  // Data
  SetVarNode, ChangeVarNode,
  // Movement Extras
  GoToXYNode, TurnRightNode, TurnLeftNode,
  // 3D
  MoveZNode, RotateXNode, RotateYNode, RotateZNode,
  // Advanced Platformer Extras
  WallJumpEnabledNode, CeilingClingNode, AirDashNode, GroundSlamNode,
  // Misc
  SetSceneNode, PlayAnimationNode, BroadcastNode, LogDataNode, WaitNode,
  ClimbVineNode, SwingRopeNode,
} from './types';
export { commandBlockToIR } from './types';
export { executeIRNode } from './interpreter';
export type { ExecutionContext } from './context';
export { generateCodeFromIR } from './codegen';
export { validateIRNode, validateIRProgram, hasErrors, getErrors, getWarnings } from './validator';
export type { ValidationError, ValidationContext } from './validator';
export { createUndoRedoState, captureState, pushDelta, undo, redo, canUndo, canRedo, getHistoryInfo, clearHistory, saveHistory, loadHistory } from './undoRedo';
export type { UndoDelta, UndoRedoState } from './undoRedo';
export { IRProfiler } from './profiler';
export type { ProfileEntry } from './profiler';
export { optimizeIR, formatOptimizationStats } from './optimizer';
export type { OptimizationResult } from './optimizer';
export { IRDebugger } from './debugger';
export type { DebugInfo } from './debugger';
export { exportToGodot, generateGDScriptFromIR, generateGodotProject } from './exporters/godotExporter';
export type { GodotExportResult } from './exporters/godotExporter';
export { exportToReactNative, generateReactNativeComponent } from './exporters/reactNativeExporter';
export type { ReactNativeExportResult } from './exporters/reactNativeExporter';
export { validateForExport } from './exporters/validation';
export type { ExportValidationResult } from './exporters/validation';
