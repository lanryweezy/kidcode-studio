export interface GameTypeConfig {
  id: string;
  family: string;
  name: string;
  emoji: string;
  description: string;
  defaultScene: string;
  defaultPlayerEmoji: string;
  defaultEnemyEmoji: string;
  features: string[];
  sampleBlocks: string[];
}

export const GAME_FAMILIES = [
  { id: 'arcade', label: '🕹️ Arcade', color: 'from-red-500 to-pink-500', description: 'Fast, score-based games' },
  { id: 'platformer', label: '🏃 Platformers', color: 'from-orange-500 to-amber-500', description: 'Jump and run adventures' },
  { id: 'action', label: '⚔️ Action', color: 'from-red-600 to-rose-500', description: 'Combat and fighting' },
  { id: 'adventure', label: '🎭 Adventure', color: 'from-indigo-500 to-violet-500', description: 'Story and exploration' },
  { id: 'rpg', label: '🎲 RPG', color: 'from-purple-500 to-pink-500', description: 'Level up and quest' },
  { id: 'puzzle', label: '🧩 Puzzle', color: 'from-cyan-500 to-teal-500', description: 'Brain teasers' },
  { id: 'racing', label: '🚗 Racing', color: 'from-yellow-500 to-orange-500', description: 'Speed and competition' },
  { id: 'sports', label: '⚽ Sports', color: 'from-green-500 to-emerald-500', description: 'Athletic games' },
  { id: 'strategy', label: '🏰 Strategy', color: 'from-amber-600 to-yellow-500', description: 'Think and plan' },
  { id: 'horror', label: '👻 Horror', color: 'from-gray-700 to-slate-800', description: 'Scary experiences' },
  { id: 'shooter', label: '🔫 Shooter', color: 'from-red-500 to-red-700', description: 'Shoot and survive' },
  { id: 'sandbox', label: '🌍 Sandbox', color: 'from-emerald-500 to-green-600', description: 'Build anything' },
  { id: 'survival', label: '🏡 Survival', color: 'from-orange-600 to-amber-700', description: 'Stay alive' },
  { id: 'card', label: '🃏 Card Games', color: 'from-red-700 to-pink-600', description: 'Cards and strategy' },
  { id: 'casino', label: '🎰 Casino', color: 'from-yellow-600 to-amber-500', description: 'Games of chance' },
  { id: 'casual', label: '👨‍👩‍👧 Casual', color: 'from-pink-400 to-rose-400', description: 'Easy fun' },
  { id: 'educational', label: '📚 Educational', color: 'from-blue-500 to-cyan-500', description: 'Learn while playing' },
  { id: 'rhythm', label: '🎼 Rhythm', color: 'from-violet-500 to-purple-600', description: 'Music and beats' },
  { id: 'creative', label: '🎨 Creative', color: 'from-pink-500 to-fuchsia-500', description: 'Art and creation' },
  { id: 'builder', label: '🛠️ Builder', color: 'from-slate-500 to-gray-600', description: 'Construct and build' },
  { id: 'scifi', label: '🌌 Sci-Fi', color: 'from-blue-600 to-indigo-700', description: 'Future and space' },
  { id: 'fantasy', label: '🐉 Fantasy', color: 'from-purple-600 to-violet-700', description: 'Magic and myth' },
  { id: 'mystery', label: '🕵️ Mystery', color: 'from-slate-600 to-gray-700', description: 'Solve the case' },
  { id: 'life', label: '🌱 Life Sim', color: 'from-green-400 to-emerald-500', description: 'Virtual living' },
  { id: 'multiplayer', label: '🌐 Multiplayer', color: 'from-blue-500 to-purple-500', description: 'Play with others' },
  { id: 'experimental', label: '🚀 Experimental', color: 'from-cyan-600 to-blue-600', description: 'Try something new' },
];

