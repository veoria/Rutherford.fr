// Sound for the color guesser, synthesized with the Web Audio API: no audio
// files to load, and nothing plays before the visitor's first click (browsers
// only allow audio after a gesture anyway). Short, soft, low in the mix.

type Note = {
  freq: number;
  at: number;
  dur: number;
  gain: number;
  type?: OscillatorType;
  to?: number;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // A gentle low-pass and a compressor keep every cue round and never clipping.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 5200;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(filter).connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return master ? { ctx, out: master } : null;
}

function play(notes: Note[], delay = 0) {
  const a = audio();
  if (!a) return;
  const start = a.ctx.currentTime + 0.01 + delay;
  for (const n of notes) {
    const t0 = start + n.at;
    const osc = a.ctx.createOscillator();
    const env = a.ctx.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, t0);
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + n.dur);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(n.gain, t0 + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + n.dur);
    osc.connect(env).connect(a.out);
    osc.start(t0);
    osc.stop(t0 + n.dur + 0.05);
  }
}

// A bell: the fundamental plus a quiet partial an octave and a fifth up.
function bell(freq: number, at: number, gain: number, dur = 0.55): Note[] {
  return [
    { freq, at, dur, gain },
    { freq: freq * 3, at, dur: dur * 0.4, gain: gain * 0.12 },
  ];
}

export const sounds = {
  // Right answer: two bell notes a fifth apart, rising.
  right: () => play([...bell(880, 0, 0.16), ...bell(1318.5, 0.085, 0.14, 0.7)]),
  // Wrong answer: a muted, descending pair. Clear, never a buzzer.
  wrong: () =>
    play([
      { freq: 311, at: 0, dur: 0.16, gain: 0.12, type: 'triangle' },
      { freq: 233, at: 0.11, dur: 0.26, gain: 0.12, type: 'triangle' },
    ]),
  // Next brand: a short tick, like a key on the console.
  tick: () => play([{ freq: 2400, to: 1500, at: 0, dur: 0.045, gain: 0.05 }]),
  // End of game: a rising arpeggio when the score is good, a calm pair otherwise.
  // Delayed to land with the result's confetti.
  finish: (good: boolean, delay = 0) =>
    play(
      good
        ? [...bell(523.25, 0, 0.12), ...bell(659.25, 0.08, 0.12), ...bell(783.99, 0.16, 0.12), ...bell(1046.5, 0.24, 0.13, 0.9)]
        : [...bell(523.25, 0, 0.11), ...bell(659.25, 0.12, 0.1, 0.7)],
      delay,
    ),
};
