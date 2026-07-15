import { IRNode } from '../types';
import { validateIRNode, ValidationError } from '../validator';
import { SpriteState } from '../../../types';

export interface ExportValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validateForExport(
  nodes: IRNode[],
  mode: 'typescript' | 'godot' | 'react-native',
  spriteState: SpriteState
): ExportValidationResult {
  const ctx = { spriteState, mode: mode === 'typescript' ? 'GAME' as const : 'GAME' as const };
  const allErrors: ValidationError[] = [];

  for (const node of nodes) {
    const errors = validateIRNode(node, ctx);
    allErrors.push(...errors);
  }

  // Platform-specific checks
  if (mode === 'react-native') {
    // Check for features not supported in React Native
    const unsupported = nodes.filter(n => ['set_3d_position', 'rotate_3d_model', 'generate_environment'].includes(n.kind));
    if (unsupported.length > 0) {
      allErrors.push({
        nodeId: 'export',
        kind: 'platform_check',
        message: `${unsupported.length} 3D commands not supported in React Native export`,
        severity: 'warning',
      });
    }
  }

  if (mode === 'godot') {
    // Check for features not supported in Godot
    const unsupported = nodes.filter(n => ['play_3d_animation', 'set_3d_camera'].includes(n.kind));
    if (unsupported.length > 0) {
      allErrors.push({
        nodeId: 'export',
        kind: 'platform_check',
        message: `${unsupported.length} commands not supported in Godot export`,
        severity: 'warning',
      });
    }
  }

  return {
    valid: !allErrors.some(e => e.severity === 'error'),
    errors: allErrors.filter(e => e.severity === 'error'),
    warnings: allErrors.filter(e => e.severity === 'warning'),
  };
}
