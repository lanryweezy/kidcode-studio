// ============================================================
// Component Datasheet System - Real-world specs for all 114 types
// Pinouts, ratings, package types, operating conditions, warnings
// ============================================================

export interface ComponentDatasheet {
  type: string;
  name: string;
  category: string;
  package: string;
  description: string;
  pinout: PinInfo[];
  ratings: ComponentRatings;
  operatingConditions: OperatingConditions;
  typicalCircuits: string[];
  tips: string[];
  warnings: string[];
  alternatives?: string[];
  datasheetUrl?: string;
  electricalCharacteristics?: ElectricalCharacteristic[];
  applicationNotes?: ApplicationNote[];
  similarComponents?: SimilarComponent[];
  pinMappingDiagram?: PinMappingDiagram;
  maximumRatings?: MaximumRatings;
}

export interface ElectricalCharacteristic {
  parameter: string;
  symbol: string;
  testCondition: string;
  min: number;
  typical: number;
  max: number;
  unit: string;
}

export interface ApplicationNote {
  title: string;
  description: string;
  circuitDiagram: string;
  keyPoints: string[];
}

export interface SimilarComponent {
  type: string;
  name: string;
  reason: string;
  keyDifferences: string[];
}

export interface PinMappingDiagram {
  package: string;
  pinCount: number;
  pinLayout: PinLayout[];
  orientationMark: string;
}

export interface PinLayout {
  position: number;
  side: 'top' | 'bottom' | 'left' | 'right';
  name: string;
  type: 'power' | 'ground' | 'input' | 'output' | 'bidirectional' | 'analog' | 'pwm' | 'comm';
  description: string;
  voltageLevel?: string;
}

export interface MaximumRatings {
  absoluteMaxRatings: RatingEntry[];
  esdSensitivity: string;
  moistureSensitivity: string;
  storageTemperature: { min: number; max: number };
}

export interface RatingEntry {
  parameter: string;
  value: number;
  unit: string;
  duration?: string;
  note?: string;
}

export interface PinInfo {
  number: number;
  name: string;
  type: 'power' | 'ground' | 'input' | 'output' | 'bidirectional' | 'analog' | 'pwm' | 'comm';
  description: string;
}

export interface ComponentRatings {
  maxVoltage?: number;
  minVoltage?: number;
  maxCurrent?: number;
  maxPower?: number;
  forwardVoltage?: number;
  reverseVoltage?: number;
  resistance?: number;
  capacitance?: number;
  inductance?: number;
  gain?: number;
  frequency?: number;
  temperature?: { min: number; max: number };
  tolerance?: string;
}

export interface OperatingConditions {
  voltage: { nominal: number; min: number; max: number };
  current: { typical: number; max: number };
  temperature: { min: number; max: number };
  humidity?: { min: number; max: number };
}

// === DATASHEET DATABASE ===

