
import { CircuitComponent, ComponentType, Wire } from '../types';
import { findConnectedGroups as findConnectedComponents, getComponentProperties } from './circuitSimulator';

export interface ValidationError {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  componentIds: string[];
  suggestion: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
}

export function validateCircuit(
  components: CircuitComponent[],
  wires: Wire[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const infos: ValidationError[] = [];

  if (components.length === 0) {
    infos.push({
      id: 'empty-circuit',
      type: 'info',
      message: 'Your circuit is empty!',
      componentIds: [],
      suggestion: 'Drag components from the panel to start building.',
    });
    return { isValid: false, errors, warnings, infos };
  }

  const batteries = components.filter(c =>
    c.type === 'BATTERY_9V' || c.type === 'BATTERY_AA' || c.type === 'SOLAR'
  );

  if (batteries.length === 0) {
    errors.push({
      id: 'no-power',
      type: 'error',
      message: 'No power source found',
      componentIds: [],
      suggestion: 'Add a 9V Battery, AA Battery, or Solar Panel to power your circuit.',
    });
  }

  if (batteries.length > 1) {
    warnings.push({
      id: 'multiple-batteries',
      type: 'warning',
      message: 'Multiple power sources detected',
      componentIds: batteries.map(b => b.id),
      suggestion: 'Using multiple batteries can cause unexpected behavior. Consider using just one.',
    });
  }

  const connectedGroups = findConnectedComponents(components, wires);

  const outputComponents = components.filter(c =>
    !c.type.startsWith('BATTERY') && c.type !== 'SOLAR' && c.type !== 'BREADBOARD'
  );

  const connectedOutputIds = new Set<string>();
  connectedGroups.forEach((group: string[]) => {
    group.forEach((id: string) => connectedOutputIds.add(id));
  });

  const disconnectedOutputs = outputComponents.filter(c => {
    const hasWires = wires.some(w =>
      w.fromComponentId === c.id || w.toComponentId === c.id
    );
    return !hasWires;
  });

  disconnectedOutputs.forEach(comp => {
    warnings.push({
      id: `disconnected-${comp.id}`,
      type: 'warning',
      message: `${getComponentLabel(comp.type)} is not connected`,
      componentIds: [comp.id],
      suggestion: `Connect ${getComponentLabel(comp.type)} to a power source with wires.`,
    });
  });

  connectedGroups.forEach((group: string[], idx: number) => {
    const groupBatteries = group.filter((id: string) =>
      components.find(c => c.id === id && (c.type === 'BATTERY_9V' || c.type === 'BATTERY_AA' || c.type === 'SOLAR'))
    );

    const groupOutputs = group.filter((id: string) => {
      const comp = components.find(c => c.id === id);
      return comp && !comp.type.startsWith('BATTERY') && comp.type !== 'SOLAR' && comp.type !== 'BREADBOARD';
    });

    if (groupBatteries.length > 0 && groupOutputs.length === 0) {
      errors.push({
        id: `short-circuit-${idx}`,
        type: 'error',
        message: 'Possible short circuit!',
        componentIds: groupBatteries,
        suggestion: 'A power source is connected with no load. Add LEDs, motors, or other components.',
      });
    }
  });

  const currentPaths = new Map<string, number>();
  const batteryComponents = components.filter(c =>
    c.type === 'BATTERY_9V' || c.type === 'BATTERY_AA' || c.type === 'SOLAR'
  );

  batteryComponents.forEach(battery => {
    const batteryProps = getComponentProperties(battery.type);
    const batteryVoltage = batteryProps.voltage || 5.0;

    connectedGroups.forEach((group: string[]) => {
      if (!group.includes(battery.id)) return;

      const groupOutputComponents = group
        .map(id => components.find(c => c.id === id)!)
        .filter(c => c && !c.type.startsWith('BATTERY') && c.type !== 'SOLAR');

      let groupResistance = 0;
      groupOutputComponents.forEach(comp => {
        const props = getComponentProperties(comp.type);
        groupResistance += props.resistance || 1000;
      });

      if (groupResistance > 0) {
        const totalCurrent = batteryVoltage / groupResistance;

        groupOutputComponents.forEach(comp => {
          const props = getComponentProperties(comp.type);
          const resistance = props.resistance || 1000;
          const compCurrent = batteryVoltage / resistance;
          currentPaths.set(comp.id, compCurrent);

          if (compCurrent > 0.1) {
            warnings.push({
              id: `high-current-${comp.id}`,
              type: 'warning',
              message: `${getComponentLabel(comp.type)} is drawing high current`,
              componentIds: [comp.id],
              suggestion: 'High current may damage components. Add a resistor to limit current.',
            });
          }
        });
      }
    });
  });

  // Power supply validation
  const powerComponents = components.filter(c =>
    c.type === 'BATTERY_9V' || c.type === 'BATTERY_AA' || c.type === 'SOLAR'
  );
  powerComponents.forEach(battery => {
    const props = getComponentProperties(battery.type);
    const voltage = props.voltage || 0;
    if (voltage === 0) {
      warnings.push({
        id: `invalid-power-${battery.id}`,
        type: 'warning',
        message: `${getComponentLabel(battery.type)} has invalid voltage specification`,
        componentIds: [battery.id],
        suggestion: 'Check the power source specifications and ensure proper voltage.',
      });
    }
  });

  // Component rating checks
  components.forEach(comp => {
    const props = getComponentProperties(comp.type);
    if (props.maxVoltage && props.voltage && props.voltage > props.maxVoltage) {
      errors.push({
        id: `voltage-exceeded-${comp.id}`,
        type: 'error',
        message: `${getComponentLabel(comp.type)} exceeds maximum voltage rating`,
        componentIds: [comp.id],
        suggestion: `Reduce voltage or use a component rated for higher voltage (max: ${props.maxVoltage}V).`,
      });
    }
    if (props.maxCurrent && props.forwardCurrent && props.forwardCurrent > props.maxCurrent) {
      warnings.push({
        id: `current-exceeded-${comp.id}`,
        type: 'warning',
        message: `${getComponentLabel(comp.type)} may exceed current rating`,
        componentIds: [comp.id],
        suggestion: `Add a resistor to limit current (max recommended: ${props.maxCurrent}A).`,
      });
    }
  });

  // Wire connectivity validation - all components should be connected
  const allConnectedComponents = new Set<string>();
  wires.forEach(w => {
    allConnectedComponents.add(w.fromComponentId);
    allConnectedComponents.add(w.toComponentId);
  });
  const unconnectedComponents = components.filter(c => !allConnectedComponents.has(c.id));
  unconnectedComponents.forEach(comp => {
    if (comp.type !== 'BREADBOARD') {
      infos.push({
        id: `unconnected-${comp.id}`,
        type: 'info',
        message: `${getComponentLabel(comp.type)} is not connected to any wires`,
        componentIds: [comp.id],
        suggestion: `Connect ${getComponentLabel(comp.type)} to other components using wires.`,
      });
    }
  });

  // Ground reference validation - common ground required
  const hasGround = wires.some(w => {
    const from = components.find(c => c.id === w.fromComponentId);
    const to = components.find(c => c.id === w.toComponentId);
    return (from?.type === 'BATTERY_9V' || from?.type === 'BATTERY_AA' || from?.type === 'SOLAR') &&
           (to?.type === 'BREADBOARD' || to?.type?.includes('ARDUINO') || to?.type?.includes('ESP'));
  });
  if (components.length > 1 && !hasGround) {
    warnings.push({
      id: 'no-common-ground',
      type: 'warning',
      message: 'No common ground reference detected',
      componentIds: [],
      suggestion: 'Connect all components to a common ground for proper circuit operation.',
    });
  }

  // Signal integrity checks - floating inputs
  const inputComponents = components.filter(c =>
    c.type === 'BUTTON' || c.type === 'BUTTON_TACTILE' || c.type === 'POTENTIOMETER' ||
    c.type === 'LIGHT_SENSOR' || c.type === 'DHT11' || c.type === 'DHT22' ||
    c.type === 'ULTRASONIC' || c.type === 'MOTION'
  );
  inputComponents.forEach(input => {
    const hasPullUp = wires.some(w => {
      const otherId = w.fromComponentId === input.id ? w.toComponentId :
        w.toComponentId === input.id ? w.fromComponentId : null;
      if (!otherId) return false;
      const other = components.find(c => c.id === otherId);
      return other && (other.type.includes('ARDUINO') || other.type.includes('ESP') || other.type.includes('RASPBERRY'));
    });
    if (!hasPullUp) {
      infos.push({
        id: `floating-input-${input.id}`,
        type: 'info',
        message: `${getComponentLabel(input.type)} may have floating input`,
        componentIds: [input.id],
        suggestion: `Connect ${getComponentLabel(input.type)} to a microcontroller with proper pull-up/pull-down resistor.`,
      });
    }
  });

  const resistors = components.filter(c => c.type === 'RESISTOR');
  resistors.forEach(resistor => {
    const hasConnection = wires.some(w =>
      w.fromComponentId === resistor.id || w.toComponentId === resistor.id
    );
    if (!hasConnection) {
      infos.push({
        id: `unused-resistor-${resistor.id}`,
        type: 'info',
        message: 'Resistor is not connected to anything',
        componentIds: [resistor.id],
        suggestion: 'Connect the resistor in series with an LED or other component.',
      });
    }
  });

  const displays = components.filter(c =>
    c.type === 'LCD' || c.type === 'OLED' || c.type === 'SEVEN_SEGMENT' || c.type === 'MATRIX'
  );

  displays.forEach(display => {
    const connectedToMC = wires.some(w => {
      const otherId = w.fromComponentId === display.id ? w.toComponentId :
        w.toComponentId === display.id ? w.fromComponentId : null;
      if (!otherId) return false;
      const other = components.find(c => c.id === otherId);
      return other && (
        other.type.includes('ARDUINO') || other.type.includes('ESP') ||
        other.type.includes('RASPBERRY') || other.type === 'MICROBIT'
      );
    });

    if (!connectedToMC) {
      warnings.push({
        id: `display-no-mc-${display.id}`,
        type: 'warning',
        message: `${getComponentLabel(display.type)} is not connected to a microcontroller`,
        componentIds: [display.id],
        suggestion: `Connect ${getComponentLabel(display.type)} to a microcontroller to display data.`,
      });
    }
  });

  const servos = components.filter(c => c.type === 'SERVO' || c.type === 'SERVO_CONTINUOUS');
  servos.forEach(servo => {
    const connectedToMC = wires.some(w => {
      const otherId = w.fromComponentId === servo.id ? w.toComponentId :
        w.toComponentId === servo.id ? w.fromComponentId : null;
      if (!otherId) return false;
      const other = components.find(c => c.id === otherId);
      return other && (
        other.type.includes('ARDUINO') || other.type.includes('ESP') ||
        other.type.includes('RASPBERRY') || other.type === 'MICROBIT'
      );
    });

    if (!connectedToMC) {
      warnings.push({
        id: `servo-no-mc-${servo.id}`,
        type: 'warning',
        message: `${getComponentLabel(servo.type)} needs a microcontroller for PWM control`,
        componentIds: [servo.id],
        suggestion: `Connect ${getComponentLabel(servo.type)} to a PWM-capable pin on a microcontroller.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    infos,
  };
}

function getComponentLabel(type: ComponentType): string {
  const labels: Record<string, string> = {
    LED_RED: 'Red LED',
    LED_BLUE: 'Blue LED',
    LED_GREEN: 'Green LED',
    LED_YELLOW: 'Yellow LED',
    LED_ORANGE: 'Orange LED',
    LED_WHITE: 'White LED',
    RGB_LED: 'RGB LED',
    RGB_STRIP: 'RGB Strip',
    BULB: 'Light Bulb',
    BUZZER: 'Piezo Buzzer',
    RESISTOR: 'Resistor',
    MOTOR_DC: 'DC Motor',
    SERVO: 'Servo',
    SERVO_CONTINUOUS: 'Continuous Servo',
    FAN: 'Fan Motor',
    BATTERY_9V: '9V Battery',
    BATTERY_AA: 'AA Battery',
    SOLAR: 'Solar Panel',
    ARDUINO_UNO: 'Arduino Uno',
    ARDUINO_NANO: 'Arduino Nano',
    ARDUINO_MEGA: 'Arduino Mega',
    ESP32_DEVKIT: 'ESP32 DevKit',
    LCD: 'LCD Screen',
    OLED: 'OLED Screen',
    SEVEN_SEGMENT: '7-Segment Display',
    MATRIX: 'LED Matrix',
    BUTTON: 'Push Button',
    BUTTON_TACTILE: 'Tactile Button',
    POTENTIOMETER: 'Rotary Knob',
    SWITCH_TOGGLE: 'Toggle Switch',
    SWITCH_SLIDE: 'Slide Switch',
    ULTRASONIC: 'Distance Sensor',
    DHT11: 'DHT11 Sensor',
    DHT22: 'DHT22 Sensor',
    LIGHT_SENSOR: 'Light Sensor',
    MOTION: 'Motion PIR',
    RELAY: 'Relay',
    RELAY_MODULE: 'Relay Module',
    LASER: 'Laser',
    LASER_DIODE: 'Laser Diode',
    PUMP: 'Water Pump',
    STEPPER: 'Stepper Motor',
    SOLENOID: 'Solenoid',
  };
  return labels[type] || type.replace(/_/g, ' ');
}
