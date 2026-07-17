// ============================================================
// Real Circuit Simulation Engine v3.0
// Physics-based: Ohm's Law, Kirchhoff's Laws, component interaction
// Supports: series/parallel circuits, voltage division, current limiting
// ============================================================

import { CircuitComponent, ComponentType, HardwareState, Wire } from '../types';

// === ELECTRICAL PROPERTY DEFINITIONS ===

export interface ComponentElectricalProps {
  resistance?: number;
  capacitance?: number;
  inductance?: number;
  forwardVoltage?: number;
  forwardCurrent?: number;
  maxCurrent?: number;
  maxVoltage?: number;
  voltage?: number;
  gain?: number;
  threshold?: number;
  beta?: number;        // Transistor gain
  vgsThreshold?: number; // MOSFET threshold
  rdsOn?: number;       // MOSFET on-resistance
  vf?: number;          // Forward voltage drop
  vz?: number;          // Zener voltage
  dropout?: number;     // Regulator dropout voltage
}

/** Default electrical properties for every supported component type. */
export const ELECTRICAL_PROPS: Record<string, ComponentElectricalProps> = {
  // LEDs - forward voltage determines minimum voltage to light
  LED_RED:     { resistance: 90,  forwardVoltage: 1.8, forwardCurrent: 0.02, maxCurrent: 0.03, vf: 1.8 },
  LED_BLUE:    { resistance: 150, forwardVoltage: 3.0, forwardCurrent: 0.02, maxCurrent: 0.03, vf: 3.0 },
  LED_GREEN:   { resistance: 110, forwardVoltage: 2.2, forwardCurrent: 0.02, maxCurrent: 0.03, vf: 2.2 },
  LED_YELLOW:  { resistance: 100, forwardVoltage: 2.0, forwardCurrent: 0.02, maxCurrent: 0.03, vf: 2.0 },
  LED_ORANGE:  { resistance: 100, forwardVoltage: 2.0, forwardCurrent: 0.02, maxCurrent: 0.03, vf: 2.0 },
  LED_WHITE:   { resistance: 160, forwardVoltage: 3.2, forwardCurrent: 0.02, maxCurrent: 0.03, vf: 3.2 },
  RGB_LED:     { resistance: 100, forwardVoltage: 2.0, forwardCurrent: 0.02, maxCurrent: 0.03, vf: 2.0 },
  LED_INFRARED:{ resistance: 65,  forwardVoltage: 1.3, forwardCurrent: 0.02, maxCurrent: 0.05, vf: 1.3 },
  BULB:        { resistance: 16.7,forwardVoltage: 2.5, forwardCurrent: 0.15, maxCurrent: 0.5,  vf: 2.5 },

  // Passive - pure resistance
  RESISTOR:    { resistance: 1000 },
  WIRE_SPOOL:  { resistance: 0.01 },

  // Capacitors
  CAPACITOR_ELEC:     { capacitance: 0.0001,   resistance: 0.1 },
  CAPACITOR_CERAMIC:  { capacitance: 0.0000001, resistance: 0.05 },
  CAPACITOR_TANTALUM: { capacitance: 0.00001,  resistance: 0.08 },

  // Diodes
  DIODE:          { vf: 0.7, resistance: 5, maxCurrent: 1.0 },
  DIODE_SCHOTTKY: { vf: 0.3, resistance: 2, maxCurrent: 1.0 },
  DIODE_ZENER:    { vf: 0.7, vz: 5.1, resistance: 5, maxCurrent: 0.5 },

  // Transistors
  TRANSISTOR_NPN: { beta: 200, resistance: 0.5, maxCurrent: 0.8 },
  TRANSISTOR_PNP: { beta: 200, resistance: 0.5, maxCurrent: 0.8 },
  MOSFET_N:       { vgsThreshold: 2.0, rdsOn: 0.1, maxCurrent: 10 },
  MOSFET_P:       { vgsThreshold: -2.0, rdsOn: 0.1, maxCurrent: 10 },

  // Op-amps
  OPAMP_358: { gain: 100000, resistance: 50, maxVoltage: 3.5 },
  OPAMP_072: { gain: 200000, resistance: 20, maxVoltage: 3.5 },

  // Voltage regulators
  VREG_7805: { voltage: 5.0, resistance: 0.5, dropout: 2.0, maxCurrent: 1.0 },
  VREG_317:  { voltage: 3.3, resistance: 0.5, dropout: 1.5, maxCurrent: 1.5 },
  VREG_LDO:  { voltage: 3.3, resistance: 0.2, dropout: 0.3, maxCurrent: 0.5 },

  // Power sources
  BATTERY_9V: { voltage: 9.0, resistance: 1.0 },
  BATTERY_AA: { voltage: 1.5, resistance: 0.5 },
  SOLAR:      { voltage: 5.0, resistance: 2.0 },

  // Motors/actuators
  MOTOR_DC:    { resistance: 25,  forwardVoltage: 5.0, forwardCurrent: 0.2, maxCurrent: 1.0 },
  SERVO:       { resistance: 33.3, forwardVoltage: 5.0, forwardCurrent: 0.15, maxCurrent: 0.5 },
  FAN:         { resistance: 50,  forwardVoltage: 5.0, forwardCurrent: 0.1, maxCurrent: 0.5 },
  BUZZER:      { resistance: 100, forwardVoltage: 3.0, forwardCurrent: 0.03, maxCurrent: 0.1 },
  SPEAKER:     { resistance: 8,   forwardVoltage: 2.0, forwardCurrent: 0.05, maxCurrent: 0.5 },
  VIBRATION:   { resistance: 30,  forwardVoltage: 3.0, forwardCurrent: 0.1, maxCurrent: 0.3 },
  STEPPER:     { resistance: 12.5,forwardVoltage: 5.0, forwardCurrent: 0.4, maxCurrent: 1.0 },
  SOLENOID:    { resistance: 16.7,forwardVoltage: 5.0, forwardCurrent: 0.3, maxCurrent: 0.5 },
  PUMP:        { resistance: 20,  forwardVoltage: 5.0, forwardCurrent: 0.25, maxCurrent: 0.5 },
  RELAY:       { resistance: 71,  forwardVoltage: 5.0, forwardCurrent: 0.07, maxCurrent: 0.1 },
  MOTOR_STEPPER: { resistance: 12.5, forwardVoltage: 5.0, forwardCurrent: 0.4, maxCurrent: 1.0 },
  MOTOR_PUMP:    { resistance: 20,  forwardVoltage: 5.0, forwardCurrent: 0.25, maxCurrent: 0.5 },
  MOTOR_SOL:     { resistance: 16.7, forwardVoltage: 5.0, forwardCurrent: 0.3, maxCurrent: 0.5 },

  // Displays
  NEOPIXEL_RING: { resistance: 55, forwardVoltage: 3.3, forwardCurrent: 0.06, maxCurrent: 0.5 },
  LCD:           { resistance: 330, forwardVoltage: 3.3, forwardCurrent: 0.01, maxCurrent: 0.1 },
  LCD_2004:      { resistance: 330, forwardVoltage: 3.3, forwardCurrent: 0.01, maxCurrent: 0.1 },
  OLED:          { resistance: 330, forwardVoltage: 3.3, forwardCurrent: 0.02, maxCurrent: 0.1 },
  SEVEN_SEGMENT: { resistance: 100, forwardVoltage: 2.0, forwardCurrent: 0.02, maxCurrent: 0.1 },
  MATRIX:        { resistance: 100, forwardVoltage: 2.0, forwardCurrent: 0.02, maxCurrent: 0.5 },

  // Communication
  WIFI:      { resistance: 100, forwardVoltage: 3.3, forwardCurrent: 0.1, maxCurrent: 0.3 },
  BLUETOOTH: { resistance: 100, forwardVoltage: 3.3, forwardCurrent: 0.05, maxCurrent: 0.2 },
  RADIO:     { resistance: 100, forwardVoltage: 3.3, forwardCurrent: 0.05, maxCurrent: 0.2 },
  SD_CARD:   { resistance: 100, forwardVoltage: 3.3, forwardCurrent: 0.05, maxCurrent: 0.1 },
  RTC:       { resistance: 100, forwardVoltage: 3.3, forwardCurrent: 0.005, maxCurrent: 0.01 },

  // Logic
  LOGIC_AND: { threshold: 2.5, resistance: 1000, maxCurrent: 0.01 },
  LOGIC_OR:  { threshold: 2.5, resistance: 1000, maxCurrent: 0.01 },
  '555_TIMER': { threshold: 2.5, resistance: 1000, maxCurrent: 0.02 },

  // Tools
  MULTIMETER:  { resistance: 10000000 }, // Very high impedance
  OSCILLOSCOPE:{ resistance: 10000000 },
  I2C_SENSOR:  { resistance: 10000 },
  SPI_SENSOR:  { resistance: 10000 },

  // Sensors (typically high impedance)
  LIGHT_SENSOR:  { resistance: 10000 },
  TEMP_SENSOR:   { resistance: 10000 },
  THERMISTOR:    { resistance: 10000 },
  DHT11:         { resistance: 10000 },
  DHT22:         { resistance: 10000 },
  ULTRASONIC:    { resistance: 10000 },
  MOTION:        { resistance: 10000 },
  SOUND_SENSOR:  { resistance: 10000 },
  GAS_SENSOR:    { resistance: 10000 },
  FLAME_SENSOR:  { resistance: 10000 },
  RAIN_SENSOR:   { resistance: 10000 },
  SOIL_SENSOR:   { resistance: 10000 },
  PRESSURE_SENSOR:{ resistance: 10000 },
  FLEX_SENSOR:   { resistance: 10000 },
  TILT_SENSOR:   { resistance: 10000 },
  HALL_SENSOR:   { resistance: 10000 },
  COMPASS:       { resistance: 10000 },
  GYRO:          { resistance: 10000 },
  GPS:           { resistance: 10000 },
  HEARTBEAT:     { resistance: 10000 },
  COLOR_SENSOR:  { resistance: 10000 },
  FINGERPRINT:   { resistance: 10000 },
  RFID:          { resistance: 10000 },
};

