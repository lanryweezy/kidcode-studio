// ============================================================
// LCD Simulation Engine v2.0 - Complete HD44780 + Graphical LCD
// Simulates REAL LCD behavior: 1602, 2004, 128x64, I2C backpack
// ============================================================

export interface LCDCustomChar {
  id: number;
  pattern: number[];
}

export interface LCDState {
  buffer: string[][];
  rows: number;
  cols: number;
  cursorRow: number;
  cursorCol: number;
  cursorVisible: boolean;
  cursorBlink: boolean;
  displayOn: boolean;
  backlightOn: boolean;
  autoScroll: boolean;
  entryMode: 'left' | 'right';
  displayShift: boolean;
  customChars: LCDCustomChar[];
  scrollOffset: number;
  ddramAddress: number;
  busy: boolean;
  i2cAddress: number;
  contrast: number;
  backlightBrightness: number;
  font: '5x8' | '5x10';
  interfaceMode: 4 | 8;
}

// === HD44780 CHARACTER TABLE (Japanese + European + Symbol) ===
export const HD44780_CHARSET: Record<number, string> = {
  0x00: '\u0000', 0x01: '\u0001', 0x02: '\u0002', 0x03: '\u0003',
  0x04: '\u0004', 0x05: '\u0005', 0x06: '\u0006', 0x07: '\u0007',
  0x08: '\u0008', 0x09: '\u0009', 0x0A: '\u000A', 0x0B: '\u000B',
  0x0C: '\u000C', 0x0D: '\u000D', 0x0E: '\u000E', 0x0F: '\u000F',
  0x10: '\u0010', 0x11: '\u0011', 0x12: '\u0012', 0x13: '\u0013',
  0x14: '\u0014', 0x15: '\u0015', 0x16: '\u0016', 0x17: '\u0017',
  0x18: '\u0018', 0x19: '\u0019', 0x1A: '\u001A', 0x1B: '\u001B',
  0x1C: '\u001C', 0x1D: '\u001D', 0x1E: '\u001E', 0x1F: '\u001F',
  0x20: ' ', 0x21: '!', 0x22: '"', 0x23: '#', 0x24: '$', 0x25: '%',
  0x26: '&', 0x27: "'", 0x28: '(', 0x29: ')', 0x2A: '*', 0x2B: '+',
  0x2C: ',', 0x2D: '-', 0x2E: '.', 0x2F: '/', 0x30: '0', 0x31: '1',
  0x32: '2', 0x33: '3', 0x34: '4', 0x35: '5', 0x36: '6', 0x37: '7',
  0x38: '8', 0x39: '9', 0x3A: ':', 0x3B: ';', 0x3C: '<', 0x3D: '=',
  0x3E: '>', 0x3F: '?', 0x40: '@', 0x41: 'A', 0x42: 'B', 0x43: 'C',
  0x44: 'D', 0x45: 'E', 0x46: 'F', 0x47: 'G', 0x48: 'H', 0x49: 'I',
  0x4A: 'J', 0x4B: 'K', 0x4C: 'L', 0x4D: 'M', 0x4E: 'N', 0x4F: 'O',
  0x50: 'P', 0x51: 'Q', 0x52: 'R', 0x53: 'S', 0x54: 'T', 0x55: 'U',
  0x56: 'V', 0x57: 'W', 0x58: 'X', 0x59: 'Y', 0x5A: 'Z', 0x5B: '[',
  0x5C: '\\', 0x5D: ']', 0x5E: '^', 0x5F: '_', 0x60: '`', 0x61: 'a',
  0x62: 'b', 0x63: 'c', 0x64: 'd', 0x65: 'e', 0x66: 'f', 0x67: 'g',
  0x68: 'h', 0x69: 'i', 0x6A: 'j', 0x6B: 'k', 0x6C: 'l', 0x6D: 'm',
  0x6E: 'n', 0x6F: 'o', 0x70: 'p', 0x71: 'q', 0x72: 'r', 0x73: 's',
  0x74: 't', 0x75: 'u', 0x76: 'v', 0x77: 'w', 0x78: 'x', 0x79: 'y',
  0x7A: 'z', 0x7B: '{', 0x7C: '|', 0x7D: '}', 0x7E: '~', 0x7F: '\u203F',
  // Japanese Katakana (HD44780 specific)
  0xA0: '�', 0xA1: '｡', 0xA2: '｢', 0xA3: '｣', 0xA4: '､', 0xA5: '･',
  0xA6: 'ｦ', 0xA7: 'ｧ', 0xA8: 'ｨ', 0xA9: 'ｩ', 0xAA: 'ｪ', 0xAB: 'ｫ',
  0xAC: 'ｬ', 0xAD: 'ｭ', 0xAE: 'ｮ', 0xAF: 'ｯ',
  0xB0: 'ｰ', 0xB1: 'ｱ', 0xB2: 'ｲ', 0xB3: 'ｳ', 0xB4: 'ｴ', 0xB5: 'ｵ',
  0xB6: 'ｶ', 0xB7: 'ｷ', 0xB8: 'ｸ', 0xB9: 'ｹ', 0xBA: 'ｺ', 0xBB: 'ｻ',
  0xBC: 'ｼ', 0xBD: 'ｽ', 0xBE: 'ｾ', 0xBF: 'ｿ',
  0xC0: 'ﾀ', 0xC1: 'ﾁ', 0xC2: 'ﾂ', 0xC3: 'ﾃ', 0xC4: 'ﾄ', 0xC5: 'ﾅ',
  0xC6: 'ﾆ', 0xC7: 'ﾇ', 0xC8: 'ﾈ', 0xC9: 'ﾉ', 0xCA: 'ﾊ', 0xCB: 'ﾋ',
  0xCC: 'ﾌ', 0xCD: 'ﾍ', 0xCE: 'ﾎ', 0xCF: 'ﾏ',
  0xD0: 'ﾐ', 0xD1: 'ﾑ', 0xD2: 'ﾒ', 0xD3: 'ﾓ', 0xD4: 'ﾔ', 0xD5: 'ﾕ',
  0xD6: 'ﾖ', 0xD7: 'ﾗ', 0xD8: 'ﾘ', 0xD9: 'ﾙ', 0xDA: 'ﾚ', 0xDB: 'ﾛ',
  0xDC: 'ﾜ', 0xDD: 'ﾝ', 0xDE: 'ﾞ', 0xDF: 'ﾟ',
  // European characters (some HD44780 variants)
  0x80: 'Ç', 0x81: 'ü', 0x82: 'é', 0x83: 'â', 0x84: 'ä', 0x85: 'à',
  0x86: 'å', 0x87: 'ç', 0x88: 'ê', 0x89: 'ë', 0x8A: 'è', 0x8B: 'ï',
  0x8C: 'î', 0x8D: 'ì', 0x8E: 'Ä', 0x8F: 'Å',
  0x90: 'É', 0x91: 'æ', 0x92: 'Æ', 0x93: 'ô', 0x94: 'ö', 0x95: 'ò',
  0x96: 'û', 0x97: 'ù', 0x98: 'ÿ', 0x99: 'Ö', 0x9A: 'Ü', 0x9B: '£',
  0x9C: '¥', 0x9D: '×', 0x9E: '÷', 0x9F: '°',
};

