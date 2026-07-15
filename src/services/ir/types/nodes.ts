/**
 * KidCode Studio — Intermediate Representation (IR)
 *
 * Typed IR nodes that both the interpreter and code generator consume.
 * This is the single source of truth for what a command block MEANS.
 *
 * Design: Each IR node is a discriminated union (tagged by `kind`).
 * No `Record<string, unknown>` — every field is typed.
 *
 * The IR sits between:
 *   Blocks (CommandBlock[]) → IR (IRNode[]) → [Interpreter] + [CodeGenerator]
 */

// === Movement (8) ===

export interface MoveXNode {
  kind: 'move_x';
  entityId: string;
  dx: number;
}

export interface MoveYNode {
  kind: 'move_y';
  entityId: string;
  dy: number;
}

export interface SetVelocityXNode {
  kind: 'set_velocity_x';
  entityId: string;
  vx: number;
}

export interface SetVelocityYNode {
  kind: 'set_velocity_y';
  entityId: string;
  vy: number;
}

export interface SetGravityNode {
  kind: 'set_gravity';
  entityId: string;
  enabled: boolean;
}

export interface SetFrictionNode {
  kind: 'set_friction';
  entityId: string;
  value: number;
}

export interface SetBouncinessNode {
  kind: 'set_bounciness';
  entityId: string;
  value: number;
}

export interface JumpNode {
  kind: 'jump';
  entityId: string;
  force: number;
}

// === Appearance (7) ===

export interface SetEmojiNode {
  kind: 'set_emoji';
  entityId: string;
  emoji: string;
}

export interface SetSizeNode {
  kind: 'set_size';
  entityId: string;
  scale: number;
}

export interface SetOpacityNode {
  kind: 'set_opacity';
  entityId: string;
  opacity: number;
}

export interface SayNode {
  kind: 'say';
  entityId: string;
  text: string;
}

export interface ThinkNode {
  kind: 'think';
  entityId: string;
  text: string;
}

export interface ShowNode {
  kind: 'show';
  entityId: string;
}

export interface HideNode {
  kind: 'hide';
  entityId: string;
}

// === Spawning (3) ===

export interface SpawnEnemyNode {
  kind: 'spawn_enemy';
  emoji: string;
  x?: number;
  y?: number;
}

export interface SpawnItemNode {
  kind: 'spawn_item';
  emoji: string;
  x?: number;
  y?: number;
}

export interface SpawnParticlesNode {
  kind: 'spawn_particles';
  count: number;
}

// === Game State (6) ===

export interface ChangeScoreNode {
  kind: 'change_score';
  delta: number;
}

export interface SetScoreNode {
  kind: 'set_score';
  value: number;
}

export interface ChangeHealthNode {
  kind: 'change_health';
  delta: number;
}

export interface SetHealthNode {
  kind: 'set_health';
  value: number;
}

export interface GameOverNode {
  kind: 'game_over';
}

export interface WinGameNode {
  kind: 'win_game';
}

// === Camera (2) ===

export interface SetCameraNode {
  kind: 'set_camera';
  follow: boolean;
}

export interface ShakeScreenNode {
  kind: 'shake_screen';
  intensity: number;
}

// === Audio (3) ===

export interface PlaySoundNode {
  kind: 'play_sound';
  sound: string;
}

export interface SetBGMNode {
  kind: 'set_bgm';
  track: string;
}

export interface StopMusicNode {
  kind: 'stop_music';
}

// === Inventory (2) ===

export interface AddToInventoryNode {
  kind: 'add_to_inventory';
  item: string;
  quantity: number;
}

export interface RemoveFromInventoryNode {
  kind: 'remove_from_inventory';
  item: string;
  quantity: number;
}

// === Cutscene (3) ===

export interface TriggerCutsceneNode {
  kind: 'trigger_cutscene';
  name: string;
}

export interface FadeInNode {
  kind: 'fade_in';
  duration: number;
}