// === SIMULATION STATE ===

export interface NodeVoltage {
  nodeId: string;
  voltage: number;
  current: number;
  components: string[];
}

export interface ComponentPowerBreakdown {
  componentId: string;
  componentType: string;
  power: number;
  current: number;
  voltage: number;
  efficiency: number;
  isActive: boolean;
  percentage: number;
}

export interface PowerConsumptionMetrics {
  totalPower: number;
  totalCurrent: number;
  totalVoltage: number;
  componentBreakdown: ComponentPowerBreakdown[];
  maxPowerBudget: number;
  remainingBudget: number;
  efficiency: number;
  estimatedBatteryLife: number;
  powerWarnings: string[];
}

export interface SimulationResult {
  componentStates: Map<string, ComponentState>;
  totalCurrent: number;
  totalVoltage: number;
  totalResistance: number;
  powerDraw: number;
  powerMetrics: PowerConsumptionMetrics;
  isShortCircuit: boolean;
  isOpenCircuit: boolean;
  errors: string[];
  warnings: string[];
  nodeVoltages: Map<string, number>;
  nodeDetails: Map<string, NodeVoltage>;
  propagationDelay: number;
}

export interface ComponentState {
  componentId: string;
  isActive: boolean;
  current: number;
  voltage: number;
  power: number;
  brightness?: number;    // For LEDs/bulbs (0-100%)
  speed?: number;         // For motors (0-100%)
  temperature?: number;   // For components that heat up
  state: Record<string, any> | string | null;
}

// === POWER CONSUMPTION CALCULATION ===

function calculateComponentEfficiency(type: string, power: number, maxPower: number): number {
  if (maxPower <= 0) return 0;
  const efficiencyMap: Record<string, number> = {
    LED_RED: 0.9, LED_BLUE: 0.85, LED_GREEN: 0.88, LED_YELLOW: 0.87,
    LED_ORANGE: 0.86, LED_WHITE: 0.82, RGB_LED: 0.80, BULB: 0.15,
    MOTOR_DC: 0.65, SERVO: 0.70, FAN: 0.55, BUZZER: 0.40,
    RESISTOR: 0.0, CAPACITOR_ELEC: 0.95, CAPACITOR_CERAMIC: 0.95,
    TRANSISTOR_NPN: 0.90, TRANSISTOR_PNP: 0.90, MOSFET_N: 0.95, MOSFET_P: 0.95,
    RELAY: 0.85, LASER: 0.30, SPEAKER: 0.60, VIBRATION: 0.50,
    LCD: 0.75, OLED: 0.80, STEPPER: 0.60, PUMP: 0.45,
    WIFI: 0.35, BLUETOOTH: 0.40, SD_CARD: 0.50, NEOPIXEL_RING: 0.70,
  };
  return efficiencyMap[type] ?? 0.5;
}

function estimateBatteryLife(totalPower: number, batteryVoltage: number): number {
  if (totalPower <= 0) return Infinity;
  const batteryCapacity = 2000;
  const energyWh = (batteryVoltage * batteryCapacity) / 1000;
  return (energyWh / totalPower) * 3600;
}

function calculatePowerMetrics(
  components: CircuitComponent[],
  componentStates: Map<string, ComponentState>,
  totalVoltage: number,
  totalCurrent: number
): PowerConsumptionMetrics {
  const breakdown: ComponentPowerBreakdown[] = [];
  const powerWarnings: string[] = [];
  let totalPower = 0;
  let activePower = 0;
  let totalMaxPower = 0;

  components.forEach(comp => {
    const state = componentStates.get(comp.id);
    const power = state?.power ?? 0;
    const current = state?.current ?? 0;
    const voltage = state?.voltage ?? totalVoltage;
    const props = ELECTRICAL_PROPS[comp.type];
    const maxCurrent = props?.maxCurrent ?? 1.0;
    const maxPower = voltage * maxCurrent;

    const efficiency = calculateComponentEfficiency(comp.type, power, maxPower);
    const isActive = state?.isActive ?? false;

    totalPower += power;
    if (isActive) activePower += power;
    totalMaxPower += maxPower;

    breakdown.push({
      componentId: comp.id,
      componentType: comp.type,
      power,
      current,
      voltage,
      efficiency,
      isActive,
      percentage: 0,
    });
  });

  const maxPowerBudget = totalVoltage > 0 ? totalVoltage * 2.0 : 10.0;
  const remainingBudget = maxPowerBudget - totalPower;

  breakdown.forEach(item => {
    item.percentage = totalPower > 0 ? (item.power / totalPower) * 100 : 0;
  });

  breakdown.sort((a, b) => b.power - a.power);

  if (totalPower > maxPowerBudget) {
    powerWarnings.push(`Total power ${totalPower.toFixed(2)}W exceeds budget ${maxPowerBudget.toFixed(2)}W`);
  }

  breakdown.forEach(item => {
    if (item.power > 0.5) {
      powerWarnings.push(`${item.componentType} consuming ${item.power.toFixed(2)}W`);
    }
  });

  const efficiency = totalMaxPower > 0 ? (activePower / totalMaxPower) * 100 : 0;
  const estimatedBatteryLife = estimateBatteryLife(totalPower, totalVoltage);

  return {
    totalPower,
    totalCurrent,
    totalVoltage,
    componentBreakdown: breakdown,
    maxPowerBudget,
    remainingBudget,
    efficiency,
    estimatedBatteryLife,
    powerWarnings,
  };
}

// === CIRCUIT TOPOLOGY ANALYSIS ===

function buildAdjacencyMap(
  components: CircuitComponent[],
  wires: Wire[]
): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  components.forEach(c => adj.set(c.id, []));
  wires.forEach(w => {
    if (adj.has(w.fromComponentId)) adj.get(w.fromComponentId)!.push(w.toComponentId);
    if (adj.has(w.toComponentId)) adj.get(w.toComponentId)!.push(w.fromComponentId);
  });
  return adj;
}

