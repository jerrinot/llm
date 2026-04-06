import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [temperature, setTemperature] = useState(0.7);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Auto-advance: tokens arrived → run forward pass
  useEffect(() => {
    if (activeStage === 1 && worker.tokens && !worker.isInferring && worker.inputIds) {
      timerRef.current = setTimeout(() => {
        setActiveStage(2);
        worker.runForward(worker.inputIds!);
      }, 50);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [activeStage, worker.tokens, worker.isInferring, worker.inputIds]);

  // Auto-advance: logits arrived → show results
  useEffect(() => {
    if (activeStage === 2 && worker.topK && !worker.isInferring) {
      timerRef.current = setTimeout(() => setActiveStage(3), 50);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [activeStage, worker.topK, worker.isInferring]);

  const handleRun = useCallback(() => {
    if (worker.modelStatus !== 'ready' || isGenerating) return;
    setActiveStage(1);
    worker.tokenize(inputText);
  }, [worker, inputText, isGenerating]);

  const disabled = worker.isInferring || isGenerating || !inputText.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <ModelStatusBar
        status={worker.modelStatus}
        progress={worker.downloadProgress}
        label={worker.downloadLabel}
        error={worker.error}
        onLoad={worker.loadModel}
      />

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
                disabled={isGenerating}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  padding: '0.25rem 0.5rem',
                  background: inputText === p ? 'var(--accent)' : 'var(--surface-3)',
                  color: inputText === p ? 'white' : 'var(--ink-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: isGenerating ? 'default' : 'pointer',
                  opacity: isGenerating ? 0.5 : 1,
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
              disabled={isGenerating}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--surface-2)',
                border: '1px solid var(--ink-ghost)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--ink-primary)',
                opacity: isGenerating ? 0.5 : 1,
              }}
            />
            <button
              onClick={handleRun}
              disabled={disabled}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-4)',
                background: disabled ? 'var(--surface-3)' : 'var(--accent)',
                color: disabled ? 'var(--ink-ghost)' : 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: disabled ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {worker.isInferring ? 'Running...' : 'Run Pipeline'}
            </button>
          </div>
        </div>
      )}

      {worker.tokens && activeStage >= 1 && (
        <TokenizationPanel pieces={worker.tokens} />
      )}

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

      {worker.topK && activeStage >= 3 && (
        <>
          <LogitsChart topK={worker.topK} />
          <SoftmaxPanel logits={worker.logits} topK={worker.topK} temperature={temperature} onTemperatureChange={setTemperature} />
          <GenerationLoop
            worker={worker}
            initialText={inputText}
            temperature={temperature}
            isGenerating={isGenerating}
            onGeneratingChange={setIsGenerating}
          />
        </>
      )}

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