export interface FadeOutNode {
  kind: 'fade_out';
  duration: number;
}

// === Boss (4) ===

export interface SpawnBossNode {
  kind: 'spawn_boss';
  name: string;
  health: number;
}

export interface SetBossHealthNode {
  kind: 'set_boss_health';
  health: number;
}

export interface BossAttackNode {
  kind: 'boss_attack';
  pattern: string;
}

export interface BossPhaseNode {
  kind: 'boss_phase';
  phase: number;
}

// === Advanced Movement (4) ===

export interface DashNode {
  kind: 'dash';
  force: number;
}

export interface DoubleJumpNode {
  kind: 'double_jump';
  enabled: boolean;
}

export interface WallJumpNode {
  kind: 'wall_jump';
  enabled: boolean;
}

export interface GrappleNode {
  kind: 'grapple';
  force: number;
}

// === Checkpoints (2) ===

export interface CreateCheckpointNode {
  kind: 'create_checkpoint';
  name: string;
}

export interface LoadCheckpointNode {
  kind: 'load_checkpoint';
}

// === Dialogue (3) ===

export interface CreateDialogueNode {
  kind: 'create_dialogue';
  speaker: string;
  message: string;
}

export interface EndDialogueNode {
  kind: 'end_dialogue';
}

export interface NPCTalkNode {
  kind: 'npc_talk';
  name: string;
  message: string;
}

// === Game Objects (4) ===

export interface ShootNode {
  kind: 'shoot';
  emoji: string;
}

export interface AddPlatformNode {
  kind: 'add_platform';
  x: number;
  y: number;
  width: number;
}

export interface CreateCloneNode {
  kind: 'create_clone';
}

export interface DeleteCloneNode {
  kind: 'delete_clone';
}

// === Weather (1) ===

export interface SetWeatherNode {
  kind: 'set_weather';
  weather: string;
}

// === Sports (18) ===

export interface KickBallNode {
  kind: 'kick_ball';
  emoji: string;
  force: number;
}

export interface PassBallNode {
  kind: 'pass_ball';
  target: string;
}

export interface DribbleNode {
  kind: 'dribble';
  speed: number;
}

export interface ShootBallNode {
  kind: 'shoot_ball';
  emoji: string;
  force: number;
}

export interface SetTimerNode {
  kind: 'set_timer';
  seconds: number;
}

export interface TickTimerNode {
  kind: 'tick_timer';
}

export interface StopTimerNode {
  kind: 'stop_timer';
}

export interface ScoreGoalNode {
  kind: 'score_goal';
  points: number;
}

export interface AddPeriodNode {
  kind: 'add_period';
  name: string;
}

export interface EndPeriodNode {
  kind: 'end_period';
}

export interface SpawnBallNode {
  kind: 'spawn_ball';
  emoji: string;
}

export interface SpawnTeammateNode {
  kind: 'spawn_teammate';
  emoji: string;
}

export interface SpawnOpponentNode {
  kind: 'spawn_opponent';
  emoji: string;
}

export interface SwitchControlNode {
  kind: 'switch_control';
}

export interface SetFormationNode {
  kind: 'set_formation';
  formation: string;
}

export interface FoulNode {
  kind: 'foul';
  type: string;
}

export interface YellowCardNode {
  kind: 'yellow_card';
}

export interface RedCardNode {
  kind: 'red_card';
}

// === Advanced Sports (12) ===

export interface CryFoulNode {
  kind: 'cry_foul';
  text: string;
}

export interface CelebrateGoalNode {
  kind: 'celebrate_goal';
  text: string;
}

export interface SubstitutionNode {
  kind: 'substitution';
  player: string;
}

export interface ExtraTimeNode {
  kind: 'extra_time';
  seconds: number;
}

export interface PenaltyKickNode {
  kind: 'penalty_kick';
  force: number;
}