/** Finds groups of components connected by wires using BFS. */
export function findConnectedGroups(
  components: CircuitComponent[],
  wires: Wire[]
): string[][] {
  const adj = buildAdjacencyMap(components, wires);
  const visited = new Set<string>();
  const groups: string[][] = [];

  const bfs = (start: string): string[] => {
    const queue = [start];
    const group: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      group.push(current);
      adj.get(current)?.forEach(n => { if (!visited.has(n)) queue.push(n); });
    }
    return group;
  };

  components.forEach(c => {
    if (!visited.has(c.id)) groups.push(bfs(c.id));
  });
  return groups;
}

// === OHM'S LAW CALCULATIONS ===

// === NODE VOLTAGE CALCULATION ===

/** Calculates the voltage at each node in a circuit. */
export function calculateNodeVoltages(
  components: CircuitComponent[],
  wires: Wire[],
  batteryVoltage: number
): Map<string, NodeVoltage> {
  const nodeDetails = new Map<string, NodeVoltage>();
  const groups = findConnectedGroups(components, wires);
  
  groups.forEach((group, groupIndex) => {
    const groupId = `node_${groupIndex}`;
    const groupComponents = group.map(id => components.find(c => c.id === id)!).filter(Boolean);
    const groupBatteries = groupComponents.filter(c => 
      c.type.startsWith('BATTERY') || c.type === 'SOLAR'
    );
    
    if (groupBatteries.length === 0) {
      // Unpowered group - all nodes at 0V
      groupComponents.forEach(comp => {
        nodeDetails.set(comp.id, {
          nodeId: groupId,
          voltage: 0,
          current: 0,
          components: [comp.id],
        });
      });
      return;
    }
    
    const voltage = ELECTRICAL_PROPS[groupBatteries[0].type]?.voltage || batteryVoltage;
    const loadComponents = groupComponents.filter(c => 
      !c.type.startsWith('BATTERY') && c.type !== 'SOLAR' && c.type !== 'BREADBOARD'
    );
    
    if (loadComponents.length === 0) {
      // Short circuit - all at source voltage
      groupComponents.forEach(comp => {
        nodeDetails.set(comp.id, {
          nodeId: groupId,
          voltage: voltage,
          current: voltage / 0.01,
          components: [comp.id],
        });
      });
      return;
    }
    
    // Calculate voltage drops across components
    let remainingVoltage = voltage;
    const totalResistance = loadComponents.reduce((sum, comp) => {
      const props = ELECTRICAL_PROPS[comp.type] || { resistance: 1000 };
      return sum + (props.resistance || 1000);
    }, 0);
    
    loadComponents.forEach((comp, idx) => {
      const props = ELECTRICAL_PROPS[comp.type] || { resistance: 1000 };
      const resistance = props.resistance || 1000;
      const voltageDrop = (resistance / totalResistance) * voltage;
      
      nodeDetails.set(comp.id, {
        nodeId: groupId,
        voltage: remainingVoltage - voltageDrop,
        current: voltage / totalResistance,
        components: [comp.id],
      });
      remainingVoltage -= voltageDrop;
    });
  });
  
  return nodeDetails;
}

// === OPEN CIRCUIT DETECTION ===

/** Detects components that are not connected to any wires. */
export function detectOpenCircuit(
  components: CircuitComponent[],
  wires: Wire[]
): { isOpen: boolean; disconnectedComponents: string[] } {
  const disconnectedComponents: string[] = [];
  
  components.forEach(comp => {
    if (comp.type.startsWith('BATTERY') || comp.type === 'SOLAR' || comp.type === 'BREADBOARD') {
      return;
    }
    
    const connectedWires = wires.filter(w => 
      w.fromComponentId === comp.id || w.toComponentId === comp.id
    );
    
    if (connectedWires.length === 0) {
      disconnectedComponents.push(comp.id);
    }
  });
  
  return {
    isOpen: disconnectedComponents.length > 0,
    disconnectedComponents,
  };
}

// === SIGNAL PROPAGATION DELAY ===

/** Calculates the total signal propagation delay across wires and components. */
export function calculatePropagationDelay(
  components: CircuitComponent[],
  wires: Wire[]
): number {
  // Base delay in microseconds per wire
  const WIRE_DELAY_US = 0.01;
  // Component-specific delays
  const COMPONENT_DELAYS: Record<string, number> = {
    DIODE: 0.01,
    DIODE_SCHOTTKY: 0.005,
    DIODE_ZENER: 0.01,
    TRANSISTOR_NPN: 0.02,
    TRANSISTOR_PNP: 0.02,
    MOSFET_N: 0.01,
    MOSFET_P: 0.01,
    OPAMP_358: 1.0,
    OPAMP_072: 0.5,
    '555_TIMER': 0.05,
    LED_RED: 0.001,
    LED_BLUE: 0.001,
    LED_GREEN: 0.001,
  };
  
  let totalDelay = 0;
  
  // Wire propagation delays
  totalDelay += wires.length * WIRE_DELAY_US;
  
  // Component switching delays
  components.forEach(comp => {
    totalDelay += COMPONENT_DELAYS[comp.type] || 0.001;
  });
  
  return totalDelay;
}

function calculateGroupResistance(
  groupComponents: CircuitComponent[],
  batteryVoltage: number
): { totalResistance: number; componentCurrents: Map<string, number>; isShort: boolean } {
  const componentCurrents = new Map<string, number>();
  let totalResistance = 0;
  const isShort = false;

  const loadComponents = groupComponents.filter(c =>
    !c.type.startsWith('BATTERY') && c.type !== 'SOLAR' &&
    c.type !== 'BREADBOARD' && c.type !== 'WIRE_SPOOL'
  );

  if (loadComponents.length === 0) {
    return { totalResistance: 0.01, componentCurrents, isShort: true };
  }

  // Calculate total resistance (simplified series model)
  loadComponents.forEach(comp => {
    const props = ELECTRICAL_PROPS[comp.type] || { resistance: 1000 };
    let resistance = props.resistance || 1000;

    // Apply component-specific resistance modifiers
    if (comp.type.startsWith('LED') || comp.type === 'BULB') {
      // LEDs have forward voltage drop - effective resistance depends on V
      const vf = props.forwardVoltage || 2.0;
      if (batteryVoltage < vf) {
        resistance = 1000000; // Very high resistance = not enough voltage to light
      } else {
        // LED resistance = (Vsupply - Vf) / If
        const targetCurrent = props.forwardCurrent || 0.02;
        resistance = (batteryVoltage - vf) / targetCurrent;
      }
    }

    if (comp.type === 'RESISTOR') {
      resistance = (comp as any).resistance || props.resistance || 1000;
    }

    if (comp.type.startsWith('CAPACITOR')) {
      // Capacitor impedance at DC = infinite (open circuit)
      resistance = 1000000;
    }

    if (comp.type === 'DIODE' || comp.type === 'DIODE_SCHOTTKY') {
      const vf = props.vf || 0.7;
      if (batteryVoltage < vf) {
        resistance = 1000000; // Reverse biased = open circuit
      } else {
        resistance = props.resistance || 5;
      }
    }

    if (comp.type === 'DIODE_ZENER') {
      const vz = props.vz || 5.1;
      if (batteryVoltage > vz) {
        resistance = props.resistance || 5; // Zener conducting
      } else {
        resistance = 1000000; // Below breakdown = open
      }
    }

    if (comp.type.startsWith('TRANSISTOR') || comp.type.startsWith('MOSFET')) {
      // Transistors need base/gate voltage to conduct
      // Simplified: if connected to power, assume OFF unless base is driven
      resistance = 1000000; // Default OFF
    }

    totalResistance += resistance;
  });

  // Calculate current through each component (Ohm's law: I = V/R)
  const groupCurrent = totalResistance > 0 ? batteryVoltage / totalResistance : 0;

  loadComponents.forEach(comp => {
    componentCurrents.set(comp.id, Math.min(groupCurrent, 0.5));
  });

  return { totalResistance, componentCurrents, isShort };
}