export const COMPONENT_DATASHEETS: Record<string, ComponentDatasheet> = {
  // === LEDs ===
  LED_RED: {
    type: 'LED_RED',
    name: 'Red LED (5mm)',
    category: 'Output',
    package: 'T-1 3/4 (5mm)',
    description: 'Standard 5mm red LED with 630nm wavelength. Common anode or cathode.',
    pinout: [
      { number: 1, name: 'Anode', type: 'power', description: 'Positive lead (longer leg)' },
      { number: 2, name: 'Cathode', type: 'ground', description: 'Negative lead (shorter leg, flat side)' },
    ],
    ratings: { maxVoltage: 2.2, maxCurrent: 0.03, maxPower: 0.12, forwardVoltage: 1.8, reverseVoltage: 5 },
    operatingConditions: { voltage: { nominal: 1.8, min: 1.5, max: 2.2 }, current: { typical: 0.02, max: 0.03 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['Arduino digital output', 'PWM brightness control', 'Status indicator'],
    tips: ['Always use a current-limiting resistor (220-470Ω for 5V)', 'Check flat side for cathode', 'Max current 20mA typical'],
    warnings: ['Exceeding 30mA will burn out the LED', 'Reverse voltage >5V can damage the LED', 'No resistor = instant burnout'],
    electricalCharacteristics: [
      { parameter: 'Forward Voltage', symbol: 'Vf', testCondition: 'If = 20mA', min: 1.5, typical: 1.8, max: 2.2, unit: 'V' },
      { parameter: 'Forward Current', symbol: 'If', testCondition: 'Continuous', min: 0, typical: 20, max: 30, unit: 'mA' },
      { parameter: 'Peak Wavelength', symbol: 'λp', testCondition: 'If = 20mA', min: 620, typical: 630, max: 640, unit: 'nm' },
      { parameter: 'Luminous Intensity', symbol: 'Iv', testCondition: 'If = 20mA', min: 100, typical: 200, max: 400, unit: 'mcd' },
    ],
    applicationNotes: [
      {
        title: 'Basic LED Circuit',
        description: 'Connect LED in series with current-limiting resistor to digital output.',
        circuitDiagram: 'Arduino Pin → Resistor → Anode → Cathode → GND',
        keyPoints: [
          'Calculate resistor: R = (Vcc - Vf) / If',
          'For 5V supply: R = (5 - 1.8) / 0.02 = 160Ω (use 220Ω)',
          'Use PWM for brightness control',
        ],
      },
      {
        title: 'PWM Brightness Control',
        description: 'Use analogWrite() to control LED brightness smoothly.',
        circuitDiagram: 'PWM Pin → Resistor → LED → GND',
        keyPoints: [
          'analogWrite(pin, 0) = off, analogWrite(pin, 255) = full brightness',
          'PWM frequency is ~490Hz on most pins',
          'Use for fading effects and status indicators',
        ],
      },
    ],
    similarComponents: [
      { type: 'LED_ORANGE', name: 'Orange LED', reason: 'Similar forward voltage', keyDifferences: ['610nm wavelength', 'Slightly different Vf'] },
      { type: 'LED_YELLOW', name: 'Yellow LED', reason: 'Similar forward voltage', keyDifferences: ['590nm wavelength', 'Slightly different Vf'] },
      { type: 'LED_GREEN', name: 'Green LED', reason: 'Same package', keyDifferences: ['525nm wavelength', 'Higher forward voltage (2.2V)'] },
    ],
    pinMappingDiagram: {
      package: 'T-1 3/4 (5mm)',
      pinCount: 2,
      orientationMark: 'Flat side on cathode',
      pinLayout: [
        { position: 1, side: 'bottom', name: 'Anode', type: 'power', description: 'Positive lead (longer)', voltageLevel: '1.5-2.2V' },
        { position: 2, side: 'bottom', name: 'Cathode', type: 'ground', description: 'Negative lead (shorter, flat)', voltageLevel: '0V' },
      ],
    },
    maximumRatings: {
      absoluteMaxRatings: [
        { parameter: 'Forward Current', value: 30, unit: 'mA', note: 'Exceeding will damage LED' },
        { parameter: 'Reverse Voltage', value: 5, unit: 'V', note: 'Max reverse voltage' },
        { parameter: 'Power Dissipation', value: 120, unit: 'mW' },
        { parameter: 'Junction Temperature', value: 150, unit: '°C' },
      ],
      esdSensitivity: 'Class 1 (>2000V HBM)',
      moistureSensitivity: 'MSL 1 (unlimited floor life)',
      storageTemperature: { min: -40, max: 100 },
    },
  },
  LED_BLUE: {
    type: 'LED_BLUE', name: 'Blue LED (5mm)', category: 'Output', package: 'T-1 3/4 (5mm)',
    description: 'Blue LED with 470nm wavelength. Higher forward voltage than red.',
    pinout: [{ number: 1, name: 'Anode', type: 'power', description: 'Positive lead' }, { number: 2, name: 'Cathode', type: 'ground', description: 'Negative lead' }],
    ratings: { maxVoltage: 3.6, maxCurrent: 0.03, maxPower: 0.12, forwardVoltage: 3.0, reverseVoltage: 5 },
    operatingConditions: { voltage: { nominal: 3.0, min: 2.8, max: 3.6 }, current: { typical: 0.02, max: 0.03 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['Arduino PWM output', 'RGB LED mixing', 'Status indicator'],
    tips: ['Needs higher voltage than red LEDs', 'Use 150-330Ω resistor with 5V', 'Popular for night lights'],
    warnings: ['Higher forward voltage means more power draw', 'Can be damaged by static discharge'],
  },
  LED_GREEN: {
    type: 'LED_GREEN', name: 'Green LED (5mm)', category: 'Output', package: 'T-1 3/4 (5mm)',
    description: 'Green LED with 525nm wavelength. Good for status indicators.',
    pinout: [{ number: 1, name: 'Anode', type: 'power', description: 'Positive lead' }, { number: 2, name: 'Cathode', type: 'ground', description: 'Negative lead' }],
    ratings: { maxVoltage: 2.5, maxCurrent: 0.03, maxPower: 0.12, forwardVoltage: 2.2, reverseVoltage: 5 },
    operatingConditions: { voltage: { nominal: 2.2, min: 1.8, max: 2.5 }, current: { typical: 0.02, max: 0.03 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['Power indicator', 'Status LED', 'Traffic light'],
    tips: ['Common for "power on" indicators', 'Use 220Ω resistor with 5V'],
    warnings: ['Exceeding 30mA will damage the LED'],
  },
  LED_YELLOW: {
    type: 'LED_YELLOW', name: 'Yellow LED (5mm)', category: 'Output', package: 'T-1 3/4 (5mm)',
    description: 'Yellow LED with 590nm wavelength.',
    pinout: [{ number: 1, name: 'Anode', type: 'power', description: 'Positive lead' }, { number: 2, name: 'Cathode', type: 'ground', description: 'Negative lead' }],
    ratings: { maxVoltage: 2.4, maxCurrent: 0.03, maxPower: 0.12, forwardVoltage: 2.0, reverseVoltage: 5 },
    operatingConditions: { voltage: { nominal: 2.0, min: 1.6, max: 2.4 }, current: { typical: 0.02, max: 0.03 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['Warning indicator', 'Traffic light', 'Battery level'],
    tips: ['Good for warning indicators', 'Use 220Ω with 5V'],
    warnings: ['Same current limits as other LEDs'],
  },
  LED_ORANGE: {
    type: 'LED_ORANGE', name: 'Orange LED (5mm)', category: 'Output', package: 'T-1 3/4 (5mm)',
    description: 'Orange LED with 610nm wavelength.',
    pinout: [{ number: 1, name: 'Anode', type: 'power', description: 'Positive lead' }, { number: 2, name: 'Cathode', type: 'ground', description: 'Negative lead' }],
    ratings: { maxVoltage: 2.4, maxCurrent: 0.03, maxPower: 0.12, forwardVoltage: 2.0, reverseVoltage: 5 },
    operatingConditions: { voltage: { nominal: 2.0, min: 1.6, max: 2.4 }, current: { typical: 0.02, max: 0.03 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['Warning indicator', 'Traffic light'],
    tips: ['Similar to yellow LED characteristics'],
    warnings: ['Standard LED current limits apply'],
  },
  LED_WHITE: {
    type: 'LED_WHITE', name: 'White LED (5mm)', category: 'Output', package: 'T-1 3/4 (5mm)',
    description: 'White LED with highest forward voltage.',
    pinout: [{ number: 1, name: 'Anode', type: 'power', description: 'Positive lead' }, { number: 2, name: 'Cathode', type: 'ground', description: 'Negative lead' }],
    ratings: { maxVoltage: 4.0, maxCurrent: 0.03, maxPower: 0.12, forwardVoltage: 3.2, reverseVoltage: 5 },
    operatingConditions: { voltage: { nominal: 3.2, min: 2.8, max: 4.0 }, current: { typical: 0.02, max: 0.03 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['White backlight', 'Flashlight', 'Night light'],
    tips: ['Highest forward voltage of visible LEDs', 'Use 100Ω resistor with 5V'],
    warnings: ['Very sensitive to overcurrent'],
  },
  RGB_LED: {
    type: 'RGB_LED', name: 'RGB LED (Common Cathode)', category: 'Output', package: '5mm 4-pin',
    description: 'Tri-color LED with separate R, G, B channels. Common cathode.',
    pinout: [
      { number: 1, name: 'Red', type: 'output', description: 'Red anode' },
      { number: 2, name: 'GND', type: 'ground', description: 'Common cathode' },
      { number: 3, name: 'Green', type: 'output', description: 'Green anode' },
      { number: 4, name: 'Blue', type: 'output', description: 'Blue anode' },
    ],
    ratings: { maxVoltage: 3.0, maxCurrent: 0.06, maxPower: 0.2, forwardVoltage: 2.0 },
    operatingConditions: { voltage: { nominal: 2.0, min: 1.5, max: 3.0 }, current: { typical: 0.02, max: 0.03 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['RGB color mixing', 'Mood lighting', 'Status indicator'],
    tips: ['Use PWM on each channel for color mixing', 'Common cathode = GND on pin 2', 'Each channel needs its own resistor'],
    warnings: ['Each color channel is independent', 'Total current = R + G + B currents'],
  },
  LED_INFRARED: {
    type: 'LED_INFRARED', name: 'IR LED (940nm)', category: 'Output', package: '5mm',
    description: 'Infrared LED for remote control and sensing. Invisible to human eye.',
    pinout: [{ number: 1, name: 'Anode', type: 'power', description: 'Positive lead' }, { number: 2, name: 'Cathode', type: 'ground', description: 'Negative lead' }],
    ratings: { maxVoltage: 1.6, maxCurrent: 0.05, maxPower: 0.1, forwardVoltage: 1.3 },
    operatingConditions: { voltage: { nominal: 1.3, min: 1.0, max: 1.6 }, current: { typical: 0.02, max: 0.05 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['IR remote control', 'Object detection', 'Line follower'],
    tips: ['Use with IR receiver for remote control', 'Higher current = longer range', '940nm is standard for remotes'],
    warnings: ['Invisible to human eye - do not stare directly', 'Can interfere with TV remotes'],
  },

  // === RESISTOR ===
  RESISTOR: {
    type: 'RESISTOR', name: 'Axial Resistor', category: 'Passive', package: 'Axial (1/4W)',
    description: 'Carbon film resistor with color band coding. 5% tolerance.',
    pinout: [
      { number: 1, name: 'Lead 1', type: 'bidirectional', description: 'Either lead (non-polarized)' },
      { number: 2, name: 'Lead 2', type: 'bidirectional', description: 'Either lead (non-polarized)' },
    ],
    ratings: { maxVoltage: 250, maxPower: 0.25, resistance: 1000, tolerance: '5%' },
    operatingConditions: { voltage: { nominal: 0, min: 0, max: 250 }, current: { typical: 0.001, max: 0.05 }, temperature: { min: -55, max: 155 } },
    typicalCircuits: ['Current limiting for LEDs', 'Voltage divider', 'Pull-up/pull-down'],
    tips: ['Color bands indicate value: Brown-Black-Red = 1kΩ', '1/4W rating means max 0.25W dissipation', 'Use Ohm\'s Law: R = V/I'],
    warnings: ['Exceeding power rating will burn the resistor', 'Value tolerance is ±5%'],
  },

  // === CAPACITORS ===
  CAPACITOR_ELEC: {
    type: 'CAPACITOR_ELEC', name: 'Electrolytic Capacitor', category: 'Passive', package: 'Radial',
    description: 'Polarized aluminum electrolytic capacitor. High capacitance, moderate ESR.',
    pinout: [
      { number: 1, name: 'Anode (+)', type: 'power', description: 'Positive lead (longer)' },
      { number: 2, name: 'Cathode (-)', type: 'ground', description: 'Negative lead (shorter, marked stripe)' },
    ],
    ratings: { maxVoltage: 25, capacitance: 0.0001, resistance: 0.1 },
    operatingConditions: { voltage: { nominal: 16, min: 0, max: 25 }, current: { typical: 0.1, max: 1.0 }, temperature: { min: -25, max: 85 } },
    typicalCircuits: ['Power supply filtering', 'Bulk decoupling', 'Energy storage'],
    tips: ['Polarized - observe + and - markings', '100µF for power filtering, 1000µF for bulk', 'ESR matters for high-frequency applications'],
    warnings: ['REVERSE POLARITY = EXPLOSION! Always check polarity', 'Voltage rating must exceed circuit voltage', 'Temperature reduces lifespan'],
  },
  CAPACITOR_CERAMIC: {
    type: 'CAPACITOR_CERAMIC', name: 'Ceramic Capacitor', category: 'Passive', package: 'Disc/SMD',
    description: 'Non-polarized ceramic capacitor. Low ESR, good for high frequency.',
    pinout: [
      { number: 1, name: 'Lead 1', type: 'bidirectional', description: 'Either lead (non-polarized)' },
      { number: 2, name: 'Lead 2', type: 'bidirectional', description: 'Either lead (non-polarized)' },
    ],
    ratings: { maxVoltage: 50, capacitance: 0.0000001, resistance: 0.05 },
    operatingConditions: { voltage: { nominal: 25, min: 0, max: 50 }, current: { typical: 0.01, max: 0.1 }, temperature: { min: -55, max: 125 } },
    typicalCircuits: ['Decoupling near ICs', 'High-frequency filtering', 'Timing circuits'],
    tips: ['100nF (0.1µF) is the most common value', 'Place close to IC power pins', 'Non-polarized - orientation doesn\'t matter'],
    warnings: ['Capacitance changes with voltage (DC bias effect)', 'Not suitable for bulk energy storage'],
  },
  CAPACITOR_TANTALUM: {
    type: 'CAPACITOR_TANTALUM', name: 'Tantalum Capacitor', category: 'Passive', package: 'SMD/Radial',
    description: 'Polarized tantalum capacitor. Better stability than electrolytic.',
    pinout: [
      { number: 1, name: 'Anode (+)', type: 'power', description: 'Positive lead (marked side)' },
      { number: 2, name: 'Cathode (-)', type: 'ground', description: 'Negative lead' },
    ],
    ratings: { maxVoltage: 16, capacitance: 0.00001, resistance: 0.08 },
    operatingConditions: { voltage: { nominal: 10, min: 0, max: 16 }, current: { typical: 0.05, max: 0.5 }, temperature: { min: -55, max: 125 } },
    typicalCircuits: ['Precision filtering', 'Audio circuits', 'Low-ESR applications'],
    tips: ['More expensive than electrolytic but better performance', 'Good for audio and precision circuits'],
    warnings: ['Polarized - observe polarity markings', 'Can fail violently if reverse-biased'],
  },

  // === DIODES ===
  DIODE: {
    type: 'DIODE', name: '1N4001 Rectifier Diode', category: 'Passive', package: 'DO-41 (Axial)',
    description: 'Standard silicon rectifier diode. 1A, 50V.',
    pinout: [
      { number: 1, name: 'Anode', type: 'input', description: 'Anode (no marking)' },
      { number: 2, name: 'Cathode', type: 'output', description: 'Cathode (silver band)' },
    ],
    ratings: { maxVoltage: 50, maxCurrent: 1.0, forwardVoltage: 0.7, reverseVoltage: 50, maxPower: 3 },
    operatingConditions: { voltage: { nominal: 0, min: 0, max: 50 }, current: { typical: 0.5, max: 1.0 }, temperature: { min: -65, max: 175 } },
    typicalCircuits: ['Half-wave rectifier', 'Full-wave rectifier', 'Flyback protection'],
    tips: ['Silver band = cathode', '0.7V forward voltage drop', 'Used for rectification and protection'],
    warnings: ['Max 1A forward current', '50V max reverse voltage (1N4001)'],
  },
  DIODE_SCHOTTKY: {
    type: 'DIODE_SCHOTTKY', name: '1N5819 Schottky Diode', category: 'Passive', package: 'DO-41 (Axial)',
    description: 'Schottky barrier diode. Fast switching, low voltage drop.',
    pinout: [
      { number: 1, name: 'Anode', type: 'input', description: 'Anode' },
      { number: 2, name: 'Cathode', type: 'output', description: 'Cathode (band)' },
    ],
    ratings: { maxVoltage: 40, maxCurrent: 1.0, forwardVoltage: 0.3, reverseVoltage: 40, maxPower: 3 },
    operatingConditions: { voltage: { nominal: 0, min: 0, max: 40 }, current: { typical: 0.5, max: 1.0 }, temperature: { min: -65, max: 125 } },
    typicalCircuits: ['Flyback protection', 'Solar panel protection', 'Fast switching'],
    tips: ['Only 0.3V drop (vs 0.7V for silicon)', 'Much faster reverse recovery', 'Ideal for power supply protection'],
    warnings: ['Higher reverse leakage current than standard diodes', '40V max reverse voltage'],
  },
  DIODE_ZENER: {
    type: 'DIODE_ZENER', name: 'Zener Diode (5.1V)', category: 'Passive', package: 'DO-41 (Axial)',
    description: 'Zener diode for voltage regulation. Conducts in reverse at breakdown voltage.',
    pinout: [
      { number: 1, name: 'Anode', type: 'input', description: 'Anode' },
      { number: 2, name: 'Cathode', type: 'output', description: 'Cathode (band side = positive in zener mode)' },
    ],
    ratings: { maxVoltage: 5.1, maxCurrent: 0.5, forwardVoltage: 0.7, maxPower: 0.5 },
    operatingConditions: { voltage: { nominal: 5.1, min: 0, max: 10 }, current: { typical: 0.01, max: 0.5 }, temperature: { min: -65, max: 175 } },
    typicalCircuits: ['Voltage regulation', 'Overvoltage protection', 'Reference voltage'],
    tips: ['Conducts in REVERSE at breakdown voltage', 'Use series resistor to limit current', '5.1V zener maintains ~5.1V across it'],
    warnings: ['Must have series resistor to limit current', 'Exceeding power rating will destroy the zener'],
  },

  // === TRANSISTORS ===
  TRANSISTOR_NPN: {
    type: 'TRANSISTOR_NPN', name: '2N2222A NPN Transistor', category: 'Active', package: 'TO-92',
    description: 'General-purpose NPN bipolar junction transistor. 600mA, 40V.',
    pinout: [
      { number: 1, name: 'Emitter', type: 'ground', description: 'Emitter (E) - connected to ground' },
      { number: 2, name: 'Base', type: 'input', description: 'Base (B) - control input' },
      { number: 3, name: 'Collector', type: 'output', description: 'Collector (C) - output/load' },
    ],
    ratings: { maxVoltage: 40, maxCurrent: 0.6, maxPower: 0.5, gain: 200 },
    operatingConditions: { voltage: { nominal: 5, min: 0.6, max: 40 }, current: { typical: 0.1, max: 0.6 }, temperature: { min: -55, max: 150 } },
    typicalCircuits: ['Switching circuit', 'Motor driver', 'Signal amplifier'],
    tips: ['Base current controls collector current: Ic = β × Ib', 'β (hFE) typically 100-300', 'Use 1kΩ base resistor for switching'],
    warnings: ['Exceeding 600mA collector current damages the transistor', 'Base-emitter voltage ~0.7V', 'Needs base resistor to limit base current'],
  },
  TRANSISTOR_PNP: {
    type: 'TRANSISTOR_PNP', name: '2N2907A PNP Transistor', category: 'Active', package: 'TO-92',
    description: 'General-purpose PNP bipolar junction transistor. Opposite of NPN.',
    pinout: [
      { number: 1, name: 'Emitter', type: 'power', description: 'Emitter (E) - connected to VCC' },
      { number: 2, name: 'Base', type: 'input', description: 'Base (B) - control input (active LOW)' },
      { number: 3, name: 'Collector', type: 'output', description: 'Collector (C) - output/load' },
    ],
    ratings: { maxVoltage: 40, maxCurrent: 0.6, maxPower: 0.5, gain: 200 },
    operatingConditions: { voltage: { nominal: 5, min: 0.6, max: 40 }, current: { typical: 0.1, max: 0.6 }, temperature: { min: -55, max: 150 } },
    typicalCircuits: ['High-side switching', 'Current source', 'Level shifter'],
    tips: ['Base LOW = current flows (opposite of NPN)', 'Use for high-side switching', 'Same gain as NPN counterpart'],
    warnings: ['Same current limits as NPN', 'Polarity is reversed from NPN'],
  },
  MOSFET_N: {
    type: 'MOSFET_N', name: 'IRF520N N-Channel MOSFET', category: 'Active', package: 'TO-220',
    description: 'N-channel power MOSFET. High current, low on-resistance.',
    pinout: [
      { number: 1, name: 'Gate', type: 'input', description: 'Gate (G) - control voltage' },
      { number: 2, name: 'Drain', type: 'output', description: 'Drain (D) - load connection' },
      { number: 3, name: 'Source', type: 'ground', description: 'Source (S) - ground' },
    ],
    ratings: { maxVoltage: 100, maxCurrent: 9.2, maxPower: 65, resistance: 0.1 },
    operatingConditions: { voltage: { nominal: 5, min: 2, max: 100 }, current: { typical: 1, max: 9.2 }, temperature: { min: -55, max: 175 } },
    typicalCircuits: ['High-current switching', 'Motor driver', 'Power supply switching'],
    tips: ['Gate threshold ~2V', 'Very low on-resistance (0.1Ω)', 'Can switch 9A continuous'],
    warnings: ['Gate is voltage-controlled, not current-controlled', 'ESD sensitive - handle carefully', 'Heat sink needed for high currents'],
  },
  MOSFET_P: {
    type: 'MOSFET_P', name: 'P-Channel MOSFET', category: 'Active', package: 'TO-220',
    description: 'P-channel power MOSFET for high-side switching.',
    pinout: [
      { number: 1, name: 'Gate', type: 'input', description: 'Gate (G) - active LOW' },
      { number: 2, name: 'Source', type: 'power', description: 'Source (S) - VCC connection' },
      { number: 3, name: 'Drain', type: 'output', description: 'Drain (D) - load connection' },
    ],
    ratings: { maxVoltage: -100, maxCurrent: -9.2, maxPower: 65, resistance: 0.1 },
    operatingConditions: { voltage: { nominal: -5, min: -100, max: 0 }, current: { typical: -1, max: -9.2 }, temperature: { min: -55, max: 175 } },
    typicalCircuits: ['High-side switching', 'Battery protection', 'Load disconnect'],
    tips: ['Gate LOW = ON (opposite of N-channel)', 'Used for high-side switching', 'Same package as N-channel counterpart'],
    warnings: ['Negative voltage/current ratings', 'Gate must be below source voltage to turn ON'],
  },

  // === VOLTAGE REGULATORS ===
  VREG_7805: {
    type: 'VREG_7805', name: 'LM7805 Voltage Regulator', category: 'Power', package: 'TO-220',
    description: 'Fixed 5V linear voltage regulator. 1A output, 2V dropout.',
    pinout: [
      { number: 1, name: 'Input', type: 'power', description: 'Input voltage (7-35V)' },
      { number: 2, name: 'Ground', type: 'ground', description: 'Ground reference' },
      { number: 3, name: 'Output', type: 'output', description: 'Regulated 5V output' },
    ],
    ratings: { maxVoltage: 35, minVoltage: 7, maxCurrent: 1.0, maxPower: 15 },
    operatingConditions: { voltage: { nominal: 9, min: 7, max: 35 }, current: { typical: 0.5, max: 1.0 }, temperature: { min: 0, max: 125 } },
    typicalCircuits: ['Arduino power supply', '5V regulated supply', 'USB power source'],
    tips: ['Input must be at least 2V above output (7V minimum)', 'Needs 0.33µF input and 0.1µF output capacitors', 'Max 1A output current'],
    warnings: ['Exceeding 1A output or 35V input will damage it', 'Dissipates heat: P = (Vin - Vout) × I', 'Use heat sink for high currents'],
  },
  VREG_317: {
    type: 'VREG_317', name: 'LM317 Adjustable Regulator', category: 'Power', package: 'TO-220',
    description: 'Adjustable linear regulator. 1.25V to 37V output.',
    pinout: [
      { number: 1, name: 'Adjust', type: 'input', description: 'Adjustment pin (voltage divider)' },
      { number: 2, name: 'Output', type: 'output', description: 'Regulated output voltage' },
      { number: 3, name: 'Input', type: 'power', description: 'Input voltage (3-40V)' },
    ],
    ratings: { maxVoltage: 40, minVoltage: 3, maxCurrent: 1.5, maxPower: 20 },
    operatingConditions: { voltage: { nominal: 12, min: 3, max: 40 }, current: { typical: 0.5, max: 1.5 }, temperature: { min: 0, max: 125 } },
    typicalCircuits: ['Adjustable power supply', 'Battery charger', 'Current source'],
    tips: ['Output = 1.25V × (1 + R2/R1)', 'Minimum 5mA load current', 'Very versatile regulator'],
    warnings: ['Needs minimum load current (5mA)', 'R1 typically 240Ω, R2 sets output voltage'],
  },
  VREG_LDO: {
    type: 'VREG_LDO', name: 'AMS1117-3.3 LDO Regulator', category: 'Power', package: 'SOT-223',
    description: 'Low dropout 3.3V regulator. Only 1.1V dropout.',
    pinout: [
      { number: 1, name: 'Ground/Adjust', type: 'ground', description: 'Ground or adjustment pin' },
      { number: 2, name: 'Output', type: 'output', description: '3.3V regulated output' },
      { number: 3, name: 'Input', type: 'power', description: 'Input voltage (4.4-12V)' },
    ],
    ratings: { maxVoltage: 12, minVoltage: 4.4, maxCurrent: 0.8, maxPower: 5 },
    operatingConditions: { voltage: { nominal: 5, min: 4.4, max: 12 }, current: { typical: 0.3, max: 0.8 }, temperature: { min: -40, max: 125 } },
    typicalCircuits: ['3.3V from 5V USB', 'ESP32 power supply', 'Low-power circuits'],
    tips: ['Only 1.1V dropout (vs 2V for 7805)', 'Perfect for 5V to 3.3V conversion', 'Needs output capacitor for stability'],
    warnings: ['Max 800mA output', 'Needs heat sink above 500mA', 'Output capacitor required for stability'],
  },

  // === OP-AMPS ===
  OPAMP_358: {
    type: 'OPAMP_358', name: 'LM358 Dual Op-Amp', category: 'Active', package: 'DIP-8',
    description: 'Dual operational amplifier. Low cost, single supply operation.',
    pinout: [
      { number: 1, name: 'Output A', type: 'output', description: 'Output of first op-amp' },
      { number: 2, name: 'Input A-', type: 'input', description: 'Inverting input A' },
      { number: 3, name: 'Input A+', type: 'input', description: 'Non-inverting input A' },
      { number: 4, name: 'GND', type: 'ground', description: 'Ground / V-' },
      { number: 5, name: 'Input B+', type: 'input', description: 'Non-inverting input B' },
      { number: 6, name: 'Input B-', type: 'input', description: 'Inverting input B' },
      { number: 7, name: 'Output B', type: 'output', description: 'Output of second op-amp' },
      { number: 8, name: 'VCC', type: 'power', description: 'Supply voltage (3-32V)' },
    ],
    ratings: { maxVoltage: 32, maxCurrent: 0.04, gain: 100000 },
    operatingConditions: { voltage: { nominal: 5, min: 3, max: 32 }, current: { typical: 0.0007, max: 0.04 }, temperature: { min: 0, max: 70 } },
    typicalCircuits: ['Signal amplifier', 'Comparator', 'Active filter', 'Voltage follower'],
    tips: ['Gain = 1 + (Rf/Rin) for non-inverting', 'Single supply: VCC to pin 8, GND to pin 4', 'Output can\'t swing to rails (not rail-to-rail)'],
    warnings: ['Output voltage range: GND+1.5V to VCC-1.5V', 'Max 40mA output current', 'Input voltage must not exceed supply rails'],
  },
  OPAMP_072: {
    type: 'OPAMP_072', name: 'TL072 JFET Op-Amp', category: 'Active', package: 'DIP-8',
    description: 'Low-noise JFET input dual op-amp. High input impedance.',
    pinout: [
      { number: 1, name: 'Output A', type: 'output', description: 'Output of first op-amp' },
      { number: 2, name: 'Input A-', type: 'input', description: 'Inverting input A' },
      { number: 3, name: 'Input A+', type: 'input', description: 'Non-inverting input A' },
      { number: 4, name: 'V-', type: 'ground', description: 'Negative supply' },
      { number: 5, name: 'Input B+', type: 'input', description: 'Non-inverting input B' },
      { number: 6, name: 'Input B-', type: 'input', description: 'Inverting input B' },
      { number: 7, name: 'Output B', type: 'output', description: 'Output of second op-amp' },
      { number: 8, name: 'V+', type: 'power', description: 'Positive supply (5-36V)' },
    ],
    ratings: { maxVoltage: 36, maxCurrent: 0.04, gain: 200000 },
    operatingConditions: { voltage: { nominal: 12, min: 5, max: 36 }, current: { typical: 0.0014, max: 0.04 }, temperature: { min: 0, max: 70 } },
    typicalCircuits: ['Audio preamplifier', 'Active filter', 'Precision measurement', 'Impedance buffer'],
    tips: ['Very high input impedance (10^12 Ω)', 'Low noise for audio applications', 'Needs dual supply for best performance'],
    warnings: ['Not rail-to-rail output', 'ESD sensitive', 'Input voltage must not exceed supply rails'],
  },

  // === 555 TIMER ===
  '555_TIMER': {
    type: '555_TIMER', name: 'NE555 Timer IC', category: 'Logic', package: 'DIP-8',
    description: 'Versatile timer IC. Astable, monostable, and bistable modes.',
    pinout: [
      { number: 1, name: 'GND', type: 'ground', description: 'Ground' },
      { number: 2, name: 'Trigger', type: 'input', description: 'Trigger input (active LOW)' },
      { number: 3, name: 'Output', type: 'output', description: 'Output (HIGH or LOW)' },
      { number: 4, name: 'Reset', type: 'input', description: 'Reset (active LOW, tie to VCC)' },
      { number: 5, name: 'Control', type: 'analog', description: 'Control voltage (bypass with 10nF)' },
      { number: 6, name: 'Threshold', type: 'input', description: 'Threshold input' },
      { number: 7, name: 'Discharge', type: 'output', description: 'Discharge pin' },
      { number: 8, name: 'VCC', type: 'power', description: 'Supply voltage (4.5-16V)' },
    ],
    ratings: { maxVoltage: 16, minVoltage: 4.5, maxCurrent: 0.2, maxPower: 0.5 },
    operatingConditions: { voltage: { nominal: 5, min: 4.5, max: 16 }, current: { typical: 0.01, max: 0.2 }, temperature: { min: -55, max: 125 } },
    typicalCircuits: ['Astable oscillator', 'Monostable one-shot', 'PWM generator', 'LED flasher'],
    tips: ['Astable: f = 1.44 / ((R1 + 2×R2) × C)', 'Monostable: t = 1.1 × R × C', 'Very versatile - one of the most popular ICs'],
    warnings: ['Max supply voltage 16V', 'Output current max 200mA', 'Reset pin must be tied HIGH for normal operation'],
  },

  // === DISPLAYS ===
  LCD: {
    type: 'LCD', name: 'HD44780 16×2 LCD', category: 'Display', package: '16-pin header',
    description: '16 character × 2 line character LCD with HD44780 controller.',
    pinout: [
      { number: 1, name: 'VSS', type: 'ground', description: 'Ground' },
      { number: 2, name: 'VDD', type: 'power', description: 'Power supply (5V)' },
      { number: 3, name: 'V0', type: 'analog', description: 'Contrast adjustment' },
      { number: 4, name: 'RS', type: 'input', description: 'Register Select (0=command, 1=data)' },
      { number: 5, name: 'RW', type: 'input', description: 'Read/Write (0=write, 1=read)' },
      { number: 6, name: 'E', type: 'input', description: 'Enable pulse' },
      { number: 7, name: 'D0', type: 'bidirectional', description: 'Data bit 0' },
      { number: 8, name: 'D1', type: 'bidirectional', description: 'Data bit 1' },
      { number: 9, name: 'D2', type: 'bidirectional', description: 'Data bit 2' },
      { number: 10, name: 'D3', type: 'bidirectional', description: 'Data bit 3' },
      { number: 11, name: 'D4', type: 'bidirectional', description: 'Data bit 4' },
      { number: 12, name: 'D5', type: 'bidirectional', description: 'Data bit 5' },
      { number: 13, name: 'D6', type: 'bidirectional', description: 'Data bit 6' },
      { number: 14, name: 'D7', type: 'bidirectional', description: 'Data bit 7' },
      { number: 15, name: 'A', type: 'power', description: 'Backlight anode (+)' },
      { number: 16, name: 'K', type: 'ground', description: 'Backlight cathode (-)' },
    ],
    ratings: { maxVoltage: 5.5, minVoltage: 4.5, maxPower: 1 },
    operatingConditions: { voltage: { nominal: 5, min: 4.5, max: 5.5 }, current: { typical: 0.002, max: 0.004 }, temperature: { min: -20, max: 70 } },
    typicalCircuits: ['Arduino text display', 'Sensor readout', 'Menu system'],
    tips: ['Use I2C backpack to reduce wiring from 16 to 4 pins', 'Contrast adjustment via potentiometer on V0', 'Initialize with specific command sequence'],
    warnings: ['5V only - not 3.3V compatible without level shifter', 'Backlight draws ~20mA', 'I2C address typically 0x27'],
  },
  OLED: {
    type: 'OLED', name: 'SSD1306 128×64 OLED', category: 'Display', package: 'I2C/SPI module',
    description: '128×64 monochrome OLED display with SSD1306 controller.',
    pinout: [
      { number: 1, name: 'GND', type: 'ground', description: 'Ground' },
      { number: 2, name: 'VCC', type: 'power', description: 'Power (3.3V or 5V)' },
      { number: 3, name: 'SCL', type: 'comm', description: 'I2C clock' },
      { number: 4, name: 'SDA', type: 'comm', description: 'I2C data' },
    ],
    ratings: { maxVoltage: 5.5, minVoltage: 1.65, maxPower: 0.02 },
    operatingConditions: { voltage: { nominal: 3.3, min: 1.65, max: 5.5 }, current: { typical: 0.01, max: 0.02 }, temperature: { min: -40, max: 70 } },
    typicalCircuits: ['Arduino graphics display', 'Sensor dashboard', 'Game display'],
    tips: ['I2C address 0x3C or 0x3D', 'Uses only 2 wires (SCL/SDA)', 'Self-emissive - no backlight needed'],
    warnings: ['I2C address may vary', 'Needs pull-up resistors on I2C bus', 'Max 400kHz I2C speed'],
  },

  // === MOTORS ===
  MOTOR_DC: {
    type: 'MOTOR_DC', name: 'RF-300 DC Motor', category: 'Output', package: '30mm round',
    description: 'Small DC motor for hobby projects. 3-6V, 150mA.',
    pinout: [
      { number: 1, name: 'Positive', type: 'power', description: 'Positive terminal' },
      { number: 2, name: 'Negative', type: 'ground', description: 'Negative terminal' },
    ],
    ratings: { maxVoltage: 6, minVoltage: 3, maxCurrent: 0.2, maxPower: 1.2 },
    operatingConditions: { voltage: { nominal: 5, min: 3, max: 6 }, current: { typical: 0.15, max: 0.2 }, temperature: { min: -10, max: 60 } },
    typicalCircuits: ['Robot wheels', 'Fan drive', 'Conveyor belt'],
    tips: ['Reverse polarity to reverse direction', 'Use PWM for speed control', 'Add flyback diode for protection'],
    warnings: ['Exceeding 6V will damage motor', 'Stalled motor draws high current', 'Always use flyback diode with inductive loads'],
  },
  SERVO: {
    type: 'SERVO', name: 'SG90 Micro Servo', category: 'Output', package: '22.2×11.8×22.7mm',
    description: '9g micro servo with 180° rotation. PWM controlled.',
    pinout: [
      { number: 1, name: 'GND', type: 'ground', description: 'Ground (brown wire)' },
      { number: 2, name: 'VCC', type: 'power', description: 'Power (4.8-6V, red wire)' },
      { number: 3, name: 'Signal', type: 'pwm', description: 'PWM signal (orange wire)' },
    ],
    ratings: { maxVoltage: 6, minVoltage: 4.8, maxCurrent: 0.5, maxPower: 3 },
    operatingConditions: { voltage: { nominal: 5, min: 4.8, max: 6 }, current: { typical: 0.15, max: 0.5 }, temperature: { min: -30, max: 60 } },
    typicalCircuits: ['Robot arm', 'Pan/tilt mechanism', 'Lock mechanism'],
    tips: ['PWM: 1ms = 0°, 1.5ms = 90°, 2ms = 180°', '50Hz frequency (20ms period)', 'Stall current is high - avoid holding position under load'],
    warnings: ['Never connect directly to 5V without current limiting', 'Stall current can reach 500mA', 'Gears can strip under excessive load'],
  },
  FAN: {
    type: 'FAN', name: '40mm DC Fan', category: 'Output', package: '40×40×10mm',
    description: 'Small cooling fan. 5V or 12V operation.',
    pinout: [
      { number: 1, name: 'VCC', type: 'power', description: 'Positive (red wire)' },
      { number: 2, name: 'GND', type: 'ground', description: 'Ground (black wire)' },
    ],
    ratings: { maxVoltage: 12, minVoltage: 3, maxCurrent: 0.1, maxPower: 1.2 },
    operatingConditions: { voltage: { nominal: 5, min: 3, max: 12 }, current: { typical: 0.08, max: 0.1 }, temperature: { min: -20, max: 70 } },
    typicalCircuits: ['CPU cooling', 'Enclosure ventilation', 'Radiator fan'],
    tips: ['PWM speed control on signal wire (3-wire version)', 'Higher voltage = faster spin', 'Add flyback diode'],
    warnings: ['Inrush current on startup', 'Stalled fan draws less current but generates heat'],
  },

  // === POWER ===
  BATTERY_9V: {
    type: 'BATTERY_9V', name: '9V Alkaline Battery', category: 'Power', package: 'PP3 snap',
    description: 'Standard 9V alkaline battery. ~500mAh capacity.',
    pinout: [
      { number: 1, name: 'Positive', type: 'power', description: 'Positive terminal (smaller snap)' },
      { number: 2, name: 'Negative', type: 'ground', description: 'Negative terminal (larger snap)' },
    ],
    ratings: { maxVoltage: 9.6, minVoltage: 6, maxCurrent: 0.5, maxPower: 4.5 },
    operatingConditions: { voltage: { nominal: 9, min: 6, max: 9.6 }, current: { typical: 0.05, max: 0.5 }, temperature: { min: -18, max: 55 } },
    typicalCircuits: ['Arduino power', 'Portable projects', 'Alarm systems'],
    tips: ['Fresh battery: 9.5V, dead: ~6V', 'Capacity ~500mAh at 100mA drain', 'Good for low-current projects'],
    warnings: ['Do not recharge (alkaline)', 'Current limit ~500mA', 'Voltage drops under load'],
  },
  BATTERY_AA: {
    type: 'BATTERY_AA', name: 'AA Alkaline Battery', category: 'Power', package: 'AA cylinder',
    description: 'Standard 1.5V AA alkaline battery. ~2500mAh capacity.',
    pinout: [
      { number: 1, name: 'Positive', type: 'power', description: 'Positive terminal (nub end)' },
      { number: 2, name: 'Negative', type: 'ground', description: 'Negative terminal (flat end)' },
    ],
    ratings: { maxVoltage: 1.6, minVoltage: 0.9, maxCurrent: 2.0, maxPower: 3 },
    operatingConditions: { voltage: { nominal: 1.5, min: 0.9, max: 1.6 }, current: { typical: 0.5, max: 2.0 }, temperature: { min: -18, max: 55 } },
    typicalCircuits: ['Low-voltage projects', 'Battery packs (series)', 'Remote controls'],
    tips: ['Connect in series for higher voltage (2×AA = 3V)', 'Capacity ~2500mAh', 'Rechargeable NiMH: 1.2V per cell'],
    warnings: ['Do not recharge alkaline batteries', 'Mixing old and new batteries is bad', 'Polarity matters!'],
  },
  SOLAR: {
    type: 'SOLAR', name: '5V Solar Panel', category: 'Power', package: '60×60mm panel',
    description: 'Small polycrystalline solar panel. 5V, 1W output.',
    pinout: [
      { number: 1, name: 'Positive', type: 'power', description: 'Positive output' },
      { number: 2, name: 'Negative', type: 'ground', description: 'Negative output' },
    ],
    ratings: { maxVoltage: 6, minVoltage: 0, maxCurrent: 0.2, maxPower: 1 },
    operatingConditions: { voltage: { nominal: 5, min: 0, max: 6 }, current: { typical: 0.1, max: 0.2 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['Battery charger', 'Solar-powered project', 'Outdoor sensor'],
    tips: ['Output depends on sunlight intensity', 'Use with charge controller for batteries', 'Open circuit voltage ~6V'],
    warnings: ['Output varies with light conditions', 'Connect to charge controller, not directly to battery', 'Not waterproof unless specified'],
  },

  // === COMMUNICATION ===
  WIFI: {
    type: 'WIFI', name: 'ESP8266 WiFi Module', category: 'Communication', package: 'ESP-01 module',
    description: 'WiFi module with TCP/IP stack. AT command interface.',
    pinout: [
      { number: 1, name: 'GND', type: 'ground', description: 'Ground' },
      { number: 2, name: 'GPIO2', type: 'bidirectional', description: 'General purpose I/O' },
      { number: 3, name: 'GPIO0', type: 'bidirectional', description: 'General purpose I/O (boot mode)' },
      { number: 4, name: 'RXD', type: 'input', description: 'UART receive' },
      { number: 5, name: 'TXD', type: 'output', description: 'UART transmit' },
      { number: 6, name: 'CH_PD', type: 'power', description: 'Chip enable (tie HIGH)' },
      { number: 7, name: 'RST', type: 'input', description: 'Reset (active LOW)' },
      { number: 8, name: 'VCC', type: 'power', description: 'Power (3.3V only!)' },
    ],
    ratings: { maxVoltage: 3.6, minVoltage: 3.0, maxCurrent: 0.3, maxPower: 1 },
    operatingConditions: { voltage: { nominal: 3.3, min: 3.0, max: 3.6 }, current: { typical: 0.08, max: 0.3 }, temperature: { min: -40, max: 85 } },
    typicalCircuits: ['IoT sensor', 'Web-controlled device', 'MQTT client'],
    tips: ['3.3V ONLY - will burn with 5V!', 'AT commands for configuration', 'TX/RX cross with Arduino (TX→RX, RX→TX)'],
    warnings: ['3.3V logic - needs level shifter with 5V Arduino', 'Peak current 300mA during WiFi transmit', 'Boot mode: GPIO0 LOW = programming, HIGH = normal'],
  },
  BLUETOOTH: {
    type: 'BLUETOOTH', name: 'HC-05 Bluetooth Module', category: 'Communication', package: '25×15mm module',
    description: 'Bluetooth 2.0+EDR module. SPP serial port profile.',
    pinout: [
      { number: 1, name: 'VCC', type: 'power', description: 'Power (3.3-6V)' },
      { number: 2, name: 'GND', type: 'ground', description: 'Ground' },
      { number: 3, name: 'TXD', type: 'output', description: 'UART transmit' },
      { number: 4, name: 'RXD', type: 'input', description: 'UART receive' },
    ],
    ratings: { maxVoltage: 6, minVoltage: 3.3, maxCurrent: 0.04, maxPower: 0.2 },
    operatingConditions: { voltage: { nominal: 5, min: 3.3, max: 6 }, current: { typical: 0.03, max: 0.04 }, temperature: { min: -20, max: 70 } },
    typicalCircuits: ['Bluetooth data link', 'Wireless sensor', 'Robot control'],
    tips: ['Default baud rate: 9600', 'AT commands for configuration', 'HC-05 = master/slave, HC-06 = slave only'],
    warnings: ['RXD pin needs voltage divider (5V→3.3V)', 'Pairing code: 1234 or 0000', 'Max range ~10m'],
  },
};

// === DATASHEET FUNCTIONS ===

export function getDatasheet(type: string): ComponentDatasheet | null {
  return COMPONENT_DATASHEETS[type] || null;
}

export function getDatasheetSummary(type: string): string {
  const ds = COMPONENT_DATASHEETS[type];
  if (!ds) return 'No datasheet available';
  return `${ds.name} (${ds.package}) - ${ds.description}`;
}

export function getPinout(type: string): PinInfo[] {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.pinout || [];
}

export function getRatings(type: string): ComponentRatings | null {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.ratings || null;
}

export function getWarnings(type: string): string[] {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.warnings || [];
}

export function getTips(type: string): string[] {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.tips || [];
}

export function validateComponentRating(
  type: string,
  voltage: number,
  current: number
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const ds = COMPONENT_DATASHEETS[type];

  if (!ds) return { valid: true, warnings: [] };

  if (voltage > (ds.ratings.maxVoltage || Infinity)) {
    warnings.push(`Voltage ${voltage}V exceeds max rating ${ds.ratings.maxVoltage}V`);
  }

  if (current > (ds.ratings.maxCurrent || Infinity)) {
    warnings.push(`Current ${current}A exceeds max rating ${ds.ratings.maxCurrent}A`);
  }

  if (voltage > (ds.ratings.maxVoltage || Infinity) || current > (ds.ratings.maxCurrent || Infinity)) {
    warnings.push(`Component may be DAMAGED! Reduce voltage/current immediately.`);
  }

  return { valid: warnings.length === 0, warnings };
}

// === NEW DATASHEET FUNCTIONS ===

export function getElectricalCharacteristics(type: string): ElectricalCharacteristic[] {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.electricalCharacteristics || [];
}

export function getApplicationNotes(type: string): ApplicationNote[] {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.applicationNotes || [];
}

export function getSimilarComponents(type: string): SimilarComponent[] {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.similarComponents || [];
}

export function getPinMappingDiagram(type: string): PinMappingDiagram | null {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.pinMappingDiagram || null;
}

export function getMaximumRatings(type: string): MaximumRatings | null {
  const ds = COMPONENT_DATASHEETS[type];
  return ds?.maximumRatings || null;
}

export function getPinMappingText(type: string): string {
  const diagram = getPinMappingDiagram(type);
  if (!diagram) return 'No pin mapping available';
  
  let text = `${diagram.package} (${diagram.pinCount} pins)\n`;
  text += `Orientation: ${diagram.orientationMark}\n\n`;
  
  diagram.pinLayout.forEach(pin => {
    text += `Pin ${pin.position} (${pin.side}): ${pin.name} - ${pin.type}`;
    if (pin.voltageLevel) text += ` [${pin.voltageLevel}]`;
    text += `\n  ${pin.description}\n`;
  });
  
  return text;
}

export function getElectricalCharacteristicsTable(type: string): string {
  const chars = getElectricalCharacteristics(type);
  if (chars.length === 0) return 'No electrical characteristics available';
  
  let table = 'Parameter | Symbol | Test Condition | Min | Typ | Max | Unit\n';
  table += '-'.repeat(80) + '\n';
  
  chars.forEach(char => {
    table += `${char.parameter} | ${char.symbol} | ${char.testCondition} | ${char.min} | ${char.typical} | ${char.max} | ${char.unit}\n`;
  });
  
  return table;
}

export function checkRating(type: string, parameter: string, value: number): { safe: boolean; message: string } {
  const ratings = getMaximumRatings(type);
  if (!ratings) return { safe: true, message: 'No ratings data available' };
  
  const rating = ratings.absoluteMaxRatings.find(r => r.parameter === parameter);
  if (!rating) return { safe: true, message: 'Parameter not found in ratings' };
  
  if (value > rating.value) {
    return {
      safe: false,
      message: `WARNING: ${parameter} = ${value}${rating.unit} exceeds max rating of ${rating.value}${rating.unit}. ${rating.note || ''}`,
    };
  }
  
  return { safe: true, message: `${parameter} = ${value}${rating.unit} is within safe limits` };
}
