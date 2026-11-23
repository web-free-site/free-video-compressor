import { describe, expect, it } from 'vitest';
import { calculateAudioBitrateKbps, calculateVideoBitrateKbps } from './bitrate';

describe('bitrate', () => {
  it('allocates most of the budget to video when audio is on', () => {
    const v = calculateVideoBitrateKbps(60, 8, true);
    const a = calculateAudioBitrateKbps(60, 8);
    expect(v).toBeGreaterThan(a);
    expect(v).toBeGreaterThan(500);
  });

  it('uses full budget for video when audio is off', () => {
    const v = calculateVideoBitrateKbps(10, 1, false);
    expect(v).toBeGreaterThan(600);
  });
});