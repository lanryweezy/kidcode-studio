/**
 * Command Palette - Ported from Timeframe
 * Quick access to all game commands via keyboard shortcut
 */

export interface PaletteCommand {
  id: string;
  label: string;
  category: string;
  icon: string;
  shortcut?: string;
  description: string;
  action: string;
  params?: Record<string, any>;
}

export const GAME_COMMANDS: PaletteCommand[] = [
  // Movement
  { id: 'cmd_move_x', label: 'Move X', category: 'Movement', icon: '➡️', shortcut: '', action: 'MOVE_X', description: 'Move horizontally' },
  { id: 'cmd_move_y', label: 'Move Y', category: 'Movement', icon: '⬆️', action: 'MOVE_Y', description: 'Move vertically' },
  { id: 'cmd_jump', label: 'Jump', category: 'Movement', icon: '🦘', shortcut: 'Space', action: 'JUMP', description: 'Jump up' },
  { id: 'cmd_dash', label: 'Dash', category: 'Movement', icon: '💨', shortcut: 'Shift', action: 'DASH', description: 'Quick dash movement' },
  { id: 'cmd_gravity', label: 'Toggle Gravity', category: 'Movement', icon: '🌍', action: 'SET_GRAVITY', description: 'Enable/disable gravity' },

  // Combat
  { id: 'cmd_attack', label: 'Attack', category: 'Combat', icon: '⚔️', shortcut: 'X', action: 'SHOOT', description: 'Melee attack' },
  { id: 'cmd_shoot', label: 'Shoot', category: 'Combat', icon: '🏹', shortcut: 'Z', action: 'SHOOT', description: 'Fire projectile' },
  { id: 'cmd_dodge', label: 'Dodge Roll', category: 'Combat', icon: '🤸', action: 'DASH', description: 'Invincibility dodge' },
  { id: 'cmd_heal', label: 'Use Health Potion', category: 'Combat', icon: '🧪', action: 'USE_ITEM', params: { text: 'Health Potion' }, description: 'Restore HP' },

  // RPG
  { id: 'cmd_add_xp', label: 'Add XP', category: 'RPG', icon: '⭐', action: 'ADD_XP', description: 'Gain experience' },
  { id: 'cmd_level_up', label: 'Level Up', category: 'RPG', icon: '📈', action: 'LEVEL_UP', description: 'Level up character' },
  { id: 'cmd_apply_status', label: 'Apply Status Effect', category: 'RPG', icon: '✨', action: 'APPLY_STATUS', description: 'Apply poison/burn/etc' },
  { id: 'cmd_drop_loot', label: 'Drop Loot', category: 'RPG', icon: '🎁', action: 'DROP_LOOT', description: 'Roll loot from enemy' },

  // Level
  { id: 'cmd_spawn_enemy', label: 'Spawn Enemy', category: 'Level', icon: '👾', action: 'SPAWN_ENEMY', description: 'Create an enemy' },
  { id: 'cmd_spawn_item', label: 'Spawn Item', category: 'Level', icon: '💎', action: 'SPAWN_ITEM', description: 'Create a collectible' },
  { id: 'cmd_set_scene', label: 'Change Scene', category: 'Level', icon: '🏞️', action: 'SET_SCENE', description: 'Change background' },
  { id: 'cmd_set_weather', label: 'Change Weather', category: 'Level', icon: '🌧️', action: 'SET_WEATHER', description: 'Rain/snow/etc' },

  // System
  { id: 'cmd_save', label: 'Save Game', category: 'System', icon: '💾', shortcut: 'Ctrl+S', action: 'SAVE_GAME', description: 'Save progress' },
  { id: 'cmd_load', label: 'Load Game', category: 'System', icon: '📂', action: 'LOAD_GAME', description: 'Load saved game' },
  { id: 'cmd_game_over', label: 'Game Over', category: 'System', icon: '💀', action: 'GAME_OVER', description: 'End game' },
  { id: 'cmd_win', label: 'Win Game', category: 'System', icon: '🏆', action: 'WIN_GAME', description: 'Victory!' },
];

export class CommandPalette {
  private isOpen: boolean = false;
  private filter: string = '';
  private selectedIndex: number = 0;
  private commands: PaletteCommand[] = GAME_COMMANDS;

  toggle(): void { this.isOpen = !this.isOpen; this.filter = ''; this.selectedIndex = 0; }
  open(): void { this.isOpen = true; this.filter = ''; this.selectedIndex = 0; }
  close(): void { this.isOpen = false; }

  setFilter(text: string): void {
    this.filter = text;
    this.selectedIndex = 0;
  }

  getFiltered(): PaletteCommand[] {
    if (!this.filter) return this.commands;
    const lower = this.filter.toLowerCase();
    return this.commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lower) ||
      cmd.category.toLowerCase().includes(lower) ||
      cmd.description.toLowerCase().includes(lower) ||
      cmd.action.toLowerCase().includes(lower)
    );
  }

  moveSelection(direction: number): void {
    const filtered = this.getFiltered();
    this.selectedIndex = Math.max(0, Math.min(filtered.length - 1, this.selectedIndex + direction));
  }

  getSelected(): PaletteCommand | null {
    const filtered = this.getFiltered();
    return filtered[this.selectedIndex] || null;
  }

  executeSelected(): PaletteCommand | null {
    const cmd = this.getSelected();
    this.close();
    return cmd;
  }

  get state() {
    return { isOpen: this.isOpen, filter: this.filter, selectedIndex: this.selectedIndex };
  }
}

export const commandPalette = new CommandPalette();
