import { describe, it, expect, beforeEach } from 'vitest';
import {
  simulateCircuit,
  calculateNodeVoltages,
  calculatePropagationDelay,
  detectOpenCircuit,
  findConnectedGroups,
  ELECTRICAL_PROPS,
  getComponentProperties,
  getComponentPropertyValue,
  getDefaultProperties,
  formatValue,
} from '../circuitSimulator';
import { CircuitComponent, Wire, HardwareState } from '../../types';

function createHardwareState(): HardwareState {
  return {
    pins: new Array(20).fill(false),
    buzzerActive: false,
    fanSpeed: 0,
    temperature: 25,
    servoAngle: 0,
    lcdLines: ['', '', '', ''],
    cursorRow: 0,
    cursorCol: 0,
    potentiometerValue: 0,
    speakerVolume: 0.5,
    rgbColor: '#000000',
    sevenSegmentValue: null,
    distance: 0,
    motionDetected: false,
    vibrationActive: false,
    keypadValue: null,
    joystick: { x: 0, y: 0 },
    pressure: 0,
    flex: 0,
    tilt: false,
    magneticField: 0,
    detectedColor: '',
    humidity: 50,
    gasLevel: 0,
    flameDetected: false,
    rainLevel: 0,
    soilMoisture: 0,
    heartbeatRate: 72,
    compassHeading: 0,
    gyroData: { x: 0, y: 0, z: 0 },
    gpsLocation: { lat: 0, lng: 0 },
    fingerprintMatch: false,
    rfidTag: null,
    stepperPosition: 0,
    pumpFlowRate: 0,
    solenoidActive: false,
    relayState: false,
    laserActive: false,
    bulbOn: false,
    continuousServoSpeed: 0,
    rgbLedColor: '',
    rgbStripColors: [],
    sdCardData: [],
    rtcTime: new Date(),
    logicGateOutput: false,
    timerOutput: false,
    wifiConnected: false,
    bluetoothConnected: false,
    cpuTemperature: 25,
    freeMemory: 32000,
    uptime: 0,
    variables: {},
    sensorHistory: [],
  };
}

