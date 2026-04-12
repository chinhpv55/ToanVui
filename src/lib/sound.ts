// Sound effect manager for VuiToan3
// Preloads and plays sound effects with volume control

type SoundName = "correct" | "incorrect" | "tap" | "star" | "complete" | "streak";

const SOUND_FILES: Record<SoundName, string> = {
  correct: "/sounds/correct.wav",
  incorrect: "/sounds/incorrect.wav",
  tap: "/sounds/tap.wav",
  star: "/sounds/star.wav",
  complete: "/sounds/complete.wav",
  streak: "/sounds/streak.wav",
};

const SOUND_VOLUMES: Record<SoundName, number> = {
  correct: 0.6,
  incorrect: 0.5,
  tap: 0.3,
  star: 0.5,
  complete: 0.7,
  streak: 0.6,
};

const sounds: Partial<Record<SoundName, HTMLAudioElement>> = {};
let muted = false;

export function preloadSounds() {
  if (typeof window === "undefined") return;
  for (const [name, path] of Object.entries(SOUND_FILES)) {
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.volume = SOUND_VOLUMES[name as SoundName];
    audio.load();
    sounds[name as SoundName] = audio;
  }
}

function playSound(name: SoundName) {
  if (muted || typeof window === "undefined") return;
  const audio = sounds[name];
  if (audio) {
    audio.currentTime = 0;
    audio.volume = SOUND_VOLUMES[name];
    audio.play().catch(() => {});
  }
}

// Public API
export function playCorrect() {
  playSound("correct");
}

export function playIncorrect() {
  playSound("incorrect");
}

export function playTap() {
  playSound("tap");
}

export function playStar() {
  playSound("star");
}

export function playComplete() {
  playSound("complete");
}

export function playStreak() {
  playSound("streak");
}

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}