// === FACTORY ===
export function createLCDState(rows: number = 2, cols: number = 16): LCDState {
  const buffer: string[][] = [];
  for (let r = 0; r < rows; r++) buffer.push(new Array(cols).fill(' '));
  return {
    buffer, rows, cols,
    cursorRow: 0, cursorCol: 0,
    cursorVisible: true, cursorBlink: false,
    displayOn: true, backlightOn: true,
    autoScroll: false, entryMode: 'right', displayShift: false,
    customChars: Array.from({ length: 8 }, (_, i) => ({ id: i, pattern: new Array(8).fill(0) })),
    scrollOffset: 0, ddramAddress: 0, busy: false,
    i2cAddress: 0x27, contrast: 255, backlightBrightness: 100,
    font: '5x8', interfaceMode: 4,
  };
}

// === HD44780 COMMAND SET ===
export function lcdClear(s: LCDState): LCDState {
  const ns = { ...s, buffer: s.buffer.map(r => new Array(s.cols).fill(' ') as string[]) };
  ns.cursorRow = 0; ns.cursorCol = 0; ns.ddramAddress = 0; ns.scrollOffset = 0;
  return ns;
}

export function lcdHome(s: LCDState): LCDState {
  return { ...s, cursorRow: 0, cursorCol: 0, ddramAddress: 0, scrollOffset: 0 };
}

