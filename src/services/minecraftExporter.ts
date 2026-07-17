import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SavedProject } from './storageService';
import { CommandBlock, CommandType } from '../types';

const MC_BLOCK_IDS: Record<string, string> = {
    stone: 'minecraft:stone',
    dirt: 'minecraft:dirt',
    grass: 'minecraft:grass_block',
    wood: 'minecraft:oak_log',
    oak_log: 'minecraft:oak_log',
    cobblestone: 'minecraft:cobblestone',
    sand: 'minecraft:sand',
    glass: 'minecraft:glass',
    water: 'minecraft:water',
    lava: 'minecraft:lava',
    iron: 'minecraft:iron_block',
    gold: 'minecraft:gold_block',
    diamond: 'minecraft:diamond_block',
    obsidian: 'minecraft:obsidian',
    brick: 'minecraft:bricks',
    planks: 'minecraft:oak_planks',
    wool: 'minecraft:white_wool',
    snow: 'minecraft:snow_block',
    clay: 'minecraft:clay',
    bedrock: 'minecraft:bedrock',
};

const MC_ENTITY_IDS: Record<string, string> = {
    creeper: 'minecraft:creeper',
    zombie: 'minecraft:zombie',
    skeleton: 'minecraft:skeleton',
    spider: 'minecraft:spider',
    pig: 'minecraft:pig',
    cow: 'minecraft:cow',
    chicken: 'minecraft:chicken',
    sheep: 'minecraft:sheep',
    villager: 'minecraft:villager',
    enderman: 'minecraft:enderman',
    witch: 'minecraft:witch',
    slime: 'minecraft:slime',
    bat: 'minecraft:bat',
    cat: 'minecraft:cat',
    wolf: 'minecraft:wolf',
};

const MC_ITEM_IDS: Record<string, string> = {
    diamond_sword: 'minecraft:diamond_sword',
    iron_sword: 'minecraft:iron_sword',
    wooden_sword: 'minecraft:wooden_sword',
    diamond_pickaxe: 'minecraft:diamond_pickaxe',
    iron_pickaxe: 'minecraft:iron_pickaxe',
    bow: 'minecraft:bow',
    arrow: 'minecraft:arrow',
    shield: 'minecraft:shield',
    torch: 'minecraft:torch',
    compass: 'minecraft:compass',
    map: 'minecraft:map',
    bread: 'minecraft:bread',
    apple: 'minecraft:apple',
    golden_apple: 'minecraft:golden_apple',
    diamond: 'minecraft:diamond',
    emerald: 'minecraft:emerald',
    iron_ingot: 'minecraft:iron_ingot',
    gold_ingot: 'minecraft:gold_ingot',
    coal: 'minecraft:coal',
    stick: 'minecraft:stick',
    crafting_table: 'minecraft:crafting_table',
    furnace: 'minecraft:furnace',
    chest: 'minecraft:chest',
    bed: 'minecraft:red_bed',
    name_tag: 'minecraft:name_tag',
    saddle: 'minecraft:saddle',
    elytra: 'minecraft:elytra',
    trident: 'minecraft:trident',
    netherite_sword: 'minecraft:netherite_sword',
};

const WEATHER_MAP: Record<string, string> = {
    clear: 'clear',
    rain: 'rain',
    thunder: 'thunder',
};

const TIME_MAP: Record<string, number> = {
    day: 1000,
    night: 13000,
    dawn: 23000,
    dusk: 12000,
    noon: 6000,
    midnight: 18000,
};

