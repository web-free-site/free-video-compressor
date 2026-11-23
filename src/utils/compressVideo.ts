import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { calculateAudioBitrateKbps, calculateVideoBitrateKbps } from './bitrate';

export type OutputCodec = 'H.264';

export interface CompressionSettings {
  targetSizeMB: number;
  frameRate: number | null;
  width: number;
  height: number;
  includeAudio: boolean;
  codec: OutputCodec;
}

export type CompressProgress = (message: string, fraction?: number) => void;

function evenDim(n: number): number {
  return n % 2 === 0 ? n : n - 1;
}

function parseResolution(value: string, srcW: number, srcH: number): { w: number; h: number } {
  if (value === 'source') return { w: evenDim(srcW), h: evenDim(srcH) };
  const [sw, sh] = value.split('x').map(Number);
  return { w: evenDim(sw), h: evenDim(sh) };
}

function fitResolution(
  srcW: number,
  srcH: number,
  maxW?: number,
  maxH?: number,
): { w: number; h: number } {
  let w = srcW;
  let h = srcH;
  if (maxW && w > maxW) {
    h = Math.round((h * maxW) / w);
    w = maxW;
  }
  if (maxH && h > maxH) {
    w = Math.round((w * maxH) / h);
    h = maxH;
  }
  return { w: evenDim(w), h: evenDim(h) };
}

export function buildSettingsFromUi(opts: {
  targetSizeMB: number;
  frameRateRaw: string;
  resolutionRaw: string;
  includeAudio: boolean;
  presetMaxW?: number;
  sourceW: number;
  sourceH: number;
}): CompressionSettings {
  const parsed = parseResolution(opts.resolutionRaw, opts.sourceW, opts.sourceH);
  const fitted = fitResolution(parsed.w, parsed.h, opts.presetMaxW);
  const frameRate =
    opts.frameRateRaw === 'source' ? null : parseInt(opts.frameRateRaw, 10) || 30;
  return {
    targetSizeMB: opts.targetSizeMB,
    frameRate,
    width: fitted.w,
    height: fitted.h,
    includeAudio: opts.includeAudio,
    codec: 'H.264',
  };
}

export function webCodecsSupported(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

async function loadVideoMeta(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  url: string;
}> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Could not read video metadata'));
    video.src = url;
  });
  return {
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    url,
  };
}

async function encodeAudioTrack(
  audioUrl: string,
  duration: number,
  audioBitrateKbps: number,
  muxer: Muxer<ArrayBufferTarget>,
  onProgress: CompressProgress,
): Promise<void> {
  if (typeof AudioEncoder === 'undefined' || typeof MediaStreamTrackProcessor === 'undefined') {
    throw new Error('AAC encoding is not supported in this browser. Turn off audio or try Chrome/Edge.');
  }

  const video = document.createElement('video');
  video.src = audioUrl;
  video.muted = false;
  video.playsInline = true;
  await new Promise<void>((resolve, reject) => {
    video.oncanplay = () => resolve();
    video.onerror = () => reject(new Error('Could not load audio'));
  });

  const stream = video.captureStream?.() ?? (video as HTMLVideoElement & { mozCaptureStream?: () => MediaStream }).mozCaptureStream?.();
  if (!stream) throw new Error('captureStream is not available');
  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack) throw new Error('This video has no audio track.');

  const sampleRate = 48000;
  const channels = 2;
  let audioEncoder: AudioEncoder | null = null;
  let encodeError: unknown = null;

  audioEncoder = new AudioEncoder({
    output: (chunk, meta) => {
      muxer.addAudioChunk(chunk, meta);
    },
    error: e => {
      encodeError = e;
    },
  });

  const cfg: AudioEncoderConfig = {
    codec: 'mp4a.40.2',
    numberOfChannels: channels,
    sampleRate,
    bitrate: audioBitrateKbps * 1000,
  };
  const sup = await AudioEncoder.isConfigSupported(cfg);
  if (!sup.supported) {
    throw new Error('AAC (mp4a) encoding is not supported in this browser.');
  }
  audioEncoder.configure(cfg);

  const processor = new MediaStreamTrackProcessor({ track: audioTrack });
  const reader = processor.readable.getReader();

  onProgress('Encoding audio…', 0.02);
  const playPromise = video.play();
  const pump = async () => {
    for (;;) {
      if (encodeError) throw encodeError;
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        audioEncoder!.encode(value);
        value.close();
      }
    }
  };

  await Promise.all([playPromise, pump()]);
  await audioEncoder.flush();
  audioEncoder.close();
  reader.releaseLock();
  video.pause();
  if (encodeError) throw encodeError;
  if (video.currentTime < duration - 0.5) {
    onProgress('Audio encode finished (short clip).');
  }
}