export function lcdSetCursor(s: LCDState, row: number, col: number): LCDState {
  return { ...s, cursorRow: Math.max(0, Math.min(s.rows - 1, row)), cursorCol: Math.max(0, Math.min(s.cols - 1, col)) };
}

export function lcdDisplayControl(s: LCDState, display: boolean, cursor: boolean, blink: boolean): LCDState {
  return { ...s, displayOn: display, cursorVisible: cursor, cursorBlink: blink };
}

export function lcdDisplayOn(s: LCDState): LCDState { return { ...s, displayOn: true }; }
export function lcdDisplayOff(s: LCDState): LCDState { return { ...s, displayOn: false }; }
export function lcdCursorOn(s: LCDState): LCDState { return { ...s, cursorVisible: true, cursorBlink: false }; }
export function lcdCursorOff(s: LCDState): LCDState { return { ...s, cursorVisible: false, cursorBlink: false }; }
export function lcdCursorBlink(s: LCDState): LCDState { return { ...s, cursorVisible: true, cursorBlink: true }; }

export function lcdBacklightOn(s: LCDState): LCDState { return { ...s, backlightOn: true }; }
export function lcdBacklightOff(s: LCDState): LCDState { return { ...s, backlightOn: false }; }
export function lcdSetBacklight(s: LCDState, brightness: number): LCDState { return { ...s, backlightBrightness: Math.max(0, Math.min(100, brightness)) }; }

export function lcdSetContrast(s: LCDState, contrast: number): LCDState { return { ...s, contrast: Math.max(0, Math.min(255, contrast)) }; }

export function lcdGetContrast(s: LCDState): number { return s.contrast; }

export function lcdGetBacklightBrightness(s: LCDState): number { return s.backlightBrightness; }

export function lcdScrollLeft(s: LCDState): LCDState { return { ...s, scrollOffset: Math.max(0, s.scrollOffset - 1) }; }
export function lcdScrollRight(s: LCDState): LCDState { return { ...s, scrollOffset: s.scrollOffset + 1 }; }
export function lcdAutoScrollOn(s: LCDState): LCDState { return { ...s, autoScroll: true }; }
export function lcdAutoScrollOff(s: LCDState): LCDState { return { ...s, autoScroll: false }; }
export function lcdLeftToRight(s: LCDState): LCDState { return { ...s, entryMode: 'right' }; }
export function lcdRightToLeft(s: LCDState): LCDState { return { ...s, entryMode: 'left' }; }

// === TEXT OUTPUT ===
export function lcdPrint(s: LCDState, text: string): LCDState {
  const ns = { ...s, buffer: s.buffer.map(r => [...r]) };
  let { cursorRow, cursorCol } = ns;
  for (const ch of text) {
    if (ch === '\n') { cursorRow = Math.min(cursorRow + 1, ns.rows - 1); cursorCol = 0; continue; }
    if (ch === '\r') { cursorCol = 0; continue; }
    if (ch === '\t') { cursorCol = Math.min(cursorCol + 4, ns.cols - 1); continue; }
    if (cursorCol >= 0 && cursorCol < ns.cols && cursorRow >= 0 && cursorRow < ns.rows) {
      ns.buffer[cursorRow][cursorCol] = ch;
    }
    cursorCol += ns.entryMode === 'right' ? 1 : -1;
    if (cursorCol >= ns.cols) { cursorCol = 0; cursorRow = Math.min(cursorRow + 1, ns.rows - 1); }
    else if (cursorCol < 0) { cursorCol = ns.cols - 1; cursorRow = Math.max(cursorRow - 1, 0); }
  }
  ns.cursorRow = cursorRow; ns.cursorCol = cursorCol;
  ns.ddramAddress = cursorRow * ns.cols + cursorCol;
  return ns;
}