export interface CornerKickNode {
  kind: 'corner_kick';
}

export interface FreeKickNode {
  kind: 'free_kick';
  force: number;
}

export interface InjuryTimeNode {
  kind: 'injury_time';
  seconds: number;
}

export interface WaterBreakNode {
  kind: 'water_break';
}

export interface TeamTalkNode {
  kind: 'team_talk';
  message: string;
}

export interface SetPieceNode {
  kind: 'set_piece';
  type: string;
}

export interface ManMarkNode {
  kind: 'man_mark';
}

// === Action (7) ===

export interface SwingWeaponNode {
  kind: 'swing_weapon';
  weapon: string;
  damage: number;
}

export interface ComboAttackNode {
  kind: 'combo_attack';
  hits: number;
}

export interface DodgeRollNode {
  kind: 'dodge_roll';
  distance: number;
}

export interface BlockAttackNode {
  kind: 'block_attack';
}

export interface SpecialMoveNode {
  kind: 'special_move';
  name: string;
  damage: number;
}

export interface SwitchWeaponNode {
  kind: 'switch_weapon';
  weapon: string;
}

export interface ChargeAttackNode {
  kind: 'charge_attack';
  damage: number;
}

// === Adventure (8) ===

export interface ExamineNode {
  kind: 'examine';
  target: string;
}

export interface UseItemNode {
  kind: 'use_item';
  item: string;
}

export interface CombineItemsNode {
  kind: 'combine_items';
  item1: string;
  item2: string;
}

export interface TalkToNode {
  kind: 'talk_to';
  npc: string;
}

export interface AddQuestNode {
  kind: 'add_quest';
  name: string;
}

export interface CompleteQuestNode {
  kind: 'complete_quest';
  name: string;
}

export interface DiscoverNode {
  kind: 'discover';
  location: string;
}

export interface TriggerPuzzleNode {
  kind: 'trigger_puzzle';
  type: string;
}

// === Shooter (7) ===

export interface ReloadNode {
  kind: 'reload';
}

export interface ThrowGrenadeNode {
  kind: 'throw_grenade';
  force: number;
}

export interface TakeCoverNode {
  kind: 'take_cover';
}

export interface AimNode {
  kind: 'aim';
  zoom: number;
}

export interface SwapWeaponNode {
  kind: 'swap_weapon';
  weapon: string;
}

export interface DropWeaponNode {
  kind: 'drop_weapon';
}

export interface PickupWeaponNode {
  kind: 'pickup_weapon';
  weapon: string;
}

// === Survival (7) ===

export interface GatherNode {
  kind: 'gather';
  resource: string;
  amount: number;
}

export interface CraftNode {
  kind: 'craft';
  item: string;
  cost: number;
}

export interface EatNode {
  kind: 'eat';
  amount: number;
}

export interface DrinkNode {
  kind: 'drink';
  amount: number;
}

export interface BuildNode {
  kind: 'build';
  structure: string;
  cost: number;
}

export interface PlaceTorchNode {
  kind: 'place_torch';
}

export interface ShelterNode {
  kind: 'shelter';
  level: number;
}

// === Puzzle (10) ===

export interface SwapTilesNode {
  kind: 'swap_tiles';
}

export interface RotateBlockNode {
  kind: 'rotate_block';
  degrees: number;
}

export interface SlidePuzzleNode {
  kind: 'slide_puzzle';
  direction: string;
}

export interface FillColorNode {
  kind: 'fill_color';
  color: string;
}

export interface ConnectDotsNode {
  kind: 'connect_dots';
  pairs: number;
}

export interface SortItemsNode {
  kind: 'sort_items';
  by: string;
}

export interface UnlockPatternNode {
  kind: 'unlock_pattern';
  pattern: string;
}

export interface MirrorPuzzleNode {
  kind: 'mirror_puzzle';
  axis: string;
}

export interface FlipCardNode {
  kind: 'flip_card';
}

