
import React from 'react';
import Stage from './Stage';
import { HardwareState, SpriteState, AppState, AppMode, CircuitComponent } from '../types/types';

interface RightPanelProps {
  rightPanelWidth: number;
  handleMouseDownRight: () => void;
  stageRef: React.RefObject<any>;
  mode: AppMode;
  hardwareState: HardwareState;
  spriteState: SpriteState;
  appState: AppState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  circuitComponents: CircuitComponent[];
  setCircuitComponents: (components: CircuitComponent[]) => void;
  pcbColor: string;
  setPcbColor: (color: string) => void;
  isPlaying: boolean;
  highlightedPin: number | null;
  activeInputs: React.MutableRefObject<Set<string>>;
  updateSpriteState: (newState: Partial<SpriteState>) => void;
  showConsole: boolean;
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  rightPanelWidth,
  handleMouseDownRight,
  stageRef,
  mode,
  hardwareState,
  spriteState,
  appState,
  canvasRef,
  circuitComponents,
  setCircuitComponents,
  pcbColor,
  setPcbColor,
  isPlaying,
  highlightedPin,
  activeInputs,
  updateSpriteState,
  showConsole,
  consoleLogs,
  setConsoleLogs,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col relative z-20" style={{ width: rightPanelWidth }}>
      <div className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-violet-500 transition-colors z-50" onMouseDown={handleMouseDownRight} />

      <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
        <Stage
          ref={stageRef}
          mode={mode}
          hardwareState={hardwareState}
          spriteState={spriteState}
          appState={appState}
          canvasRef={canvasRef}
          circuitComponents={circuitComponents}
          onCircuitUpdate={setCircuitComponents}
          pcbColor={pcbColor}
          setPcbColor={setPcbColor}
          isExecuting={isPlaying}
          onNavigate={(scr) => { /* Handle navigation */ }}
          highlightPin={highlightedPin}
          inputState={activeInputs.current}
          onInput={(k, v) => { if (v) activeInputs.current.add(k); else activeInputs.current.delete(k); }}
          onUpdateSpriteState={updateSpriteState}
        />
      </div>

      <div className={`h-40 bg-slate-900 text-slate-300 font-mono text-xs overflow-y-auto p-2 border-t border-slate-700 transition-all ${showConsole ? 'block' : 'hidden'}`}>
        <div className="flex justify-between items-center mb-1 text-slate-500 text-[10px] uppercase font-bold sticky top-0 bg-slate-900">
          <span>Console Output</span>
          <button onClick={() => setConsoleLogs([])} className="hover:text-white">Clear</button>
        </div>
        {consoleLogs.map((log, i) => <div key={i} className="border-b border-white/5 py-0.5">{log}</div>)}
      </div>
    </div>
  );
};

export default RightPanel;
