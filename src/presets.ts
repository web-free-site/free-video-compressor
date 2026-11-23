export type PlatformPresetId =
  | 'custom'
  | 'whatsapp'
  | 'whatsapp-status'
  | 'email-25'
  | 'discord-10'
  | 'messenger';

export interface PlatformPreset {
  id: PlatformPresetId;
  label: string;
  targetSizeMB: number;
  hint: string;
  maxWidth?: number;
  maxHeight?: number;
  frameRate?: number;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'custom',
    label: 'Custom size',
    targetSizeMB: 8,
    hint: 'Set your own target file size below.',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    targetSizeMB: 16,
    hint: 'Under the usual 16 MB limit for video messages.',
    maxWidth: 1280,
    frameRate: 30,
  },
  {
    id: 'whatsapp-status',
    label: 'WhatsApp Status',
    targetSizeMB: 12,
    hint: 'Smaller file for status updates (up to 30s).',
    maxWidth: 720,
    frameRate: 30,
  },
  {
    id: 'email-25',
    label: 'Email attachment (25 MB)',
    targetSizeMB: 25,
    hint: 'Common attachment limit for many mail providers.',
    maxWidth: 1920,
  },
  {
    id: 'discord-10',
    label: 'Discord (10 MB)',
    targetSizeMB: 10,
    hint: 'Free-tier upload limit without Nitro boost.',
    maxWidth: 1280,
    frameRate: 30,
  },
  {
    id: 'messenger',
    label: 'Messenger',
    targetSizeMB: 25,
    hint: 'Comfortable size for Facebook Messenger video.',
    maxWidth: 1280,
    frameRate: 30,
  },
];