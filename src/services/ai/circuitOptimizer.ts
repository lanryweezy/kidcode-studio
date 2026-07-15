
// ============================================================
// Circuit Optimization - optimization suggestions, pin mapping, alternatives
// ============================================================

import { CircuitComponent, Wire, ComponentType } from '../../types';
import { CircuitDesignResult } from './index';

// ============================================================
// CIRCUIT OPTIMIZATION SUGGESTIONS
// ============================================================

export function optimizeCircuit(
  components: CircuitComponent[],
  wires: Wire[]
): string[] {
  const suggestions: string[] = [];

  // Check for series vs parallel optimization
  const resistors = components.filter(c => c.type === 'RESISTOR');
  if (resistors.length > 3) {
    suggestions.push('Consider using a resistor network or IC instead of individual resistors');
  }

  // Check for decoupling capacitors
  const hasMCU = components.some(c => c.type.includes('ARDUINO') || c.type.includes('ESP'));
  const hasCap = components.some(c => c.type.includes('CAPACITOR'));
  if (hasMCU && !hasCap) {
    suggestions.push('Add 100nF decoupling capacitor near MCU power pins');
  }

  // Check for flyback diodes
  const hasInductiveLoad = components.some(c => c.type === 'MOTOR_DC' || c.type === 'SERVO' || c.type === 'RELAY');
  const hasDiode = components.some(c => c.type.includes('DIODE'));
  if (hasInductiveLoad && !hasDiode) {
    suggestions.push('Add flyback diode across inductive loads (motors, relays)');
  }

  // Check for pull-up/pull-down resistors
  const hasButtons = components.some(c => c.type.includes('BUTTON'));
  if (hasButtons) {
    suggestions.push('Use INPUT_PULLUP for buttons to avoid floating inputs');
  }

  return suggestions;
}

// ============================================================
// PIN MAPPING ASSISTANCE
// ============================================================

export function suggestPinMapping(
  components: CircuitComponent[]
): { component: string; suggestedPin: number; reason: string }[] {
  const suggestions: { component: string; suggestedPin: number; reason: string }[] = [];
  const usedPins = new Set(components.map(c => c.pin));

  components.forEach(comp => {
    if (comp.type.startsWith('LED') || comp.type === 'BUZZER' || comp.type === 'MOTOR_DC') {
      if (!usedPins.has(13)) {
        suggestions.push({ component: comp.type, suggestedPin: 13, reason: 'Digital output pin' });
      } else if (!usedPins.has(9)) {
        suggestions.push({ component: comp.type, suggestedPin: 9, reason: 'PWM-capable for dimming/speed' });
      }
    }
    if (comp.type === 'SERVO') {
      if (!usedPins.has(9)) {
        suggestions.push({ component: comp.type, suggestedPin: 9, reason: 'PWM required for servo' });
      }
    }
    if (comp.type.includes('SENSOR') || comp.type === 'DHT11' || comp.type === 'ULTRASONIC') {
      if (!usedPins.has(2)) {
        suggestions.push({ component: comp.type, suggestedPin: 2, reason: 'Digital input pin' });
      }
    }
  });

  return suggestions;
}

// ============================================================
// ALTERNATIVE DESIGNS
// ============================================================

export function suggestAlternatives(
  design: CircuitDesignResult
): CircuitDesignResult[] {
  const alternatives: CircuitDesignResult[] = [];

  // If using LEDs, suggest NeoPixel alternative
  if (design.circuit.components.some(c => c.type.startsWith('LED'))) {
    alternatives.push({
      success: true,
      circuit: {
        components: [{ id: crypto.randomUUID(), type: 'NEOPIXEL_RING' as ComponentType, x: 100, y: 150, pin: 10, rotation: 0 }],
        wires: [{ id: crypto.randomUUID(), fromComponentId: design.circuit.components[0]?.id || '', fromPin: 10, toComponentId: '', toPin: 10, color: '#fbbf24' }],
        code: '// NeoPixel alternative - more colors, less wiring',
        explanation: 'NeoPixel ring replaces multiple LEDs with programmable RGB LEDs.',
      },
      alternatives: [],
      warnings: [],
      estimatedTime: design.estimatedTime,
      difficulty: design.difficulty,
    });
  }

  return alternatives;
}

// ============================================================
// DIFFICULTY PROGRESSION
// ============================================================

export function getProgressionPath(
  currentDifficulty: 'beginner' | 'intermediate' | 'advanced'
): { next: string; prerequisites: string[]; tips: string[] } {
  const paths: Record<string, { next: string; prerequisites: string[]; tips: string[] }> = {
    beginner: {
      next: 'intermediate',
      prerequisites: ['LED blink', 'Button control', 'Sensor reading'],
      tips: ['Master Ohm\'s Law first', 'Understand digital vs analog', 'Learn to read datasheets'],
    },
    intermediate: {
      next: 'advanced',
      prerequisites: ['PWM control', 'Interrupt handling', 'Communication protocols'],
      tips: ['Learn about transistors and MOSFETs', 'Understand RC time constants', 'Practice with oscilloscope'],
    },
    advanced: {
      next: 'expert',
      prerequisites: ['Op-amps', 'PCB design', 'Power supply design'],
      tips: ['Study circuit analysis', 'Learn about impedance matching', 'Design your own PCBs'],
    },
  };
  return paths[currentDifficulty] || paths.beginner;
}
