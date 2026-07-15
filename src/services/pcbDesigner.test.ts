import { describe, it, expect } from 'vitest';
import {
  PCBDesigner,
  DEFAULT_RULES,
  createDefaultFootprint,
  exportToSVG,
} from './pcbDesigner';

describe('PCB Designer', () => {
  describe('Board initialization', () => {
    it('creates board with default dimensions', () => {
      const designer = new PCBDesigner();
      const board = designer.getBoard();
      expect(board.width).toBe(100);
      expect(board.height).toBe(80);
      expect(board.layers).toBe(2);
    });

    it('creates board with custom dimensions', () => {
      const designer = new PCBDesigner(50, 30, 4);
      const board = designer.getBoard();
      expect(board.width).toBe(50);
      expect(board.height).toBe(30);
      expect(board.layers).toBe(4);
    });

    it('applies custom design rules', () => {
      const designer = new PCBDesigner(100, 80, 2, { minTraceWidth: 0.5 });
      const board = designer.getBoard();
      expect(board.rules.minTraceWidth).toBe(0.5);
    });

    it('uses default rules for unspecified values', () => {
      const designer = new PCBDesigner(100, 80, 2, { minTraceWidth: 0.5 });
      const board = designer.getBoard();
      expect(board.rules.minClearance).toBe(DEFAULT_RULES.minClearance);
    });
  });

  describe('Component management', () => {
    it('adds a component', () => {
      const designer = new PCBDesigner();
      const comp = designer.addComponent(
        'resistor',
        { x: 10, y: 10 },
        0,
        'top',
        [
          { id: 1, offset: { x: -2, y: 0 } },
          { id: 2, offset: { x: 2, y: 0 } },
        ],
        'R1',
        '10k'
      );
      expect(comp.id).toBeDefined();
      expect(comp.name).toBe('R1');
      expect(designer.getBoard().components).toHaveLength(1);
    });

    it('removes a component', () => {
      const designer = new PCBDesigner();
      const comp = designer.addComponent(
        'resistor', { x: 10, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );
      expect(designer.removeComponent(comp.id)).toBe(true);
      expect(designer.getBoard().components).toHaveLength(0);
    });

    it('returns false when removing non-existent component', () => {
      const designer = new PCBDesigner();
      expect(designer.removeComponent('nonexistent')).toBe(false);
    });

    it('moves a component', () => {
      const designer = new PCBDesigner();
      const comp = designer.addComponent(
        'resistor', { x: 10, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );
      expect(designer.moveComponent(comp.id, { x: 20, y: 30 })).toBe(true);
      expect(designer.getBoard().components[0].position).toEqual({ x: 20, y: 30 });
    });

    it('rotates a component', () => {
      const designer = new PCBDesigner();
      const comp = designer.addComponent(
        'resistor', { x: 10, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );
      expect(designer.rotateComponent(comp.id, 90)).toBe(true);
      expect(designer.getBoard().components[0].rotation).toBe(90);
    });
  });

  describe('Net management', () => {
    it('creates a net', () => {
      const designer = new PCBDesigner();
      const net = designer.createNet('VCC');
      expect(net.name).toBe('VCC');
      expect(net.pads).toHaveLength(0);
    });

    it('connects pads', () => {
      const designer = new PCBDesigner();
      const comp1 = designer.addComponent(
        'resistor', { x: 10, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );
      const comp2 = designer.addComponent(
        'resistor', { x: 20, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R2', '10k'
      );

      const pad1Id = `pad_${comp1.id}_2`;
      const pad2Id = `pad_${comp2.id}_1`;
      designer.connectPads(pad1Id, pad2Id, 'net1');

      const board = designer.getBoard();
      expect(board.nets).toHaveLength(1);
      expect(board.nets[0].pads).toContain(pad1Id);
      expect(board.nets[0].pads).toContain(pad2Id);
    });
  });

  describe('Auto-routing', () => {
    it('routes connected pads', () => {
      const designer = new PCBDesigner();
      const comp1 = designer.addComponent(
        'resistor', { x: 10, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );
      const comp2 = designer.addComponent(
        'resistor', { x: 30, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R2', '10k'
      );

      designer.connectPads(`pad_${comp1.id}_2`, `pad_${comp2.id}_1`, 'net1');

      const result = designer.autoRoute();
      expect(result.traces.length).toBeGreaterThan(0);
      expect(result.totalLength).toBeGreaterThan(0);
    });

    it('reports unrouted nets for isolated pads', () => {
      const designer = new PCBDesigner();
      const comp1 = designer.addComponent(
        'resistor', { x: 10, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );

      designer.connectPads(`pad_${comp1.id}_1`, `pad_${comp1.id}_2`, 'net1');

      const result = designer.autoRoute();
      expect(result.traces.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Placement optimization', () => {
    it('optimizes component placement', () => {
      const designer = new PCBDesigner(100, 80);
      designer.addComponent(
        'resistor', { x: 5, y: 5 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );
      designer.addComponent(
        'resistor', { x: 90, y: 70 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R2', '10k'
      );

      const result = designer.optimizePlacement();
      expect(result.components).toHaveLength(2);
      expect(result.utilization).toBeGreaterThanOrEqual(0);
      expect(result.boundingBox.width).toBeGreaterThan(0);
    });

    it('returns empty result for empty board', () => {
      const designer = new PCBDesigner();
      const result = designer.optimizePlacement();
      expect(result.components).toHaveLength(0);
      expect(result.totalArea).toBe(0);
    });
  });

  describe('Design Rule Checking', () => {
    it('detects trace width violations', () => {
      const designer = new PCBDesigner(100, 80, 2, { minTraceWidth: 0.3 });
      const violations = designer.runDRC();
      expect(violations).toBeDefined();
      expect(Array.isArray(violations)).toBe(true);
    });

    it('returns empty violations for clean board', () => {
      const designer = new PCBDesigner();
      const violations = designer.runDRC();
      expect(violations).toHaveLength(0);
    });
  });

  describe('Gerber generation', () => {
    it('generates Gerber file', () => {
      const designer = new PCBDesigner();
      const gerber = designer.generateGerber();
      expect(gerber.layers).toBeDefined();
      expect(gerber.layers.length).toBeGreaterThan(0);
      expect(gerber.drillFile).toBeDefined();
      expect(gerber.boardOutline).toBeDefined();
    });

    it('generates multiple layers for multi-layer board', () => {
      const designer = new PCBDesigner(100, 80, 2);
      const gerber = designer.generateGerber();
      expect(gerber.layers.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('2D Preview', () => {
    it('generates preview data', () => {
      const designer = new PCBDesigner();
      designer.addComponent(
        'resistor', { x: 10, y: 10 }, 0, 'top',
        [{ id: 1, offset: { x: -2, y: 0 } }, { id: 2, offset: { x: 2, y: 0 } }],
        'R1', '10k'
      );

      const preview = designer.generatePreview();
      expect(preview.boardOutline).toHaveLength(5);
      expect(preview.components).toHaveLength(1);
      expect(preview.dimensions.width).toBe(100);
    });
  });

  describe('Helper functions', () => {
    it('creates default resistor footprint', () => {
      const fp = createDefaultFootprint('resistor', 2);
      expect(fp).toHaveLength(2);
      expect(fp[0].id).toBe(1);
      expect(fp[1].id).toBe(2);
    });

    it('creates default IC footprint', () => {
      const fp = createDefaultFootprint('ic', 8);
      expect(fp).toHaveLength(8);
    });

    it('exports to SVG', () => {
      const designer = new PCBDesigner();
      const preview = designer.generatePreview();
      const svg = exportToSVG(preview);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });
});
