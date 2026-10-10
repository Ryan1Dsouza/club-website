import { useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { serverSoundSnapshot, setSoundSettings, soundSnapshot, subscribeSound, unlockAudio } from '../../lib/audio-engine';
import { sfx } from '../../lib/sound-effects';

export default function SoundToggle({ className = 'site-sound-toggle', label = false }: { className?: string; label?: boolean }) {
  const { muted } = useSyncExternalStore(subscribeSound, soundSnapshot, serverSoundSnapshot);
  return <button type="button" className={className} data-sound="none" aria-label="Website sound" aria-pressed={!muted}
    title={muted ? 'Turn sound on' : 'Mute all sound'} onClick={() => {
      void unlockAudio(); setSoundSettings({ muted: !muted }); if (muted) sfx.toggle();
    }}>
    {muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}{label && <span>Sound</span>}
  </button>;
}