export function lcdPrintAt(s: LCDState, row: number, col: number, text: string): LCDState {
  return lcdPrint(lcdSetCursor(s, row, col), text);
}

export function lcdPrintNumber(s: LCDState, value: number, decimals: number = 0): LCDState {
  return lcdPrint(s, decimals > 0 ? value.toFixed(decimals) : String(Math.round(value)));
}

export function lcdPrintFloat(s: LCDState, value: number, decimals: number = 2): LCDState {
  return lcdPrint(s, value.toFixed(decimals));
}

export function lcdPrintHex(s: LCDState, value: number, digits: number = 2): LCDState {
  return lcdPrint(s, `0x${  value.toString(16).toUpperCase().padStart(digits, '0')}`);
}

export function lcdPrintBinary(s: LCDState, value: number, digits: number = 8): LCDState {
  return lcdPrint(s, value.toString(2).padStart(digits, '0'));
}

// === CUSTOM CHARACTERS ===
export function lcdCreateChar(s: LCDState, id: number, pattern: number[]): LCDState {
  if (id < 0 || id > 7 || pattern.length !== 8) return s;
  const nc = [...s.customChars]; nc[id] = { id, pattern: pattern.map(p => p & 0x1F) };
  return { ...s, customChars: nc };
}

export function lcdWriteCustomChar(s: LCDState, id: number): LCDState {
  return lcdPrint(s, String.fromCharCode(id));
}

// === FORMATTING ===
export function lcdGetDisplayText(s: LCDState): string[] {
  return s.buffer.map(r => r.join(''));
}

export function lcdGetCursorPos(s: LCDState): { row: number; col: number } {
  return { row: s.cursorRow, col: s.cursorCol };
}