const STRUCTURE_BLOCKS: Record<string, (x: number, y: number, z: number) => string[]> = {
    house: (x, y, z) => [
        `fill ${x} ${y} ${z} ${x + 7} ${y + 4} ${z + 7} minecraft:oak_planks`,
        `fill ${x + 1} ${y} ${z + 1} ${x + 6} ${y + 3} ${z + 6} minecraft:air`,
        `fill ${x + 3} ${y} ${z} ${x + 4} ${y + 2} ${z} minecraft:oak_door`,
        `fill ${x + 2} ${y + 3} ${z + 1} ${x + 5} ${y + 3} ${z + 1} minecraft:glass`,
        `fill ${x} ${y + 4} ${z} ${x + 7} ${y + 4} ${z + 7} minecraft:oak_slab`,
    ],
    tower: (x, y, z) => [
        `fill ${x} ${y} ${z} ${x + 5} ${y + 12} ${z + 5} minecraft:stone_bricks`,
        `fill ${x + 1} ${y} ${z + 1} ${x + 4} ${y + 11} ${z + 4} minecraft:air`,
        `fill ${x + 2} ${y} ${z} ${x + 3} ${y + 3} ${z} minecraft:stone_brick_stairs`,
        `fill ${x} ${y + 12} ${z} ${x + 5} ${y + 12} ${z} minecraft:cobblestone_wall`,
        `fill ${x} ${y + 12} ${z + 5} ${x + 5} ${y + 12} ${z + 5} minecraft:cobblestone_wall`,
        `fill ${x} ${y + 12} ${z} ${x} ${y + 12} ${z + 5} minecraft:cobblestone_wall`,
        `fill ${x + 5} ${y + 12} ${z} ${x + 5} ${y + 12} ${z + 5} minecraft:cobblestone_wall`,
    ],
    farm: (x, y, z) => [
        `fill ${x} ${y} ${z} ${x + 9} ${y} ${z + 9} minecraft:farmland`,
        `fill ${x + 1} ${y + 1} ${z + 1} ${x + 8} ${y + 1} ${z + 8} minecraft:wheat`,
        `fill ${x} ${y} ${z} ${x + 9} ${y} ${z} minecraft:fence`,
        `fill ${x} ${y} ${z + 9} ${x + 9} ${y} ${z + 9} minecraft:fence`,
        `fill ${x} ${y} ${z} ${x} ${y} ${z + 9} minecraft:fence`,
        `fill ${x + 9} ${y} ${z} ${x + 9} ${y} ${z + 9} minecraft:fence`,
        `fill ${x + 4} ${y} ${z} ${x + 5} ${y} ${z} minecraft:air`,
    ],
    castle: (x, y, z) => [
        `fill ${x} ${y} ${z} ${x + 15} ${y + 8} ${z + 15} minecraft:stone_bricks`,
        `fill ${x + 1} ${y} ${z + 1} ${x + 14} ${y + 7} ${z + 14} minecraft:air`,
        `fill ${x + 7} ${y} ${z} ${x + 8} ${y + 4} ${z} minecraft:iron_door`,
        `fill ${x} ${y + 8} ${z} ${x + 15} ${y + 8} ${z} minecraft:cobblestone_wall`,
        `fill ${x} ${y + 8} ${z + 15} ${x + 15} ${y + 8} ${z + 15} minecraft:cobblestone_wall`,
        `fill ${x} ${y + 8} ${z} ${x} ${y + 8} ${z + 15} minecraft:cobblestone_wall`,
        `fill ${x + 15} ${y + 8} ${z} ${x + 15} ${y + 8} ${z + 15} minecraft:cobblestone_wall`,
        `fill ${x + 2} ${y + 8} ${z + 2} ${x + 4} ${y + 10} ${z + 4} minecraft:stone_brick_wall`,
        `fill ${x + 11} ${y + 8} ${z + 2} ${x + 13} ${y + 10} ${z + 4} minecraft:stone_brick_wall`,
        `fill ${x + 2} ${y + 8} ${z + 11} ${x + 4} ${y + 10} ${z + 13} minecraft:stone_brick_wall`,
        `fill ${x + 11} ${y + 8} ${z + 11} ${x + 13} ${y + 10} ${z + 13} minecraft:stone_brick_wall`,
    ],
};

