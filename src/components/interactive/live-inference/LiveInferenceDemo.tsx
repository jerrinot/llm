import { useState, useCallback } from 'react';
import { useInferenceWorker } from './useInferenceWorker';
import { ModelStatusBar } from './ModelStatusBar';
import { TokenizationPanel } from './TokenizationPanel';
import { LogitsChart } from './LogitsChart';
import { SoftmaxPanel } from './SoftmaxPanel';
import { GenerationLoop } from './GenerationLoop';

const PRESETS = [
  'The meaning of life is',
  'Once upon a time,',
  'In the beginning was the',
  'The quick brown fox',
];

export default function LiveInferenceDemo() {
  const worker = useInferenceWorker();
  const [inputText, setInputText] = useState(PRESETS[0]);
  const [temperature, setTemperature] = useState(1.0);
  const [activeStage, setActiveStage] = useState<number>(0);

  const handleRun = useCallback(() => {
    if (worker.modelStatus !== 'ready') return;
    setActiveStage(1);
    worker.tokenize(inputText);
  }, [worker, inputText]);

  // When tokens arrive, auto-run forward pass
  const handleTokensReady = useCallback(() => {
    if (worker.inputIds && worker.inputIds.length > 0) {
      setActiveStage(2);
      worker.runForward(worker.inputIds);
    }
  }, [worker]);

  // Auto-advance when logits arrive
  if (worker.topK && activeStage === 2) {
    setTimeout(() => setActiveStage(3), 50);
  }

  // Auto-advance when tokens arrive
  if (worker.tokens && activeStage === 1 && !worker.isInferring) {
    setTimeout(() => handleTokensReady(), 50);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Model loader */}
      <ModelStatusBar
        status={worker.modelStatus}
        progress={worker.downloadProgress}
        label={worker.downloadLabel}
        error={worker.error}
        onLoad={worker.loadModel}
      />

      {/* Input */}
      {worker.modelStatus === 'ready' && (
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>
            Prompt
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => { setInputText(p); setActiveStage(0); }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  padding: '0.25rem 0.5rem',
                  background: inputText === p ? 'var(--accent)' : 'var(--surface-3)',
                  color: inputText === p ? 'white' : 'var(--ink-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <input
              type="text"
              value={inputText}
              onChange={e => { setInputText(e.target.value); setActiveStage(0); }}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--surface-2)',
                border: '1px solid var(--ink-ghost)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--ink-primary)',
              }}
            />
            <button
              onClick={handleRun}
              disabled={worker.isInferring || !inputText.trim()}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-4)',
                background: worker.isInferring ? 'var(--surface-3)' : 'var(--accent)',
                color: worker.isInferring ? 'var(--ink-ghost)' : 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: worker.isInferring ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {worker.isInferring ? 'Running...' : 'Run Pipeline'}
            </button>
          </div>
        </div>
      )}

      {/* Stage 1: Tokenization */}
      {worker.tokens && activeStage >= 1 && (
        <TokenizationPanel pieces={worker.tokens} />
      )}

      {/* Stage 2: Forward pass indicator */}
      {activeStage === 2 && worker.isInferring && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--ink-ghost)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', marginBottom: 'var(--space-2)' }}>
            Running forward pass through 6 transformer layers...
          </div>
          <div style={{
            width: '2rem', height: '2rem', margin: '0 auto',
            border: '3px solid var(--surface-3)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Stage 3: Logits + Softmax + Sampling */}
      {worker.topK && activeStage >= 3 && (
        <>
          <LogitsChart topK={worker.topK} />
          <SoftmaxPanel topK={worker.topK} temperature={temperature} onTemperatureChange={setTemperature} />
          <GenerationLoop
            worker={worker}
            initialText={inputText}
            temperature={temperature}
          />
        </>
      )}

      {/* Error display */}
      {worker.error && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--surface-2)',
          border: '1px solid var(--sem-attention)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--sem-attention)',
          fontSize: 'var(--text-sm)',
        }}>
          Error: {worker.error}
        </div>
      )}
    </div>
  );
}
