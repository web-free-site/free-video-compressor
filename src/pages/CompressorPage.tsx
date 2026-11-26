import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PLATFORM_PRESETS, type PlatformPresetId } from '../presets';
import {
  buildSettingsFromUi,
  compressVideoFile,
  webCodecsSupported,
  type CompressionSettings,
} from '../utils/compressVideo';
import { formatBytes } from '../utils/bitrate';
import { AdSlot, SponsoredSmartlink, useAdScripts } from '../components/ads/AdSlot';
import SiteFooter from '../components/SiteFooter';
import HomeSeoSection from '../components/HomeSeoSection';
import { usePageMeta } from '../seo/usePageMeta';
import { HOME_H1 } from '../seo/homeSeoContent';

const VIDEO_ACCEPT =
  'video/*,.mp4,.mov,.webm,.mkv,.m4v,.avi,.mpeg,.mpg,.ogv,.3gp';

export default function CompressorPage({
  title = HOME_H1,
  lead = 'Pick a local video, choose a platform preset or target size, and download a smaller MP4. Everything stays on your device.',
  initialPreset = 'custom' as PlatformPresetId,
  metaPath = '/',
}: {
  title?: string;
  lead?: string;
  initialPreset?: PlatformPresetId;
  metaPath?: string;
}) {
  usePageMeta(
    `${title} — compress video in the browser`,
    lead,
    metaPath,
  );
  useAdScripts();

  const [preset, setPreset] = useState<PlatformPresetId>(initialPreset);
  const [targetSize, setTargetSize] = useState(8);
  const [frameRate, setFrameRate] = useState('source');
  const [resolution, setResolution] = useState('source');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState('Click to choose a video file, or drag one here');
  const [busy, setBusy] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState('');
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [inputSize, setInputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceDims, setSourceDims] = useState<{ w: number; h: number } | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const applyPreset = useCallback((id: PlatformPresetId) => {
    setPreset(id);
    const p = PLATFORM_PRESETS.find(x => x.id === id);
    if (!p || id === 'custom') return;
    setTargetSize(p.targetSizeMB);
    if (p.frameRate) setFrameRate(String(p.frameRate));
    if (p.maxWidth && p.maxWidth <= 720) setResolution('1280x720');
    else if (p.maxWidth && p.maxWidth <= 854) setResolution('1280x720');
    else setResolution('source');
  }, []);

  useEffect(() => {
    applyPreset(initialPreset);
  }, [initialPreset, applyPreset]);

  const onFile = async (f: File) => {
    if (!f.type.startsWith('video/') && !/\.(mp4|mov|webm|mkv|m4v|avi|mpeg|mpg|ogv|3gp)$/i.test(f.name)) {
      setError('Please choose a video file (MP4, MOV, WebM, MKV, etc.).');
      return;
    }
    setFile(f);
    setFileLabel(f.name);
    setInputSize(f.size);
    setError(null);
    setShowResults(false);
    setSourceDims(null);
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
    }
    setMetaLoading(true);
    const url = URL.createObjectURL(f);
    const video = document.createElement('video');
    video.preload = 'metadata';
    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Could not read video metadata'));
        video.src = url;
      });
      setSourceDims({ w: video.videoWidth, h: video.videoHeight });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setFile(null);
      setFileLabel('Click to choose a video file, or drag one here');
    } finally {
      URL.revokeObjectURL(url);
      setMetaLoading(false);
    }
  };

  const onCompress = async () => {
    if (!file || !sourceDims) {
      setError('Select a video file first.');
      return;
    }
    if (!webCodecsSupported()) {
      setError('WebCodecs is not available. Use Chrome, Edge, or another Chromium browser.');
      return;
    }
    setBusy(true);
    setError(null);
    setProgressPct(0);
    setProgressText('Starting…');

    const presetDef = PLATFORM_PRESETS.find(p => p.id === preset);
    let settings: CompressionSettings;
    try {
      settings = buildSettingsFromUi({
        targetSizeMB: targetSize,
        frameRateRaw: frameRate,
        resolutionRaw: resolution,
        includeAudio,
        presetMaxW: presetDef?.maxWidth,
        sourceW: sourceDims.w,
        sourceH: sourceDims.h,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
      return;
    }

    try {
      const result = await compressVideoFile(file, settings, (msg, frac) => {
        setProgressText(msg);
        if (frac !== undefined) setProgressPct(Math.round(frac * 100));
      });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(result.blob);
      setOutputUrl(url);
      setOutputName(result.fileName);
      setOutputSize(result.outputSize);
      setShowResults(true);
      setProgressText(`Done. Output ${formatBytes(result.outputSize)} (target ${targetSize} MB).`);
      setProgressPct(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setProgressText('');
    } finally {
      setBusy(false);
    }
  };

  const onReset = () => {
    setShowResults(false);
    setBusy(false);
    setProgressText('');
    setProgressPct(0);
    setFile(null);
    setFileLabel('Click to choose a video file, or drag one here');
    setInputSize(null);
    setSourceDims(null);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
    setOutputName('');
    setOutputSize(null);
    setError(null);
    applyPreset('custom');
    setTargetSize(8);
    setFrameRate('source');
    setResolution('source');
    setIncludeAudio(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="compress-layout">
      <article className="container center space-elements hero">
        <h1>{title}</h1>
        <p>{lead}</p>
        <p className="muted-note">
          H.264 MP4 via WebCodecs (no GPL FFmpeg core). Files are never uploaded.
        </p>
        <SponsoredSmartlink />
        <AdSlot slot="homeTop728x90" className="center-ad" />
      </article>

      <div className="tool-grid container">
        <article id="settings-pane" className="space-elements settings-pane">
          <p className="preset-label">Platform preset</p>
          <div className="preset-grid">
            {PLATFORM_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                className={`preset-card${preset === p.id ? ' active' : ''}`}
                onClick={() => applyPreset(p.id)}
                disabled={busy}
              >
                <strong>{p.label}</strong>
                {p.id !== 'custom' && <small>{p.targetSizeMB} MB target</small>}
              </button>
            ))}
          </div>
          {preset !== 'custom' && (
            <p className="preset-hint">{PLATFORM_PRESETS.find(p => p.id === preset)?.hint}</p>
          )}

          <label htmlFor="upload-box">Video file</label>
          <div
            id="upload-box"
            ref={uploadBoxRef}
            className="center upload-box"
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            onDragOver={e => {
              e.preventDefault();
              uploadBoxRef.current?.classList.add('drag-over');
            }}
            onDragLeave={() => uploadBoxRef.current?.classList.remove('drag-over')}
            onDrop={e => {
              e.preventDefault();
              uploadBoxRef.current?.classList.remove('drag-over');
              const f = e.dataTransfer.files?.[0];
              if (f) void onFile(f);
            }}
          >
            <i className="fa fa-video-camera" aria-hidden />
            <span>{fileLabel}</span>
          </div>
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept={VIDEO_ACCEPT}
            hidden
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
            onInput={e => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (f) void onFile(f);
            }}
          />

          <label htmlFor="target-size">Target file size</label>
          <div className="target-size-group">
            <input
              id="target-size"
              className="input-box"
              type="number"
              min={1}
              max={500}
              step={1}
              value={targetSize}
              disabled={busy}
              onChange={e => {
                setPreset('custom');
                setTargetSize(parseFloat(e.target.value) || 1);
              }}
            />
            <span>MB</span>
          </div>

          <label htmlFor="frame-rate">Frame rate</label>
          <select
            id="frame-rate"
            className="input-box full-select"
            value={frameRate}
            disabled={busy}
            onChange={e => setFrameRate(e.target.value)}
          >
            <option value="source">Same as source (30 fps encode)</option>
            <option value="24">24</option>
            <option value="30">30</option>
            <option value="60">60</option>
          </select>

          <label htmlFor="resolution">Resolution</label>
          <select
            id="resolution"
            className="input-box full-select"
            value={resolution}
            disabled={busy}
            onChange={e => setResolution(e.target.value)}
          >
            <option value="source">Same as source</option>
            <option value="640x480">640×480</option>
            <option value="1280x720">1280×720</option>
            <option value="1920x1080">1920×1080</option>
          </select>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={includeAudio}
              disabled={busy}
              onChange={e => setIncludeAudio(e.target.checked)}
            />
            Include audio (AAC via WebCodecs)
          </label>

          <p className="codec-note">
            Output codec: <strong>H.264</strong> (browser encoder). H.265 is not available without GPL
            libraries.
          </p>

          <button
            id="compress-btn"
            type="button"
            className="full-width"
            disabled={!file || !sourceDims || metaLoading || busy}
            onClick={() => void onCompress()}
          >
            <i className="fa fa-compress" aria-hidden /> {busy ? 'Compressing…' : 'Compress video'}
          </button>
          {error && <p className="error-text" role="alert">{error}</p>}
        </article>

        <aside className="sidebar-ads">
          <AdSlot slot="sidebar160x600" />
          <AdSlot slot="sidebar160x300" />
        </aside>
      </div>

      {(busy || showResults) && (
        <article id="progress-pane" className="container space-elements progress-pane">
          {inputSize != null && (
            <p>
              Original: {formatBytes(inputSize)}
              {outputSize != null && (
                <>
                  {' → '}
                  <strong>{formatBytes(outputSize)}</strong>
                  {outputSize <= targetSize * 1024 * 1024 * 1.1 ? ' (within target)' : ' (may exceed target)'}
                </>
              )}
            </p>
          )}
          <p id="progress-text">{progressText}</p>
          <progress
            id="progress-bar"
            className="progress-bar full-width"
            max={100}
            value={progressPct}
          />
          {outputUrl && (
            <>
              <video className="preview-video" src={outputUrl} controls preload="metadata" />
              <a
                id="download-btn"
                className="full-width button-contrast download-link"
                href={outputUrl}
                download={outputName}
              >
                <i className="fa fa-download" aria-hidden /> Download compressed MP4
              </a>
              <AdSlot slot="nativeBelowResult" className="center-ad" />
            </>
          )}
          {!busy && (
            <button type="button" className="secondary full-width" onClick={onReset}>
              <i className="fa fa-refresh" aria-hidden /> Compress another video
            </button>
          )}
        </article>
      )}

      <AdSlot slot="betweenToolContent728x90" className="container center-ad" />
      {metaPath === '/' && <HomeSeoSection />}
      <AdSlot slot="content468x60" className="container center-ad mobile-only" />
      <AdSlot slot="content300x250" className="container center-ad" />
      <AdSlot slot="mobileSticky320x50" className="sticky-mobile-ad" />

      <SiteFooter />
    </main>
  );
}