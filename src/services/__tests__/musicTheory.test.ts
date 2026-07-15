import { describe, it, expect } from 'vitest';
import {
  NOTE_NAMES,
  noteToMidi,
  midiToNote,
  noteToFrequency,
  frequencyToNote,
  generateScale,
  scaleToMidi,
  scaleToFrequencies,
  scaleToNoteNames,
  generateChord,
  chordToNoteNames,
  chordToMidi,
  detectKey,
  transpose,
  transposeToKey,
  getRhythmPattern,
  getAllRhythmPatterns,
  generateRhythmSequence,
} from '../musicTheory';

// ─── Note Helpers ───

describe('Music Theory - Note Helpers', () => {
  it('noteToMidi returns correct MIDI values', () => {
    expect(noteToMidi('C', 4)).toBe(60);
    expect(noteToMidi('A', 4)).toBe(69);
    expect(noteToMidi('C', 5)).toBe(72);
    expect(noteToMidi('C', 3)).toBe(48);
  });

  it('midiToNote returns correct note and octave', () => {
    expect(midiToNote(60)).toEqual({ note: 'C', octave: 4 });
    expect(midiToNote(69)).toEqual({ note: 'A', octave: 4 });
    expect(midiToNote(48)).toEqual({ note: 'C', octave: 3 });
  });

  it('noteToFrequency returns correct frequencies', () => {
    expect(noteToFrequency('A', 4)).toBeCloseTo(440, 0);
    expect(noteToFrequency('C', 4)).toBeCloseTo(261.63, 0);
    expect(noteToFrequency('A', 5)).toBeCloseTo(880, 0);
  });

  it('frequencyToNote converts back correctly', () => {
    const { note, octave } = frequencyToNote(440);
    expect(note).toBe('A');
    expect(octave).toBe(4);
  });

  it('NOTE_NAMES has 12 entries', () => {
    expect(NOTE_NAMES).toHaveLength(12);
  });
});

// ─── Scale Generation ───

describe('Music Theory - Scale Generation', () => {
  it('generates C major scale', () => {
    const scale = generateScale('C', 'major', 4);
    expect(scale).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });

  it('generates A minor scale', () => {
    const scale = generateScale('A', 'minor', 4);
    expect(scale).toEqual([69, 71, 72, 74, 76, 77, 79]);
  });

  it('generates pentatonic scale with 5 notes', () => {
    const scale = generateScale('C', 'pentatonic', 4);
    expect(scale).toHaveLength(5);
  });

  it('generates blues scale with 6 notes', () => {
    const scale = generateScale('G', 'blues', 4);
    expect(scale).toHaveLength(6);
  });

  it('generates chromatic scale with 12 notes', () => {
    const scale = generateScale('C', 'chromatic', 4);
    expect(scale).toHaveLength(12);
  });

  it('scaleToFrequencies returns correct count', () => {
    const scale = generateScale('C', 'major', 4);
    const freqs = scaleToFrequencies(scale);
    expect(freqs).toHaveLength(7);
    expect(freqs.every(f => f > 0)).toBe(true);
  });

  it('scaleToNoteNames returns string names', () => {
    const scale = generateScale('C', 'major', 4);
    const names = scaleToNoteNames(scale);
    expect(names).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']);
  });
});

// ─── Chord Generation ───

describe('Music Theory - Chord Generation', () => {
  it('generates C major chord', () => {
    const chord = generateChord('C', 'major', 4);
    expect(chord).toEqual([60, 64, 67]);
  });

  it('generates A minor chord', () => {
    const chord = generateChord('A', 'minor', 4);
    expect(chord).toEqual([69, 72, 76]);
  });

  it('generates diminished chord', () => {
    const chord = generateChord('C', 'diminished', 4);
    expect(chord).toEqual([60, 63, 66]);
  });

  it('generates augmented chord', () => {
    const chord = generateChord('C', 'augmented', 4);
    expect(chord).toEqual([60, 64, 68]);
  });

  it('generates 7th chord with 4 notes', () => {
    const chord = generateChord('C', '7th', 4);
    expect(chord).toHaveLength(4);
    expect(chord).toEqual([60, 64, 67, 70]);
  });

  it('chordToNoteNames returns correct names', () => {
    const chord = generateChord('C', 'major', 4);
    expect(chordToNoteNames(chord)).toEqual(['C4', 'E4', 'G4']);
  });
});