function calculateComponentState(
  comp: CircuitComponent,
  current: number,
  voltage: number,
  batteryVoltage: number,
  hardwareState: HardwareState
): ComponentState {
  const props = ELECTRICAL_PROPS[comp.type] || { resistance: 1000 };
  const state: ComponentState = {
    componentId: comp.id,
    isActive: false,
    current,
    voltage,
    power: voltage * current,
    state: null,
  };

  // LED behavior - needs minimum voltage AND current to light
  if (comp.type.startsWith('LED') && comp.type !== 'RGB_LED') {
    const vf = props.forwardVoltage || 2.0;
    const maxCurrent = props.forwardCurrent || 0.02;
    const isOverdriven = current > (props.maxCurrent || 0.03);

    if (batteryVoltage >= vf && current > 0.001) {
      state.isActive = true;
      state.brightness = Math.min(100, (current / maxCurrent) * 100);
      state.current = Math.min(current, maxCurrent);
    }

    if (isOverdriven) {
      state.temperature = 80 + (current - (props.maxCurrent || 0.03)) * 1000;
      if (state.temperature > 120) {
        state.state = 'burned_out';
        state.isActive = false;
      }
    }
  }

  // Bulb behavior
  if (comp.type === 'BULB') {
    const vf = props.forwardVoltage || 2.5;
    if (batteryVoltage >= vf && current > 0.001) {
      state.isActive = true;
      state.brightness = Math.min(100, (current / (props.forwardCurrent || 0.15)) * 100);
      state.temperature = 20 + current * 200;
    }
  }

  // Motor behavior - needs minimum voltage and current
  if (comp.type === 'MOTOR_DC' || comp.type === 'FAN') {
    const vf = props.forwardVoltage || 5.0;
    if (batteryVoltage >= vf && current > 0.01) {
      state.isActive = true;
      state.speed = Math.min(100, (current / (props.forwardCurrent || 0.1)) * 100);
    }
  }

  // Servo behavior
  if (comp.type === 'SERVO' || comp.type === 'SERVO_CONTINUOUS') {
    const vf = props.forwardVoltage || 5.0;
    if (batteryVoltage >= vf && current > 0.01) {
      state.isActive = true;
    }
  }

  // Buzzer behavior
  if (comp.type === 'BUZZER') {
    const vf = props.forwardVoltage || 3.0;
    if (batteryVoltage >= vf && current > 0.001) {
      state.isActive = true;
    }
  }

  // Relay behavior
  if (comp.type === 'RELAY' || comp.type === 'RELAY_MODULE') {
    const vf = props.forwardVoltage || 5.0;
    if (batteryVoltage >= vf && current > 0.005) {
      state.isActive = true;
    }
  }

  // Laser behavior
  if (comp.type === 'LASER' || comp.type === 'LASER_DIODE') {
    const vf = props.forwardVoltage || 2.0;
    if (batteryVoltage >= vf && current > 0.001) {
      state.isActive = true;
    }
  }

  // Diode behavior
  if (comp.type === 'DIODE' || comp.type === 'DIODE_SCHOTTKY' || comp.type === 'DIODE_ZENER') {
    const vf = props.vf || 0.7;
    state.isActive = batteryVoltage >= vf && current > 0.0001;
    state.voltage = state.isActive ? vf : 0;
  }

  // Transistor behavior (simplified)
  if (comp.type === 'TRANSISTOR_NPN' || comp.type === 'TRANSISTOR_PNP') {
    // Assume transistor is ON if it's in a connected group with power
    state.isActive = current > 0.001;
  }

  // MOSFET behavior
  if (comp.type === 'MOSFET_N' || comp.type === 'MOSFET_P') {
    state.isActive = current > 0.001;
  }

  // Display behavior
  if (comp.type === 'LCD' || comp.type === 'LCD_2004' || comp.type === 'OLED' ||
      comp.type === 'SEVEN_SEGMENT' || comp.type === 'MATRIX') {
    const vf = props.forwardVoltage || 3.3;
    state.isActive = batteryVoltage >= vf && current > 0.001;
  }

  // Sensor behavior (sensors are always "active" when connected to power)
  if (comp.type.includes('SENSOR') || comp.type === 'DHT11' || comp.type === 'DHT22' ||
      comp.type === 'ULTRASONIC' || comp.type === 'MOTION' || comp.type === 'COMPASS' ||
      comp.type === 'GYRO' || comp.type === 'GPS' || comp.type === 'HEARTBEAT' ||
      comp.type === 'COLOR_SENSOR' || comp.type === 'THERMISTOR' || comp.type === 'TILT_SENSOR' ||
      comp.type === 'HALL_SENSOR' || comp.type === 'FLEX_SENSOR' || comp.type === 'PRESSURE_SENSOR' ||
      comp.type === 'RAIN_SENSOR' || comp.type === 'SOIL_SENSOR' || comp.type === 'GAS_SENSOR' ||
      comp.type === 'FLAME_SENSOR' || comp.type === 'SOUND_SENSOR' || comp.type === 'RFID' ||
      comp.type === 'FINGERPRINT') {
    const vf = props.forwardVoltage || 3.3;
    state.isActive = batteryVoltage >= vf && current > 0.0001;
  }

  // Communication modules
  if (comp.type === 'WIFI' || comp.type === 'BLUETOOTH' || comp.type === 'RADIO' ||
      comp.type === 'SD_CARD' || comp.type === 'RTC') {
    const vf = props.forwardVoltage || 3.3;
    state.isActive = batteryVoltage >= vf && current > 0.0001;
  }

  // Microcontrollers
  if (isMicrocontroller(comp.type)) {
    const vf = props.forwardVoltage || 5.0;
    state.isActive = batteryVoltage >= vf && current > 0.001;
  }

  return state;
}

function isMicrocontroller(type: string): boolean {
  return type.includes('ARDUINO') || type.includes('ESP') || type.includes('RASPBERRY_PI') ||
         type === 'MICROBIT' || type === 'NODEMCU';
}

// === MAIN SIMULATION ===