// === PRESET CUSTOM CHARS ===
export const LCD_CHARS: Record<string, number[]> = {
  speaker: [0b00100,0b00110,0b01110,0b11111,0b11111,0b01110,0b00110,0b00100],
  heart: [0b00000,0b01010,0b11111,0b11111,0b11111,0b01110,0b00100,0b00000],
  note: [0b00011,0b00011,0b00010,0b00010,0b01100,0b11100,0b11000,0b00000],
  check: [0b00000,0b00001,0b00010,0b10100,0b01000,0b00000,0b00000,0b00000],
  cross: [0b00000,0b10001,0b01010,0b00100,0b01010,0b10001,0b00000,0b00000],
  arrow_up: [0b00100,0b01110,0b10101,0b00100,0b00100,0b00100,0b00100,0b00000],
  arrow_down: [0b00100,0b00100,0b00100,0b00100,0b10101,0b01110,0b00100,0b00000],
  arrow_left: [0b00010,0b00110,0b01110,0b11110,0b01110,0b00110,0b00010,0b00000],
  arrow_right: [0b01000,0b01100,0b01110,0b01111,0b01110,0b01100,0b01000,0b00000],
  sun: [0b00100,0b10101,0b01110,0b11111,0b01110,0b10101,0b00100,0b00000],
  moon: [0b00111,0b01100,0b10100,0b10100,0b10100,0b01100,0b00111,0b00000],
  drop: [0b00100,0b00100,0b01010,0b01010,0b10001,0b10001,0b10001,0b01110],
  wifi: [0b11111,0b00000,0b01110,0b00000,0b00100,0b00000,0b00000,0b00000],
  battery: [0b01110,0b11111,0b11111,0b11111,0b11111,0b11111,0b11111,0b11111],
  battery_empty: [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b11111],
  thermometer: [0b00100,0b01010,0b01010,0b01010,0b01110,0b11111,0b11111,0b01110],
  degree: [0b01100,0b10010,0b10010,0b01100,0b00000,0b00000,0b00000,0b00000],
  smily: [0b00000,0b01010,0b01010,0b00000,0b10001,0b01110,0b00000,0b00000],
  sad: [0b00000,0b01010,0b01010,0b00000,0b01110,0b10001,0b00000,0b00000],
  skull: [0b01110,0b10001,0b11011,0b11111,0b01110,0b00100,0b01010,0b01010],
  alien: [0b01110,0b10001,0b11111,0b11011,0b11111,0b01010,0b10101,0b10001],
  robot: [0b01010,0b10101,0b01110,0b10001,0b01110,0b01010,0b01110,0b00000],
  infinity: [0b00000,0b00000,0b01110,0b10001,0b01110,0b10001,0b01110,0b00000],
  pi: [0b00000,0b00000,0b11111,0b00100,0b00100,0b00100,0b00100,0b00000],
  omega: [0b00000,0b00000,0b01110,0b10001,0b10001,0b01010,0b11011,0b00000],
  sigma: [0b00000,0b11111,0b00100,0b00100,0b00100,0b00100,0b11111,0b00000],
  delta: [0b00000,0b00100,0b00100,0b01010,0b01010,0b10001,0b11111,0b00000],
  mu: [0b00000,0b00000,0b10001,0b10001,0b11111,0b10001,0b10001,0b00000],
  phi: [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b01110,0b00100],
  theta: [0b01110,0b10001,0b10101,0b11111,0b10101,0b10001,0b01110,0b00000],
  lambda: [0b00000,0b00100,0b00100,0b01010,0b01010,0b10001,0b10001,0b00000],
  full_block: [0b11111,0b11111,0b11111,0b11111,0b11111,0b11111,0b11111,0b11111],
  half_block: [0b00000,0b00000,0b00000,0b11111,0b11111,0b11111,0b11111,0b11111],
  left_half: [0b11000,0b11000,0b11000,0b11000,0b11000,0b11000,0b11000,0b11000],
  right_half: [0b00011,0b00011,0b00011,0b00011,0b00011,0b00011,0b00011,0b00011],
  top_half: [0b11111,0b11111,0b11111,0b11111,0b00000,0b00000,0b00000,0b00000],
  bottom_half: [0b00000,0b00000,0b00000,0b00000,0b11111,0b11111,0b11111,0b11111],
  diamond: [0b00100,0b01110,0b11111,0b11111,0b11111,0b01110,0b00100,0b00000],
  club: [0b00100,0b01110,0b00100,0b10101,0b01110,0b00100,0b01110,0b00000],
  spade: [0b00100,0b01110,0b11111,0b11111,0b00100,0b01110,0b10001,0b00000],
  heart_s: [0b00000,0b01010,0b11111,0b11111,0b11111,0b01110,0b00100,0b00000],
  flag: [0b10000,0b10000,0b10100,0b10110,0b10100,0b10000,0b10000,0b11111],
  music_note: [0b00011,0b00011,0b00010,0b00010,0b01100,0b11100,0b11000,0b00000],
  double_note: [0b00110,0b00110,0b00100,0b00100,0b01100,0b01100,0b11100,0b00000],
  copyright: [0b01110,0b10001,0b10110,0b10100,0b10110,0b10001,0b01110,0b00000],
  registered: [0b01110,0b10001,0b10110,0b10000,0b10101,0b10010,0b01101,0b00000],
  trademark: [0b10010,0b11110,0b10010,0b00000,0b00000,0b00000,0b00000,0b00000],
  yen: [0b10101,0b01010,0b11111,0b01010,0b11111,0b01010,0b10101,0b00000],
  euro: [0b00000,0b00000,0b01110,0b10000,0b11110,0b10000,0b01110,0b00000],
  pound: [0b00110,0b01001,0b01000,0b11110,0b01000,0b01000,0b11111,0b00000],
  dollar: [0b00100,0b01111,0b10100,0b01110,0b00101,0b11110,0b00100,0b00000],
  cent: [0b00000,0b00000,0b00110,0b10100,0b10100,0b10100,0b01110,0b00000],
  at_sign: [0b01110,0b10001,0b10111,0b10101,0b10110,0b10000,0b01110,0b00000],
};