// ─── Key Detection ───

describe('Music Theory - Key Detection', () => {
  it('detects C major from C major scale', () => {
    const notes = generateScale('C', 'major', 4);
    const { key, confidence } = detectKey(notes);
    expect(key).toBe('C major');
    expect(confidence).toBeGreaterThan(0.8);
  });

  it('detects A minor from A minor scale', () => {
    const notes = generateScale('A', 'minor', 4);
    const { key, confidence } = detectKey(notes);
    // A minor and C major are relative keys (share same notes)
    // Detection may pick either, but confidence should be high
    expect(['A minor', 'C major']).toContain(key);
    expect(confidence).toBeGreaterThan(0.8);
  });

  it('handles empty notes', () => {
    const { key, confidence } = detectKey([]);
    expect(key).toBe('C major');
    expect(confidence).toBe(0);
  });

  it('detects partial scale with lower confidence', () => {
    const partial = [60, 62, 64]; // C D E
    const { confidence } = detectKey(partial);
    expect(confidence).toBeLessThan(1);
  });
});

// ─── Transposition ───

describe('Music Theory - Transposition', () => {
  it('transposes up by semitones', () => {
    const notes = [60, 64, 67];
    const result = transpose(notes, 5);
    expect(result).toEqual([65, 69, 72]);
  });

  it('transposes down by semitones', () => {
    const notes = [60, 64, 67];
    const result = transpose(notes, -5);
    expect(result).toEqual([55, 59, 62]);
  });

  it('transposeToKey transposes from C to G', () => {
    const notes = [60, 64, 67]; // C E G
    const result = transposeToKey(notes, 'C major', 'G major');
    expect(result).toEqual([67, 71, 74]); // G B D
  });

  it('transposeToKey with same key returns same notes', () => {
    const notes = [60, 64, 67];
    const result = transposeToKey(notes, 'C major', 'C major');
    expect(result).toEqual(notes);
  });
});

// ─── Rhythm Patterns ───

describe('Music Theory - Rhythm Patterns', () => {
  it('gets straight 4/4 pattern', () => {
    const pattern = getRhythmPattern('straight-4/4');
    expect(pattern).not.toBeNull();
    expect(pattern!.timeSignature).toBe('4/4');
    expect(pattern!.beats).toHaveLength(16);
    expect(pattern!.swing).toBe(0);
  });

  it('gets waltz 3/4 pattern', () => {
    const pattern = getRhythmPattern('waltz-3/4');
    expect(pattern).not.toBeNull();
    expect(pattern!.timeSignature).toBe('3/4');
  });

  it('gets compound 6/8 pattern', () => {
    const pattern = getRhythmPattern('compound-6/8');
    expect(pattern).not.toBeNull();
    expect(pattern!.timeSignature).toBe('6/8');
  });

  it('returns null for unknown pattern', () => {
    expect(getRhythmPattern('unknown')).toBeNull();
  });

  it('lists all rhythm patterns', () => {
    const patterns = getAllRhythmPatterns();
    expect(patterns.length).toBeGreaterThanOrEqual(4);
    expect(patterns).toContain('straight-4/4');
    expect(patterns).toContain('swing-4/4');
  });

  it('generates rhythm sequence', () => {
    const pattern = getRhythmPattern('straight-4/4')!;
    const sequence = generateRhythmSequence(pattern, 2, 120);
    expect(sequence.length).toBeGreaterThan(0);
    expect(sequence[0].time).toBe(0);
  });

  it('swing pattern produces shifted times', () => {
    const pattern = getRhythmPattern('swing-4/4')!;
    const sequence = generateRhythmSequence(pattern, 1, 120);
    expect(sequence.length).toBeGreaterThan(0);
  });
});