export interface CheckMatchNode {
  kind: 'check_match';
}

// === Racing (8) ===

export interface BoostNode {
  kind: 'boost';
  force: number;
}

export interface DriftNode {
  kind: 'drift';
  angle: number;
}

export interface LapCompleteNode {
  kind: 'lap_complete';
}

export interface StartRaceNode {
  kind: 'start_race';
  countdown: number;
}

export interface SetCheckpointNode {
  kind: 'set_checkpoint';
}

export interface UpgradeCarNode {
  kind: 'upgrade_car';
  stat: string;
  amount: number;
}

export interface PitStopNode {
  kind: 'pit_stop';
}

export interface UseBoostPadNode {
  kind: 'use_boost_pad';
}

// === Save/Load (2) ===

export interface SaveGameNode {
  kind: 'save_game';
  slot: string;
}

export interface LoadGameNode {
  kind: 'load_game';
  slot: string;
}

// === Data (2) ===

export interface SetVarNode {
  kind: 'set_var';
  varName: string;
  value: number | string | boolean | null;
}

export interface ChangeVarNode {
  kind: 'change_var';
  varName: string;
  delta: number;
}

// === Movement Extras (3) ===

export interface GoToXYNode {
  kind: 'go_to_xy';
  x: number;
  y: number;
}

export interface TurnRightNode {
  kind: 'turn_right';
  degrees: number;
}

export interface TurnLeftNode {
  kind: 'turn_left';
  degrees: number;
}

// === 3D (4) ===

export interface MoveZNode {
  kind: 'move_z';
  dz: number;
}

export interface RotateXNode {
  kind: 'rotate_x';
  degrees: number;
}

export interface RotateYNode {
  kind: 'rotate_y';
  degrees: number;
}

export interface RotateZNode {
  kind: 'rotate_z';
  degrees: number;
}

// === Advanced Platformer Extras (4) ===

export interface WallJumpEnabledNode {
  kind: 'wall_jump_enabled';
  enabled: boolean;
}

export interface CeilingClingNode {
  kind: 'ceiling_cling';
}

export interface AirDashNode {
  kind: 'air_dash';
  force: number;
}

export interface GroundSlamNode {
  kind: 'ground_slam';
  force: number;
}

// === Misc (7) ===

export interface SetSceneNode {
  kind: 'set_scene';
  scene: string;
}

export interface SetMusicVolumeNode {
  kind: 'set_music_volume';
  volume: number;
}

export interface PlayAmbientNode {
  kind: 'play_ambient';
  preset: string;
}

export interface SlowMotionNode {
  kind: 'slow_motion';
  timeScale: number;
}

export interface PlayAnimationNode {
  kind: 'play_animation';
  animation: string;
}

export interface BroadcastNode {
  kind: 'broadcast';
  channel: string;
}

export interface LogDataNode {
  kind: 'log_data';
  text: string;
}

export interface WaitNode {
  kind: 'wait';
  seconds: number;
}

export interface ClimbVineNode {
  kind: 'climb_vine';
  force: number;
}

export interface SwingRopeNode {
  kind: 'swing_rope';
  force: number;
}

// === Union ===

