import React, { useState } from 'react';
import { AudioProcessor } from './components/AudioProcessor';
import { AudioWaveform as Waveform, Volume2 } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<'echo' | 'noise-echo'>('echo');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Waveform className="text-indigo-600" size={32} />
            Blind Adaptive Echo & Noise Cancellation
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setMode('echo')}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                mode === 'echo'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Waveform size={20} />
              Echo Simulation & Removal
            </button>
            <button
              onClick={() => setMode('noise-echo')}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                mode === 'noise-echo'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Volume2 size={20} />
              Noise & Echo Removal
            </button>
          </div>
        </div>

        <AudioProcessor mode={mode} />
      </main>
    </div>
  );
}

export default App;