const commandToMCFunction = (cmd: CommandBlock): string[] => {
    const p = cmd.params;
    switch (cmd.type) {
        case CommandType.MC_SET_BLOCK: {
            const blockId = MC_BLOCK_IDS[p.blockType as string] || `minecraft:${p.blockType || 'stone'}`;
            return [`setblock ${p.x ?? 0} ${p.y ?? 64} ${p.z ?? 0} ${blockId}`];
        }
        case CommandType.MC_REMOVE_BLOCK:
            return [`setblock ${p.x ?? 0} ${p.y ?? 64} ${p.z ?? 0} minecraft:air`];
        case CommandType.MC_FILL_AREA: {
            const blockId = MC_BLOCK_IDS[p.blockType as string] || `minecraft:${p.blockType || 'stone'}`;
            return [`fill ${p.x ?? 0} ${p.y ?? 64} ${p.z ?? 0} ${p.x2 ?? 5} ${p.y2 ?? 66} ${p.z2 ?? 5} ${blockId}`];
        }
        case CommandType.MC_SPAWN_ENTITY: {
            const entityId = MC_ENTITY_IDS[p.entityType as string] || `minecraft:${p.entityType || 'pig'}`;
            return [`summon ${entityId} ${p.x ?? 0} ${p.y ?? 64} ${p.z ?? 0}`];
        }
        case CommandType.MC_SET_WEATHER:
            return [`weather ${WEATHER_MAP[p.weather as string] || 'clear'}`];
        case CommandType.MC_SET_TIME:
            return [`time set ${TIME_MAP[p.time as string] ?? 1000}`];
        case CommandType.MC_TELEPORT:
            return [`tp @p ${p.x ?? 0} ${p.y ?? 64} ${p.z ?? 0}`];
        case CommandType.MC_GIVE_ITEM: {
            const itemId = MC_ITEM_IDS[p.item as string] || `minecraft:${p.item || 'diamond_sword'}`;
            return [`give @s ${itemId} ${p.amount ?? 1}`];
        }
        case CommandType.MC_PLAY_SOUND:
            return [`playsound ${p.sound || 'note.pling'} master @s ~ ~ ~ 1 1`];
        case CommandType.MC_SHOW_MESSAGE:
            return [`tellraw @a {"text":"${(p.text || 'Hello World!').replace(/"/g, '\\"')}"}`];
        case CommandType.MC_CREATE_STRUCTURE: {
            const builder = STRUCTURE_BLOCKS[p.structure as string];
            if (builder) {
                return builder(p.x ?? 0, p.y ?? 64, p.z ?? 0);
            }
            return [`# Unknown structure: ${p.structure}`];
        }
        case CommandType.COMMENT:
            return p.text ? [`# ${p.text}`] : [];
        case CommandType.WAIT:
            return [`scoreboard players add #delay mcTimer ${p.value ?? 1}`];
        default:
            return [];
    }
};