/** Runs a full DC simulation on a circuit, returning component states, current/voltage totals, and diagnostics. */
export function simulateCircuit(
  components: CircuitComponent[],
  wires: Wire[],
  hardwareState: HardwareState
): SimulationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const componentStates = new Map<string, ComponentState>();
  const nodeVoltages = new Map<string, number>();
  const nodeDetails = new Map<string, NodeVoltage>();

  // Initialize all component states
  components.forEach(comp => {
    componentStates.set(comp.id, {
      componentId: comp.id,
      isActive: false,
      current: 0,
      voltage: 0,
      power: 0,
      state: null,
    });
  });

  if (components.length === 0) {
    const emptyMetrics = calculatePowerMetrics(components, componentStates, 0, 0);
    return { componentStates, totalCurrent: 0, totalVoltage: 0, totalResistance: 0, powerDraw: 0, powerMetrics: emptyMetrics, isShortCircuit: false, isOpenCircuit: false, errors, warnings, nodeVoltages, nodeDetails, propagationDelay: 0 };
  }

  // Find power sources
  const batteries = components.filter(c =>
    c.type === 'BATTERY_9V' || c.type === 'BATTERY_AA' || c.type === 'SOLAR'
  );

  if (batteries.length === 0) {
    warnings.push('No power source found. Add a battery or power supply.');
    const noPowerMetrics = calculatePowerMetrics(components, componentStates, 0, 0);
    return { componentStates, totalCurrent: 0, totalVoltage: 0, totalResistance: 0, powerDraw: 0, powerMetrics: noPowerMetrics, isShortCircuit: false, isOpenCircuit: false, errors, warnings, nodeVoltages, nodeDetails, propagationDelay: 0 };
  }

  // Find connected groups
  const groups = findConnectedGroups(components, wires);
  let totalVoltage = 0;
  let totalCurrent = 0;
  let totalResistance = 0;
  let isShortCircuit = false;

  groups.forEach((group: string[]) => {
    const groupBatteries = group.filter((id: string) =>
      components.find(c => c.id === id && (c.type === 'BATTERY_9V' || c.type === 'BATTERY_AA' || c.type === 'SOLAR'))
    );

    if (groupBatteries.length === 0) {
      // Group has no power source - components are inactive
      group.forEach((id: string) => {
        const state = componentStates.get(id);
        if (state) {
          state.isActive = false;
          state.current = 0;
          state.voltage = 0;
        }
      });
      return;
    }

    // Use the highest voltage battery in the group
    let bestBatteryId = groupBatteries[0];
    let bestVoltage = 0;
    groupBatteries.forEach((id: string) => {
      const comp = components.find(c => c.id === id);
      if (comp) {
        const props = ELECTRICAL_PROPS[comp.type];
        const v = props?.voltage || 5.0;
        if (v > bestVoltage) {
          bestVoltage = v;
          bestBatteryId = id;
        }
      }
    });
    const mainBattery = components.find(c => c.id === bestBatteryId)!;

    const batteryVoltage = ELECTRICAL_PROPS[mainBattery.type]?.voltage || 5.0;
    totalVoltage = Math.max(totalVoltage, batteryVoltage);

    // Check for short circuit (only batteries connected, no loads)
    const groupComponents = group.map(id => components.find(c => c.id === id)!).filter(Boolean);
    const loadComponents = groupComponents.filter(c =>
      !c.type.startsWith('BATTERY') && c.type !== 'SOLAR' && c.type !== 'BREADBOARD'
    );

    if (loadComponents.length === 0) {
      isShortCircuit = true;
      totalCurrent = batteryVoltage / 0.01; // Near-zero resistance
      errors.push('SHORT CIRCUIT! No load components connected to power. Current is dangerously high!');

      // Mark battery as overloaded
      const state = componentStates.get(mainBattery.id);
      if (state) {
        state.isActive = true;
        state.current = totalCurrent;
        state.voltage = batteryVoltage;
        state.power = batteryVoltage * totalCurrent;
        state.temperature = 200; // Overheating
        state.state = 'overloaded';
      }
      return;
    }

    // Calculate resistance and current for this group
    const { totalResistance: groupResistance, componentCurrents, isShort } =
      calculateGroupResistance(groupComponents, batteryVoltage);

    if (isShort) {
      isShortCircuit = true;
      errors.push('Short circuit detected in group!');
    }

    totalResistance = groupResistance;
    totalCurrent = batteryVoltage / groupResistance;

    // Check for overcurrent on any component
    loadComponents.forEach(comp => {
      const props = ELECTRICAL_PROPS[comp.type];
      const maxCurrent = props?.maxCurrent || 1.0;
      const compCurrent = componentCurrents.get(comp.id) || 0;

      if (compCurrent > maxCurrent) {
        warnings.push(`${comp.type} is drawing ${compCurrent.toFixed(3)}A (max: ${maxCurrent}A). May be damaged!`);
      }
    });

    // Calculate state for each component
    groupComponents.forEach(comp => {
      const compCurrent = componentCurrents.get(comp.id) || 0;
      const state = calculateComponentState(comp, compCurrent, batteryVoltage, batteryVoltage, hardwareState);
      componentStates.set(comp.id, state);
    });

    // Check for LED without resistor warnings
    const leds = loadComponents.filter(c => c.type.startsWith('LED'));
    const hasResistor = loadComponents.some(c => c.type === 'RESISTOR');
    if (leds.length > 0 && !hasResistor) {
      warnings.push('LED connected without resistor! Add a resistor to limit current.');
    }
  });

  // Generate sensor readings
  const { sensorReadings } = generateSensorReadings(components, hardwareState);
  hardwareState.sensorReadings = sensorReadings;

  // Update hardware state based on simulation
  if (hardwareState.pins) {
    // Set pin states based on component states
    components.forEach(comp => {
      const state = componentStates.get(comp.id);
      if (state && comp.pin < hardwareState.pins.length) {
        hardwareState.pins[comp.pin] = state.isActive;
      }
    });
  }

  // Calculate node voltages
  const voltageResult = calculateNodeVoltages(components, wires, 9.0);
  voltageResult.forEach((node, id) => {
    nodeDetails.set(id, node);
    nodeVoltages.set(id, node.voltage);
  });

  // Detect open circuits
  const openCircuitResult = detectOpenCircuit(components, wires);
  if (openCircuitResult.isOpen) {
    warnings.push(`Open circuit detected: ${openCircuitResult.disconnectedComponents.length} component(s) disconnected`);
    openCircuitResult.disconnectedComponents.forEach(id => {
      const state = componentStates.get(id);
      if (state) {
        state.isActive = false;
        state.current = 0;
        state.voltage = 0;
      }
    });
  }

  // Calculate propagation delay
  const propagationDelay = calculatePropagationDelay(components, wires);

  const powerMetrics = calculatePowerMetrics(
    components,
    componentStates,
    totalVoltage,
    totalCurrent
  );

  return {
    componentStates,
    totalCurrent,
    totalVoltage,
    totalResistance,
    powerDraw: totalVoltage * totalCurrent * 1000,
    powerMetrics,
    isShortCircuit,
    isOpenCircuit: openCircuitResult.isOpen,
    errors,
    warnings,
    nodeVoltages,
    nodeDetails,
    propagationDelay,
  };
}

export interface SensorReadingsResult {
  sensorReadings: Map<string, number>;
}

const SENSOR_COMPONENT_TYPES = new Set([
  'LIGHT_SENSOR', 'TEMP_SENSOR', 'THERMISTOR', 'DHT11', 'DHT22',
  'ULTRASONIC', 'MOTION', 'SOUND_SENSOR', 'GAS_SENSOR', 'FLAME_SENSOR',
  'RAIN_SENSOR', 'SOIL_SENSOR', 'PRESSURE_SENSOR', 'FLEX_SENSOR', 'TILT_SENSOR',
  'HALL_SENSOR', 'COMPASS', 'GYRO', 'GPS', 'HEARTBEAT', 'COLOR_SENSOR',
  'RFID', 'FINGERPRINT', 'POTENTIOMETER', 'SLIDE_POT',
]);

export function generateSensorReadings(
  components: CircuitComponent[],
  hardwareState: HardwareState
): SensorReadingsResult {
  const sensorReadings = new Map<string, number>();
  const t = Date.now() / 1000;

  components.forEach(comp => {
    if (!SENSOR_COMPONENT_TYPES.has(comp.type)) return;

    let value = 0;
    switch (comp.type) {
      case 'LIGHT_SENSOR':
        value = Math.round((0.5 + 0.5 * Math.sin(t * 0.1)) * 1023);
        break;
      case 'TEMP_SENSOR':
        value = Math.round((22 + 2 * Math.sin(t * 0.02) + (Math.random() - 0.5)) * 10) / 10;
        break;
      case 'ULTRASONIC':
        value = Math.round((200 + 150 * Math.sin(t * 0.05)) * 10) / 10;
        break;
      case 'POTENTIOMETER':
      case 'SLIDE_POT':
        value = hardwareState.potentiometerValue;
        break;
      case 'DHT11':
        value = Math.round(22 + Math.sin(t * 0.01) * 3);
        break;
      case 'DHT22':
        value = Math.round((22.5 + Math.sin(t * 0.01) * 3.5) * 10) / 10;
        break;
      case 'MOTION':
        value = Math.random() > 0.8 ? 1 : 0;
        break;
      case 'SOUND_SENSOR':
        value = Math.round(50 + 200 * Math.abs(Math.sin(t * 0.3)) + (Math.random() - 0.5) * 20);
        break;
      case 'GAS_SENSOR':
        value = Math.round(100 + 300 * Math.sin(t * 0.005) + (Math.random() - 0.5) * 10);
        break;
      case 'FLAME_SENSOR':
        value = Math.random() > 0.95 ? 1 : 0;
        break;
      case 'RAIN_SENSOR':
        value = Math.round(50 + 200 * Math.abs(Math.sin(t * 0.01)));
        break;
      case 'SOIL_SENSOR':
        value = Math.round(400 + 100 * Math.sin(t * 0.003));
        break;
      case 'PRESSURE_SENSOR':
        value = Math.round((1013.25 + Math.sin(t * 0.001) * 2) * 10) / 10;
        break;
      case 'FLEX_SENSOR':
        value = Math.round(200 + 300 * Math.abs(Math.sin(t * 0.1)));
        break;
      case 'TILT_SENSOR':
        value = Math.sin(t * 0.05) > 0 ? 1 : 0;
        break;
      case 'HALL_SENSOR':
        value = Math.round(Math.abs(Math.sin(t * 0.2)) * 5 * 100) / 100;
        break;
      case 'COMPASS':
        value = Math.round(((t * 10) % 360) * 10) / 10;
        break;
      case 'HEARTBEAT':
        value = Math.round(72 + Math.sin(t * 0.1) * 8);
        break;
      case 'COLOR_SENSOR':
        value = Math.round(Math.random() * 0xFFFFFF);
        break;
      default:
        value = Math.round(Math.random() * 1023);
        break;
    }

    sensorReadings.set(comp.id, value);
  });

  return { sensorReadings };
}

