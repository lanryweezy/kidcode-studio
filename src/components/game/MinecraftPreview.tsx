import React, { useRef, useEffect, useMemo } from 'react';
import { CommandBlock, CommandType } from '../../types';

interface Block {
    x: number;
    y: number;
    z: number;
    color: string;
}

const BLOCK_COLORS: Record<string, string> = {
    stone: '#808080',
    dirt: '#8B6914',
    grass: '#4CAF50',
    wood: '#8B4513',
    oak_log: '#8B4513',
    cobblestone: '#696969',
    sand: '#F4D03F',
    glass: '#B0E0E6',
    water: '#1565C0',
    lava: '#FF5722',
    iron: '#C0C0C0',
    gold: '#FFD700',
    diamond: '#00BCD4',
    obsidian: '#1A1A2E',
    brick: '#D35400',
    planks: '#D2B48C',
    wool: '#FFFFFF',
    snow: '#F5F5F5',
    clay: '#BDB76B',
    bedrock: '#2C2C2C',
    chest: '#CD853F',
};

interface EntitySprite {
    x: number;
    y: number;
    z: number;
    type: string;
}

const ENTITY_COLORS: Record<string, string> = {
    creeper: '#00C853',
    zombie: '#2E7D32',
    skeleton: '#BDBDBD',
    spider: '#4E342E',
    pig: '#F48FB1',
    cow: '#6D4C41',
    chicken: '#FFF9C4',
    sheep: '#FAFAFA',
    villager: '#795548',
    enderman: '#1A1A1A',
    witch: '#4A148C',
    slime: '#69F0AE',
};

const MinecraftPreview: React.FC<{ commands: CommandBlock[] }> = ({ commands }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { blocks, entities } = useMemo(() => {
        const b: Block[] = [];
        const e: EntitySprite[] = [];

        for (const cmd of commands) {
            const p = cmd.params;
            switch (cmd.type) {
                case CommandType.MC_SET_BLOCK:
                    b.push({ x: p.x ?? 0, y: p.y ?? 64, z: p.z ?? 0, color: BLOCK_COLORS[p.blockType as string] || '#808080' });
                    break;
                case CommandType.MC_FILL_AREA: {
                    const x1 = Math.min(p.x ?? 0, p.x2 ?? 5);
                    const y1 = Math.min(p.y ?? 64, p.y2 ?? 66);
                    const z1 = Math.min(p.z ?? 0, p.z2 ?? 5);
                    const x2 = Math.max(p.x ?? 0, p.x2 ?? 5);
                    const y2 = Math.max(p.y ?? 64, p.y2 ?? 66);
                    const z2 = Math.max(p.z ?? 0, p.z2 ?? 5);
                    const color = BLOCK_COLORS[p.blockType as string] || '#808080';
                    for (let x = x1; x <= x2; x++) {
                        for (let y = y1; y <= y2; y++) {
                            for (let z = z1; z <= z2; z++) {
                                b.push({ x, y, z, color });
                            }
                        }
                    }
                    break;
                }
                case CommandType.MC_SPAWN_ENTITY:
                    e.push({ x: p.x ?? 0, y: p.y ?? 64, z: p.z ?? 0, type: p.entityType as string || 'creeper' });
                    break;
            }
        }

        return { blocks: b, entities: e };
    }, [commands]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width = canvas.offsetWidth * 2;
        const h = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        const cw = w / 2;
        const ch = h / 2;

        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, cw, ch);

        const gridW = 20;
        const gridH = 15;
        const cellW = cw / gridW;
        const cellH = ch / gridH;

        const offsetX = cw / 2;
        const offsetY = ch * 0.6;

        const isoX = (x: number, y: number, z: number) => {
            return {
                sx: offsetX + (x - z) * cellW * 0.5,
                sy: offsetY + (x + z) * cellH * 0.3 - (y - 64) * cellH * 0.5,
            };
        };

        const drawBlock = (x: number, y: number, z: number, color: string) => {
            const { sx, sy } = isoX(x, y, z);
            const bw = cellW * 0.5;
            const bh = cellH * 0.4;

            ctx.fillStyle = color;
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(sx, sy - bh);
            ctx.lineTo(sx + bw, sy - bh + bh * 0.5);
            ctx.lineTo(sx + bw, sy + bh * 0.5);
            ctx.lineTo(sx, sy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = shadeColor(color, -20);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + bw, sy + bh * 0.5);
            ctx.lineTo(sx + bw, sy + bh * 0.5 + bh);
            ctx.lineTo(sx, sy + bh);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = shadeColor(color, 20);
            ctx.beginPath();
            ctx.moveTo(sx, sy - bh);
            ctx.lineTo(sx - bw, sy - bh + bh * 0.5);
            ctx.lineTo(sx - bw, sy + bh * 0.5);
            ctx.lineTo(sx, sy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };

        const drawEntity = (x: number, y: number, z: number, type: string) => {
            const { sx, sy } = isoX(x, y, z);
            const color = ENTITY_COLORS[type] || '#FF5722';

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(sx, sy - cellH * 0.5, cellW * 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#FFF';
            ctx.font = `${cellW * 0.15}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(type.charAt(0).toUpperCase(), sx, sy - cellH * 0.45);
        };

        const sortedBlocks = [...blocks].sort((a, b) => (a.x + a.z) - (b.x + b.z) || a.y - b.y);
        for (const block of sortedBlocks) {
            drawBlock(block.x, block.y, block.z, block.color);
        }

        for (const entity of entities) {
            drawEntity(entity.x, entity.y, entity.z, entity.type);
        }

        if (blocks.length === 0 && entities.length === 0) {
            ctx.fillStyle = '#333';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Add Minecraft blocks to see a preview', cw / 2, ch / 2);
        }
    }, [blocks, entities]);

    return (
        <div className="w-full h-full bg-gradient-to-b from-sky-300 to-sky-500 rounded-xl overflow-hidden relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded">
                {blocks.length} blocks · {entities.length} entities
            </div>
        </div>
    );
};

function shadeColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export default React.memo(MinecraftPreview);
