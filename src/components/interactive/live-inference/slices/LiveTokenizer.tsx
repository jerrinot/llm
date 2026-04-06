import { useState, useCallback } from 'react';
import { useInferenceWorker } from '../useInferenceWorker';
import { ModelStatusBar } from '../ModelStatusBar';
import { TokenizationPanel } from '../TokenizationPanel';

const PRESETS = [
  'The cat sat on the mat.',
  'Hello, world! 🎉',
  'def fibonacci(n):',
  'naïve café résumé',
];

export default function LiveTokenizer() {
  const worker = useInferenceWorker();
  const [inputText, setInputText] = useState(PRESETS[0]);

  const handleTokenize = useCallback(() => {
    if (worker.modelStatus !== 'ready') return;
    worker.tokenize(inputText);
  }, [worker, inputText]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <ModelStatusBar
        status={worker.modelStatus}
        progress={worker.downloadProgress}
        label={worker.downloadLabel}
        error={worker.error}
        onLoad={worker.loadModel}
      />

      {worker.modelStatus === 'ready' && (
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => { setInputText(p); }}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                  padding: '0.2rem 0.4rem',
                  background: inputText === p ? 'var(--accent)' : 'var(--surface-3)',
                  color: inputText === p ? 'white' : 'var(--ink-secondary)',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{
                flex: 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--surface-2)', border: '1px solid var(--ink-ghost)',
                borderRadius: 'var(--radius-sm)', color: 'var(--ink-primary)',
              }}
            />
            <button
              onClick={handleTokenize}
              disabled={!inputText.trim()}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--accent)', color: 'white',
                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              }}
            >
              Tokenize
            </button>
          </div>
        </div>
      )}

      {worker.tokens && (
        <TokenizationPanel pieces={worker.tokens} label="GPT-2 Tokenization" />
      )}

      {worker.error && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--sem-attention)' }}>
          Error: {worker.error}
        </div>
      )}
    </div>
  );
}