export const GAME_TYPES: GameTypeConfig[] = [
  // ARCADE
  { id: 'space_shooter', family: 'arcade', name: 'Space Shooter', emoji: '🚀', description: 'Blast aliens in space', defaultScene: 'space', defaultPlayerEmoji: '🚀', defaultEnemyEmoji: '👾', features: ['shooting', 'waves', 'score'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'SHOOT', 'CHANGE_SCORE'] },
  { id: 'brick_breaker', family: 'arcade', name: 'Brick Breaker', emoji: '🧱', description: 'Break all the bricks', defaultScene: 'grid', defaultPlayerEmoji: '🏓', defaultEnemyEmoji: '🧱', features: ['physics', 'bounce', ' destruction'], sampleBlocks: ['SET_BOUNCINESS', 'BOUNCE_ON_EDGE', 'SPAWN_ENEMY'] },
  { id: 'snake', family: 'arcade', name: 'Snake', emoji: '🐍', description: 'Grow your snake', defaultScene: 'grid', defaultPlayerEmoji: '🐍', defaultEnemyEmoji: '🍎', features: ['grid', 'grow', 'timer'], sampleBlocks: ['FOREVER', 'CHANGE_VAR', 'SPAWN_ITEM'] },
  { id: 'pacman', family: 'arcade', name: 'Pac-Man', emoji: '👾', description: 'Eat dots, avoid ghosts', defaultScene: 'grid', defaultPlayerEmoji: '😊', defaultEnemyEmoji: '👻', features: ['maze', 'collect', 'chase'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'SPAWN_ITEM', 'CHANGE_SCORE'] },
  { id: 'asteroids', family: 'arcade', name: 'Asteroids', emoji: '☄️', description: 'Destroy asteroids', defaultScene: 'space', defaultPlayerEmoji: '🚀', defaultEnemyEmoji: '☄️', features: ['wrap', 'rotate', 'shoot'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'SHOOT', 'BOUNCE_ON_EDGE'] },
  { id: 'flappy_bird', family: 'arcade', name: 'Flappy Bird', emoji: '🐦', description: 'Flap through pipes', defaultScene: 'space', defaultPlayerEmoji: '🐦', defaultEnemyEmoji: '🟩', features: ['gravity', 'tap', 'scroll'], sampleBlocks: ['SET_GRAVITY', 'JUMP', 'SPAWN_ENEMY'] },
  { id: 'whack_a_mole', family: 'arcade', name: 'Whack-a-Mole', emoji: '🔨', description: 'Whack the moles', defaultScene: 'grid', defaultPlayerEmoji: '🔨', defaultEnemyEmoji: '🐹', features: ['timed', 'click', 'score'], sampleBlocks: ['ON_CLICK', 'CHANGE_SCORE', 'WAIT'] },
  { id: 'fruit_ninja', family: 'arcade', name: 'Fruit Ninja', emoji: '🍉', description: 'Slice fruits', defaultScene: 'grid', defaultPlayerEmoji: '⚔️', defaultEnemyEmoji: '🍉', features: ['swipe', 'slice', 'bomb'], sampleBlocks: ['FOREVER', 'SPAWN_ITEM', 'ON_COLLIDE', 'CHANGE_SCORE'] },

  // PLATFORMERS
  { id: 'mario_style', family: 'platformer', name: 'Mario-style', emoji: '🍄', description: 'Classic platformer', defaultScene: 'forest', defaultPlayerEmoji: '🧑‍🔧', defaultEnemyEmoji: '🍄', features: ['gravity', 'jump', 'coins'], sampleBlocks: ['SET_GRAVITY', 'JUMP', 'SPAWN_ENEMY', 'SPAWN_ITEM'] },
  { id: 'sonic_style', family: 'platformer', name: 'Sonic-style', emoji: '🦔', description: 'Speed through levels', defaultScene: 'forest', defaultPlayerEmoji: '🦔', defaultEnemyEmoji: '🤖', features: ['speed', 'rings', 'loops'], sampleBlocks: ['SET_GRAVITY', 'JUMP', 'DASH', 'CHANGE_SCORE'] },
  { id: 'metroidvania', family: 'platformer', name: 'Metroidvania', emoji: '🔮', description: 'Explore interconnected world', defaultScene: 'forest', defaultPlayerEmoji: '🧑‍🚀', defaultEnemyEmoji: '👽', features: ['abilities', 'doors', 'map'], sampleBlocks: ['SET_GRAVITY', 'JUMP', 'ADD_TO_INVENTORY', 'TRANSITION_TO_AREA'] },
  { id: 'endless_runner', family: 'platformer', name: 'Endless Runner', emoji: '🏃', description: 'Run forever', defaultScene: 'forest', defaultPlayerEmoji: '🏃', defaultEnemyEmoji: '🪨', features: ['auto-run', 'obstacles', 'distance'], sampleBlocks: ['FOREVER', 'MOVE_X', 'SPAWN_ENEMY', 'CHANGE_SCORE'] },
  { id: 'precision', family: 'platformer', name: 'Precision Platformer', emoji: '🎯', description: 'Pixel-perfect jumps', defaultScene: 'forest', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '💀', features: ['hard jumps', 'checkpoints', 'death'], sampleBlocks: ['SET_GRAVITY', 'JUMP', 'CREATE_CHECKPOINT', 'GAME_OVER'] },

  // ACTION
  { id: 'hack_slash', family: 'action', name: 'Hack & Slash', emoji: '⚔️', description: 'Sword combat action', defaultScene: 'forest', defaultPlayerEmoji: '⚔️', defaultEnemyEmoji: '👹', features: ['melee', 'combos', 'waves'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'ATTACK_ENEMY', 'DASH'] },
  { id: 'beat_em_up', family: 'action', name: "Beat 'Em Up", emoji: '👊', description: 'Fight through streets', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🧔', features: ['combo', 'special', 'enemies'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'ATTACK_ENEMY', 'DASH'] },
  { id: 'bullet_hell', family: 'action', name: 'Bullet Hell', emoji: '💫', description: 'Dodge everything', defaultScene: 'space', defaultPlayerEmoji: '✈️', defaultEnemyEmoji: '🔴', features: ['patterns', 'dodge', 'power'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'SPAWN_PARTICLES', 'DASH'] },
  { id: 'arena_fighter', family: 'action', name: 'Arena Fighter', emoji: '🏟️', description: 'Fight in arena', defaultScene: 'grid', defaultPlayerEmoji: '⚔️', defaultEnemyEmoji: '🗡️', features: ['arena', 'powerups', 'last standing'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'SPAWN_ITEM', 'ATTACK_ENEMY'] },

  // ADVENTURE
  { id: 'open_world', family: 'adventure', name: 'Open World', emoji: '🗺️', description: 'Explore freely', defaultScene: 'forest', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🐉', features: ['exploration', 'NPCs', 'quests'], sampleBlocks: ['SET_CAMERA', 'NPC_TALK', 'ACCEPT_QUEST', 'TRANSITION_TO_AREA'] },
  { id: 'point_click', family: 'adventure', name: 'Point & Click', emoji: '👆', description: 'Click to interact', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🔍', features: ['click', 'inventory', 'puzzles'], sampleBlocks: ['ON_CLICK', 'ADD_TO_INVENTORY', 'SAY', 'CREATE_DIALOGUE'] },
  { id: 'story_adventure', family: 'adventure', name: 'Story Adventure', emoji: '📖', description: 'Narrative-driven', defaultScene: 'forest', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '📜', features: ['dialogue', 'choices', 'story'], sampleBlocks: ['CREATE_DIALOGUE', 'TRIGGER_CUTSCENE', 'FADE_IN', 'FADE_OUT'] },

  // RPG
  { id: 'jrpg', family: 'rpg', name: 'JRPG', emoji: '⚔️', description: 'Japanese-style RPG', defaultScene: 'forest', defaultPlayerEmoji: '🧑‍🎤', defaultEnemyEmoji: '🐉', features: ['turn-based', 'party', 'spells'], sampleBlocks: ['ADD_XP', 'LEVEL_UP', 'SET_STAT', 'ATTACK_ENEMY'] },
  { id: 'action_rpg', family: 'rpg', name: 'Action RPG', emoji: '🗡️', description: 'Real-time combat RPG', defaultScene: 'forest', defaultPlayerEmoji: '⚔️', defaultEnemyEmoji: '👹', features: ['realtime', 'skills', 'loot'], sampleBlocks: ['SET_GRAVITY', 'ATTACK_ENEMY', 'DROP_LOOT', 'OPEN_SHOP'] },
  { id: 'dungeon_crawler', family: 'rpg', name: 'Dungeon Crawler', emoji: '🏰', description: 'Explore dungeons', defaultScene: 'grid', defaultPlayerEmoji: '🧑‍🎤', defaultEnemyEmoji: '💀', features: ['rooms', 'traps', 'treasure'], sampleBlocks: ['TRANSITION_TO_AREA', 'SPAWN_ENEMY', 'DROP_LOOT', 'CREATE_CHECKPOINT'] },
  { id: 'roguelike', family: 'rpg', name: 'Roguelike', emoji: '🎲', description: 'Random dungeons', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '💀', features: ['random', 'permadeath', 'items'], sampleBlocks: ['CALC_RANDOM', 'SPAWN_ENEMY', 'GAME_OVER', 'DROP_LOOT'] },
  { id: 'monster_collector', family: 'rpg', name: 'Monster Collector', emoji: '🐲', description: 'Catch them all', defaultScene: 'forest', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🐲', features: ['capture', 'evolve', 'battle'], sampleBlocks: ['SPAWN_ENEMY', 'ADD_TO_INVENTORY', 'ATTACK_ENEMY', 'LEVEL_UP'] },

  // PUZZLE
  { id: 'match_3', family: 'puzzle', name: 'Match 3', emoji: '💎', description: 'Match gems', defaultScene: 'grid', defaultPlayerEmoji: '💎', defaultEnemyEmoji: '🟣', features: ['grid', 'match', 'cascade'], sampleBlocks: ['FOREVER', 'CHANGE_VAR', 'SPAWN_PARTICLES', 'CHANGE_SCORE'] },
  { id: 'tetris', family: 'puzzle', name: 'Tetris', emoji: '🟦', description: 'Stack blocks', defaultScene: 'grid', defaultPlayerEmoji: '🟦', defaultEnemyEmoji: '🟥', features: ['grid', 'rotate', 'lines'], sampleBlocks: ['FOREVER', 'MOVE_Y', 'CHANGE_SCORE', 'SPAWN_PARTICLES'] },
  { id: 'sudoku', family: 'puzzle', name: 'Sudoku', emoji: '🔢', description: 'Number puzzle', defaultScene: 'grid', defaultPlayerEmoji: '🔢', defaultEnemyEmoji: '✅', features: ['numbers', 'logic', 'hints'], sampleBlocks: ['SET_VAR', 'IF', 'CHANGE_VAR', 'GAME_OVER'] },
  { id: 'escape_room', family: 'puzzle', name: 'Escape Room', emoji: '🔐', description: 'Solve puzzles to escape', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🔑', features: ['clues', 'items', 'doors'], sampleBlocks: ['ON_CLICK', 'ADD_TO_INVENTORY', 'TRANSITION_TO_AREA', 'WIN_GAME'] },
  { id: 'physics_puzzle', family: 'puzzle', name: 'Physics Puzzle', emoji: '⚽', description: 'Use physics to solve', defaultScene: 'grid', defaultPlayerEmoji: '⚽', defaultEnemyEmoji: '🥅', features: ['gravity', 'bouncy', 'launch'], sampleBlocks: ['SET_GRAVITY', 'APPLY_FORCE', 'SET_BOUNCINESS', 'ON_COLLIDE'] },

  // RACING
  { id: 'kart_racing', family: 'racing', name: 'Kart Racing', emoji: '🏎️', description: 'Fun kart racing', defaultScene: 'grid', defaultPlayerEmoji: '🏎️', defaultEnemyEmoji: '🏁', features: ['steering', 'items', 'laps'], sampleBlocks: ['FOREVER', 'MOVE_X', 'MOVE_Y', 'CHANGE_SCORE'] },
  { id: 'endless_highway', family: 'racing', name: 'Endless Highway', emoji: '🛣️', description: 'Dodge traffic', defaultScene: 'grid', defaultPlayerEmoji: '🚗', defaultEnemyEmoji: '🚛', features: ['dodge', 'speed', 'distance'], sampleBlocks: ['FOREVER', 'MOVE_X', 'SPAWN_ENEMY', 'CHANGE_SCORE'] },
  { id: 'drift_racing', family: 'racing', name: 'Drift Racing', emoji: '💨', description: 'Drift around corners', defaultScene: 'grid', defaultPlayerEmoji: '🏎️', defaultEnemyEmoji: '🏁', features: ['drift', 'points', 'time'], sampleBlocks: ['FOREVER', 'MOVE_X', 'CHANGE_SCORE', 'SET_TIMER'] },

  // SPORTS
  { id: 'football', family: 'sports', name: 'Football', emoji: '⚽', description: 'Score goals', defaultScene: 'grid', defaultPlayerEmoji: '🏃', defaultEnemyEmoji: '⚽', features: ['kick', 'goal', 'timer'], sampleBlocks: ['SPAWN_BALL', 'KICK_BALL', 'SCORE_GOAL', 'SET_TIMER'] },
  { id: 'basketball', family: 'sports', name: 'Basketball', emoji: '🏀', description: 'Shoot hoops', defaultScene: 'grid', defaultPlayerEmoji: '🏀', defaultEnemyEmoji: '🥅', features: ['shoot', 'dribble', 'score'], sampleBlocks: ['SPAWN_BALL', 'SHOOT_BALL', 'SCORE_GOAL', 'SET_TIMER'] },
  { id: 'boxing', family: 'sports', name: 'Boxing', emoji: '🥊', description: 'Knockout opponent', defaultScene: 'grid', defaultPlayerEmoji: '🥊', defaultEnemyEmoji: '🤕', features: ['punch', 'dodge', 'KO'], sampleBlocks: ['FOREVER', 'ATTACK_ENEMY', 'DASH', 'GAME_OVER'] },
  { id: 'golf', family: 'sports', name: 'Golf', emoji: '⛳', description: 'Swing for par', defaultScene: 'grid', defaultPlayerEmoji: '⛳', defaultEnemyEmoji: '🏌️', features: ['aim', 'power', 'holes'], sampleBlocks: ['APPLY_FORCE', 'ON_COLLIDE', 'CHANGE_SCORE', 'WIN_GAME'] },

  // STRATEGY
  { id: 'tower_defense', family: 'strategy', name: 'Tower Defense', emoji: '🗼', description: 'Defend your base', defaultScene: 'grid', defaultPlayerEmoji: '🗼', defaultEnemyEmoji: '👹', features: ['towers', 'waves', 'path'], sampleBlocks: ['START_WAVE', 'SPAWN_ENEMY', 'SPAWN_PARTICLES', 'GAME_OVER'] },
  { id: 'city_builder', family: 'strategy', name: 'City Builder', emoji: '🏙️', description: 'Build a city', defaultScene: 'grid', defaultPlayerEmoji: '🏙️', defaultEnemyEmoji: '🏗️', features: ['build', 'resources', 'population'], sampleBlocks: ['SET_VAR', 'CHANGE_VAR', 'SPAWN_PARTICLES', 'WIN_GAME'] },
  { id: 'auto_battler', family: 'strategy', name: 'Auto Battler', emoji: '♟️', description: 'Auto-fighting units', defaultScene: 'grid', defaultPlayerEmoji: '♟️', defaultEnemyEmoji: '♟️', features: ['units', 'auto-combat', 'synergy'], sampleBlocks: ['SPAWN_ENEMY', 'SPAWN_TEAMMATE', 'FOREVER', 'CHANGE_SCORE'] },

  // HORROR
  { id: 'zombie_survival', family: 'horror', name: 'Zombie Survival', emoji: '🧟', description: 'Survive zombies', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🧟', features: ['waves', 'weapons', 'fear'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'SHOOT', 'GAME_OVER'] },
  { id: 'psychological', family: 'horror', name: 'Psychological Horror', emoji: '😱', description: 'Mind-bending scares', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '👁️', features: ['paranoia', 'jumpscares', 'sanity'], sampleBlocks: ['WAIT', 'FADE_IN', 'FADE_OUT', 'SHAKE_SCREEN'] },
  { id: 'ghost_hunting', family: 'horror', name: 'Ghost Hunting', emoji: '👻', description: 'Find and trap ghosts', defaultScene: 'grid', defaultPlayerEmoji: '🔦', defaultEnemyEmoji: '👻', features: ['detect', 'trap', 'investigate'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'ON_COLLIDE', 'ADD_TO_INVENTORY'] },

  // SHOOTER
  { id: 'fps', family: 'shooter', name: 'FPS', emoji: '🔫', description: 'First person shooter', defaultScene: 'space', defaultPlayerEmoji: '🔫', defaultEnemyEmoji: '🎯', features: ['aim', 'shoot', 'cover'], sampleBlocks: ['FOREVER', 'SHOOT', 'SPAWN_ENEMY', 'CHANGE_SCORE'] },
  { id: 'top_down_shooter', family: 'shooter', name: 'Top Down Shooter', emoji: '🎯', description: 'Shoot from above', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '👹', features: ['aim', 'waves', 'powerups'], sampleBlocks: ['FOREVER', 'SHOOT', 'SPAWN_ENEMY', 'SPAWN_ITEM'] },
  { id: 'twin_stick', family: 'shooter', name: 'Twin Stick Shooter', emoji: '🎮', description: 'Move + shoot independently', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '👾', features: ['dual-stick', 'waves', 'upgrades'], sampleBlocks: ['FOREVER', 'SHOOT', 'SPAWN_ENEMY', 'CHANGE_SCORE'] },

  // SANDBOX
  { id: 'voxel', family: 'sandbox', name: 'Voxel Builder', emoji: '🟫', description: 'Minecraft-style building', defaultScene: 'forest', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🟫', features: ['build', 'mine', 'craft'], sampleBlocks: ['ON_CLICK', 'SET_TILE', 'ADD_TO_INVENTORY', 'CRAFT_ITEM'] },
  { id: 'physics_sandbox', family: 'sandbox', name: 'Physics Sandbox', emoji: '⚽', description: 'Play with physics', defaultScene: 'grid', defaultPlayerEmoji: '⚽', defaultEnemyEmoji: '🏀', features: ['gravity', 'bouncy', 'connect'], sampleBlocks: ['SET_GRAVITY', 'APPLY_FORCE', 'CREATE_JOINT', 'SET_BOUNCINESS'] },

  // SURVIVAL
  { id: 'crafting_survival', family: 'survival', name: 'Crafting Survival', emoji: '🪓', description: 'Gather and craft', defaultScene: 'forest', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🐺', features: ['gather', 'craft', 'survive'], sampleBlocks: ['FOREVER', 'SPAWN_ITEM', 'ADD_TO_INVENTORY', 'CRAFT_ITEM'] },
  { id: 'wave_survival', family: 'survival', name: 'Wave Survival', emoji: '🌊', description: 'Survive waves', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '👹', features: ['waves', 'upgrade', 'survive'], sampleBlocks: ['START_WAVE', 'SPAWN_ENEMY', 'NEXT_WAVE', 'GAME_OVER'] },

  // CARD GAMES
  { id: 'solitaire', family: 'card', name: 'Solitaire', emoji: '🃏', description: 'Classic card game', defaultScene: 'grid', defaultPlayerEmoji: '🃏', defaultEnemyEmoji: '♠️', features: ['cards', 'stack', 'sort'], sampleBlocks: ['ON_CLICK', 'SET_VAR', 'CHANGE_VAR', 'WIN_GAME'] },
  { id: 'blackjack', family: 'card', name: 'Blackjack', emoji: '🃏', description: 'Beat the dealer', defaultScene: 'grid', defaultPlayerEmoji: '🃏', defaultEnemyEmoji: '🎰', features: ['hit', 'stand', 'bust'], sampleBlocks: ['CALC_RANDOM', 'CHANGE_VAR', 'IF', 'WIN_GAME'] },
  { id: 'uno', family: 'card', name: 'Uno', emoji: '🔴', description: 'Match colors and numbers', defaultScene: 'grid', defaultPlayerEmoji: '🔴', defaultEnemyEmoji: '🃏', features: ['match', 'skip', 'draw'], sampleBlocks: ['ON_CLICK', 'CHANGE_VAR', 'SPAWN_ENEMY', 'WIN_GAME'] },

  // CASINO
  { id: 'slots', family: 'casino', name: 'Slot Machine', emoji: '🎰', description: 'Spin to win', defaultScene: 'grid', defaultPlayerEmoji: '🎰', defaultEnemyEmoji: '💰', features: ['spin', 'match', 'jackpot'], sampleBlocks: ['CALC_RANDOM', 'CHANGE_VAR', 'SPAWN_PARTICLES', 'PLAY_SOUND'] },
  { id: 'roulette', family: 'casino', name: 'Roulette', emoji: '🎡', description: 'Bet on red or black', defaultScene: 'grid', defaultPlayerEmoji: '🎡', defaultEnemyEmoji: '🔴', features: ['bet', 'spin', 'win'], sampleBlocks: ['CALC_RANDOM', 'CHANGE_VAR', 'IF', 'SPAWN_PARTICLES'] },

  // CASUAL
  { id: 'idle_clicker', family: 'casual', name: 'Idle Clicker', emoji: '👆', description: 'Tap to earn', defaultScene: 'grid', defaultPlayerEmoji: '👆', defaultEnemyEmoji: '💰', features: ['click', 'upgrade', 'auto'], sampleBlocks: ['ON_CLICK', 'CHANGE_VAR', 'CHANGE_SCORE', 'SPAWN_PARTICLES'] },
  { id: 'merge_game', family: 'casual', name: 'Merge Game', emoji: '🔮', description: 'Merge items', defaultScene: 'grid', defaultPlayerEmoji: '🔮', defaultEnemyEmoji: '✨', features: ['drag', 'merge', 'upgrade'], sampleBlocks: ['ON_CLICK', 'CHANGE_VAR', 'SPAWN_PARTICLES', 'CHANGE_SCORE'] },

  // EDUCATIONAL
  { id: 'math_game', family: 'educational', name: 'Math Game', emoji: '🔢', description: 'Solve math problems', defaultScene: 'grid', defaultPlayerEmoji: '🔢', defaultEnemyEmoji: '✅', features: ['problems', 'timer', 'score'], sampleBlocks: ['CALC_RANDOM', 'IF', 'CHANGE_SCORE', 'SET_TIMER'] },
  { id: 'coding_game', family: 'educational', name: 'Coding Game', emoji: '💻', description: 'Learn to code', defaultScene: 'grid', defaultPlayerEmoji: '💻', defaultEnemyEmoji: '🤖', features: ['commands', 'debug', 'level'], sampleBlocks: ['FOREVER', 'IF', 'CHANGE_VAR', 'WIN_GAME'] },
  { id: 'typing_tutor', family: 'educational', name: 'Typing Tutor', emoji: '⌨️', description: 'Learn to type fast', defaultScene: 'grid', defaultPlayerEmoji: '⌨️', defaultEnemyEmoji: '📝', features: ['words', 'speed', 'accuracy'], sampleBlocks: ['WAIT', 'IF', 'CHANGE_SCORE', 'SET_TIMER'] },

  // RHYTHM
  { id: 'piano_tiles', family: 'rhythm', name: 'Piano Tiles', emoji: '🎹', description: 'Tap the black tiles', defaultScene: 'grid', defaultPlayerEmoji: '🎹', defaultEnemyEmoji: '⬛', features: ['tiles', 'speed', 'combo'], sampleBlocks: ['ON_CLICK', 'CHANGE_SCORE', 'FOREVER', 'GAME_OVER'] },
  { id: 'guitar_hero', family: 'rhythm', name: 'Guitar Hero', emoji: '🎸', description: 'Hit the notes', defaultScene: 'grid', defaultPlayerEmoji: '🎸', defaultEnemyEmoji: '🎵', features: ['notes', 'timing', 'streak'], sampleBlocks: ['FOREVER', 'ON_PRESS', 'CHANGE_SCORE', 'WAIT'] },

  // CREATIVE
  { id: 'pixel_art', family: 'creative', name: 'Pixel Art Creator', emoji: '🎨', description: 'Draw pixel art', defaultScene: 'grid', defaultPlayerEmoji: '🎨', defaultEnemyEmoji: '🖌️', features: ['draw', 'colors', 'export'], sampleBlocks: ['ON_CLICK', 'SET_VAR', 'CHANGE_VAR', 'SAVE_GAME'] },
  { id: 'music_maker', family: 'creative', name: 'Music Maker', emoji: '🎵', description: 'Create music', defaultScene: 'grid', defaultPlayerEmoji: '🎵', defaultEnemyEmoji: '🎹', features: ['notes', 'beats', 'loop'], sampleBlocks: ['ON_CLICK', 'PLAY_SOUND', 'SET_VAR', 'CHANGE_VAR'] },

  // BUILDER
  { id: 'city_builder_sim', family: 'builder', name: 'City Builder', emoji: '🏙️', description: 'Build a city', defaultScene: 'grid', defaultPlayerEmoji: '🏙️', defaultEnemyEmoji: '🏗️', features: ['build', 'zoning', 'services'], sampleBlocks: ['ON_CLICK', 'SET_TILE', 'CHANGE_VAR', 'SPAWN_PARTICLES'] },
  { id: 'bridge_builder', family: 'builder', name: 'Bridge Builder', emoji: '🌉', description: 'Build bridges', defaultScene: 'grid', defaultPlayerEmoji: '🌉', defaultEnemyEmoji: '🚗', features: ['physics', 'budget', 'test'], sampleBlocks: ['CREATE_JOINT', 'SET_PHYSICS_TYPE', 'APPLY_FORCE', 'CHANGE_VAR'] },

  // SCI-FI
  { id: 'space_exploration', family: 'scifi', name: 'Space Exploration', emoji: '🌌', description: 'Explore the galaxy', defaultScene: 'space', defaultPlayerEmoji: '🚀', defaultEnemyEmoji: '🪐', features: ['fuel', 'planets', 'trade'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'ADD_TO_INVENTORY', 'CHANGE_VAR'] },
  { id: 'mech_combat', family: 'scifi', name: 'Mech Combat', emoji: '🤖', description: 'Pilot a mech', defaultScene: 'space', defaultPlayerEmoji: '🤖', defaultEnemyEmoji: '🦾', features: ['mech', 'weapons', 'energy'], sampleBlocks: ['FOREVER', 'SHOOT', 'SPAWN_ENEMY', 'CHANGE_VAR'] },

  // FANTASY
  { id: 'dragon_adventure', family: 'fantasy', name: 'Dragon Adventure', emoji: '🐉', description: 'Ride dragons', defaultScene: 'forest', defaultPlayerEmoji: '🐉', defaultEnemyEmoji: '🧙', features: ['dragon', 'fire', 'quest'], sampleBlocks: ['SET_GRAVITY', 'SHOOT', 'NPC_TALK', 'ACCEPT_QUEST'] },
  { id: 'wizard_school', family: 'fantasy', name: 'Wizard School', emoji: '🧙', description: 'Learn magic', defaultScene: 'forest', defaultPlayerEmoji: '🧙', defaultEnemyEmoji: '📚', features: ['spells', 'potions', 'exam'], sampleBlocks: ['ADD_TO_INVENTORY', 'CRAFT_ITEM', 'SPAWN_PARTICLES', 'CHANGE_VAR'] },

  // MYSTERY
  { id: 'detective', family: 'mystery', name: 'Detective', emoji: '🕵️', description: 'Solve crimes', defaultScene: 'grid', defaultPlayerEmoji: '🕵️', defaultEnemyEmoji: '🔍', features: ['clues', 'interrogate', 'solve'], sampleBlocks: ['ON_CLICK', 'ADD_TO_INVENTORY', 'CREATE_DIALOGUE', 'WIN_GAME'] },
  { id: 'murder_mystery', family: 'mystery', name: 'Murder Mystery', emoji: '🔪', description: 'Find the killer', defaultScene: 'grid', defaultPlayerEmoji: '🕵️', defaultEnemyEmoji: '🔪', features: ['suspects', 'evidence', 'accuse'], sampleBlocks: ['NPC_TALK', 'ADD_TO_INVENTORY', 'IF', 'WIN_GAME'] },

  // LIFE SIM
  { id: 'virtual_pet', family: 'life', name: 'Virtual Pet', emoji: '🐱', description: 'Care for a pet', defaultScene: 'grid', defaultPlayerEmoji: '🐱', defaultEnemyEmoji: '🍖', features: ['feed', 'play', 'sleep'], sampleBlocks: ['ON_CLICK', 'CHANGE_VAR', 'SPAWN_PARTICLES', 'SAY'] },
  { id: 'farm_sim', family: 'life', name: 'Farm Simulator', emoji: '🌾', description: 'Run a farm', defaultScene: 'forest', defaultPlayerEmoji: '🧑‍🌾', defaultEnemyEmoji: '🌾', features: ['plant', 'harvest', 'sell'], sampleBlocks: ['SET_TILE', 'WAIT', 'CHANGE_VAR', 'SPAWN_ITEM'] },

  // MULTIPLAYER
  { id: 'local_coop', family: 'multiplayer', name: 'Local Co-op', emoji: '🎮', description: 'Play together', defaultScene: 'grid', defaultPlayerEmoji: '🎮', defaultEnemyEmoji: '👾', features: ['2 players', 'teamwork', 'shared'], sampleBlocks: ['FOREVER', 'SPAWN_ENEMY', 'CHANGE_SCORE', 'WIN_GAME'] },
  { id: 'arena_pvp', family: 'multiplayer', name: 'Arena PvP', emoji: '⚔️', description: 'Fight each other', defaultScene: 'grid', defaultPlayerEmoji: '⚔️', defaultEnemyEmoji: '🛡️', features: ['versus', 'skills', 'winner'], sampleBlocks: ['FOREVER', 'SHOOT', 'GAME_OVER', 'CHANGE_SCORE'] },

  // EXPERIMENTAL
  { id: 'procedural_world', family: 'experimental', name: 'Procedural World', emoji: '🌍', description: 'AI-generated worlds', defaultScene: 'space', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '🌍', features: ['random', 'generate', 'discover'], sampleBlocks: ['GENERATE_ENVIRONMENT', 'FOREVER', 'SPAWN_ENEMY', 'CHANGE_SCORE'] },
  { id: 'time_loop', family: 'experimental', name: 'Time Loop', emoji: '⏰', description: 'Relive the day', defaultScene: 'grid', defaultPlayerEmoji: '🧑', defaultEnemyEmoji: '⏰', features: ['reset', 'memory', 'progress'], sampleBlocks: ['LOAD_GAME', 'SAVE_GAME', 'CHANGE_VAR', 'IF'] },

  // BUSINESS (already built as standalone games)
  { id: 'stock_market', family: 'business', name: 'Stock Market', emoji: '📈', description: 'Trade stocks', defaultScene: 'grid', defaultPlayerEmoji: '📈', defaultEnemyEmoji: '💰', features: ['stocks', 'portfolio', 'events'], sampleBlocks: ['CHANGE_VAR', 'IF', 'SPAWN_PARTICLES', 'CHANGE_SCORE'] },
];

export function getGameTypesByFamily(familyId: string): GameTypeConfig[] {
  return GAME_TYPES.filter(t => t.family === familyId);
}

export function getGameTypeById(id: string): GameTypeConfig | undefined {
  return GAME_TYPES.find(t => t.id === id);
}

export function getFamilyById(id: string) {
  return GAME_FAMILIES.find(f => f.id === id);
}
