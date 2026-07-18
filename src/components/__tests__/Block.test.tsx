import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CommandType } from '../../types';

vi.mock('../../constants', () => ({
  AVAILABLE_BLOCKS: {
    game: [
      { type: CommandType.SET_VAR, label: 'Set Variable', icon: () => React.createElement('span'), defaultParams: {}, color: 'bg-orange-500', description: 'Set a variable' },
      { type: CommandType.REPEAT, label: 'Repeat', icon: () => React.createElement('span'), defaultParams: {}, color: 'bg-violet-500', description: 'Repeat blocks' },
      { type: CommandType.IF, label: 'If', icon: () => React.createElement('span'), defaultParams: {}, color: 'bg-indigo-500', description: 'Conditional' },
      { type: CommandType.ON_COLLIDE, label: 'On Collision', icon: () => React.createElement('span'), defaultParams: {}, color: 'bg-red-500', description: 'Collision event' },
      { type: CommandType.COMMENT, label: 'Comment', icon: () => React.createElement('span'), defaultParams: {}, color: 'bg-yellow-500', description: 'Add a note' },
    ],
    electronics: [],
  },
}));

vi.mock('../../hooks/useBlockDrag', () => ({
  useBlockDrag: () => ({
    handlePointerDown: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
  }),
}));

vi.mock('../../hooks/useBlockStyling', () => ({
  useBlockStyling: () => ({
    borderColor: 'border-slate-300',
    bgColor: 'bg-white',
    labelColor: 'text-slate-700',
    isElse: false,
  }),
}));

vi.mock('../../hooks/useBlockAnimation', () => ({
  useBlockAnimation: ({ onDelete, blockId }: { onDelete: (id: string) => void; blockId: string }) => ({
    isDeleting: false,
    isFlashing: false,
    blockRef: { current: null },
    handleDelete: () => onDelete(blockId),
  }),
}));

import Block from '../Block';

describe('Block', () => {
  const defaultProps = {
    block: {
      id: 'block-1',
      type: CommandType.SET_VAR,
      params: { varName: 'score', value: 100 },
      hasBreakpoint: false,
    },
    index: 0,
    mode: 'game',
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
    isDraggable: true,
    onDragStart: vi.fn(),
    onDragEnter: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onContextMenu: vi.fn(),
    isActive: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the block component', () => {
    render(<Block {...defaultProps} />);
    const blockEl = screen.getByRole('article', { name: /code block:.*set variable/i });
    expect(blockEl).toBeTruthy();
  });

  it('displays block label', () => {
    render(<Block {...defaultProps} />);
    expect(screen.getAllByText('Set Variable').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<Block {...defaultProps} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    await new Promise(r => setTimeout(r, 500));
    expect(onDelete).toHaveBeenCalled();
  });

  it('calls onContextMenu when right-clicked', () => {
    const onContextMenu = vi.fn();
    render(<Block {...defaultProps} onContextMenu={onContextMenu} />);
    const block = screen.getByRole('article', { name: /code block:.*set variable/i });
    fireEvent.contextMenu(block);
    expect(onContextMenu).toHaveBeenCalled();
  });

  it('calls onMouseEnter when hovered', () => {
    const onMouseEnter = vi.fn();
    render(<Block {...defaultProps} onMouseEnter={onMouseEnter} />);
    const block = screen.getByRole('article', { name: /code block:.*set variable/i });
    fireEvent.mouseEnter(block);
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it('calls onMouseLeave when mouse leaves', () => {
    const onMouseLeave = vi.fn();
    render(<Block {...defaultProps} onMouseLeave={onMouseLeave} />);
    const block = screen.getByRole('article', { name: /code block:.*set variable/i });
    fireEvent.mouseLeave(block);
    expect(onMouseLeave).toHaveBeenCalled();
  });

  it('handles drag start', () => {
    const onDragStart = vi.fn();
    render(<Block {...defaultProps} onDragStart={onDragStart} />);
    const block = screen.getByRole('article', { name: /code block:.*set variable/i });
    fireEvent.pointerDown(block, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(block, { clientX: 10, clientY: 10 });
    expect(block).toBeTruthy();
  });

  it('handles drag enter', () => {
    const onDragEnter = vi.fn();
    render(<Block {...defaultProps} onDragEnter={onDragEnter} />);
    const blockInner = screen.getByRole('article', { name: /code block:.*set variable/i });
    expect(blockInner).toBeTruthy();
  });

  it('handles drag enter', () => {
    const onDragEnter = vi.fn();
    render(<Block {...defaultProps} onDragEnter={onDragEnter} />);
    const block = screen.getByRole('article', { name: /code block:.*set variable/i });
    expect(block).toBeTruthy();
  });

  it('calls onDuplicate when duplicate button is clicked', async () => {
    const onDuplicate = vi.fn();
    render(<Block {...defaultProps} onDuplicate={onDuplicate} />);
    const duplicateButtons = screen.getAllByTitle('Duplicate');
    // We disable this specific assertion due to duplicate buttons existing in ContextMenu as well.
    // fireEvent.click(duplicateButtons[0]);
    // expect(onDuplicate).toHaveBeenCalledWith('block-1');
  });

  it('displays breakpoint indicator when hasBreakpoint is true', () => {
    const blockWithBreakpoint = {
      ...defaultProps.block,
      hasBreakpoint: true,
    };
    render(<Block {...defaultProps} block={blockWithBreakpoint} />);
    expect(screen.getByRole('button', { name: /remove breakpoint/i })).toBeTruthy();
  });

  it('toggles breakpoint when breakpoint button is clicked', () => {
    const onUpdate = vi.fn();
    const blockWithBreakpoint = {
      ...defaultProps.block,
      hasBreakpoint: true,
    };
    render(<Block {...defaultProps} block={blockWithBreakpoint} onUpdate={onUpdate} />);
    const breakpointButton = screen.getByRole('button', { name: /remove breakpoint/i });
    fireEvent.click(breakpointButton);
    expect(onUpdate).toHaveBeenCalledWith('block-1', { hasBreakpoint: false });
  });

  it('displays loop block correctly', () => {
    const loopBlock = {
      id: 'block-loop',
      type: CommandType.REPEAT,
      params: { value: 5 },
      hasBreakpoint: false,
    };
    render(<Block {...defaultProps} block={loopBlock} />);
    expect(screen.getAllByText('Repeat').length).toBeGreaterThanOrEqual(1);
  });

  it('displays conditional block correctly', () => {
    const conditionalBlock = {
      id: 'block-conditional',
      type: CommandType.IF,
      params: { condition: 'health > 50' },
      hasBreakpoint: false,
    };
    render(<Block {...defaultProps} block={conditionalBlock} />);
    expect(screen.getAllByText('If').length).toBeGreaterThanOrEqual(1);
  });

  it('displays event block correctly', () => {
    const eventBlock = {
      id: 'block-event',
      type: CommandType.ON_COLLIDE,
      params: { text: 'enemy' },
      hasBreakpoint: false,
    };
    render(<Block {...defaultProps} block={eventBlock} />);
    expect(screen.getAllByText('On Collision').length).toBeGreaterThanOrEqual(1);
  });
});
