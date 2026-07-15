export interface Employee {
  id: string;
  name: string;
  emoji: string;
  role: string;
  skill: number;
  salary: number;
  morale: number;
  efficiency: number;
  hiredDay: number;
}

export interface StaffState {
  employees: Employee[];
  maxEmployees: number;
  totalSalaryCost: number;
}

const EMPLOYEE_NAMES = ['Alex', 'Jordan', 'Sam', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Blake', 'Drew', 'Emery', 'Finley'];
const EMPLOYEE_EMOJIS = ['🧑', '👩', '👨', '🧔', '👩‍🦰', '👨‍🦱', '🧑‍🦳', '👩‍🦱'];

export const STAFF_ROLES = [
  { role: 'Cashier', emoji: '💵', baseSkill: 3, baseSalary: 200 },
  { role: 'Clerk', emoji: '📋', baseSkill: 4, baseSalary: 250 },
  { role: 'Manager', emoji: '👔', baseSkill: 6, baseSalary: 400 },
  { role: 'Chef', emoji: '👨‍🍳', baseSkill: 5, baseSalary: 350 },
  { role: 'Cleaner', emoji: '🧹', baseSkill: 2, baseSalary: 150 },
  { role: 'Security', emoji: '🛡️', baseSkill: 4, baseSalary: 300 },
  { role: 'Marketer', emoji: '📢', baseSkill: 5, baseSalary: 320 },
  { role: 'Engineer', emoji: '🔧', baseSkill: 7, baseSalary: 450 },
];

export function createStaffState(maxEmployees: number = 20): StaffState {
  return { employees: [], maxEmployees, totalSalaryCost: 0 };
}

export function hireEmployee(state: StaffState, roleIndex: number, currentDay: number): StaffState | null {
  if (state.employees.length >= state.maxEmployees) return null;

  const role = STAFF_ROLES[roleIndex % STAFF_ROLES.length];
  const skill = role.baseSkill + Math.floor(Math.random() * 4);
  const salary = role.baseSalary + skill * 20;

  const employee: Employee = {
    id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: EMPLOYEE_NAMES[Math.floor(Math.random() * EMPLOYEE_NAMES.length)],
    emoji: EMPLOYEE_EMOJIS[Math.floor(Math.random() * EMPLOYEE_EMOJIS.length)],
    role: role.role,
    skill,
    salary,
    morale: 70 + Math.floor(Math.random() * 30),
    efficiency: 60 + Math.floor(Math.random() * 30),
    hiredDay: currentDay,
  };

  return {
    ...state,
    employees: [...state.employees, employee],
    totalSalaryCost: state.totalSalaryCost + salary,
  };
}

export function fireEmployee(state: StaffState, employeeId: string): StaffState {
  const employee = state.employees.find(e => e.id === employeeId);
  if (!employee) return state;

  return {
    ...state,
    employees: state.employees.filter(e => e.id !== employeeId),
    totalSalaryCost: state.totalSalaryCost - employee.salary,
  };
}

export function trainEmployee(state: StaffState, employeeId: string): StaffState {
  return {
    ...state,
    employees: state.employees.map(e => {
      if (e.id !== employeeId) return e;
      return {
        ...e,
        skill: Math.min(10, e.skill + 1),
        efficiency: Math.min(100, e.efficiency + 5),
      };
    }),
  };
}

export function updateMorale(state: StaffState, dt: number): StaffState {
  return {
    ...state,
    employees: state.employees.map(e => {
      // Morale naturally decays slightly
      const newMorale = Math.max(0, Math.min(100, e.morale - 0.1 * dt + (e.efficiency > 80 ? 0.05 : 0)));
      return { ...e, morale: newMorale };
    }),
  };
}

export function getTeamEfficiency(state: StaffState): number {
  if (state.employees.length === 0) return 0;
  const totalEfficiency = state.employees.reduce((sum, e) => sum + e.efficiency, 0);
  return totalEfficiency / state.employees.length;
}

export function getTeamSkill(state: StaffState): number {
  if (state.employees.length === 0) return 0;
  const totalSkill = state.employees.reduce((sum, e) => sum + e.skill, 0);
  return totalSkill / state.employees.length;
}

export function getRoleCount(state: StaffState, role: string): number {
  return state.employees.filter(e => e.role === role).length;
}
