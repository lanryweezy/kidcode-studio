import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressTracker } from './ProgressTracker';
import { addXP, recordProjectComplete, updateSkillProgress } from '../../services/educationSystem';

describe('ProgressTracker', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ProgressTracker {...defaultProps} />);
    expect(screen.getByText('Progress Tracker')).toBeDefined();
  });

  it('should show overview tab by default', () => {
    render(<ProgressTracker {...defaultProps} />);
    expect(screen.getByText('Overview')).toBeDefined();
  });

  it('should display level information', () => {
    addXP(150);
    render(<ProgressTracker {...defaultProps} />);
    expect(screen.getByText(/Level 2/)).toBeDefined();
  });

  it('should display project count', () => {
    recordProjectComplete();
    recordProjectComplete();
    render(<ProgressTracker {...defaultProps} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('should switch to achievements tab', () => {
    render(<ProgressTracker {...defaultProps} />);
    const achievementTab = screen.getAllByText('Achievements')[0];
    fireEvent.click(achievementTab);
    expect(screen.getByText('First Steps')).toBeDefined();
  });

  it('should show leaderboard tab', () => {
    render(<ProgressTracker {...defaultProps} />);
    const leaderboardTab = screen.getAllByText('Leaderboard')[0];
    fireEvent.click(leaderboardTab);
    expect(screen.getByText('CodeMaster AI')).toBeDefined();
  });

  it('should display streak count', () => {
    render(<ProgressTracker {...defaultProps} />);
    expect(screen.getByText(/Day Streak/)).toBeDefined();
  });
});
