import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, DollarSign, Users, TrendingUp, Clock, Shield, CreditCard, PiggyBank } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  emoji: string;
  balance: number;
  interestRate: number;
  type: 'savings' | 'checking' | 'loan';
}

interface Loan {
  id: string;
  borrower: string;
  amount: number;
  interestRate: number;
  term: number;
  paid: number;
  status: 'active' | 'paid' | 'defaulted';
}

interface GameState {
  day: number;
  cash: number;
  totalDeposits: number;
  totalLoans: number;
  accounts: Account[];
  loans: Loan[];
  reputation: number;
  goal: number;
  gameOver: boolean;
}

const ACCOUNT_NAMES = ['Savings Plus', 'High Yield', 'Student Account', 'Business Account'];
const ACCOUNT_EMOJIS = ['💰', '📈', '🎓', '🏢'];
const BORROWER_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];

export const BankSimulatorGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    cash: 100000,
    totalDeposits: 0,
    totalLoans: 0,
    accounts: ACCOUNT_NAMES.slice(0, 2).map((name, i) => ({
      id: `acc_${i}`,
      name,
      emoji: ACCOUNT_EMOJIS[i],
      balance: 5000 + Math.floor(Math.random() * 10000),
      interestRate: 2 + Math.random() * 3,
      type: 'savings' as const,
    })),
    loans: [],
    reputation: 70,
    goal: 500000,
    gameOver: false,
  });

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Issue loan
  const issueLoan = useCallback(() => {
    setGameState(prev => {
      const borrower = BORROWER_NAMES[Math.floor(Math.random() * BORROWER_NAMES.length)];
      const amount = 5000 + Math.floor(Math.random() * 20000);
      const interestRate = 5 + Math.random() * 10;
      const term = 12 + Math.floor(Math.random() * 24);

      if (prev.cash < amount) {
        setNotification('Not enough cash!');
        setTimeout(() => setNotification(null), 1500);
        return prev;
      }

      return {
        ...prev,
        cash: prev.cash - amount,
        loans: [...prev.loans, {
          id: `loan_${Date.now()}`,
          borrower,
          amount,
          interestRate,
          term,
          paid: 0,
          status: 'active' as const,
        }],
      };
    });
    setNotification('Loan issued!');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  // Game tick
  const tick = useCallback(() => {
    if (isPaused || gameState.gameOver) return;

    setGameState(prev => {
      let newDay = prev.day + 0.1 * speed;
      let dayIncome = 0;

      // Process accounts - pay interest
      const updatedAccounts = prev.accounts.map(acc => {
        const interest = acc.balance * (acc.interestRate / 100) * 0.01 * speed;
        dayIncome -= interest;
        return { ...acc, balance: acc.balance + interest };
      });

      // Process loans - collect payments
      const updatedLoans = prev.loans.map(loan => {
        if (loan.status !== 'active') return loan;
        
        const payment = (loan.amount / loan.term) * (1 + loan.interestRate / 100) * 0.1 * speed;
        dayIncome += payment;

        const newPaid = loan.paid + payment;
        if (newPaid >= loan.amount * (1 + loan.interestRate / 100)) {
          return { ...loan, paid: newPaid, status: 'paid' as const };
        }
        return { ...loan, paid: newPaid };
      });

      return {
        ...prev,
        day: newDay,
        accounts: updatedAccounts,
        loans: updatedLoans,
        cash: prev.cash + dayIncome,
        totalDeposits: updatedAccounts.reduce((sum, a) => sum + a.balance, 0),
        totalLoans: updatedLoans.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.amount - l.paid), 0),
        gameOver: prev.cash + dayIncome >= prev.goal,
      };
    });
  }, [isPaused, gameState.gameOver, speed]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white">🏠</button>
          <span className="text-white font-bold">Day {Math.floor(gameState.day)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-green-400 font-bold">${gameState.cash.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Cash</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">💰 ${gameState.totalDeposits.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Deposits</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold">📋 ${gameState.totalLoans.toLocaleString()}</div>
            <div className="text-slate-500 text-xs">Loans</div>
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
        {/* Accounts */}
        <div className="flex-1 bg-slate-950 p-6">
          <h3 className="text-white font-bold mb-4">💰 Accounts</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {gameState.accounts.map(acc => (
              <div
                key={acc.id}
                onClick={() => setSelectedAccount(acc.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedAccount === acc.id
                    ? 'bg-slate-700 border-2 border-yellow-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{acc.emoji}</span>
                  <div>
                    <div className="text-white font-bold">{acc.name}</div>
                    <div className="text-green-400 font-bold">${acc.balance.toLocaleString()}</div>
                    <div className="text-slate-400 text-xs">{acc.interestRate.toFixed(1)}% APY</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-white font-bold mb-4">📋 Loans</h3>
          <div className="flex gap-4 mb-4">
            <button onClick={issueLoan} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              + Issue New Loan
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gameState.loans.filter(l => l.status === 'active').map(loan => (
              <div key={loan.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-bold">{loan.borrower}</div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    loan.status === 'paid' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {loan.status}
                  </div>
                </div>
                <div className="text-green-400 font-bold mb-2">${loan.amount.toLocaleString()}</div>
                <div className="h-2 bg-slate-700 rounded-full mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                    style={{ width: `${(loan.paid / (loan.amount * (1 + loan.interestRate / 100))) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{loan.interestRate.toFixed(1)}% APR</span>
                  <span>${loan.paid.toFixed(0)} / ${(loan.amount * (1 + loan.interestRate / 100)).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-white font-bold mb-4">📊 Bank Stats</h3>
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Total Deposits</div>
              <div className="text-blue-400 font-bold">${gameState.totalDeposits.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Outstanding Loans</div>
              <div className="text-yellow-400 font-bold">${gameState.totalLoans.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Active Loans</div>
              <div className="text-purple-400 font-bold">{gameState.loans.filter(l => l.status === 'active').length}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Reputation</div>
              <div className="text-yellow-400 font-bold">⭐ {gameState.reputation}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-slate-400 text-sm">Goal</div>
              <div className="text-yellow-400 font-bold">${gameState.goal.toLocaleString()}</div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                  style={{ width: `${Math.min(100, (gameState.cash / gameState.goal) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
