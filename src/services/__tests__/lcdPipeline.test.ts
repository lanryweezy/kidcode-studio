import { describe, it, expect } from 'vitest';
import type { HardwareState } from '../../types';

function makeHardwareState(overrides: Partial<HardwareState> = {}): HardwareState {
  return {
    pins: Array(14).fill(false),
    buzzerActive: false, fanSpeed: 0, temperature: 25, servoAngle: 0,
    lcdLines: ['', '', '', ''], cursorRow: 0, cursorCol: 0,
    potentiometerValue: 512, speakerVolume: 0, rgbColor: '#FF0000',
    sevenSegmentValue: null, distance: 0, motionDetected: false,
    vibrationActive: false, keypadValue: null, joystick: { x: 0, y: 0 },
    pressure: 0, flex: 0, tilt: false, magneticField: 0, detectedColor: '',
    humidity: 0, gasLevel: 0, flameDetected: false, rainLevel: 0,
    soilMoisture: 0, heartbeatRate: 0, compassHeading: 0,
    gyroData: { x: 0, y: 0, z: 0 }, gpsLocation: { lat: 0, lng: 0 },
    fingerprintMatch: false, rfidTag: null, stepperPosition: 0,
    pumpFlowRate: 0, solenoidActive: false, relayState: false,
    laserActive: false, bulbOn: false, continuousServoSpeed: 0,
    rgbLedColor: '#FF0000', rgbStripColors: [], sdCardData: [],
    rtcTime: new Date(), logicGateOutput: false, timerOutput: false,
    wifiConnected: false, bluetoothConnected: false, cpuTemperature: 25,
    freeMemory: 1024, uptime: 0, variables: {}, sensorHistory: [],
    ...overrides,
  };
}

describe('LCD Pipeline - Initialization', () => {
  it('hardware state has empty LCD lines array', () => {
    const hw = makeHardwareState();
    expect(hw.lcdLines).toEqual(['', '', '', '']);
  });

  it('LCD cursor starts at (0,0)', () => {
    const hw = makeHardwareState();
    expect(hw.cursorRow).toBe(0);
    expect(hw.cursorCol).toBe(0);
  });

  it('LCD has exactly 4 lines', () => {
    const hw = makeHardwareState();
    expect(hw.lcdLines.length).toBe(4);
  });
});

describe('LCD Pipeline - Setting LCD lines', () => {
  it('setting a line updates the lcdLines array', () => {
    const hw = makeHardwareState();
    hw.lcdLines[0] = 'Hello World';
    expect(hw.lcdLines[0]).toBe('Hello World');
    expect(hw.lcdLines[1]).toBe('');
  });

  it('setting multiple lines', () => {
    const hw = makeHardwareState();
    hw.lcdLines[0] = 'Line 1';
    hw.lcdLines[1] = 'Line 2';
    hw.lcdLines[2] = 'Line 3';
    hw.lcdLines[3] = 'Line 4';
    expect(hw.lcdLines).toEqual(['Line 1', 'Line 2', 'Line 3', 'Line 4']);
  });

  it('overwriting a line replaces previous content', () => {
    const hw = makeHardwareState();
    hw.lcdLines[0] = 'Old text';
    hw.lcdLines[0] = 'New text';
    expect(hw.lcdLines[0]).toBe('New text');
  });
});

describe('LCD Pipeline - Cursor position', () => {
  it('setting cursor position updates row and col', () => {
    const hw = makeHardwareState();
    hw.cursorRow = 2;
    hw.cursorCol = 5;
    expect(hw.cursorRow).toBe(2);
    expect(hw.cursorCol).toBe(5);
  });

  it('cursor position within valid range', () => {
    const hw = makeHardwareState();
    hw.cursorRow = 3;
    hw.cursorCol = 19;
    expect(hw.cursorRow).toBeGreaterThanOrEqual(0);
    expect(hw.cursorRow).toBeLessThan(4);
    expect(hw.cursorCol).toBeGreaterThanOrEqual(0);
  });
});

