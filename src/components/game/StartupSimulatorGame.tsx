import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, Users, Code, DollarSign, TrendingUp, Zap, Target, Award } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string;
  emoji: string;
  skill: number;
  salary: number;
  morale: number;
}

interface Project {
  id: string;
  name: string;
  emoji: string;
  difficulty: number;
  reward: number;
  progress: number;
  requiredSkill: number;
  status: 'available' | 'in_progress' | 'completed';
}

interface Startup {
  name: string;
  valuation: number;
  funding: number;
  round: string;
  employees: Employee[];
  projects: Project[];
}

interface GameState {
  month: number;
  cash: number;
  valuation: number;
  funding: number;
  round: string;
  employees: Employee[];
  projects: Project[];
  completedProjects: number;
  totalRevenue: number;
  morale: number;
  goal: number;
  gameOver: boolean;
  techLevel: number;
}

const EMPLOYEE_NAMES = ['Alex', 'Jordan', 'Sam', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery'];
const EMPLOYEE_ROLES = [
  { role: 'Developer', emoji: '👨‍💻', baseSkill: 5, baseSalary: 500 },
  { role: 'Designer', emoji: '🎨', baseSkill: 4, baseSalary: 450 },
  { role: 'Manager', emoji: '📋', baseSkill: 3, baseSalary: 400 },
  { role: 'Marketer', emoji: '📢', baseSkill: 3, baseSalary: 350 },
  { role: 'Data Analyst', emoji: '📊', baseSkill: 4, baseSalary: 420 },
];

const PROJECT_TEMPLATES = [
  { name: 'Mobile App', emoji: '📱', difficulty: 3, reward: 5000, requiredSkill: 5 },
  { name: 'Website', emoji: '🌐', difficulty: 2, reward: 3000, requiredSkill: 3 },
  { name: 'AI Feature', emoji: '🤖', difficulty: 5, reward: 10000, requiredSkill: 8 },
  { name: 'Game', emoji: '🎮', difficulty: 4, reward: 7000, requiredSkill: 6 },
  { name: 'E-commerce', emoji: '🛒', difficulty: 3, reward: 4000, requiredSkill: 4 },
  { name: 'SaaS Platform', emoji: '☁️', difficulty: 6, reward: 15000, requiredSkill: 10 },
];

const FUNDING_ROUNDS = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'IPO'];

