import React, { useState } from 'react';
import { X, Plus, Trash2, GitBranch, Star, Target, Gift, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

type QuestNodeType = 'start' | 'objective' | 'choice' | 'reward' | 'end';

interface QuestNode {
  id: string;
  type: QuestNodeType;
  title: string;
  description: string;
  objective?: 'collect' | 'defeat' | 'reach' | 'talk' | 'survive';
  objectiveTarget?: string;
  objectiveCount?: number;
  reward?: { xp: number; item?: string };
  choices?: { text: string; nextNode: string | null }[];
  nextNode?: string | null;
}

interface QuestStoryEditorProps {
  onClose: () => void;
  onSave: (nodes: QuestNode[]) => void;
  initialNodes?: QuestNode[];
}

const NODE_COLORS: Record<QuestNodeType, string> = {
  start: 'bg-emerald-500',
  objective: 'bg-blue-500',
  choice: 'bg-amber-500',
  reward: 'bg-purple-500',
  end: 'bg-slate-500',
};

const NODE_ICONS: Record<QuestNodeType, React.ReactNode> = {
  start: <Star size={14} />,
  objective: <Target size={14} />,
  choice: <GitBranch size={14} />,
  reward: <Gift size={14} />,
  end: <X size={14} />,
};

const OBJECTIVE_TYPES = [
  { id: 'collect', label: 'Collect', emoji: '🪙', placeholder: 'coins, gems...' },
  { id: 'defeat', label: 'Defeat', emoji: '⚔️', placeholder: 'enemies, bosses...' },
  { id: 'reach', label: 'Reach', emoji: '📍', placeholder: 'village, castle...' },
  { id: 'talk', label: 'Talk to', emoji: '💬', placeholder: 'NPC names...' },
  { id: 'survive', label: 'Survive', emoji: '⏱️', placeholder: 'waves, time...' },
];

const createDefaultNode = (type: QuestNodeType, id: string): QuestNode => {
  const base = { id, type, title: '', description: '' };
  switch (type) {
    case 'start':
      return { ...base, title: 'Quest Start', description: 'The adventure begins!', nextNode: null };
    case 'objective':
      return { ...base, title: 'New Objective', description: 'Complete this task', objective: 'collect', objectiveTarget: 'coins', objectiveCount: 5, nextNode: null };
    case 'choice':
      return { ...base, title: 'Player Choice', description: 'What will you do?', choices: [{ text: 'Option A', nextNode: null }, { text: 'Option B', nextNode: null }] };
    case 'reward':
      return { ...base, title: 'Quest Complete!', description: 'You earned a reward!', reward: { xp: 100, item: 'Sword' }, nextNode: null };
    case 'end':
      return { ...base, title: 'Quest End', description: 'The story continues...' };
  }
};

export const QuestStoryEditor: React.FC<QuestStoryEditorProps> = ({ onClose, onSave, initialNodes }) => {
  const [nodes, setNodes] = useState<QuestNode[]>(
    initialNodes || [createDefaultNode('start', 'q_1')]
  );
  const [selectedNode, setSelectedNode] = useState<string>('q_1');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const selected = nodes.find(n => n.id === selectedNode);

  const addNode = (type: QuestNodeType) => {
    const newId = `q_${nodes.length + 1}`;
    const newNode = createDefaultNode(type, newId);
    setNodes([...nodes, newNode]);
    setSelectedNode(newId);
  };

  const deleteNode = (id: string) => {
    if (nodes.length <= 1) return;
    const newNodes = nodes.filter(n => n.id !== id);
    newNodes.forEach(n => {
      if (n.nextNode === id) n.nextNode = null;
      if (n.choices) n.choices.forEach(c => { if (c.nextNode === id) c.nextNode = null; });
    });
    setNodes(newNodes);
    if (selectedNode === id) setSelectedNode(newNodes[0].id);
  };

  const updateNode = (id: string, updates: Partial<QuestNode>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const addChoice = () => {
    if (!selected || selected.type !== 'choice') return;
    updateNode(selected.id, {
      choices: [...(selected.choices || []), { text: 'New option', nextNode: null }]
    });
  };

  const updateChoice = (index: number, updates: Partial<{ text: string; nextNode: string | null }>) => {
    if (!selected || !selected.choices) return;
    const newChoices = [...selected.choices];
    newChoices[index] = { ...newChoices[index], ...updates };
    updateNode(selected.id, { choices: newChoices });
  };

  const removeChoice = (index: number) => {
    if (!selected || !selected.choices || selected.choices.length <= 1) return;
    updateNode(selected.id, {
      choices: selected.choices.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    onSave(nodes);
    onClose();
  };

  // Group nodes by type for the sidebar
  const grouped = nodes.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = [];
    acc[node.type].push(node);
    return acc;
  }, {} as Record<QuestNodeType, QuestNode[]>);

  return (
    <Modal open={true} onClose={onClose} title="Quest & Story Editor" size="xl">
      <div className="flex gap-4 h-[500px]">
        {/* Node List */}
        <div className="w-56 border-r border-slate-200 pr-4 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase mb-3">Quest Nodes</div>

          {Object.entries(grouped).map(([type, nodeList]) => (
            <div key={type} className="mb-3">
              <button
                onClick={() => setCollapsedCategories({ ...collapsedCategories, [type]: !collapsedCategories[type] })}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1 w-full"
              >
                {collapsedCategories[type] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <span className={`w-2 h-2 rounded-full ${NODE_COLORS[type as QuestNodeType]}`} />
                {type} ({nodeList.length})
              </button>
              {!collapsedCategories[type] && (
                <div className="space-y-1 ml-3">
                  {nodeList.map(node => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${
                        selectedNode === node.id
                          ? 'bg-violet-100 text-violet-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {node.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Add Node Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Add Node</div>
            <div className="grid grid-cols-2 gap-1">
              {(['objective', 'choice', 'reward', 'end'] as QuestNodeType[]).map(type => (
                <button
                  key={type}
                  onClick={() => addNode(type)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-white ${NODE_COLORS[type]} hover:opacity-90 transition-opacity`}
                >
                  {NODE_ICONS[type]} {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Node Editor */}
        {selected && (
          <div className="flex-1 space-y-4 overflow-y-auto">
            {/* Node Type Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${NODE_COLORS[selected.type]}`}>
                {NODE_ICONS[selected.type]} {selected.type}
              </span>
              {nodes.length > 1 && (
                <Button variant="ghost" size="xs" icon={<Trash2 size={12} />} onClick={() => deleteNode(selected.id)} className="ml-auto text-red-500" />
              )}
            </div>

            {/* Title */}
            <input
              type="text"
              value={selected.title}
              onChange={(e) => updateNode(selected.id, { title: e.target.value })}
              placeholder="Node title"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold"
            />

            {/* Description */}
            <textarea
              value={selected.description}
              onChange={(e) => updateNode(selected.id, { description: e.target.value })}
              placeholder="What happens here?"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm resize-none h-16"
            />

            {/* Objective Settings */}
            {selected.type === 'objective' && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                <div className="text-xs font-bold text-blue-600 uppercase">Objective</div>
                <div className="grid grid-cols-5 gap-1">
                  {OBJECTIVE_TYPES.map(obj => (
                    <button
                      key={obj.id}
                      onClick={() => updateNode(selected.id, { objective: obj.id as QuestNode['objective'], objectiveTarget: obj.placeholder.split(',')[0] })}
                      className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all ${
                        selected.objective === obj.id
                          ? 'bg-blue-200 font-bold'
                          : 'bg-white hover:bg-blue-100'
                      }`}
                    >
                      <span className="text-lg">{obj.emoji}</span>
                      <span>{obj.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selected.objectiveTarget || ''}
                    onChange={(e) => updateNode(selected.id, { objectiveTarget: e.target.value })}
                    placeholder="Target (e.g. coins)"
                    className="flex-1 px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm"
                  />
                  <input
                    type="number"
                    value={selected.objectiveCount || 1}
                    onChange={(e) => updateNode(selected.id, { objectiveCount: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-20 px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm text-center"
                  />
                </div>
              </div>
            )}

            {/* Choice Settings */}
            {selected.type === 'choice' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-600 uppercase">Choices</div>
                  <Button variant="ghost" size="xs" icon={<Plus size={12} />} onClick={addChoice}>Add</Button>
                </div>
                {selected.choices?.map((choice, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ArrowRight size={12} className="text-amber-400 shrink-0" />
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => updateChoice(i, { text: e.target.value })}
                      className="flex-1 px-2 py-1 rounded border border-amber-200 bg-white text-sm"
                      placeholder="Choice text"
                    />
                    <select
                      value={choice.nextNode || ''}
                      onChange={(e) => updateChoice(i, { nextNode: e.target.value || null })}
                      className="px-2 py-1 rounded border border-amber-200 bg-white text-xs"
                    >
                      <option value="">End</option>
                      {nodes.filter(n => n.id !== selected.id).map(n => (
                        <option key={n.id} value={n.id}>{n.title || n.type}</option>
                      ))}
                    </select>
                    {selected.choices && selected.choices.length > 1 && (
                      <button onClick={() => removeChoice(i)} className="text-amber-400 hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reward Settings */}
            {selected.type === 'reward' && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
                <div className="text-xs font-bold text-purple-600 uppercase">Reward</div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">XP</label>
                    <input
                      type="number"
                      value={selected.reward?.xp || 0}
                      onChange={(e) => updateNode(selected.id, { reward: { ...selected.reward, xp: parseInt(e.target.value) || 0, item: selected.reward?.item } })}
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Item</label>
                    <input
                      type="text"
                      value={selected.reward?.item || ''}
                      onChange={(e) => updateNode(selected.id, { reward: { ...selected.reward, xp: selected.reward?.xp || 0, item: e.target.value || undefined } })}
                      placeholder="Sword, Shield..."
                      className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Next Node */}
            {selected.type !== 'choice' && selected.type !== 'end' && (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Next Node</label>
                <select
                  value={selected.nextNode || ''}
                  onChange={(e) => updateNode(selected.id, { nextNode: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                >
                  <option value="">End quest</option>
                  {nodes.filter(n => n.id !== selected.id).map(n => (
                    <option key={n.id} value={n.id}>{n.title || n.type}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Visual Preview */}
            <div className="p-4 bg-slate-100 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Preview</div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${NODE_COLORS[selected.type]}`} />
                  <span className="font-bold text-sm">{selected.title || 'Untitled'}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{selected.description}</p>
                {selected.type === 'objective' && selected.objective && (
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block">
                    {OBJECTIVE_TYPES.find(o => o.id === selected.objective)?.emoji} {selected.objectiveCount}x {selected.objectiveTarget}
                  </div>
                )}
                {selected.type === 'choice' && selected.choices && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.choices.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">{c.text}</span>
                    ))}
                  </div>
                )}
                {selected.type === 'reward' && selected.reward && (
                  <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded inline-block">
                    ⭐ {selected.reward.xp} XP {selected.reward.item && `+ ${selected.reward.item}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200">
        <Button variant="ghost" onClick={onClose}>Never mind</Button>
        <Button variant="primary" onClick={handleSave}>Save Quest</Button>
      </div>
    </Modal>
  );
};