/** Returns the default electrical properties for a given component type. */
export function getComponentProperties(type: ComponentType): ComponentElectricalProps {
  return ELECTRICAL_PROPS[type] || { resistance: 1000 };
}

/** Returns a specific electrical property value for a component type. */
export function getComponentPropertyValue(type: ComponentType, key: string): number {
  const props = ELECTRICAL_PROPS[type];
  return (props as any)?.[key] ?? 0;
}

/** Returns a copy of the default electrical properties for a component type. */
export function getDefaultProperties(type: ComponentType): ComponentElectricalProps {
  return { ...getComponentProperties(type) };
}

// === AC CIRCUIT ANALYSIS ===

export interface ACAnalysisResult {
  impedance: number;
  phaseShift: number;
  magnitude: number;
  frequency: number;
  resonanceFreq?: number;
  qualityFactor?: number;
}

/** Calculates capacitive reactance Xc = 1/(2πfC). */
export function calculateCapacitiveReactance(capacitance: number, frequency: number): number {
  if (frequency <= 0) return Infinity;
  return 1 / (2 * Math.PI * frequency * capacitance);
}

/** Calculates inductive reactance Xl = 2πfL. */
export function calculateInductiveReactance(inductance: number, frequency: number): number {
  return 2 * Math.PI * frequency * inductance;
}

/** Calculates AC impedance, phase shift, resonance frequency, and quality factor. */
export function calculateACImpedance(
  resistance: number,
  capacitance: number,
  inductance: number,
  frequency: number
): ACAnalysisResult {
  const Xc = calculateCapacitiveReactance(capacitance, frequency);
  const Xl = calculateInductiveReactance(inductance, frequency);
  const reactance = Xl - Xc;
  const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
  const phaseShift = Math.atan2(reactance, resistance) * (180 / Math.PI);

  const resonanceFreq = capacitance > 0 && inductance > 0
    ? 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance))
    : undefined;

  const qualityFactor = resonanceFreq !== undefined && resistance > 0
    ? (1 / resistance) * Math.sqrt(inductance / capacitance)
    : undefined;

  return { impedance, phaseShift, magnitude: impedance, frequency, resonanceFreq, qualityFactor };
}

// === TRANSISTOR SIMULATION ===

export interface TransistorState {
  type: 'NPN' | 'PNP';
  baseVoltage: number;
  collectorCurrent: number;
  emitterCurrent: number;
  collectorEmitterVoltage: number;
  mode: 'cutoff' | 'active' | 'saturation' | 'reverse';
  powerDissipation: number;
}

/** Simulates NPN/PNP transistor behavior (cutoff, active, saturation, reverse modes). */
export function simulateTransistor(
  type: 'NPN' | 'PNP',
  baseVoltage: number,
  collectorSupply: number,
  beta: number = 200,
  emitterResistance: number = 0,
  baseResistance: number = 1000
): TransistorState {
  const Vbe = type === 'NPN' ? 0.7 : -0.7;
  const VbeEff = baseVoltage - Vbe;
  const baseCurrent = type === 'NPN'
    ? Math.max(0, VbeEff / baseResistance)
    : Math.max(0, -VbeEff / baseResistance);

  let collectorCurrent = baseCurrent * beta;
  const maxCollectorCurrent = collectorSupply / (emitterResistance + 0.1);
  collectorCurrent = Math.min(collectorCurrent, maxCollectorCurrent);

  const Vce = type === 'NPN'
    ? collectorSupply - collectorCurrent * emitterResistance
    : -(collectorSupply - collectorCurrent * emitterResistance);

  let mode: TransistorState['mode'];
  if (baseCurrent <= 0.000001) {
    mode = 'cutoff';
    collectorCurrent = 0;
  } else if (Math.abs(Vce) < 0.2) {
    mode = 'saturation';
    collectorCurrent = maxCollectorCurrent;
  } else if ((type === 'NPN' && Vce > 0.2) || (type === 'PNP' && Vce < -0.2)) {
    mode = 'active';
  } else {
    mode = 'reverse';
  }

  const emitterCurrent = collectorCurrent + baseCurrent;
  const powerDissipation = Math.abs(Vce) * collectorCurrent;

  return {
    type,
    baseVoltage,
    collectorCurrent,
    emitterCurrent,
    collectorEmitterVoltage: Vce,
    mode,
    powerDissipation,
  };
}

// === OP-AMP SIMULATION ===

export interface OpAmpState {
  outputVoltage: number;
  gain: number;
  bandwidth: number;
  slewRate: number;
  inputCurrent: number;
  outputCurrent: number;
  isSaturated: boolean;
  mode: 'linear' | 'saturated_high' | 'saturated_low';
  powerDissipation: number;
}

/** Simulates an op-amp with saturation and slew-rate limiting. */
export function simulateOpAmp(
  type: 'OPAMP_358' | 'OPAMP_072',
  nonInvertingInput: number,
  invertingInput: number,
  supplyVoltage: number = 5,
  rf: number = 10000,
  ri: number = 1000
): OpAmpState {
  const props = ELECTRICAL_PROPS[type];
  const openLoopGain = props?.gain || 100000;
  const maxOutputVoltage = supplyVoltage - (props?.maxVoltage || 3.5) + supplyVoltage / 2;
  const minOutputVoltage = 0;

  const differential = nonInvertingInput - invertingInput;
  let outputVoltage = differential * (rf / ri);

  const bandwidth = openLoopGain / (1 + rf / ri);
  const slewRate = type === 'OPAMP_072' ? 0.65 : 0.3;

  let mode: OpAmpState['mode'] = 'linear';
  let isSaturated = false;
  if (outputVoltage >= maxOutputVoltage) {
    outputVoltage = maxOutputVoltage;
    mode = 'saturated_high';
    isSaturated = true;
  } else if (outputVoltage <= minOutputVoltage) {
    outputVoltage = minOutputVoltage;
    mode = 'saturated_low';
    isSaturated = true;
  }

  const effectiveGain = isSaturated ? 0 : rf / ri;
  const inputCurrent = Math.abs(differential) / 10000000;
  const outputCurrent = outputVoltage / (rf + ri);
  const powerDissipation = Math.abs(outputVoltage) * outputCurrent;

  return {
    outputVoltage,
    gain: effectiveGain,
    bandwidth,
    slewRate,
    inputCurrent,
    outputCurrent,
    isSaturated,
    mode,
    powerDissipation,
  };
}

// === CAPACITOR CHARGING/DISCHARGING ===

