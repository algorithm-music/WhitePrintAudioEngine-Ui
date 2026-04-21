'use client';

import { useState } from 'react';

export interface PlatformTarget {
  id: string;
  name: string;
  lufs: number;
  truePeak: number;
  description: string;
}

export const PLATFORMS: PlatformTarget[] = [
  { id: 'spotify',      name: 'Spotify',           lufs: -14.0, truePeak: -1.0, description: '-14 LUFS / -1.0 dBTP' },
  { id: 'apple_music',  name: 'Apple Music',       lufs: -16.0, truePeak: -1.0, description: '-16 LUFS / -1.0 dBTP' },
  { id: 'youtube',      name: 'YouTube',           lufs: -14.0, truePeak: -1.0, description: '-14 LUFS / -1.0 dBTP' },
  { id: 'beatport',     name: 'Beatport / Club',   lufs: -6.0,  truePeak: -0.1, description: '-6 LUFS / -0.1 dBTP' },
  { id: 'netflix',      name: 'Netflix / Film',    lufs: -27.0, truePeak: -2.0, description: '-27 LUFS / -2.0 dBTP (dialog norm)' },
  { id: 'broadcast',    name: 'Broadcast (EBU)',   lufs: -23.0, truePeak: -1.0, description: '-23 LUFS / -1.0 dBTP' },
  { id: 'podcast',      name: 'Podcast',           lufs: -16.0, truePeak: -1.0, description: '-16 LUFS / -1.0 dBTP' },
  { id: 'custom',       name: 'Custom',            lufs: -14.0, truePeak: -1.0, description: 'Set your own targets' },
];

interface PlatformSelectorProps {
  /**
   * Called with the platform id. The AI panel uses the id as deliberation
   * context; it decides the actual LUFS / True-Peak targets per track.
   * For `custom`, caller receives explicit numeric overrides as well.
   */
  onSelect: (platformId: string, customOverride?: { lufs: number; truePeak: number }) => void;
  initialId?: string;
}

export default function PlatformSelector({ onSelect, initialId = 'spotify' }: PlatformSelectorProps) {
  const [selected, setSelected] = useState<string>(initialId);
  const [customLufs, setCustomLufs] = useState(-14.0);
  const [customPeak, setCustomPeak] = useState(-1.0);

  const handleSelect = (platform: PlatformTarget) => {
    setSelected(platform.id);
    if (platform.id === 'custom') {
      onSelect('custom', { lufs: customLufs, truePeak: customPeak });
    } else {
      onSelect(platform.id);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">TARGET_PLATFORM</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              selected === p.id
                ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
            }`}
          >
            <div className={`text-sm font-bold ${selected === p.id ? 'text-indigo-400' : 'text-zinc-300'}`}>
              {p.name}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">{p.description}</div>
          </button>
        ))}
      </div>
      {selected === 'custom' && (
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-zinc-500">LUFS</label>
            <input
              type="number"
              value={customLufs}
              onChange={(e) => { const v = parseFloat(e.target.value); setCustomLufs(v); onSelect('custom', { lufs: v, truePeak: customPeak }); }}
              step={0.5}
              className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-zinc-500">True Peak</label>
            <input
              type="number"
              value={customPeak}
              onChange={(e) => { const v = parseFloat(e.target.value); setCustomPeak(v); onSelect('custom', { lufs: customLufs, truePeak: v }); }}
              step={0.1}
              className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
