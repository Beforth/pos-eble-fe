/**
 * The new-order sound for a website (delivery) order: a service-bell "ding-ding" followed by
 * a bright rising run of four notes, played twice. It is synthesised with the Web Audio API
 * (bell = several inharmonic partials with a fast decay), so no sound file has to ship.
 *
 * Browsers only let a page make sound after the user has touched it once, so the audio
 * context is unlocked on the first click or key press; before that the sound is skipped
 * quietly (the order counter still updates).
 */

let context: AudioContext | null = null
let unlockBound = false

function getContext(): AudioContext | null {
  if (context) return context
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  try {
    context = new Ctor()
  } catch {
    context = null
  }
  return context
}

function unlock() {
  const ctx = getContext()
  if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {})
}

/** Call once at start-up: the first user gesture unlocks sound for the whole session. */
export function bindOrderSoundUnlock(): () => void {
  if (unlockBound) return () => {}
  unlockBound = true
  const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'click', 'touchstart']
  events.forEach((name) => window.addEventListener(name, unlock, { passive: true }))
  return () => {
    unlockBound = false
    events.forEach((name) => window.removeEventListener(name, unlock))
  }
}

// Partials of a struck bell: [frequency ratio, loudness, decay in seconds].
const BELL_PARTIALS: Array<[number, number, number]> = [
  [1, 1, 1.1],
  [2.76, 0.55, 0.7],
  [5.4, 0.3, 0.4],
  [8.93, 0.15, 0.25],
]

function strike(ctx: BaseAudioContext, out: AudioNode, frequency: number, start: number, level: number) {
  BELL_PARTIALS.forEach(([ratio, loudness, decay]) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency * ratio
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(level * loudness, start + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + decay)
    osc.connect(gain)
    gain.connect(out)
    osc.start(start)
    osc.stop(start + decay + 0.05)
  })
}

function pluck(ctx: BaseAudioContext, out: AudioNode, frequency: number, start: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.28, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32)
  osc.connect(gain)
  gain.connect(out)
  osc.start(start)
  osc.stop(start + 0.35)
}

/** Schedules one full round of the sound on any audio context (live or offline). */
export function scheduleOrderSound(ctx: BaseAudioContext, begin = 0): number {
  const master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)
  const t = ctx.currentTime + begin
  // "Ding-ding" of a service bell...
  strike(ctx, master, 1568, t, 0.5)
  strike(ctx, master, 1568, t + 0.28, 0.5)
  // ...then a bright rising run: C6, E6, G6, C7.
  ;[1046.5, 1318.5, 1568, 2093].forEach((f, i) => pluck(ctx, master, f, t + 0.7 + i * 0.13))
  return 1.4 // seconds one round lasts
}

/**
 * Plays the new-order sound twice. Never throws. A suspended context (no click yet) is
 * resumed first and the sound plays once that finishes; if the browser still refuses, it
 * stays silent.
 */
export function playNewOrderSound(): void {
  const ctx = getContext()
  if (!ctx) return
  const play = () => {
    const length = scheduleOrderSound(ctx, 0)
    scheduleOrderSound(ctx, length + 0.5)
  }
  if (ctx.state === 'running') {
    play()
    return
  }
  void ctx
    .resume()
    .then(() => {
      if (ctx.state === 'running') play()
    })
    .catch(() => {})
}