export interface CapacitorChargeState {
  voltage: number;
  current: number;
  chargePercent: number;
  energyStored: number;
  timeConstant: number;
  isCharging: boolean;
  timeElapsed: number;
}

/** Simulates capacitor charging/discharging over time. */
export function simulateCapacitorCharge(
  capacitance: number,
  resistance: number,
  supplyVoltage: number,
  initialVoltage: number,
  timeElapsed: number,
  charging: boolean
): CapacitorChargeState {
  const tau = resistance * capacitance;
  let voltage: number;
  let current: number;

  if (charging) {
    voltage = supplyVoltage * (1 - Math.exp(-timeElapsed / tau)) + initialVoltage * Math.exp(-timeElapsed / tau);
    current = ((supplyVoltage - initialVoltage) / resistance) * Math.exp(-timeElapsed / tau);
  } else {
    voltage = initialVoltage * Math.exp(-timeElapsed / tau);
    current = -(initialVoltage / resistance) * Math.exp(-timeElapsed / tau);
  }

  const chargePercent = (voltage / supplyVoltage) * 100;
  const energyStored = 0.5 * capacitance * voltage * voltage;

  return {
    voltage,
    current,
    chargePercent: Math.min(100, Math.max(0, chargePercent)),
    energyStored,
    timeConstant: tau,
    isCharging: charging,
    timeElapsed,
  };
}

// === INDUCTOR BEHAVIOR ===

export interface InductorState {
  current: number;
  backEmf: number;
  energyStored: number;
  timeConstant: number;
  isCharging: boolean;
  magneticField: number;
  fluxDensity: number;
}

/** Simulates inductor behavior with back-EMF during charge/discharge. */
export function simulateInductor(
  inductance: number,
  resistance: number,
  supplyVoltage: number,
  initialCurrent: number,
  timeElapsed: number,
  charging: boolean
): InductorState {
  const tau = inductance / resistance;
  let current: number;

  if (charging) {
    const targetCurrent = supplyVoltage / resistance;
    current = targetCurrent * (1 - Math.exp(-timeElapsed / tau)) + initialCurrent * Math.exp(-timeElapsed / tau);
  } else {
    current = initialCurrent * Math.exp(-timeElapsed / tau);
  }

  const backEmf = -inductance * (current - initialCurrent) / Math.max(timeElapsed, 0.0001);
  const energyStored = 0.5 * inductance * current * current;
  const magneticField = current / resistance;
  const fluxDensity = inductance * current;

  return {
    current,
    backEmf,
    energyStored,
    timeConstant: tau,
    isCharging: charging,
    magneticField,
    fluxDensity,
  };
}

/** Formats a numeric value with its unit using human-readable prefixes (kΩ, µF, mA, etc.). */
export function formatValue(value: number, unit: string): string {
  if (unit === 'Ω') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}MΩ`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}kΩ`;
    return `${value.toFixed(0)}Ω`;
  }
  if (unit === 'F') {
    if (value >= 0.001) return `${(value * 1000).toFixed(1)}mF`;
    if (value >= 0.000001) return `${(value * 1000000).toFixed(1)}µF`;
    return `${(value * 1000000000).toFixed(0)}nF`;
  }
  if (unit === 'V') return `${value.toFixed(2)}V`;
  if (unit === 'A') {
    if (value >= 1) return `${value.toFixed(2)}A`;
    if (value >= 0.001) return `${(value * 1000).toFixed(1)}mA`;
    return `${(value * 1000000).toFixed(0)}µA`;
  }
  if (unit === 'W') {
    if (value >= 1) return `${value.toFixed(2)}W`;
    return `${(value * 1000).toFixed(1)}mW`;
  }
  return `${value}${unit}`;
}

// === FREQUENCY RESPONSE ANALYSIS (BODE PLOT) ===

export interface BodePoint {
  frequency: number;
  magnitudeDb: number;
  phaseDegrees: number;
  magnitudeLinear: number;
}

export interface BodePlotData {
  points: BodePoint[];
  bandwidth: number;
  cutoffFrequency: number;
  gainAtDC: number;
  phaseAtDC: number;
}

/** Generates Bode plot data (magnitude/phase vs frequency) for an RLC circuit. */
export function calculateBodePlot(
  resistance: number,
  capacitance: number,
  inductance: number,
  startFreq: number,
  endFreq: number,
  points: number = 100
): BodePlotData {
  const bodePoints: BodePoint[] = [];
  const logStart = Math.log10(startFreq);
  const logEnd = Math.log10(endFreq);

  for (let i = 0; i < points; i++) {
    const logFreq = logStart + (logEnd - logStart) * (i / (points - 1));
    const freq = Math.pow(10, logFreq);

    const Xc = calculateCapacitiveReactance(capacitance, freq);
    const Xl = calculateInductiveReactance(inductance, freq);
    const reactance = Xl - Xc;
    const impedance = Math.sqrt(resistance * resistance + reactance * reactance);

    const magnitudeLinear = impedance > 0 ? resistance / impedance : 0;
    const magnitudeDb = 20 * Math.log10(Math.max(magnitudeLinear, 1e-10));
    const phaseDegrees = Math.atan2(reactance, resistance) * (180 / Math.PI);

    bodePoints.push({
      frequency: freq,
      magnitudeDb,
      phaseDegrees,
      magnitudeLinear,
    });
  }

  // Find -3dB cutoff frequency
  const dcGain = bodePoints[0].magnitudeDb;
  const cutoffGain = dcGain - 3;
  let cutoffFreq = bodePoints[bodePoints.length - 1].frequency;
  for (const point of bodePoints) {
    if (point.magnitudeDb <= cutoffGain) {
      cutoffFreq = point.frequency;
      break;
    }
  }

  // Calculate bandwidth
  const bandwidth = cutoffFreq - bodePoints[0].frequency;

  return {
    points: bodePoints,
    bandwidth,
    cutoffFrequency: cutoffFreq,
    gainAtDC: bodePoints[0].magnitudeLinear,
    phaseAtDC: bodePoints[0].phaseDegrees,
  };
}

// === TRANSIENT ANALYSIS ===

export interface TransientPoint {
  time: number;
  voltage: number;
  current: number;
}

export interface TransientResult {
  points: TransientPoint[];
  riseTime: number;
  fallTime: number;
  settlingTime: number;
  overshoot: number;
  finalValue: number;
}

/** Simulates the transient response (step, pulse, or sine input) of an RLC circuit. */
export function simulateTransient(
  resistance: number,
  capacitance: number,
  inductance: number,
  supplyVoltage: number,
  duration: number,
  timeStep: number,
  inputType: 'step' | 'pulse' | 'sine',
  inputFrequency?: number
): TransientResult {
  const points: TransientPoint[] = [];
  const tau = resistance * capacitance;
  const steps = Math.floor(duration / timeStep);

  let prevVoltage = 0;
  let maxVoltage = 0;
  let riseStart = 0;
  let riseEnd = 0;
  let settled = false;
  let settlingTime = 0;

  for (let i = 0; i <= steps; i++) {
    const t = i * timeStep;
    let inputVoltage: number;

    switch (inputType) {
      case 'step':
        inputVoltage = supplyVoltage;
        break;
      case 'pulse':
        inputVoltage = (Math.sin(2 * Math.PI * (inputFrequency || 1) * t) > 0) ? supplyVoltage : 0;
        break;
      case 'sine':
        inputVoltage = supplyVoltage * Math.sin(2 * Math.PI * (inputFrequency || 1) * t);
        break;
    }

    // RC circuit response
    let voltage: number;
    if (inductance > 0) {
      // RLC circuit - simplified Euler integration
      const di = (inputVoltage - prevVoltage / resistance - prevVoltage) / inductance * timeStep;
      voltage = prevVoltage + di * timeStep;
    } else {
      // RC circuit
      voltage = inputVoltage * (1 - Math.exp(-t / tau));
    }

    const current = (inputVoltage - voltage) / resistance;

    points.push({ time: t, voltage, current });

    // Track metrics
    if (voltage > maxVoltage) maxVoltage = voltage;
    if (voltage >= supplyVoltage * 0.1 && riseStart === 0) riseStart = t;
    if (voltage >= supplyVoltage * 0.9 && riseEnd === 0) riseEnd = t;
    if (!settled && Math.abs(voltage - supplyVoltage) < supplyVoltage * 0.02) {
      settled = true;
      settlingTime = t;
    }

    prevVoltage = voltage;
  }

  const riseTime = riseEnd - riseStart;
  const overshoot = maxVoltage > supplyVoltage ? ((maxVoltage - supplyVoltage) / supplyVoltage) * 100 : 0;
  const finalValue = points[points.length - 1]?.voltage || 0;
  const fallTime = duration - settlingTime;

  return {
    points,
    riseTime,
    fallTime,
    settlingTime,
    overshoot,
    finalValue,
  };
}

