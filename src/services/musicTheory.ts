// Music Theory Utilities — Scales, Chords, Key Detection, Transposition, Rhythms

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export type ScaleType = 'major' | 'minor' | 'pentatonic' | 'blues' | 'chromatic';

export type ChordType = 'major' | 'minor' | 'diminished' | 'augmented' | '7th';

export type TimeSignature = '4/4' | '3/4' | '6/8';

// ─── Note Helpers ───

export function noteToMidi(note: NoteName, octave: number): number {
  return NOTE_NAMES.indexOf(note) + (octave + 1) * 12;
}

export function midiToNote(midi: number): { note: NoteName; octave: number } {
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { note, octave };
}

export function noteToFrequency(note: NoteName, octave: number): number {
  const midi = noteToMidi(note, octave);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToNote(freq: number): { note: NoteName; octave: number } {
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  return midiToNote(midi);
}

// ─── Scale Generation ───

const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

export function generateScale(root: NoteName, type: ScaleType, octave: number = 4): number[] {
  const rootMidi = noteToMidi(root, octave);
  return SCALE_INTERVALS[type].map(interval => rootMidi + interval);
}

export function scaleToMidi(scale: number[]): number[] {
  return [...scale];
}

export function scaleToFrequencies(scale: number[]): number[] {
  return scale.map(midi => 440 * Math.pow(2, (midi - 69) / 12));
}

export function scaleToNoteNames(scale: number[]): string[] {
  return scale.map(midi => {
    const { note, octave } = midiToNote(midi);
    return `${note}${octave}`;
  });
}

// ─── Chord Generation ───

const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  '7th': [0, 4, 7, 10],
};

export function generateChord(root: NoteName, type: ChordType, octave: number = 4): number[] {
  const rootMidi = noteToMidi(root, octave);
  return CHORD_INTERVALS[type].map(interval => rootMidi + interval);
}

export function chordToNoteNames(chord: number[]): string[] {
  return chord.map(midi => {
    const { note, octave } = midiToNote(midi);
    return `${note}${octave}`;
  });
}

export function chordToMidi(chord: number[]): number[] {
  return [...chord];
}

// ─── Key Detection ───

// Relative major/minor key profiles (intervals)
const KEY_PROFILES: Record<string, number[]> = {
  'C major': [0, 2, 4, 5, 7, 9, 11],
  'A minor': [0, 2, 3, 5, 7, 8, 10],
  'G major': [0, 2, 4, 5, 7, 9, 11],
  'E minor': [0, 2, 3, 5, 7, 8, 10],
  'D major': [0, 2, 4, 5, 7, 9, 11],
  'B minor': [0, 2, 3, 5, 7, 8, 10],
  'A major': [0, 2, 4, 5, 7, 9, 11],
  'F# minor': [0, 2, 3, 5, 7, 8, 10],
  'F major': [0, 2, 4, 5, 7, 9, 11],
  'D minor': [0, 2, 3, 5, 7, 8, 10],
  'Bb major': [0, 2, 4, 5, 7, 9, 11],
  'G minor': [0, 2, 3, 5, 7, 8, 10],
  'Eb major': [0, 2, 4, 5, 7, 9, 11],
  'C minor': [0, 2, 3, 5, 7, 8, 10],
  'Ab major': [0, 2, 4, 5, 7, 9, 11],
  'F minor': [0, 2, 3, 5, 7, 8, 10],
  'Db major': [0, 2, 4, 5, 7, 9, 11],
  'Bb minor': [0, 2, 3, 5, 7, 8, 10],
  'Gb major': [0, 2, 4, 5, 7, 9, 11],
  'Eb minor': [0, 2, 3, 5, 7, 8, 10],
  'B major': [0, 2, 4, 5, 7, 9, 11],
  'G# minor': [0, 2, 3, 5, 7, 8, 10],
  'E major': [0, 2, 4, 5, 7, 9, 11],
  'C# minor': [0, 2, 3, 5, 7, 8, 10],
};

function getNoteClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

function scoreKey(notes: number[], intervals: number[]): number {
  const noteClasses = new Set(notes.map(getNoteClass));
  let matches = 0;
  for (const interval of intervals) {
    if (noteClasses.has(interval)) matches++;
  }
  return matches / intervals.length;
}

export function detectKey(notes: number[]): { key: string; confidence: number } {
  if (notes.length === 0) return { key: 'C major', confidence: 0 };

  let bestKey = 'C major';
  let bestScore = 0;

  for (const [key, intervals] of Object.entries(KEY_PROFILES)) {
    const score = scoreKey(notes, intervals);
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  return { key: bestKey, confidence: bestScore };
}

// ─── Transposition ───

export function transpose(notes: number[], semitones: number): number[] {
  return notes.map(n => n + semitones);
}

export function transposeToKey(notes: number[], fromKey: string, toKey: string): number[] {
  const fromRoot = fromKey.replace(/ (major|minor|pentatonic|blues|chromatic)/i, '').trim();
  const toRoot = toKey.replace(/ (major|minor|pentatonic|blues|chromatic)/i, '').trim();

  const fromIndex = NOTE_NAMES.indexOf(fromRoot as NoteName);
  const toIndex = NOTE_NAMES.indexOf(toRoot as NoteName);

  if (fromIndex === -1 || toIndex === -1) return notes;

  const semitones = ((toIndex - fromIndex) % 12 + 12) % 12;
  return transpose(notes, semitones);
}

// ─── Rhythm Patterns ───

export interface RhythmPattern {
  name: string;
  timeSignature: TimeSignature;
  beats: number[];
  swing: number;
}

const RHYTHM_PATTERNS: Record<string, RhythmPattern> = {
  'straight-4/4': { name: 'Straight 4/4', timeSignature: '4/4', beats: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], swing: 0 },
  'waltz-3/4': { name: 'Waltz 3/4', timeSignature: '3/4', beats: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], swing: 0 },
  'compound-6/8': { name: 'Compound 6/8', timeSignature: '6/8', beats: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], swing: 0 },
  'swing-4/4': { name: 'Swing 4/4', timeSignature: '4/4', beats: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], swing: 0.33 },
  'rock-4/4': { name: 'Rock 4/4', timeSignature: '4/4', beats: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], swing: 0 },
  'latin-4/4': { name: 'Latin 4/4', timeSignature: '4/4', beats: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], swing: 0 },
  'shuffle-6/8': { name: 'Shuffle 6/8', timeSignature: '6/8', beats: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], swing: 0.25 },
};

export function getRhythmPattern(name: string): RhythmPattern | null {
  return RHYTHM_PATTERNS[name] || null;
}

export function getAllRhythmPatterns(): string[] {
  return Object.keys(RHYTHM_PATTERNS);
}

export function generateRhythmSequence(
  pattern: RhythmPattern,
  measures: number,
  bpm: number
): { time: number; duration: number }[] {
  const sixteenthDuration = 60 / bpm / 4;
  const sequence: { time: number; duration: number }[] = [];

  for (let m = 0; m < measures; m++) {
    for (let i = 0; i < pattern.beats.length; i++) {
      if (pattern.beats[i]) {
        let time = m * pattern.beats.length * sixteenthDuration + i * sixteenthDuration;
        if (pattern.swing > 0 && i % 2 === 1) {
          time += sixteenthDuration * pattern.swing;
        }
        sequence.push({ time, duration: sixteenthDuration });
      }
    }
  }

  return sequence;
}
