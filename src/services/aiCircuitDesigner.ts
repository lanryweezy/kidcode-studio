
// ============================================================
// AI Circuit Design Assistant
// Re-exports from ai/ directory for backwards compatibility
// ============================================================

export type {
  CircuitDesignRequest,
  CircuitDesignResult,
} from './ai';
export {
  COMPONENT_KNOWLEDGE,
  diagnoseCircuit,
  recommendComponents,
  calculateCircuitPower,
  explainCircuit,
  designCircuit,
  optimizeCircuit,
  suggestPinMapping,
  suggestAlternatives,
  getProgressionPath,
} from './ai';