export async function compressVideoFile(
  file: File,
  settings: CompressionSettings,
  onProgress: CompressProgress,
): Promise<{ blob: Blob; fileName: string; outputSize: number }> {
  if (!webCodecsSupported()) {
    throw new Error(
      'WebCodecs H.264 encoding is not supported in this browser. Try the latest Chrome or Edge.',
    );
  }

  onProgress('Reading video…', 0);
  const meta = await loadVideoMeta(file);
  const duration = meta.duration;
  if (!duration || !Number.isFinite(duration)) {
    URL.revokeObjectURL(meta.url);
    throw new Error('Could not determine video duration.');
  }

  const fps = settings.frameRate ?? 30;
  const frameCount = Math.max(1, Math.floor(duration * fps));
  const videoBitrateKbps = calculateVideoBitrateKbps(
    duration,
    settings.targetSizeMB,
    settings.includeAudio,
  );
  const audioBitrateKbps = settings.includeAudio
    ? calculateAudioBitrateKbps(duration, settings.targetSizeMB)
    : 0;

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width: settings.width,
      height: settings.height,
      frameRate: fps,
    },
    audio: settings.includeAudio
      ? { codec: 'aac', numberOfChannels: 2, sampleRate: 48000 }
      : undefined,
    fastStart: 'in-memory',
  });

  let videoError: unknown = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: e => {
      videoError = e;
    },
  });

  const codecString = 'avc1.42E01E';
  const videoConfig: VideoEncoderConfig = {
    codec: codecString,
    width: settings.width,
    height: settings.height,
    bitrate: videoBitrateKbps * 1000,
    framerate: fps,
    avc: { format: 'avc' },
  };
  const vSup = await VideoEncoder.isConfigSupported(videoConfig);
  if (!vSup.supported) {
    URL.revokeObjectURL(meta.url);
    throw new Error('H.264 encoding is not available in this browser.');
  }
  videoEncoder.configure(videoConfig);

  const canvas = document.createElement('canvas');
  canvas.width = settings.width;
  canvas.height = settings.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');

  const video = document.createElement('video');
  video.src = meta.url;
  video.muted = true;
  video.playsInline = true;
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error('Could not load video for encoding'));
  });

  let audioPromise: Promise<void> | null = null;
  if (settings.includeAudio) {
    audioPromise = encodeAudioTrack(meta.url, duration, audioBitrateKbps, muxer, onProgress).catch(
      err => {
        throw err;
      },
    );
  }

  onProgress('Encoding video frames…', 0.05);
  for (let i = 0; i < frameCount; i++) {
    if (videoError) throw videoError;
    const t = Math.min(duration - 0.001, i / fps);
    await new Promise<void>(resolve => {
      video.onseeked = () => resolve();
      video.currentTime = t;
    });
    ctx.drawImage(video, 0, 0, settings.width, settings.height);
    const frame = new VideoFrame(canvas, { timestamp: (i * 1_000_000) / fps });
    videoEncoder.encode(frame, { keyFrame: i % Math.max(1, fps) === 0 });
    frame.close();
    if (i % 4 === 0) {
      onProgress(`Encoding frame ${i + 1} of ${frameCount}…`, 0.05 + (0.75 * i) / frameCount);
    }
  }

  await videoEncoder.flush();
  videoEncoder.close();
  if (videoError) throw videoError;

  if (audioPromise) {
    await audioPromise;
  }

  onProgress('Muxing MP4…', 0.92);
  muxer.finalize();

  URL.revokeObjectURL(meta.url);

  const buffer = target.buffer;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  const base = file.name.replace(/\.[^.]+$/, '');
  return {
    blob,
    fileName: `${base}_compressed.mp4`,
    outputSize: blob.size,
  };
}