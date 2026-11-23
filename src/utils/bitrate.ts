const CONTAINER_OVERHEAD_PERCENT = 0.05;
const AUDIO_SIZE_PERCENT = 0.15;
const KBITS_PER_MB = 8192;

export function calculateVideoBitrateKbps(
  durationSeconds: number,
  desiredSizeMB: number,
  includeAudio: boolean,
): number {
  let videoDesiredSizeMB: number;
  if (includeAudio) {
    const audioSizeMB = desiredSizeMB * AUDIO_SIZE_PERCENT;
    const remainingSizeMB = desiredSizeMB - audioSizeMB;
    videoDesiredSizeMB = remainingSizeMB * (1 - CONTAINER_OVERHEAD_PERCENT);
  } else {
    videoDesiredSizeMB = desiredSizeMB * (1 - CONTAINER_OVERHEAD_PERCENT);
  }
  const videoBitrateKbps = (videoDesiredSizeMB * KBITS_PER_MB) / durationSeconds;
  return Math.max(50, Math.floor(videoBitrateKbps));
}

export function calculateAudioBitrateKbps(durationSeconds: number, desiredSizeMB: number): number {
  const audioSizeMB = desiredSizeMB * AUDIO_SIZE_PERCENT;
  const audioBitrateKbps = (audioSizeMB * KBITS_PER_MB) / durationSeconds;
  return Math.max(32, Math.floor(audioBitrateKbps));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}