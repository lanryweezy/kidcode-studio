import React, { useState } from 'react';
import { CollaborationOperation } from '../../services/collaboration/collaborationManager';
import { Modal } from '../ui/Modal';

interface ConflictResolverProps {
  open: boolean;
  onClose: () => void;
  localOp: CollaborationOperation;
  remoteOp: CollaborationOperation;
  onResolve: (winner: 'local' | 'remote' | 'merge') => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  open,
  onClose,
  localOp,
  remoteOp,
  onResolve,
}) => {
  const [selected, setSelected] = useState<'local' | 'remote' | 'merge' | null>(null);

  const handleResolve = () => {
    if (!selected) return;
    onResolve(selected);
    onClose();
  };

  const formatOpType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Modal open={open} onClose={onClose} title="Resolve Conflict" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Both you and a collaborator edited the same node. Choose which version to keep.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelected('local')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
              selected === 'local'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            aria-pressed={selected === 'local'}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👤</span>
              <span className="font-semibold text-slate-900">Your Version</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Operation: {formatOpType(localOp.type)}</p>
              <p>Time: {new Date(localOp.timestamp).toLocaleTimeString()}</p>
              {localOp.node && (
                <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono">
                  {JSON.stringify(localOp.node).slice(0, 100)}...
                </div>
              )}
            </div>
          </button>

          <button
            onClick={() => setSelected('remote')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
              selected === 'remote'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            aria-pressed={selected === 'remote'}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👥</span>
              <span className="font-semibold text-slate-900">Collaborator's Version</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Operation: {formatOpType(remoteOp.type)}</p>
              <p>Time: {new Date(remoteOp.timestamp).toLocaleTimeString()}</p>
              {remoteOp.node && (
                <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono">
                  {JSON.stringify(remoteOp.node).slice(0, 100)}...
                </div>
              )}
            </div>
          </button>
        </div>

        {localOp.type === 'update' && remoteOp.type === 'update' && localOp.node && remoteOp.node && (
          <button
            onClick={() => setSelected('merge')}
            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
              selected === 'merge'
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            aria-pressed={selected === 'merge'}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔀</span>
              <span className="font-semibold text-slate-900">Merge Both</span>
              <span className="text-xs text-slate-500">(non-conflicting changes)</span>
            </div>
          </button>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={!selected}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Resolution
          </button>
        </div>
      </div>
    </Modal>
  );
};
