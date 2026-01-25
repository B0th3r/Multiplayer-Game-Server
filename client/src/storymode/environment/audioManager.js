import { Howl, Howler } from "howler";

const VOICE_BASE_PATH = "/audio";
const voiceCache = new Map();
let currentVoice = null;
const audioDurations = new Map();
function getOrCreateVoice(characterId, clipId) {
  const key = `${characterId}:${clipId}`;
  if (voiceCache.has(key)) return voiceCache.get(key);

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const sound = new Howl({
    src: [`${VOICE_BASE_PATH}/${characterId}/${clipId}.mp3`],
    preload: true,
    html5: isiOS, 
    volume: 1.0,
  });

  voiceCache.set(key, sound);
  return sound;
}
export function getVoiceDuration(characterId, clipId) {
  const key = `${characterId}:${clipId}`;

  if (audioDurations.has(key)) {
    return Promise.resolve(audioDurations.get(key));
  }

  const sound = getOrCreateVoice(characterId.toLowerCase(), clipId);

  return new Promise((resolve) => {
    if (sound.state() === 'loaded') {
      const duration = sound.duration() * 1000; // Convert to ms
      audioDurations.set(key, duration);
      resolve(duration);
    } else {
      sound.once('load', () => {
        const duration = sound.duration() * 1000;
        audioDurations.set(key, duration);
        resolve(duration);
      });

      sound.once('loaderror', (id, err) => {
        console.warn(`Could not load audio: ${key}`, err);
        resolve(null);
      });
    }
  });
}

export function getCachedVoiceDuration(characterId, clipId) {
  const key = `${characterId}:${clipId}`;
  return audioDurations.get(key) || null;
}

export function playVoice(characterId, clipId, { interrupt = true } = {}) {
  if (!characterId || !clipId) return;

  const sound = getOrCreateVoice(characterId.toLowerCase(), clipId);

  try {
    if (interrupt && currentVoice) {
      currentVoice.stop();
    }
    currentVoice = sound;
    sound.play();
  } catch (err) {
    console.warn("[voice] Failed to play voice line", { characterId, clipId, err });
  }
}

export function stopVoice() {
  if (currentVoice && currentVoice.playing()) {
    currentVoice.stop();
  }
}

export function setVoiceVolume(volume) {
  const v = Math.min(1, Math.max(0, volume));
  Howler.volume(v);
}

export function muteVoices() {
  Howler.mute(true);
}

export function unmuteVoices() {
  Howler.mute(false);
}