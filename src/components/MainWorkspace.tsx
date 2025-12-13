
import React from 'react';
import { Trash, Box } from 'lucide-react';
import Block from './Block';
import { CommandBlock, AppMode } from '../types/types';

interface MainWorkspaceProps {
  draggedBlockId: string | null;
  isOverTrash: boolean;
  setIsOverTrash: (isOver: boolean) => void;
  commands: CommandBlock[];
  pushToHistory: (commands: CommandBlock[]) => void;
  mode: AppMode;
  activeBlockId: string | null;
  handleUpdateBlock: (id: string, params: any) => void;
  handleDeleteBlock: (id: string) => void;
  handleDuplicateBlock: (id: string) => void;
  isPlaying: boolean;
  setDraggedToolType: (type: any) => void;
}

const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  draggedBlockId,
  isOverTrash,
  setIsOverTrash,
  commands,
  pushToHistory,
  mode,
  activeBlockId,
  handleUpdateBlock,
  handleDeleteBlock,
  handleDuplicateBlock,
  isPlaying,
  setDraggedToolType,
}) => {
  return (
    <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative flex flex-col">
      {draggedBlockId && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-full transition-all z-40 flex items-center gap-2 ${isOverTrash ? 'bg-red-500 text-white scale-110 shadow-xl' : 'bg-white text-slate-400 shadow-lg'}`}
          onDragEnter={() => setIsOverTrash(true)}
          onDragLeave={() => setIsOverTrash(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedBlockId) {
              const newCmds = commands.filter(c => c.id !== draggedBlockId);
              pushToHistory(newCmds);
            }
          }}
        >
          <Trash size={24} />
          {isOverTrash && <span className="font-bold">Drop to Delete</span>}
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-1 relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          try {
            const data = e.dataTransfer.getData('application/json');
            if (!data) return;
            const def = JSON.parse(data);
            if (def.type) {
              const newBlock: CommandBlock = {
                id: crypto.randomUUID(),
                type: def.type,
                params: { ...def.defaultParams },
              };
              pushToHistory([...commands, newBlock]);
            }
          } catch (err) {}
          setDraggedToolType(null);
        }}
      >
        {commands.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 pointer-events-none">
            <Box size={48} className="mb-4 text-slate-300" />
            <p className="font-bold text-lg">Drag blocks here to start coding!</p>
          </div>
        )}

        {commands.map((cmd, idx) => (
          <div key={cmd.id} className="block-wrapper">
            <Block
              block={cmd}
              index={idx}
              mode={mode}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onDuplicate={handleDuplicateBlock}
              isDraggable={!isPlaying}
              isActive={activeBlockId === cmd.id}
            />
          </div>
        ))}

        <div className="h-40" />
      </div>
    </div>
  );
};

export default MainWorkspace;
