import { useState, useCallback, useEffect } from 'react';
import { useInferenceWorker } from '../useInferenceWorker';
import { ModelStatusBar } from '../ModelStatusBar';
import { TokenizationPanel } from '../TokenizationPanel';
import { LogitsChart } from '../LogitsChart';
import { SoftmaxPanel } from '../SoftmaxPanel';

const PRESETS = [
  'The meaning of life is',
  'Once upon a time,',
  'The cat sat on the',
];

export default function LiveSoftmax() {
  const worker = useInferenceWorker();
  const [inputText, setInputText] = useState(PRESETS[0]);
  const [temperature, setTemperature] = useState(1.0);
  const [ran, setRan] = useState(false);

  const handleRun = useCallback(() => {
    if (worker.modelStatus !== 'ready') return;
    setRan(true);
    worker.tokenize(inputText);
  }, [worker, inputText]);

  // Auto-advance: tokens → forward pass (guard against error-loop)
  useEffect(() => {
    if (ran && worker.tokens && worker.inputIds && !worker.isInferring && !worker.topK && !worker.error) {
      worker.runForward(worker.inputIds);
    }
  }, [ran, worker.tokens, worker.inputIds, worker.isInferring, worker.topK, worker.error]);

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
              <button key={p} onClick={() => { setInputText(p); setRan(false); }}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                  padding: '0.2rem 0.4rem',
                  background: inputText === p ? 'var(--accent)' : 'var(--surface-3)',
                  color: inputText === p ? 'white' : 'var(--ink-secondary)',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                }}
              >{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input type="text" aria-label="Prompt text" value={inputText}
              onChange={e => { setInputText(e.target.value); setRan(false); }}
              style={{
                flex: 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--surface-2)', border: '1px solid var(--ink-ghost)',
                borderRadius: 'var(--radius-sm)', color: 'var(--ink-primary)',
              }}
            />
            <button onClick={handleRun}
              disabled={worker.isInferring || !inputText.trim()}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-4)',
                background: worker.isInferring ? 'var(--surface-3)' : 'var(--accent)',
                color: worker.isInferring ? 'var(--ink-ghost)' : 'white',
                border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: worker.isInferring ? 'default' : 'pointer',
              }}
            >{worker.isInferring ? 'Running...' : 'Run Model'}</button>
          </div>
        </div>
      )}

      {worker.isInferring && ran && (
        <div style={{ textAlign: 'center', padding: 'var(--space-3)', color: 'var(--ink-secondary)', fontSize: 'var(--text-sm)' }}>
          Running forward pass...
        </div>
      )}

      {worker.tokens && ran && <TokenizationPanel pieces={worker.tokens} />}
      {worker.topK && ran && <LogitsChart topK={worker.topK} />}
      {worker.topK && ran && (
        <SoftmaxPanel logits={worker.logits} topK={worker.topK}
          temperature={temperature} onTemperatureChange={setTemperature} />
      )}

      {worker.error && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--sem-attention)' }}>Error: {worker.error}</div>
      )}
    </div>
  );
}