export const StartupSimulatorGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    month: 1,
    cash: 10000,
    valuation: 50000,
    funding: 10000,
    round: 'Pre-Seed',
    employees: [
      { id: 'emp_1', name: 'You', role: 'Founder', emoji: '🧑‍💼', skill: 10, salary: 0, morale: 100 },
    ],
    projects: PROJECT_TEMPLATES.slice(0, 3).map((p, i) => ({
      ...p,
      id: `proj_${i}`,
      progress: 0,
      status: 'available' as const,
    })),
    completedProjects: 0,
    totalRevenue: 0,
    morale: 80,
    goal: 1000000,
    gameOver: false,
    techLevel: 1,
  });

  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Hire employee
  const hireEmployee = useCallback(() => {
    setGameState(prev => {
      const role = EMPLOYEE_ROLES[Math.floor(Math.random() * EMPLOYEE_ROLES.length)];
      const name = EMPLOYEE_NAMES[Math.floor(Math.random() * EMPLOYEE_NAMES.length)];
      const skill = role.baseSkill + Math.floor(Math.random() * 3);
      const salary = role.baseSalary + skill * 50;

      if (prev.cash < salary * 2) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - salary * 2,
        employees: [...prev.employees, {
          id: `emp_${Date.now()}`,
          name,
          role: role.role,
          emoji: role.emoji,
          skill,
          salary,
          morale: 80,
        }],
      };
    });
    setNotification('Employee hired!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Start project
  const startProject = useCallback((projectId: string) => {
    setGameState(prev => {
      const project = prev.employees.find(e => e.role === 'Founder')?.skill;
      return {
        ...prev,
        projects: prev.projects.map(p =>
          p.id === projectId ? { ...p, status: 'in_progress' as const } : p
        ),
      };
    });
  }, []);

  // Assign employee to project
  const assignEmployee = useCallback((employeeId: string, projectId: string) => {
    // Simple assignment - in full version would track assignments
    setNotification('Employee assigned!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newMonth = prev.month + 0.1 * speed;

      // Monthly processing
      if (newMonth % 1 === 0 && Math.floor(newMonth) > prev.month) {
        // Pay salaries
        const totalSalaries = prev.employees.reduce((sum, e) => sum + e.salary, 0);
        
        // Progress projects
        const updatedProjects = prev.projects.map(p => {
          if (p.status !== 'in_progress') return p;
          const avgSkill = prev.employees.reduce((sum, e) => sum + e.skill, 0) / prev.employees.length;
          const progressGain = (avgSkill / p.difficulty) * 10;
          const newProgress = Math.min(100, p.progress + progressGain);
          
          if (newProgress >= 100) {
            return { ...p, progress: 100, status: 'completed' as const };
          }
          return { ...p, progress: newProgress };
        });

        const completedThisMonth = updatedProjects.filter(p => p.status === 'completed').length - 
          prev.projects.filter(p => p.status === 'completed').length;

        // Revenue from completed projects
        const revenue = completedThisMonth * 1000;

        return {
          ...prev,
          month: newMonth,
          cash: prev.cash - totalSalaries + revenue,
          projects: updatedProjects,
          completedProjects: prev.completedProjects + completedThisMonth,
          totalRevenue: prev.totalRevenue + revenue,
          gameOver: prev.cash >= prev.goal,
        };
      }

      return { ...prev, month: newMonth };
    });
  }, [isPaused, gameState.gameOver, speed]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white">🏠</button>
          <span className="text-white font-bold">Month {Math.floor(gameState.month)}</span>
          <span className="text-slate-400">🚀 {gameState.round}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-green-400 font-bold">${gameState.cash.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">${gameState.valuation.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Valuation</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">{gameState.employees.length}</div>
            <div className="text-slate-500 text-xs">Team</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPaused(!isPaused)} className="px-3 py-1 bg-slate-800 text-white rounded-lg text-sm">
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-slate-800 text-white rounded-lg px-2 py-1 text-sm">
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
        </div>
      </div>

      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Team Panel */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">👥 Team</h3>
            <button onClick={hireEmployee} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              + Hire
            </button>
          </div>
          <div className="space-y-3">
            {gameState.employees.map(emp => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  selectedEmployee === emp.id
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emp.emoji}</span>
                  <div className="flex-1">
                    <div className="text-white font-bold">{emp.name}</div>
                    <div className="text-slate-400 text-sm">{emp.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-sm">⭐ {emp.skill}</div>
                    <div className="text-slate-500 text-xs">${emp.salary}/mo</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Panel */}
        <div className="flex-1 bg-slate-950 p-6">
          <h3 className="text-white font-bold mb-4">💼 Projects</h3>
          <div className="grid grid-cols-2 gap-4">
            {gameState.projects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedProject === project.id
                    ? 'bg-slate-700 border-2 border-slate-500'
                    : project.status === 'completed'
                    ? 'bg-green-900/30 border border-green-700'
                    : project.status === 'in_progress'
                    ? 'bg-blue-900/30 border border-blue-700'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{project.emoji}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    project.status === 'completed' ? 'bg-green-600 text-white' :
                    project.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {project.status === 'completed' ? '✅ Done' :
                     project.status === 'in_progress' ? '🔄 Working' : '📋 Available'}
                  </span>
                </div>
                <h4 className="text-white font-bold mb-1">{project.name}</h4>
                <div className="text-slate-400 text-sm mb-3">
                  Difficulty: {'⭐'.repeat(project.difficulty)} • Reward: ${project.reward.toLocaleString()}
                </div>
                {project.status === 'in_progress' && (
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                )}
                {project.status === 'available' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); startProject(project.id); }}
                    className="w-full mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Start Project
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-64 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">📊 Stats</h3>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Completed Projects</div>
              <div className="text-blue-400 font-bold">{gameState.completedProjects}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Revenue</div>
              <div className="text-green-400 font-bold">${gameState.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Tech Level</div>
              <div className="text-purple-400 font-bold">Lv. {gameState.techLevel}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Goal</div>
              <div className="text-yellow-400 font-bold">${gameState.goal.toLocaleString()}</div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                  style={{ width: `${Math.min(100, (gameState.valuation / gameState.goal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