// === PROGRESS BAR ===
export function lcdProgressBar(s: LCDState, row: number, percent: number, width: number = 16): LCDState {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return lcdPrintAt(s, row, 0, '\u2588'.repeat(filled) + '\u2591'.repeat(empty));
}

// === MARQUEE ===
export function lcdMarquee(s: LCDState, text: string, row: number, offset: number): LCDState {
  const padded = `${text  }   ${  text}`;
  const start = offset % (text.length + 3);
  return lcdPrintAt(s, row, 0, padded.substring(start, start + s.cols));
}

// === SCROLLING TEXT MODE ===
export function lcdScrollText(s: LCDState, text: string, row: number, offset: number): LCDState {
  const ns = { ...s, buffer: s.buffer.map(r => [...r]) };
  if (row < 0 || row >= ns.rows) return ns;
  for (let col = 0; col < ns.cols; col++) {
    const textIdx = col + offset;
    if (textIdx >= 0 && textIdx < text.length) {
      ns.buffer[row][col] = text[textIdx];
    } else {
      ns.buffer[row][col] = ' ';
    }
  }
  return ns;
}

export function lcdShiftDisplayLeft(s: LCDState): LCDState {
  const ns = { ...s, buffer: s.buffer.map(r => [...r]) };
  for (let r = 0; r < ns.rows; r++) {
    for (let c = 0; c < ns.cols - 1; c++) {
      ns.buffer[r][c] = ns.buffer[r][c + 1];
    }
    ns.buffer[r][ns.cols - 1] = ' ';
  }
  return ns;
}

export function lcdShiftDisplayRight(s: LCDState): LCDState {
  const ns = { ...s, buffer: s.buffer.map(r => [...r]) };
  for (let r = 0; r < ns.rows; r++) {
    for (let c = ns.cols - 1; c > 0; c--) {
      ns.buffer[r][c] = ns.buffer[r][c - 1];
    }
    ns.buffer[r][0] = ' ';
  }
  return ns;
}

// === BLINK CURSOR WITH STATE ===
export function lcdBlinkStep(s: LCDState, visible: boolean): LCDState {
  return { ...s, cursorVisible: s.cursorBlink ? visible : s.cursorVisible };
}

// === BOX DRAWING ===
export function lcdBox(s: LCDState, row: number, text: string): LCDState {
  const inner = text.padEnd(s.cols - 2).substring(0, s.cols - 2);
  let ns = lcdPrintAt(s, row, 0, `\u2554${  '\u2550'.repeat(s.cols - 2)  }\u2557`);
  ns = lcdPrintAt(ns, row + 1, 0, `\u2551${  inner  }\u2551`);
  if (row + 2 < s.rows) ns = lcdPrintAt(ns, row + 2, 0, `\u255A${  '\u2550'.repeat(s.cols - 2)  }\u255D`);
  return ns;
}

// === UTILITY ===
export function lcdFormatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function lcdFormatTemp(c: number, showUnit: boolean = true): string {
  return c.toFixed(1) + (showUnit ? '\u00B0C' : '');
}

export function lcdFormatVoltage(v: number): string { return `${v.toFixed(2)  }V`; }
export function lcdFormatPercent(p: number): string { return `${Math.round(p)  }%`; }
export function lcdCenter(text: string, width: number): string {
  const p = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(p) + text;
}
export function lcdRightAlign(text: string, width: number): string {
  return ' '.repeat(Math.max(0, width - text.length)) + text;
}

// === LCD TYPE PRESETS ===
export const LCD_TYPES = {
  '1602': { rows: 2, cols: 16, label: '16×2 Character LCD' },
  '2004': { rows: 4, cols: 20, label: '20×4 Character LCD' },
  '12864': { rows: 8, cols: 21, label: '128×64 Graphical LCD' },
  'NOKIA5110': { rows: 6, cols: 14, label: 'Nokia 5110 (84×48)' },
} as const;
