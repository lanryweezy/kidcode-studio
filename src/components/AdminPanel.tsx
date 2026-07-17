import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Shield, BarChart3, AlertTriangle, Ban, Cpu, Key, Lock, Trash2, RefreshCw } from 'lucide-react';
import {
  getBlockUsageStats,
  getCompletionRate,
  getErrorPatterns,
  getAverageSessionDuration,
  getFeatureAdoption,
  clearAnalytics,
} from '../services/kidcodeAnalytics';
import {
  getErrors,
  clearErrors,
  getBlockedContent,
  clearBlockedContent,
  getAPIUsageSummary,
} from '../services/errorTracker';

const ADMIN_PASSWORD = 'kidcode-admin-2024';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({
  label,
  value,
  icon,
  color,
}) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
    <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
    <div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  </div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onClose }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'errors' | 'moderation' | 'features' | 'api' | 'health'>('stats');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogin = useCallback(() => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Invalid password');
      setPassword('');
    }
  }, [password]);

  const stats = useMemo(() => {
    if (!authenticated) return null;
    return {
      blocks: getBlockUsageStats(),
      completion: getCompletionRate(),
      errors: getErrorPatterns(),
      avgSession: getAverageSessionDuration(),
      features: getFeatureAdoption(),
      apiUsage: getAPIUsageSummary(),
      errorLog: getErrors(),
      blockedContent: getBlockedContent(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, refreshKey]);

  useEffect(() => {
    if (!open) {
      setAuthenticated(false);
      setPassword('');
      setPasswordError('');
    }
  }, [open]);

  useEffect(() => {
    if (!authenticated) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [authenticated, onClose]);

  if (!open) return null;

  if (!authenticated) {
    return (
      <Modal open={open} onClose={onClose} title="Admin Access" size="sm">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 rounded-full bg-slate-100">
            <Lock size={32} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 text-center">Enter the admin password to access system tools.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold text-center"
            autoFocus
          />
          {passwordError && <p className="text-xs text-red-500 font-bold">{passwordError}</p>}
          <Button variant="primary" fullWidth onClick={handleLogin}>
            <Key size={16} className="mr-1" /> Authenticate
          </Button>
        </div>
      </Modal>
    );
  }

  if (!stats) return null;

  const tabs = [
    { id: 'stats' as const, label: 'System Stats', icon: <BarChart3 size={14} /> },
    { id: 'errors' as const, label: 'Error Log', icon: <AlertTriangle size={14} /> },
    { id: 'moderation' as const, label: 'Moderation', icon: <Ban size={14} /> },
    { id: 'features' as const, label: 'Feature Usage', icon: <Cpu size={14} /> },
    { id: 'api' as const, label: 'API Usage', icon: <Shield size={14} /> },
    { id: 'health' as const, label: 'Health', icon: <Cpu size={14} /> },
  ];

  const formatDuration = (ms: number) => {
    if (ms === 0) return '0m';
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  return (
    <Modal open={open} onClose={onClose} title="Admin Panel" size="xl">
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

        <div className="flex justify-end">
          <Button variant="ghost" size="xs" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw size={12} className="mr-1" /> Refresh
          </Button>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                label="Total Projects"
                value={stats.completion.total}
                icon={<BarChart3 size={20} />}
                color="bg-violet-100 text-violet-600"
              />
              <StatCard
                label="Completion Rate"
                value={`${Math.round(stats.completion.rate * 100)}%`}
                icon={<Cpu size={20} />}
                color="bg-emerald-100 text-emerald-600"
              />
              <StatCard
                label="Avg Session"
                value={formatDuration(stats.avgSession)}
                icon={<Shield size={20} />}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="AI Calls"
                value={stats.apiUsage.totalCalls}
                icon={<AlertTriangle size={20} />}
                color="bg-amber-100 text-amber-600"
              />
              <StatCard
                label="Total Tokens"
                value={stats.apiUsage.totalTokens.toLocaleString()}
                icon={<Cpu size={20} />}
                color="bg-pink-100 text-pink-600"
              />
              <StatCard
                label="Total Cost"
                value={formatCost(stats.apiUsage.totalCost)}
                icon={<BarChart3 size={20} />}
                color="bg-rose-100 text-rose-600"
              />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top Blocks</h4>
              <div className="space-y-2">
                {stats.blocks.length === 0 && <p className="text-xs text-slate-400">No block usage data yet.</p>}
                {stats.blocks.slice(0, 5).map((b) => (
                  <div key={b.blockType} className="flex items-center justify-between text-sm">
                    <span className="font-mono font-bold text-slate-600">{b.blockType}</span>
                    <span className="text-slate-400">{b.count} uses</span>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="danger" size="xs" onClick={() => { clearAnalytics(); setRefreshKey(k => k + 1); }}>
              <Trash2 size={12} className="mr-1" /> Clear Analytics
            </Button>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Error Log ({stats.errorLog.length})</h4>
              <Button variant="danger" size="xs" onClick={() => { clearErrors(); setRefreshKey(k => k + 1); }}>
                <Trash2 size={12} className="mr-1" /> Clear
              </Button>
            </div>
            {stats.errorLog.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No errors logged.</p>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.errorLog.map((e) => (
                <div key={e.id} className="bg-white rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-red-600 text-xs">{e.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      e.type === 'unhandled' ? 'bg-red-100 text-red-600' :
                      e.type === 'unhandledRejection' ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>{e.type}</span>
                  </div>
                  <p className="text-slate-600">{e.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span>{new Date(e.timestamp).toLocaleString()}</span>
                    {e.context && <span className="font-mono">[{JSON.stringify(e.context)}]</span>}
                  </div>
                </div>
              ))}
            </div>
            {stats.errors.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Error Patterns</h4>
                <div className="space-y-2">
                  {stats.errors.slice(0, 5).map((e) => (
                    <div key={e.errorCode} className="flex items-center justify-between text-sm">
                      <span className="font-mono font-bold text-red-500">{e.errorCode}</span>
                      <span className="text-slate-400">{e.count}x — {e.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Blocked Content ({stats.blockedContent.length})
              </h4>
              <Button variant="danger" size="xs" onClick={() => { clearBlockedContent(); setRefreshKey(k => k + 1); }}>
                <Trash2 size={12} className="mr-1" /> Clear
              </Button>
            </div>
            {stats.blockedContent.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No blocked content attempts.</p>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.blockedContent.map((b) => (
                <div key={b.id} className="bg-white rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">{b.blockType}</span>
                    <span className="text-[10px] text-slate-400">{new Date(b.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 truncate">"{b.input}"</p>
                  <p className="text-xs text-slate-400 mt-1">Reason: {b.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feature Adoption</h4>
            {stats.features.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No feature usage data.</p>
            )}
            <div className="space-y-2">
              {stats.features.map((f) => (
                <div key={f.featureId} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-700">{f.featureId}</span>
                    <div className="text-[10px] text-slate-400">
                      First: {new Date(f.firstUsed).toLocaleDateString()} | Last: {new Date(f.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-lg font-black text-violet-600">{f.useCount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Calls"
                value={stats.apiUsage.totalCalls}
                icon={<Shield size={20} />}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="Success Rate"
                value={`${Math.round(stats.apiUsage.successRate * 100)}%`}
                icon={<Cpu size={20} />}
                color="bg-emerald-100 text-emerald-600"
              />
              <StatCard
                label="Total Tokens"
                value={stats.apiUsage.totalTokens.toLocaleString()}
                icon={<BarChart3 size={20} />}
                color="bg-amber-100 text-amber-600"
              />
              <StatCard
                label="Total Cost"
                value={formatCost(stats.apiUsage.totalCost)}
                icon={<AlertTriangle size={20} />}
                color="bg-rose-100 text-rose-600"
              />
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Avg Session"
                value={formatDuration(stats.avgSession)}
                icon={<Cpu size={20} />}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="Completion"
                value={`${Math.round(stats.completion.rate * 100)}%`}
                icon={<BarChart3 size={20} />}
                color="bg-emerald-100 text-emerald-600"
              />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">User Agent</span>
                  <span className="font-mono text-xs text-slate-600 max-w-[60%] truncate">{navigator.userAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Language</span>
                  <span className="text-slate-600">{navigator.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Online</span>
                  <span className={navigator.onLine ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {navigator.onLine ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PWA Supported</span>
                  <span className="text-slate-600">
                    {window.matchMedia('(display-mode: standalone)').matches ? 'Installed' : 'Browser'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Screen</span>
                  <span className="text-slate-600">{window.screen.width}x{window.screen.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Viewport</span>
                  <span className="text-slate-600">{window.innerWidth}x{window.innerHeight}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AdminPanel;
