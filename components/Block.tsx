
import React from 'react';
import { CommandBlock, CommandType } from '../types';
import { Trash2, GripVertical } from 'lucide-react';
import { AVAILABLE_BLOCKS } from '../constants';

interface BlockProps {
  block: CommandBlock;
  index: number;
  mode: string;
  onUpdate: (id: string, newParams: any) => void;
  onDelete: (id: string) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Block: React.FC<BlockProps> = ({ 
  block, 
  index, 
  mode, 
  onUpdate, 
  onDelete, 
  isDraggable, 
  onDragStart,
  onMouseEnter,
  onMouseLeave
}) => {
  // Find definition to get label and icon
  const defs = Object.values(AVAILABLE_BLOCKS).flat();
  const def = defs.find(d => d.type === block.type);
  
  if (!def) return null;

  const Icon = def.icon;

  const handleParamChange = (key: string, value: any) => {
    onUpdate(block.id, { ...block.params, [key]: value });
  };

  const isControlBlock = block.type === CommandType.REPEAT || block.type === CommandType.END_REPEAT;
  const isLogicBlock = block.type === CommandType.IF || block.type === CommandType.END_IF || block.type === CommandType.ELSE || block.type === CommandType.WAIT_FOR_PRESS;

  let borderColor = 'border-slate-200';
  let bgColor = 'bg-white';
  let labelColor = 'text-slate-700';

  if (isControlBlock) {
    borderColor = 'border-violet-200';
    bgColor = 'bg-violet-50';
    labelColor = 'text-violet-700';
  } else if (isLogicBlock) {
    borderColor = 'border-indigo-200';
    bgColor = 'bg-indigo-50';
    labelColor = 'text-indigo-700';
  }

  // Visual distinction for ELSE to look like a separator/branch
  const isElse = block.type === CommandType.ELSE;
  if (isElse) {
     bgColor = 'bg-indigo-100';
     borderColor = 'border-indigo-300';
  }

  return (
    <div 
      className={`
        relative group flex items-center gap-3 p-3 rounded-xl shadow-sm border-2 mb-2
        transition-all duration-200 hover:shadow-md 
        ${borderColor} ${bgColor} hover:border-slate-300
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Drag Handle */}
      {isDraggable && (
        <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
          <GripVertical size={16} />
        </div>
      )}

      {/* Index Number */}
      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 select-none">
        {index + 1}
      </div>

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0 ${def.color}`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-wrap items-center gap-2">
        <span className={`font-bold ${labelColor}`}>{def.label}</span>
        
        {/* Render Inputs based on command type */}
        {(block.type === CommandType.SET_BACKGROUND || block.type === CommandType.SET_RGB) && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
             <input 
              type="color" 
              value={block.params.color || '#ffffff'}
              onChange={(e) => handleParamChange('color', e.target.value)}
              className="w-12 h-8 rounded cursor-pointer border-0 p-0"
            />
            <span className="text-xs font-mono text-slate-400">{block.params.color}</span>
          </div>
        )}

        {/* Inputs for App Maker & Game Maker Text */}
        {(block.type === CommandType.SET_TITLE || 
          block.type === CommandType.ADD_TEXT_BLOCK || 
          block.type === CommandType.SAY || 
          block.type === CommandType.SET_EMOJI ||
          block.type === CommandType.LOG_DATA ||
          block.type === CommandType.ADD_INPUT ||
          block.type === CommandType.SET_LCD) && (
          <input 
            type="text" 
            value={block.params.text || ''}
            onChange={(e) => handleParamChange('text', e.target.value)}
            className={`
              flex-1 min-w-[100px] rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200 
              ${block.type === CommandType.SET_LCD 
                ? 'bg-[#84cc16] text-slate-900 font-digital border border-lime-600 placeholder-lime-800' 
                : 'bg-slate-100 font-mono'}
            `}
            placeholder={block.type === CommandType.SET_LCD ? "LCD Text..." : "Text..."}
            maxLength={block.type === CommandType.SET_LCD ? 16 : 100}
          />
        )}

        {block.type === CommandType.SET_SEGMENT && (
          <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded px-2 py-1">
             <span className="text-xs text-red-500 font-bold">NUM</span>
             <input 
              type="number" 
              value={block.params.value}
              onChange={(e) => handleParamChange('value', parseInt(e.target.value) || 0)}
              className="w-16 bg-transparent outline-none font-mono text-sm text-red-700 font-bold"
              min="0" max="9"
            />
          </div>
        )}

        {block.type === CommandType.ADD_IMAGE && (
          <input 
            type="text" 
            value={block.params.text || ''}
            onChange={(e) => handleParamChange('text', e.target.value)}
            className="flex-1 min-w-[150px] bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
            placeholder="Image URL"
          />
        )}

        {block.type === CommandType.SET_SCENE && (
           <div className="flex items-center gap-1 bg-white border border-purple-200 rounded px-2 py-1">
           <select 
             value={block.params.text}
             onChange={(e) => handleParamChange('text', e.target.value)}
             className="bg-transparent outline-none text-sm font-bold text-purple-700 cursor-pointer"
           >
             <option value="grid">⬜ Grid</option>
             <option value="space">🚀 Space</option>
             <option value="forest">🌲 Forest</option>
             <option value="underwater">🌊 Ocean</option>
             <option value="desert">🌵 Desert</option>
           </select>
         </div>
        )}

        {/* Special Case: Button with Label AND Alert Message */}
        {block.type === CommandType.ADD_BUTTON && (
          <>
             <input 
              type="text" 
              value={block.params.text || ''}
              onChange={(e) => handleParamChange('text', e.target.value)}
              className="w-24 bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
              placeholder="Label"
            />
            <span className="text-xs text-slate-400 font-bold">MSG:</span>
            <input 
              type="text" 
              value={block.params.message || ''}
              onChange={(e) => handleParamChange('message', e.target.value)}
              className="flex-1 min-w-[100px] bg-slate-100 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-200"
              placeholder="Alert Message"
            />
          </>
        )}

        {(block.type === CommandType.MOVE_X || block.type === CommandType.MOVE_Y) && (
          <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1">
            <span className="text-xs text-slate-500 font-bold">PX</span>
            <input 
              type="number" 
              value={block.params.value}
              onChange={(e) => handleParamChange('value', parseInt(e.target.value) || 0)}
              className="w-16 bg-transparent outline-none font-mono text-sm"
            />
          </div>
        )}

        {(block.type === CommandType.CHANGE_SCORE || block.type === CommandType.SET_SCORE) && (
          <div className="flex items-center gap-1 bg-yellow-50 rounded px-2 py-1 border border-yellow-200">
             <span className="text-xs text-yellow-600 font-bold">PTS</span>
             <input 
              type="number" 
              value={block.params.value}
              onChange={(e) => handleParamChange('value', parseInt(e.target.value) || 0)}
              className="w-16 bg-transparent outline-none font-mono text-sm text-yellow-800 font-bold"
            />
          </div>
        )}

        {(block.type === CommandType.WAIT || block.type === CommandType.SLEEP || block.type === CommandType.SET_VIBRATION) && (
            <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1">
            <span className="text-xs text-slate-500 font-bold">SEC</span>
            <input 
              type="number" 
              step="0.1"
              value={block.params.value}
              onChange={(e) => handleParamChange('value', parseFloat(e.target.value) || 0)}
              className="w-16 bg-transparent outline-none font-mono text-sm"
            />
          </div>
        )}

        {block.type === CommandType.REPEAT && (
            <div className="flex items-center gap-1 bg-white border border-violet-100 rounded px-2 py-1">
            <span className="text-xs text-violet-500 font-bold">TIMES</span>
            <input 
              type="number" 
              value={block.params.value}
              onChange={(e) => handleParamChange('value', parseInt(e.target.value) || 1)}
              className="w-16 bg-transparent outline-none font-mono text-sm text-violet-700 font-bold"
            />
          </div>
        )}

        {/* GENERIC IF BLOCK UI - ENGINEERING STYLE */}
        {block.type === CommandType.IF && (
          <>
            <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded px-2 py-1 shadow-sm">
              <select 
                value={block.params.condition}
                onChange={(e) => handleParamChange('condition', e.target.value)}
                className="bg-transparent outline-none text-sm font-bold text-indigo-700 cursor-pointer pr-2"
              >
                {/* Hardware Conditions */}
                <option value="IS_PRESSED">Button Pressed</option>
                <option value="IS_SWITCH_ON">Switch is ON</option>
                <option value="IS_DARK">Light Sensor (Dark)</option>
                <option value="IS_TEMP_HIGH">Temperature &gt;</option>
                <option value="IS_MOTION">Motion Detected</option>
                <option value="DIST_LESS_THAN">Distance &lt;</option>
                <option value="FAN_SPEED_GT">Fan Speed &gt;</option>
                <option value="PIN_HIGH">Custom Pin HIGH</option>
                {/* Game Conditions */}
                <option value="IS_TOUCHING_EDGE">Touching Edge</option>
              </select>
            </div>

            {/* Dynamic Inputs Based on Logic Selection */}
            
            {/* Temperature Threshold */}
            {block.params.condition === 'IS_TEMP_HIGH' && (
               <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded px-2 py-1 animate-in fade-in zoom-in duration-200">
                  <input 
                    type="number" 
                    value={block.params.value}
                    onChange={(e) => handleParamChange('value', parseInt(e.target.value) || 25)}
                    className="w-12 bg-transparent outline-none font-mono text-sm text-indigo-700 font-bold"
                  />
                  <span className="text-xs text-indigo-400 font-bold">°C</span>
               </div>
            )}

            {/* Distance Threshold */}
            {block.params.condition === 'DIST_LESS_THAN' && (
               <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded px-2 py-1 animate-in fade-in zoom-in duration-200">
                  <input 
                    type="number" 
                    value={block.params.value}
                    onChange={(e) => handleParamChange('value', parseInt(e.target.value) || 20)}
                    className="w-12 bg-transparent outline-none font-mono text-sm text-indigo-700 font-bold"
                  />
                  <span className="text-xs text-indigo-400 font-bold">cm</span>
               </div>
            )}

            {/* Fan Speed Threshold */}
            {block.params.condition === 'FAN_SPEED_GT' && (
               <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded px-2 py-1 animate-in fade-in zoom-in duration-200">
                  <input 
                    type="number" 
                    value={block.params.value}
                    onChange={(e) => handleParamChange('value', parseInt(e.target.value) || 0)}
                    className="w-12 bg-transparent outline-none font-mono text-sm text-indigo-700 font-bold"
                  />
                  <span className="text-xs text-indigo-400 font-bold">%</span>
               </div>
            )}

            {/* Custom Pin Selector */}
            {block.params.condition === 'PIN_HIGH' && (
               <div className="flex items-center gap-1 bg-white border border-indigo-100 rounded px-2 py-1 animate-in fade-in zoom-in duration-200">
                  <span className="text-xs text-indigo-400 font-bold">PIN</span>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={block.params.pin}
                    onChange={(e) => handleParamChange('pin', parseInt(e.target.value) || 0)}
                    className="w-12 bg-transparent outline-none font-mono text-sm text-indigo-700 font-bold"
                  />
               </div>
            )}
          </>
        )}

        {(block.type === CommandType.LED_ON || block.type === CommandType.LED_OFF) && (
           <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1">
           <span className="text-xs text-slate-500 font-bold">PIN #</span>
           <select 
             value={block.params.pin}
             onChange={(e) => handleParamChange('pin', parseInt(e.target.value))}
             className="bg-transparent outline-none text-sm cursor-pointer"
           >
             <option value={0}>0 (Red)</option>
             <option value={1}>1 (Blue)</option>
             <option value={2}>2 (Green)</option>
             <option value={3}>3 (Yellow)</option>
           </select>
         </div>
        )}

        {block.type === CommandType.PLAY_TONE && (
          <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1">
             <span className="text-xs text-slate-500 font-bold">DUR</span>
             <input 
              type="number" 
              step="0.1"
              value={block.params.duration}
              onChange={(e) => handleParamChange('duration', parseFloat(e.target.value) || 0)}
              className="w-16 bg-transparent outline-none font-mono text-sm"
            />
          </div>
        )}

        {block.type === CommandType.PLAY_SOUND && (
           <div className="flex items-center gap-1 bg-white border border-fuchsia-200 rounded px-2 py-1">
           <select 
             value={block.params.text}
             onChange={(e) => handleParamChange('text', e.target.value)}
             className="bg-transparent outline-none text-sm font-bold text-fuchsia-700 cursor-pointer"
           >
             <option value="siren">🚨 Siren</option>
             <option value="laser">🔫 Laser</option>
             <option value="coin">🪙 Coin</option>
             <option value="powerup">⚡ Power Up</option>
           </select>
         </div>
        )}

        {block.type === CommandType.SET_FAN && (
          <div className="flex items-center gap-2 bg-slate-100 rounded px-2 py-1 min-w-[140px]">
             <span className="text-xs text-slate-500 font-bold w-12 text-right whitespace-nowrap">SPD: {block.params.speed ?? 0}%</span>
             <input 
              type="range" 
              min="0"
              max="100"
              step="5"
              value={block.params.speed ?? 0}
              onChange={(e) => handleParamChange('speed', parseInt(e.target.value))}
              className="w-24 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>
        )}

        {block.type === CommandType.SET_SERVO && (
          <div className="flex items-center gap-2 bg-slate-100 rounded px-2 py-1 min-w-[140px]">
             <span className="text-xs text-slate-500 font-bold w-12 text-right whitespace-nowrap">ANG: {block.params.angle ?? 90}°</span>
             <input 
              type="range" 
              min="0"
              max="180"
              step="10"
              value={block.params.angle ?? 90}
              onChange={(e) => handleParamChange('angle', parseInt(e.target.value))}
              className="w-24 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
          </div>
        )}
      </div>

      {/* Delete Action */}
      <button 
        onClick={() => onDelete(block.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        aria-label="Delete block"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default Block;
