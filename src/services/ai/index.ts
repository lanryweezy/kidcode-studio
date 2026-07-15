
// ============================================================
// AI Circuit Design - barrel exports
// ============================================================

import { CircuitComponent, Wire } from '../../types';

// === SHARED TYPES ===

export interface CircuitDesignRequest {
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  components?: string[];
  excludeComponents?: string[];
}

export interface CircuitDesignResult {
  success: boolean;
  circuit: {
    components: CircuitComponent[];
    wires: Wire[];
    code: string;
    explanation: string;
  };
  alternatives: CircuitDesignResult[];
  warnings: string[];
  estimatedTime: string;
  difficulty: string;
}

// === RE-EXPORTS ===

export { COMPONENT_KNOWLEDGE, diagnoseCircuit, recommendComponents, calculateCircuitPower, explainCircuit } from './circuitAnalyzer';
export { designCircuit } from './circuitGenerator';
export { optimizeCircuit, suggestPinMapping, suggestAlternatives, getProgressionPath } from './circuitOptimizer';