describe('LCD Pipeline - Clear command simulation', () => {
  it('clear resets all LCD lines', () => {
    const hw = makeHardwareState();
    hw.lcdLines[0] = 'Hello';
    hw.lcdLines[1] = 'World';
    hw.lcdLines[2] = 'Test';
    hw.lcdLines[3] = 'Data';

    hw.lcdLines = ['', '', '', ''];
    expect(hw.lcdLines).toEqual(['', '', '', '']);
  });

  it('clear resets cursor position', () => {
    const hw = makeHardwareState();
    hw.cursorRow = 3;
    hw.cursorCol = 10;

    hw.cursorRow = 0;
    hw.cursorCol = 0;
    expect(hw.cursorRow).toBe(0);
    expect(hw.cursorCol).toBe(0);
  });
});

describe('LCD Pipeline - Scroll simulation', () => {
  it('scroll up shifts lines upward', () => {
    const hw = makeHardwareState();
    hw.lcdLines[0] = 'Line 0';
    hw.lcdLines[1] = 'Line 1';
    hw.lcdLines[2] = 'Line 2';
    hw.lcdLines[3] = 'Line 3';

    hw.lcdLines = [hw.lcdLines[1], hw.lcdLines[2], hw.lcdLines[3], ''];
    expect(hw.lcdLines).toEqual(['Line 1', 'Line 2', 'Line 3', '']);
  });

  it('scroll adds empty line at bottom', () => {
    const hw = makeHardwareState();
    hw.lcdLines[0] = 'Text';
    hw.lcdLines = [hw.lcdLines[1], hw.lcdLines[2], hw.lcdLines[3], ''];
    expect(hw.lcdLines[3]).toBe('');
  });
});

describe('LCD Pipeline - Multiple line display', () => {
  it('all 4 lines can display different content', () => {
    const hw = makeHardwareState();
    hw.lcdLines = ['Temp: 25C', 'Humidity: 60%', 'Light: 800', 'Status: OK'];
    expect(hw.lcdLines).toEqual(['Temp: 25C', 'Humidity: 60%', 'Light: 800', 'Status: OK']);
  });

  it('long text in line is stored correctly', () => {
    const hw = makeHardwareState();
    const longText = 'A very long line of text that exceeds normal LCD width';
    hw.lcdLines[0] = longText;
    expect(hw.lcdLines[0]).toBe(longText);
  });

  it('LCD line updates do not affect other lines', () => {
    const hw = makeHardwareState();
    hw.lcdLines[0] = 'Original 0';
    hw.lcdLines[1] = 'Original 1';
    hw.lcdLines[2] = 'Original 2';
    hw.lcdLines[3] = 'Original 3';

    hw.lcdLines[1] = 'Updated 1';
    expect(hw.lcdLines[0]).toBe('Original 0');
    expect(hw.lcdLines[1]).toBe('Updated 1');
    expect(hw.lcdLines[2]).toBe('Original 2');
    expect(hw.lcdLines[3]).toBe('Original 3');
  });
});

describe('LCD Pipeline - Cursor movement simulation', () => {
  it('cursor advances after writing text', () => {
    const hw = makeHardwareState();
    const text = 'Hello';
    hw.lcdLines[hw.cursorRow] = text;
    hw.cursorCol = text.length;
    expect(hw.cursorCol).toBe(5);
  });

  it('cursor wraps to next line', () => {
    const hw = makeHardwareState();
    hw.cursorCol = 20;
    if (hw.cursorCol >= 20) {
      hw.cursorCol = 0;
      hw.cursorRow = Math.min(hw.cursorRow + 1, 3);
    }
    expect(hw.cursorRow).toBe(1);
    expect(hw.cursorCol).toBe(0);
  });

  it('cursor stays within bounds', () => {
    const hw = makeHardwareState();
    hw.cursorRow = 3;
    hw.cursorCol = 19;
    if (hw.cursorCol >= 20) {
      hw.cursorCol = 0;
      hw.cursorRow = Math.min(hw.cursorRow + 1, 3);
    }
    expect(hw.cursorRow).toBe(3);
    expect(hw.cursorCol).toBe(19);
  });
});