describe('circuit simulation edge cases', () => {
  let hw: HardwareState;
  beforeEach(() => { hw = createHardwareState(); });

  describe('empty circuit edge cases', () => {
    it('handles completely empty component list', () => {
      const result = simulateCircuit([], [], hw);
      expect(result.totalCurrent).toBe(0);
      expect(result.totalVoltage).toBe(0);
      expect(result.componentStates.size).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.propagationDelay).toBe(0);
    });

    it('handles empty components with wires (orphan wires)', () => {
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'nonexistent', fromPin: 0, toComponentId: 'also_nonexistent', toPin: 1 }];
      const result = simulateCircuit([], wires, hw);
      expect(result.totalCurrent).toBe(0);
    });

    it('open circuit detection with empty components', () => {
      const result = detectOpenCircuit([], []);
      expect(result.isOpen).toBe(false);
      expect(result.disconnectedComponents).toHaveLength(0);
    });

    it('findConnectedGroups with empty inputs', () => {
      const groups = findConnectedGroups([], []);
      expect(groups).toHaveLength(0);
    });

    it('node voltages with empty circuit', () => {
      const nodes = calculateNodeVoltages([], [], 9);
      expect(nodes.size).toBe(0);
    });

    it('propagation delay with empty circuit', () => {
      expect(calculatePropagationDelay([], [])).toBe(0);
    });
  });

  describe('single component circuits', () => {
    it('single battery alone triggers short circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const result = simulateCircuit([battery], [], hw);
      expect(result.isShortCircuit).toBe(true);
      expect(result.errors.some(e => e.includes('SHORT CIRCUIT'))).toBe(true);
    });

    it('single LED without battery warns no power source', () => {
      const led: CircuitComponent = { id: 'led1', type: 'LED_RED', x: 0, y: 0, pin: 13 };
      const result = simulateCircuit([led], [], hw);
      expect(result.warnings.some(w => w.includes('No power source'))).toBe(true);
      expect(result.componentStates.get('led1')?.isActive).toBe(false);
    });

    it('single resistor without battery is inactive', () => {
      const r: CircuitComponent = { id: 'r1', type: 'RESISTOR', x: 0, y: 0, pin: 0 };
      const result = simulateCircuit([r], [], hw);
      expect(result.componentStates.get('r1')?.isActive).toBe(false);
    });

    it('single sensor without battery is inactive', () => {
      const sensor: CircuitComponent = { id: 's1', type: 'LIGHT_SENSOR', x: 0, y: 0, pin: 0 };
      const result = simulateCircuit([sensor], [], hw);
      expect(result.componentStates.get('s1')?.isActive).toBe(false);
    });
  });

  describe('very large circuits', () => {
    it('handles 100 components without crashing', () => {
      const components: CircuitComponent[] = Array.from({ length: 100 }, (_, i) => ({
        id: `c${i}`,
        type: 'RESISTOR' as CircuitComponent['type'],
        x: (i % 10) * 60,
        y: Math.floor(i / 10) * 60,
        pin: i % 20,
      }));
      const result = simulateCircuit(components, [], hw);
      expect(result.componentStates.size).toBe(100);
    });

    it('handles 50 wires in a chain', () => {
      const comps: CircuitComponent[] = [
        { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 },
      ];
      const wires: Wire[] = [];
      for (let i = 0; i < 50; i++) {
        const rId = `r${i}`;
        comps.push({ id: rId, type: 'RESISTOR', x: (i + 1) * 40, y: 0, pin: 0 });
        const prevId = i === 0 ? 'b1' : `r${i - 1}`;
        wires.push({ id: `w${i}`, fromComponentId: prevId, fromPin: 0, toComponentId: rId, toPin: 0 });
      }
      const result = simulateCircuit(comps, wires, hw);
      expect(result.totalVoltage).toBe(9);
      expect(result.isShortCircuit).toBe(false);
    });

    it('handles large parallel circuit', () => {
      const comps: CircuitComponent[] = [
        { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 },
      ];
      const wires: Wire[] = [];
      for (let i = 0; i < 30; i++) {
        const ledId = `led${i}`;
        comps.push({ id: ledId, type: 'LED_RED', x: 100, y: i * 40, pin: 13 });
        wires.push({ id: `w${i}`, fromComponentId: 'b1', fromPin: 0, toComponentId: ledId, toPin: 0 });
      }
      const result = simulateCircuit(comps, wires, hw);
      expect(result.componentStates.size).toBe(31);
    });

    it('handles 200 components for stress test', () => {
      const components: CircuitComponent[] = Array.from({ length: 200 }, (_, i) => ({
        id: `comp${i}`,
        type: 'RESISTOR' as CircuitComponent['type'],
        x: i * 30,
        y: 0,
        pin: 0,
      }));
      const result = simulateCircuit(components, [], hw);
      expect(result.componentStates.size).toBe(200);
    });
  });

  describe('mixed component type circuits', () => {
    it('battery + capacitor circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const cap: CircuitComponent = { id: 'c1', type: 'CAPACITOR_ELEC', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'c1', toPin: 0 }];
      const result = simulateCircuit([battery, cap], wires, hw);
      expect(result.totalVoltage).toBe(9);
    });

    it('battery + diode circuit (forward biased)', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const diode: CircuitComponent = { id: 'd1', type: 'DIODE', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'd1', toPin: 0 }];
      const result = simulateCircuit([battery, diode], wires, hw);
      expect(result.componentStates.get('d1')?.isActive).toBe(true);
    });

    it('battery + transistor circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const transistor: CircuitComponent = { id: 't1', type: 'TRANSISTOR_NPN', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 't1', toPin: 0 }];
      const result = simulateCircuit([battery, transistor], wires, hw);
      expect(result.componentStates.size).toBe(2);
    });

    it('battery + MOSFET circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const mosfet: CircuitComponent = { id: 'm1', type: 'MOSFET_N', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'm1', toPin: 0 }];
      const result = simulateCircuit([battery, mosfet], wires, hw);
      expect(result.componentStates.size).toBe(2);
    });

    it('battery + relay circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const relay: CircuitComponent = { id: 'r1', type: 'RELAY', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'r1', toPin: 0 }];
      const result = simulateCircuit([battery, relay], wires, hw);
      expect(result.componentStates.get('r1')?.isActive).toBe(true);
    });

    it('battery + servo circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const servo: CircuitComponent = { id: 's1', type: 'SERVO', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 's1', toPin: 0 }];
      const result = simulateCircuit([battery, servo], wires, hw);
      expect(result.componentStates.get('s1')?.isActive).toBe(true);
    });

    it('battery + fan circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const fan: CircuitComponent = { id: 'f1', type: 'FAN', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'f1', toPin: 0 }];
      const result = simulateCircuit([battery, fan], wires, hw);
      expect(result.componentStates.get('f1')?.isActive).toBe(true);
    });

    it('battery + LCD display circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const lcd: CircuitComponent = { id: 'lcd1', type: 'LCD', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'lcd1', toPin: 0 }];
      const result = simulateCircuit([battery, lcd], wires, hw);
      expect(result.componentStates.get('lcd1')?.isActive).toBe(true);
    });

    it('battery + OLED display circuit', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const oled: CircuitComponent = { id: 'o1', type: 'OLED', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'o1', toPin: 0 }];
      const result = simulateCircuit([battery, oled], wires, hw);
      expect(result.componentStates.get('o1')?.isActive).toBe(true);
    });

    it('battery + seven segment display', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const ssd: CircuitComponent = { id: 'ss1', type: 'SEVEN_SEGMENT', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'ss1', toPin: 0 }];
      const result = simulateCircuit([battery, ssd], wires, hw);
      expect(result.componentStates.get('ss1')?.isActive).toBe(true);
    });

    it('battery + WiFi module', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const wifi: CircuitComponent = { id: 'w1', type: 'WIFI', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'wr1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'w1', toPin: 0 }];
      const result = simulateCircuit([battery, wifi], wires, hw);
      expect(result.componentStates.get('w1')?.isActive).toBe(true);
    });

    it('battery + Bluetooth module', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const bt: CircuitComponent = { id: 'bt1', type: 'BLUETOOTH', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'bt1', toPin: 0 }];
      const result = simulateCircuit([battery, bt], wires, hw);
      expect(result.componentStates.get('bt1')?.isActive).toBe(true);
    });

    it('battery + laser diode', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const laser: CircuitComponent = { id: 'l1', type: 'LASER', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'l1', toPin: 0 }];
      const result = simulateCircuit([battery, laser], wires, hw);
      expect(result.componentStates.get('l1')?.isActive).toBe(true);
    });

    it('battery + neopixel ring', () => {
      const battery: CircuitComponent = { id: 'b1', type: 'BATTERY_9V', x: 0, y: 0, pin: 0 };
      const neo: CircuitComponent = { id: 'n1', type: 'NEOPIXEL_RING', x: 100, y: 0, pin: 0 };
      const wires: Wire[] = [{ id: 'w1', fromComponentId: 'b1', fromPin: 0, toComponentId: 'n1', toPin: 0 }];
      const result = simulateCircuit([battery, neo], wires, hw);
      expect(result.totalVoltage).toBe(9);
      expect(result.componentStates.has('n1')).toBe(true);
    });
  });

  describe('ELECTRICAL_PROPS completeness', () => {
    it('has properties for all sensor types', () => {
      const sensorTypes = ['LIGHT_SENSOR', 'TEMP_SENSOR', 'THERMISTOR', 'DHT11', 'DHT22', 'ULTRASONIC', 'MOTION', 'SOUND_SENSOR', 'GAS_SENSOR', 'FLAME_SENSOR', 'RAIN_SENSOR', 'SOIL_SENSOR', 'PRESSURE_SENSOR', 'FLEX_SENSOR', 'TILT_SENSOR', 'HALL_SENSOR', 'COMPASS', 'GYRO', 'GPS', 'HEARTBEAT', 'COLOR_SENSOR', 'FINGERPRINT', 'RFID'];
      for (const type of sensorTypes) {
        expect(ELECTRICAL_PROPS[type]).toBeDefined();
        expect(ELECTRICAL_PROPS[type].resistance).toBeGreaterThan(0);
      }
    });

    it('has properties for all passive components', () => {
      const passiveTypes = ['CAPACITOR_ELEC', 'CAPACITOR_CERAMIC', 'CAPACITOR_TANTALUM', 'DIODE', 'DIODE_SCHOTTKY', 'DIODE_ZENER', 'TRANSISTOR_NPN', 'TRANSISTOR_PNP', 'MOSFET_N', 'MOSFET_P'];
      for (const type of passiveTypes) {
        expect(ELECTRICAL_PROPS[type]).toBeDefined();
      }
    });

    it('has properties for op-amps', () => {
      expect(ELECTRICAL_PROPS['OPAMP_358'].gain).toBe(100000);
      expect(ELECTRICAL_PROPS['OPAMP_072'].gain).toBe(200000);
    });

    it('has properties for voltage regulators', () => {
      expect(ELECTRICAL_PROPS['VREG_7805'].voltage).toBe(5.0);
      expect(ELECTRICAL_PROPS['VREG_317'].voltage).toBe(3.3);
      expect(ELECTRICAL_PROPS['VREG_LDO'].voltage).toBe(3.3);
    });
  });

  describe('getComponentPropertyValue and getDefaultProperties', () => {
    it('gets specific property value', () => {
      expect(getComponentPropertyValue('BATTERY_9V', 'voltage')).toBe(9);
      expect(getComponentPropertyValue('LED_RED', 'forwardVoltage')).toBe(1.8);
    });

    it('returns 0 for non-existent property', () => {
      expect(getComponentPropertyValue('BATTERY_9V', 'nonexistent')).toBe(0);
    });

    it('getDefaultProperties returns a copy', () => {
      const props = getDefaultProperties('LED_RED');
      expect(props.resistance).toBe(90);
      props.resistance = 999;
      const props2 = getDefaultProperties('LED_RED');
      expect(props2.resistance).toBe(90);
    });
  });
});
