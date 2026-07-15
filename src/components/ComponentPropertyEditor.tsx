import React, { useState } from 'react';
import { CircuitComponent, ComponentType } from '../types';
import { getComponentProperties, getDefaultProperties, formatValue } from '../services/circuitSimulator';
import ComponentThumbnail from './ComponentThumbnail';
import { X, Settings, Zap, ChevronDown, ChevronRight, Info } from 'lucide-react';

interface ComponentPropertyEditorProps {
  component: CircuitComponent | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<CircuitComponent>) => void;
  onDelete: (id: string) => void;
}

const COMPONENT_PROPERTY_SCHEMAS: Record<string, { key: string; label: string; unit: string; min: number; max: number; step: number }[]> = {
  RESISTOR: [
    { key: 'resistance', label: 'Resistance', unit: 'Ω', min: 1, max: 10000000, step: 100 },
  ],
  CAPACITOR_ELEC: [
    { key: 'capacitance', label: 'Capacitance', unit: 'F', min: 0.000001, max: 0.01, step: 0.000001 },
  ],
  CAPACITOR_CERAMIC: [
    { key: 'capacitance', label: 'Capacitance', unit: 'F', min: 0.000000001, max: 0.00001, step: 0.000000001 },
  ],
  CAPACITOR_TANTALUM: [
    { key: 'capacitance', label: 'Capacitance', unit: 'F', min: 0.0000001, max: 0.001, step: 0.0000001 },
  ],
  TRANSISTOR_NPN: [
    { key: 'gain', label: 'Current Gain (hFE)', unit: '', min: 10, max: 1000, step: 10 },
  ],
  TRANSISTOR_PNP: [
    { key: 'gain', label: 'Current Gain (hFE)', unit: '', min: 10, max: 1000, step: 10 },
  ],
  MOSFET_N: [
    { key: 'gain', label: 'Transconductance', unit: '', min: 100, max: 10000, step: 100 },
  ],
  MOSFET_P: [
    { key: 'gain', label: 'Transconductance', unit: '', min: 100, max: 10000, step: 100 },
  ],
  DIODE: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 0.5, max: 1.5, step: 0.1 },
  ],
  DIODE_SCHOTTKY: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 0.1, max: 0.5, step: 0.05 },
  ],
  DIODE_ZENER: [
    { key: 'voltage', label: 'Zener Voltage', unit: 'V', min: 2.0, max: 24.0, step: 0.1 },
  ],
  VREG_7805: [
    { key: 'voltage', label: 'Output Voltage', unit: 'V', min: 3.0, max: 12.0, step: 0.5 },
  ],
  VREG_317: [
    { key: 'voltage', label: 'Output Voltage', unit: 'V', min: 1.25, max: 37.0, step: 0.25 },
  ],
  VREG_LDO: [
    { key: 'voltage', label: 'Output Voltage', unit: 'V', min: 1.8, max: 5.0, step: 0.1 },
  ],
  OPAMP_358: [
    { key: 'gain', label: 'Open-Loop Gain', unit: '', min: 1000, max: 200000, step: 1000 },
  ],
  OPAMP_072: [
    { key: 'gain', label: 'Open-Loop Gain', unit: '', min: 1000, max: 500000, step: 1000 },
  ],
  LED_RED: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  LED_BLUE: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  LED_GREEN: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  LED_YELLOW: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  LED_ORANGE: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  LED_WHITE: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  RGB_LED: [
    { key: 'forwardVoltage', label: 'Forward Voltage', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  BULB: [
    { key: 'forwardVoltage', label: 'Rated Voltage', unit: 'V', min: 1.0, max: 12.0, step: 0.5 },
  ],
  BUZZER: [
    { key: 'forwardVoltage', label: 'Rated Voltage', unit: 'V', min: 1.5, max: 12.0, step: 0.5 },
  ],
  MOTOR_DC: [
    { key: 'forwardVoltage', label: 'Rated Voltage', unit: 'V', min: 1.0, max: 12.0, step: 0.5 },
    { key: 'resistance', label: 'Internal Resistance', unit: 'Ω', min: 1, max: 1000, step: 1 },
  ],
  SERVO: [
    { key: 'forwardVoltage', label: 'Rated Voltage', unit: 'V', min: 3.0, max: 6.0, step: 0.5 },
  ],
  FAN: [
    { key: 'forwardVoltage', label: 'Rated Voltage', unit: 'V', min: 3.0, max: 12.0, step: 0.5 },
  ],
  BATTERY_9V: [
    { key: 'voltage', label: 'Voltage', unit: 'V', min: 1.0, max: 24.0, step: 0.5 },
  ],
  BATTERY_AA: [
    { key: 'voltage', label: 'Voltage', unit: 'V', min: 0.5, max: 3.0, step: 0.1 },
  ],
  SOLAR: [
    { key: 'voltage', label: 'Output Voltage', unit: 'V', min: 1.0, max: 12.0, step: 0.5 },
  ],
  LOGIC_AND: [
    { key: 'threshold', label: 'Logic Threshold', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
  LOGIC_OR: [
    { key: 'threshold', label: 'Logic Threshold', unit: 'V', min: 1.0, max: 5.0, step: 0.1 },
  ],
};

const COMPONENT_TIPS: Record<string, string> = {
  RESISTOR: 'Resistors limit current flow. Use Ohm\'s Law: I = V/R. A 220Ω resistor with a 5V source limits current to ~23mA.',
  LED_RED: 'Red LEDs need ~1.8V and ~20mA. Always use a resistor in series!',
  LED_BLUE: 'Blue LEDs need ~3.0V and ~20mA. They have a higher forward voltage than red.',
  LED_GREEN: 'Green LEDs need ~2.2V and ~20mA. Popular for status indicators.',
  BULB: 'Incandescent bulbs are resistive loads. They glow when current flows through them.',
  MOTOR_DC: 'DC motors spin when current flows. Higher voltage = faster spin. Add a flyback diode!',
  SERVO: 'Servos need PWM signals to position. Connect to a PWM-capable pin.',
  BATTERY_9V: 'Standard 9V battery provides constant voltage. Connect + to power, - to ground.',
  BATTERY_AA: 'AA batteries provide 1.5V each. Connect in series for higher voltage.',
  BUZZER: 'Piezo buzzers make sound when voltage is applied. Use PWM for different tones.',
  FAN: 'DC fans spin when voltage is applied. Higher voltage = faster spin.',
  CAPACITOR_ELEC: 'Electrolytic caps are POLARIZED! Long leg = positive. They smooth voltage ripple and store energy. 100µF is common for power supply filtering.',
  CAPACITOR_CERAMIC: 'Ceramic caps are non-polarized. 100nF is the most common value — place one near every IC\'s power pin for noise filtering.',
  CAPACITOR_TANTALUM: 'Tantalum caps are polarized and expensive. They offer better stability than electrolytics in a smaller package.',
  TRANSISTOR_NPN: 'NPN transistor (2N2222): Base controls Collector-Emitter flow. Apply voltage to base (through a resistor!) to switch a larger load. B=base, C=collector, E=emitter.',
  TRANSISTOR_PNP: 'PNP transistor (2N2907): Opposite of NPN. Base LOW = current flows. Great for high-side switching.',
  MOSFET_N: 'N-channel MOSFET (IRF520): Gate voltage controls drain-source flow. Very high input impedance — almost no current needed at gate!',
  MOSFET_P: 'P-channel MOSFET: Gate LOW = ON. Used for high-side switching in power circuits.',
  DIODE: 'Standard diode (1N4001): Allows current in ONE direction only (anode→cathode). 0.7V forward voltage drop. Used for rectification.',
  DIODE_SCHOTTKY: 'Schottky diode (1N5819): Faster switching, lower voltage drop (0.3V). Great for power supply protection.',
  DIODE_ZENER: 'Zener diode: Conducts in REVERSE at its rated voltage (5.1V). Used for voltage regulation and overvoltage protection.',
  VREG_7805: 'LM7805: Fixed 5V output. Input must be ≥7V (2V dropout). Max 1A. Add 0.33µF input and 0.1µF output capacitors!',
  VREG_317: 'LM317: Adjustable voltage via two resistors. Vout = 1.25V × (1 + R2/R1). Very versatile regulator.',
  VREG_LDO: 'LDO regulator: Low dropout — can regulate with input only slightly above output. 3.3V from 5V with ~0.3V drop.',
  OPAMP_358: 'LM358: Dual op-amp. Can amplify tiny signals (from sensors) to readable levels. Needs power supply (usually dual ±5V).',
  OPAMP_072: 'TL072: Low-noise JFET op-amp. Higher input impedance than LM358. Great for audio and precision measurement.',
  NEOPIXEL_RING: 'NeoPixel ring: 12 individually addressable RGB LEDs. Each LED can be a different color. Requires 5V data protocol.',
  TM1637: 'TM1637: 4-digit 7-segment display with colon. Simple 2-wire interface (CLK + DIO). Great for clocks and counters.',
  MAX7219: 'MAX7219: Drives an 8x8 LED matrix. SPI interface. Can cascade multiple modules for larger displays.',
  EINK: 'E-ink display: Ultra-low power — only uses energy when changing the image. Readable in direct sunlight like paper.',
  WIRE_SPOOL: 'Jumper wires connect components on a breadboard. Use different colors for power (red), ground (black), and signals.',
};

const ComponentPropertyEditor: React.FC<ComponentPropertyEditorProps> = ({
  component,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'info'>('properties');

  if (!component) return null;

  const defaultProps = getComponentProperties(component.type);
  const schema = COMPONENT_PROPERTY_SCHEMAS[component.type] || [];
  const tip = COMPONENT_TIPS[component.type];

  const getPropertyValue = (key: string): number => {
    return (component as any)[key] ?? (defaultProps as any)?.[key] ?? 0;
  };

  const handlePropertyChange = (key: string, value: number) => {
    onUpdate(component.id, { [key]: value } as any);
  };

  const handlePinChange = (newPin: number) => {
    onUpdate(component.id, { pin: newPin });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-y-auto overflow-x-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <ComponentThumbnail type={component.type} />
            <div>
              <h3 className="font-bold text-slate-800">{getComponentLabel(component.type)}</h3>
              <span className="text-xs font-mono text-emerald-600">{component.id}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'properties'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings size={14} className="inline mr-1" />
            Properties
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'info'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info size={14} className="inline mr-1" />
            Info
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'properties' && (
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Connected Pin
                </label>
                <select
                  value={component.pin}
                  onChange={(e) => handlePinChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  {Array.from({ length: 50 }, (_, i) => (
                    <option key={i} value={i}>PIN {i}</option>
                  ))}
                </select>
              </div>

              {schema.map(prop => {
                const currentValue = getPropertyValue(prop.key);
                return (
                  <div key={prop.key}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {prop.label}
                      </label>
                      <span className="text-xs font-mono text-emerald-600 font-bold">
                        {formatValue(currentValue, prop.unit)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={prop.min}
                      max={prop.max}
                      step={prop.step}
                      value={currentValue}
                      onChange={(e) => handlePropertyChange(prop.key, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                      <span>{formatValue(prop.min, prop.unit)}</span>
                      <span>{formatValue(prop.max, prop.unit)}</span>
                    </div>
                  </div>
                );
              })}

              {schema.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <Zap size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No adjustable properties for this component.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Electrical Properties</h4>
                <div className="grid grid-cols-2 gap-2">
                  {defaultProps.resistance !== undefined && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Resistance</span>
                      <span className="text-sm font-mono font-bold text-slate-700">
                        {formatValue(getPropertyValue('resistance') || defaultProps.resistance, 'Ω')}
                      </span>
                    </div>
                  )}
                  {defaultProps.forwardVoltage !== undefined && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Forward V</span>
                      <span className="text-sm font-mono font-bold text-slate-700">
                        {formatValue(defaultProps.forwardVoltage, 'V')}
                      </span>
                    </div>
                  )}
                  {defaultProps.voltage !== undefined && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Voltage</span>
                      <span className="text-sm font-mono font-bold text-slate-700">
                        {formatValue(defaultProps.voltage, 'V')}
                      </span>
                    </div>
                  )}
                  {defaultProps.forwardCurrent !== undefined && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Max Current</span>
                      <span className="text-sm font-mono font-bold text-slate-700">
                        {formatValue(defaultProps.forwardCurrent, 'A')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {tip && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <h4 className="text-xs font-bold text-amber-800 flex items-center gap-2 mb-2">
                    <Zap size={14} />
                    KidCode Tip!
                  </h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {tip}
                  </p>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Connections</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Pin</span>
                    <span className="font-mono font-bold text-indigo-600">{component.pin}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Position</span>
                    <span className="font-mono text-slate-600">{component.x}, {component.y}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Rotation</span>
                    <span className="font-mono text-slate-600">{component.rotation || 0}°</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => onDelete(component.id)}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

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

export default ComponentPropertyEditor;
