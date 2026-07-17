import { AppMode, BlockDefinition, CommandType } from '../types';
import {
    Box, Trash2, PaintBucket, Ghost, CloudRain, Clock, Move,
    Gift, Volume2, MessageSquare, Landmark
} from 'lucide-react';

export const MINECRAFT_BLOCKS: BlockDefinition[] = [
    { type: CommandType.MC_SET_BLOCK, label: 'Place Block', icon: Box, defaultParams: { x: 0, y: 64, z: 0, blockType: 'stone' }, color: 'bg-green-600', category: 'World', description: 'Place a block at x, y, z coordinates.' },
    { type: CommandType.MC_REMOVE_BLOCK, label: 'Remove Block', icon: Trash2, defaultParams: { x: 0, y: 64, z: 0 }, color: 'bg-green-700', category: 'World', description: 'Remove a block at x, y, z coordinates.' },
    { type: CommandType.MC_FILL_AREA, label: 'Fill Area', icon: PaintBucket, defaultParams: { x: 0, y: 64, z: 0, x2: 5, y2: 66, z2: 5, blockType: 'stone' }, color: 'bg-green-500', category: 'World', description: 'Fill a rectangular area with a block type.' },
    { type: CommandType.MC_SPAWN_ENTITY, label: 'Spawn Entity', icon: Ghost, defaultParams: { x: 0, y: 64, z: 0, entityType: 'creeper' }, color: 'bg-red-500', category: 'Entities', description: 'Spawn a mob or entity at coordinates.' },
    { type: CommandType.MC_SET_WEATHER, label: 'Set Weather', icon: CloudRain, defaultParams: { weather: 'clear' }, color: 'bg-blue-500', category: 'Effects', description: 'Change the weather (clear, rain, thunder).' },
    { type: CommandType.MC_SET_TIME, label: 'Set Time', icon: Clock, defaultParams: { time: 'day' }, color: 'bg-blue-600', category: 'Effects', description: 'Set time of day (day, night, dawn, dusk).' },
    { type: CommandType.MC_TELEPORT, label: 'Teleport', icon: Move, defaultParams: { x: 0, y: 64, z: 0 }, color: 'bg-purple-500', category: 'World', description: 'Move player to coordinates.' },
    { type: CommandType.MC_GIVE_ITEM, label: 'Give Item', icon: Gift, defaultParams: { item: 'diamond_sword', amount: 1 }, color: 'bg-yellow-500', category: 'Items', description: 'Give the player an item.' },
    { type: CommandType.MC_PLAY_SOUND, label: 'Play Sound', icon: Volume2, defaultParams: { sound: 'note.pling' }, color: 'bg-pink-500', category: 'Effects', description: 'Play a Minecraft sound effect.' },
    { type: CommandType.MC_SHOW_MESSAGE, label: 'Show Message', icon: MessageSquare, defaultParams: { text: 'Hello World!' }, color: 'bg-indigo-500', category: 'Effects', description: 'Display a chat message to the player.' },
    { type: CommandType.MC_CREATE_STRUCTURE, label: 'Create Structure', icon: Landmark, defaultParams: { x: 0, y: 64, z: 0, structure: 'house' }, color: 'bg-amber-600', category: 'World', description: 'Generate a predefined structure.' },
];