export type IRNode =
  // Movement
  | MoveXNode
  | MoveYNode
  | SetVelocityXNode
  | SetVelocityYNode
  | SetGravityNode
  | SetFrictionNode
  | SetBouncinessNode
  | JumpNode
  // Appearance
  | SetEmojiNode
  | SetSizeNode
  | SetOpacityNode
  | SayNode
  | ThinkNode
  | ShowNode
  | HideNode
  // Spawning
  | SpawnEnemyNode
  | SpawnItemNode
  | SpawnParticlesNode
  // Game State
  | ChangeScoreNode
  | SetScoreNode
  | ChangeHealthNode
  | SetHealthNode
  | GameOverNode
  | WinGameNode
  // Camera
  | SetCameraNode
  | ShakeScreenNode
  // Audio
  | PlaySoundNode
  | SetBGMNode
  | StopMusicNode
  // Inventory
  | AddToInventoryNode
  | RemoveFromInventoryNode
  // Cutscene
  | TriggerCutsceneNode
  | FadeInNode
  | FadeOutNode
  // Boss
  | SpawnBossNode
  | SetBossHealthNode
  | BossAttackNode
  | BossPhaseNode
  // Advanced Movement
  | DashNode
  | DoubleJumpNode
  | WallJumpNode
  | GrappleNode
  // Checkpoints
  | CreateCheckpointNode
  | LoadCheckpointNode
  // Dialogue
  | CreateDialogueNode
  | EndDialogueNode
  | NPCTalkNode
  // Game Objects
  | ShootNode
  | AddPlatformNode
  | CreateCloneNode
  | DeleteCloneNode
  // Weather
  | SetWeatherNode
  // Sports
  | KickBallNode
  | PassBallNode
  | DribbleNode
  | ShootBallNode
  | SetTimerNode
  | TickTimerNode
  | StopTimerNode
  | ScoreGoalNode
  | AddPeriodNode
  | EndPeriodNode
  | SpawnBallNode
  | SpawnTeammateNode
  | SpawnOpponentNode
  | SwitchControlNode
  | SetFormationNode
  | FoulNode
  | YellowCardNode
  | RedCardNode
  // Advanced Sports
  | CryFoulNode
  | CelebrateGoalNode
  | SubstitutionNode
  | ExtraTimeNode
  | PenaltyKickNode
  | CornerKickNode
  | FreeKickNode
  | InjuryTimeNode
  | WaterBreakNode
  | TeamTalkNode
  | SetPieceNode
  | ManMarkNode
  // Action
  | SwingWeaponNode
  | ComboAttackNode
  | DodgeRollNode
  | BlockAttackNode
  | SpecialMoveNode
  | SwitchWeaponNode
  | ChargeAttackNode
  // Adventure
  | ExamineNode
  | UseItemNode
  | CombineItemsNode
  | TalkToNode
  | AddQuestNode
  | CompleteQuestNode
  | DiscoverNode
  | TriggerPuzzleNode
  // Shooter
  | ReloadNode
  | ThrowGrenadeNode
  | TakeCoverNode
  | AimNode
  | SwapWeaponNode
  | DropWeaponNode
  | PickupWeaponNode
  // Survival
  | GatherNode
  | CraftNode
  | EatNode
  | DrinkNode
  | BuildNode
  | PlaceTorchNode
  | ShelterNode
  // Puzzle
  | SwapTilesNode
  | RotateBlockNode
  | SlidePuzzleNode
  | FillColorNode
  | ConnectDotsNode
  | SortItemsNode
  | UnlockPatternNode
  | MirrorPuzzleNode
  | FlipCardNode
  | CheckMatchNode
  // Racing
  | BoostNode
  | DriftNode
  | LapCompleteNode
  | StartRaceNode
  | SetCheckpointNode
  | UpgradeCarNode
  | PitStopNode
  | UseBoostPadNode
  // Save/Load
  | SaveGameNode
  | LoadGameNode
  // Data
  | SetVarNode
  | ChangeVarNode
  // Movement Extras
  | GoToXYNode
  | TurnRightNode
  | TurnLeftNode
  // 3D
  | MoveZNode
  | RotateXNode
  | RotateYNode
  | RotateZNode
  // Advanced Platformer Extras
  | WallJumpEnabledNode
  | CeilingClingNode
  | AirDashNode
  | GroundSlamNode
  // Misc
  | SetSceneNode
  | SetMusicVolumeNode
  | PlayAmbientNode
  | SlowMotionNode
  | PlayAnimationNode
  | BroadcastNode
  | LogDataNode
  | WaitNode
  | ClimbVineNode
  | SwingRopeNode;