function findMatchingEnd(commands: CommandBlock[], startIndex: number, openType: CommandType, closeType: CommandType): number {
    let depth = 0;
    for (let i = startIndex; i < commands.length; i++) {
        if (commands[i].type === openType) depth++;
        if (commands[i].type === closeType) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return commands.length - 1;
}

export const generateDatapackFunctions = (commands: CommandBlock[]): string[] => {
    const lines: string[] = [];
    let i = 0;
    while (i < commands.length) {
        const cmd = commands[i];

        if (cmd.type === CommandType.REPEAT) {
            const count = cmd.params.value ?? 10;
            const endIndex = findMatchingEnd(commands, i, CommandType.REPEAT, CommandType.END_REPEAT);
            const childCommands = commands.slice(i + 1, endIndex);
            for (let rep = 0; rep < count; rep++) {
                for (const child of childCommands) {
                    const mcLines = commandToMCFunction(child);
                    lines.push(...mcLines);
                }
            }
            i = endIndex + 1;
            continue;
        }

        if (cmd.type === CommandType.IF) {
            const condition = cmd.params.condition || 'condition';
            const elseIndex = commands.findIndex((c, idx) => idx > i && c.type === CommandType.ELSE);
            const endifIndex = findMatchingEnd(commands, i, CommandType.IF, CommandType.END_IF);
            const thenCommands = elseIndex > i ? commands.slice(i + 1, elseIndex) : commands.slice(i + 1, endifIndex);
            const elseCommands = elseIndex > i ? commands.slice(elseIndex + 1, endifIndex) : [];

            const safeCondition = condition.replace(/[^a-zA-Z0-9_ ]/g, '').trim() || 'condition';
            for (const child of thenCommands) {
                const mcLines = commandToMCFunction(child);
                for (const line of mcLines) {
                    lines.push(`execute if score #${safeCondition} mcCondition matches 1 run ${line}`);
                }
            }
            if (elseCommands.length > 0) {
                for (const child of elseCommands) {
                    const mcLines = commandToMCFunction(child);
                    for (const line of mcLines) {
                        lines.push(`execute unless score #${safeCondition} mcCondition matches 1 run ${line}`);
                    }
                }
            }
            i = endifIndex + 1;
            continue;
        }

        if (cmd.type === CommandType.FOREVER) {
            const endIndex = findMatchingEnd(commands, i, CommandType.FOREVER, CommandType.END_FOREVER);
            const childCommands = commands.slice(i + 1, endIndex);
            for (const child of childCommands) {
                const mcLines = commandToMCFunction(child);
                lines.push(...mcLines);
            }
            i = endIndex + 1;
            continue;
        }

        const mcLines = commandToMCFunction(cmd);
        lines.push(...mcLines);
        i++;
    }
    return lines;
};

export const exportToDatapack = async (project: SavedProject): Promise<void> => {
    const zip = new JSZip();
    const commands = project.data.commands || [];
    const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    const packMeta = {
        pack: {
            pack_format: 15,
            description: `${project.name} — Created with KidCode Studio`
        }
    };
    zip.file('pack.mcmeta', JSON.stringify(packMeta, null, 2));

    const funcDir = zip.folder(`data/kidcode/functions`);
    const mainLines = generateDatapackFunctions(commands);
    funcDir?.file('main.mcfunction', mainLines.join('\n'));

    funcDir?.file('load.mcfunction', [
        'scoreboard objectives add mcTimer dummy',
        `tellraw @a {"text":"${project.name} loaded!","color":"green"}`,
    ].join('\n'));

    funcDir?.file('tick.mcfunction', [
        'execute as @a at @s run function kidcode:main',
    ].join('\n'));

    zip.file('README.md', [
        `# ${project.name}`,
        '',
        'This is a Minecraft datapack created with KidCode Studio.',
        '',
        '## How to Install',
        '',
        '1. Open Minecraft Java Edition',
        '2. Go to your saves folder',
        '3. Open your world\'s `datapacks` folder',
        '4. Copy this entire folder into `datapacks`',
        '5. In Minecraft, run `/reload`',
        '6. The datapack will run automatically!',
        '',
        '## Commands',
        '',
        '- `/reload` — Reload all datapacks',
        '- `/function kidcode:main` — Run the main function manually',
        '',
        '## Troubleshooting',
        '',
        '- Make sure you are on Minecraft 1.20+',
        '- Check the datapacks list with `/datapack list`',
        '',
        `Created with KidCode Studio ⚡`,
    ].join('\n'));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${safeName}_datapack.zip`);
};

export const exportToMCWorld = async (project: SavedProject): Promise<void> => {
    const zip = new JSZip();
    const commands = project.data.commands || [];
    const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    const manifest = {
        format_version: 2,
        header: {
            name: project.name,
            description: 'Created with KidCode Studio',
            uuid: '00000000-0000-0000-0000-000000000001',
            version: [1, 0, 0],
            min_engine_version: [1, 20, 0]
        },
        modules: [{
            type: 'data',
            uuid: '00000000-0000-0000-0000-000000000002',
            version: [1, 0, 0]
        }]
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    const mainLines = generateDatapackFunctions(commands);

    const behaviorDir = zip.folder('behavior/functions');
    behaviorDir?.file('main.mcfunction', mainLines.join('\n'));
    behaviorDir?.file('load.mcfunction', [
        'scoreboard objectives add mcTimer dummy',
        `tellraw @a {"text":"${project.name} loaded!","color":"green"}`,
    ].join('\n'));
    behaviorDir?.file('tick.mcfunction', [
        'execute as @a at @s run function kidcode:main',
    ].join('\n'));

    zip.file('README.md', [
        `# ${project.name}`,
        '',
        'This is a Minecraft Bedrock addon created with KidCode Studio.',
        '',
        '## How to Install',
        '',
        '1. Transfer this file to your device',
        '2. Double-click the `.mcworld` file',
        '3. Minecraft will automatically import it',
        '',
        `Created with KidCode Studio ⚡`,
    ].join('\n'));

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${safeName}.mcworld`);
};