// === NOISE ANALYSIS ===

export interface NoiseSource {
  type: 'thermal' | 'shot' | 'flicker';
  value: number;
  formula: string;
}

export interface NoiseAnalysisResult {
  thermalNoise: number;
  shotNoise: number;
  flickerNoise: number;
  totalNoise: number;
  signalToNoiseRatio: number;
  noiseDensity: number;
  sources: NoiseSource[];
  bandwidth: number;
}

/** Calculates thermal, shot, and flicker noise for a circuit. */
export function analyzeNoise(
  resistance: number,
  current: number,
  temperature: number,
  bandwidth: number,
  flickerCornerFreq: number = 1000
): NoiseAnalysisResult {
  const kB = 1.380649e-23; // Boltzmann constant
  const q = 1.602176634e-19; // Electron charge

  // Thermal noise (Johnson-Nyquist): Vn = sqrt(4 * k * T * R * BW)
  const thermalNoise = Math.sqrt(4 * kB * temperature * resistance * bandwidth);

  // Shot noise: In = sqrt(2 * q * I * BW)
  const shotNoise = Math.sqrt(2 * q * Math.abs(current) * bandwidth);

  // Flicker noise (1/f noise): Vn = K * sqrt(ln(fH/fL)) where K depends on device
  const flickerConstant = 1e-6; // Typical flicker noise constant
  const fL = 1; // Low frequency cutoff
  const flickerNoise = flickerConstant * Math.sqrt(Math.log(bandwidth / fL));

  // Total noise (RSS)
  const totalNoise = Math.sqrt(thermalNoise ** 2 + shotNoise ** 2 + flickerNoise ** 2);

  // SNR
  const signalVoltage = current * resistance;
  const signalToNoiseRatio = totalNoise > 0 ? 20 * Math.log10(signalVoltage / totalNoise) : Infinity;

  // Noise density (per sqrt Hz)
  const noiseDensity = totalNoise / Math.sqrt(bandwidth);

  const sources: NoiseSource[] = [
    {
      type: 'thermal',
      value: thermalNoise,
      formula: `Vn = sqrt(4 * k * T * R * BW) = ${thermalNoise.toExponential(3)} V`,
    },
    {
      type: 'shot',
      value: shotNoise,
      formula: `In = sqrt(2 * q * I * BW) = ${shotNoise.toExponential(3)} A`,
    },
    {
      type: 'flicker',
      value: flickerNoise,
      formula: `Vn = K * sqrt(ln(fH/fL)) = ${flickerNoise.toExponential(3)} V`,
    },
  ];

  return {
    thermalNoise,
    shotNoise,
    flickerNoise,
    totalNoise,
    signalToNoiseRatio,
    noiseDensity,
    sources,
    bandwidth,
  };
}

// === MONTE CARLO SIMULATION ===

export interface ComponentTolerance {
  nominal: number;
  tolerance: number; // percentage (e.g., 5 for 5%)
  distribution: 'uniform' | 'gaussian';
}

export interface MonteCarloResult {
  results: number[];
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  histogram: { range: string; count: number }[];
  percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
  withinSpec: number; // percentage within spec
}

/** Runs a Monte Carlo simulation with component tolerances. */
export function runMonteCarloSimulation(
  calculateFunction: (components: number[]) => number,
  componentTolerances: ComponentTolerance[],
  numSamples: number = 10000,
  specMin?: number,
  specMax?: number
): MonteCarloResult {
  const results: number[] = [];

  for (let sample = 0; sample < numSamples; sample++) {
    const componentValues = componentTolerances.map(ct => {
      if (ct.distribution === 'gaussian') {
        // Box-Muller transform for Gaussian
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return ct.nominal * (1 + z * ct.tolerance / 100);
      } 
        // Uniform distribution
        const range = ct.nominal * ct.tolerance / 100;
        return ct.nominal + (Math.random() * 2 - 1) * range;
      
    });

    results.push(calculateFunction(componentValues));
  }

  // Statistics
  const sorted = [...results].sort((a, b) => a - b);
  const mean = results.reduce((s, v) => s + v, 0) / results.length;
  const variance = results.reduce((s, v) => s + (v - mean) ** 2, 0) / results.length;
  const stdDev = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Histogram
  const numBins = 20;
  const binWidth = (max - min) / numBins;
  const histogram: { range: string; count: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    const low = min + i * binWidth;
    const high = low + binWidth;
    const count = results.filter(v => v >= low && (i === numBins - 1 ? v <= high : v < high)).length;
    histogram.push({
      range: `${low.toFixed(3)}-${high.toFixed(3)}`,
      count,
    });
  }

  // Percentiles
  const percentile = (p: number) => sorted[Math.floor(sorted.length * p / 100)];
  const percentiles = {
    p5: percentile(5),
    p25: percentile(25),
    p50: percentile(50),
    p75: percentile(75),
    p95: percentile(95),
  };

  // Within spec
  let withinSpec = 100;
  if (specMin !== undefined && specMax !== undefined) {
    const inSpec = results.filter(v => v >= specMin && v <= specMax).length;
    withinSpec = (inSpec / results.length) * 100;
  }

  return {
    results,
    mean,
    stdDev,
    min,
    max,
    histogram,
    percentiles,
    withinSpec,
  };
}

// === PARAMETRIC SWEEP ===

export interface SweepPoint {
  paramValue: number;
  result: number;
  additionalResults?: Record<string, number>;
}

export interface ParametricSweepResult {
  points: SweepPoint[];
  paramName: string;
  paramUnit: string;
  resultName: string;
  resultUnit: string;
  optimalValue: number;
  optimalResult: number;
  sensitivity: number;
}

/** Sweeps a parameter across a range and returns the resulting circuit behavior. */
export function runParametricSweep(
  calculateFunction: (paramValue: number) => { result: number; additional?: Record<string, number> },
  paramName: string,
  paramUnit: string,
  resultName: string,
  resultUnit: string,
  startValue: number,
  endValue: number,
  steps: number
): ParametricSweepResult {
  const points: SweepPoint[] = [];
  const stepSize = (endValue - startValue) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const paramValue = startValue + i * stepSize;
    const { result, additional } = calculateFunction(paramValue);
    points.push({
      paramValue,
      result,
      additionalResults: additional,
    });
  }

  // Find optimal value (maximum result)
  let optimalIdx = 0;
  let optimalResult = points[0].result;
  for (let i = 1; i < points.length; i++) {
    if (points[i].result > optimalResult) {
      optimalResult = points[i].result;
      optimalIdx = i;
    }
  }

  // Calculate sensitivity (derivative at midpoint)
  const midIdx = Math.floor(points.length / 2);
  const sensitivity = midIdx > 0 && midIdx < points.length - 1
    ? (points[midIdx + 1].result - points[midIdx - 1].result) / (2 * stepSize)
    : 0;

  return {
    points,
    paramName,
    paramUnit,
    resultName,
    resultUnit,
    optimalValue: points[optimalIdx].paramValue,
    optimalResult,
    sensitivity,
  };
}
