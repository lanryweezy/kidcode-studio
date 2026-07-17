import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Users, FileText, Download, Copy, Check, Plus, Trash2 } from 'lucide-react';

const TEACHER_PREFIX = 'teacher-';

interface ClassCode {
  id: string;
  code: string;
  name: string;
  createdAt: number;
  studentCount: number;
}

interface AssignmentTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  blockCount: number;
  createdAt: number;
}

interface StudentProgress {
  name: string;
  classCode: string;
  projectsCompleted: number;
  lastActive: number;
  averageScore: number;
}

interface TeacherDashboardProps {
  open: boolean;
  onClose: () => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(TEACHER_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(TEACHER_PREFIX + key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const defaultTemplates: AssignmentTemplate[] = [
  { id: 'tpl_1', name: 'Hello World', description: 'Create your first program that displays a message', difficulty: 'easy', blockCount: 3, createdAt: Date.now() },
  { id: 'tpl_2', name: 'Moving Character', description: 'Make a character move across the screen', difficulty: 'easy', blockCount: 5, createdAt: Date.now() },
  { id: 'tpl_3', name: 'Simple Game', description: 'Build a basic game with score tracking', difficulty: 'medium', blockCount: 10, createdAt: Date.now() },
  { id: 'tpl_4', name: 'Interactive Story', description: 'Create a story with user choices', difficulty: 'medium', blockCount: 8, createdAt: Date.now() },
  { id: 'tpl_5', name: 'Physics Playground', description: 'Explore gravity and collisions', difficulty: 'hard', blockCount: 15, createdAt: Date.now() },
];

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'progress' | 'templates' | 'export'>('classes');
  const [classes, setClasses] = useState<ClassCode[]>(() => loadFromStorage('classes', []));
  const [templates, setTemplates] = useState<AssignmentTemplate[]>(() => loadFromStorage('templates', defaultTemplates));
  const [students] = useState<StudentProgress[]>(() => loadFromStorage('students', []));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newTemplate, setNewTemplate] = useState<{ name: string; description: string; difficulty: 'easy' | 'medium' | 'hard' }>({ name: '', description: '', difficulty: 'easy' });

  useEffect(() => {
    saveToStorage('classes', classes);
  }, [classes]);

  useEffect(() => {
    saveToStorage('templates', templates);
  }, [templates]);

  const createClass = useCallback(() => {
    const name = newClassName.trim() || `Class ${classes.length + 1}`;
    const newClass: ClassCode = {
      id: `cls_${Date.now()}`,
      code: generateClassCode(),
      name,
      createdAt: Date.now(),
      studentCount: 0,
    };
    setClasses(prev => [...prev, newClass]);
    setNewClassName('');
  }, [newClassName, classes.length]);

  const deleteClass = useCallback((id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  }, []);

  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const addTemplate = useCallback(() => {
    if (!newTemplate.name.trim()) return;
    const tpl: AssignmentTemplate = {
      id: `tpl_${Date.now()}`,
      name: newTemplate.name.trim(),
      description: newTemplate.description.trim(),
      difficulty: newTemplate.difficulty,
      blockCount: 0,
      createdAt: Date.now(),
    };
    setTemplates(prev => [...prev, tpl]);
    setNewTemplate({ name: '', description: '', difficulty: 'easy' });
  }, [newTemplate]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const exportGrades = useCallback(() => {
    if (students.length === 0) return;
    const headers = ['Name', 'Class Code', 'Projects Completed', 'Average Score', 'Last Active'];
    const rows = students.map(s => [
      s.name,
      s.classCode,
      s.projectsCompleted.toString(),
      s.averageScore.toString(),
      new Date(s.lastActive).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kidcode-grades-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [students]);

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-emerald-100 text-emerald-600';
      case 'medium': return 'bg-amber-100 text-amber-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const tabs = [
    { id: 'classes' as const, label: 'Classes', icon: <Users size={14} /> },
    { id: 'progress' as const, label: 'Student Progress', icon: <BarChart3Icon size={14} /> },
    { id: 'templates' as const, label: 'Templates', icon: <FileText size={14} /> },
    { id: 'export' as const, label: 'Export Grades', icon: <Download size={14} /> },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Teacher Dashboard" size="xl">
      <div className="space-y-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'classes' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createClass(); }}
                placeholder="Class name (optional)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-bold"
              />
              <Button variant="primary" size="md" onClick={createClass}>
                <Plus size={14} className="mr-1" /> Create Class
              </Button>
            </div>

            {classes.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No classes created yet.</p>
            )}

            <div className="space-y-2">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{cls.name}</div>
                    <div className="text-xs text-slate-400">
                      Created {new Date(cls.createdAt).toLocaleDateString()} | {cls.studentCount} students
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyCode(cls.code, cls.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      {copiedId === cls.id ? <Check size={12} /> : <Copy size={12} />}
                      {cls.code}
                    </button>
                    <button
                      onClick={() => deleteClass(cls.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-3">
            {students.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                No student data yet. Students appear here after joining a class.
              </p>
            )}
            <div className="space-y-2">
              {students.map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-400">Class: {s.classCode}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-violet-600">{s.projectsCompleted}</div>
                      <div className="text-[10px] text-slate-400 uppercase">projects</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span>Avg Score: <span className="font-bold text-slate-600">{s.averageScore}%</span></span>
                    <span>Last Active: {new Date(s.lastActive).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Template</h4>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                placeholder="Template name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-bold"
              />
              <input
                type="text"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(p => ({ ...p, description: e.target.value }))}
                placeholder="Description"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-bold"
              />
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setNewTemplate(p => ({ ...p, difficulty: d }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      newTemplate.difficulty === d ? difficultyColor(d) : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <Button variant="primary" size="sm" onClick={addTemplate} fullWidth>
                <Plus size={14} className="mr-1" /> Add Template
              </Button>
            </div>

            <div className="space-y-2">
              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{tpl.name}</div>
                    <div className="text-xs text-slate-400">{tpl.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${difficultyColor(tpl.difficulty)}`}>
                        {tpl.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400">{tpl.blockCount} blocks</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-center space-y-4">
              <Download size={32} className="text-slate-400 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-700">Export Student Grades</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Download a CSV file with all student progress data.
                </p>
              </div>
              {students.length === 0 ? (
                <p className="text-xs text-slate-400">No student data to export.</p>
              ) : (
                <Button variant="primary" onClick={exportGrades}>
                  <Download size={14} className="mr-1" /> Download CSV ({students.length} students)
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

function BarChart3Icon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export default TeacherDashboard;
