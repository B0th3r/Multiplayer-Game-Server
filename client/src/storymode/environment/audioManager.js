import { Howl, Howler } from "howler";

const VOICE_BASE_PATH = "/audio";
const voiceCache = new Map();
let currentVoice = null;

function getOrCreateVoice(characterId, clipId) {
  const key = `${characterId}:${clipId}`;
  if (voiceCache.has(key)) return voiceCache.get(key);

  const sound = new Howl({
    src: [`${VOICE_BASE_PATH}/${characterId}/${clipId}.mp3`],
    preload: true,
    html5: false,      
    volume: 1.0,
  });

  voiceCache.set(key, sound);
  return sound;
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