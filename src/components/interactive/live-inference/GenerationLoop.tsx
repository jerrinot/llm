import { useState, useCallback, useRef, useEffect } from 'react';
import type { TopKEntry } from './types';

function softmaxFull(logits: number[], temperature: number): Float64Array {
  const scaled = logits.map(l => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return Float64Array.from(exps.map(e => e / sum));
}

function sampleFromFullLogits(logits: number[], topK: TopKEntry[], temperature: number): TopKEntry {
  // Sample from the full distribution, but return the chosen entry's info
  const probs = softmaxFull(logits, temperature);
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (r < cumulative) {
      // Check if this token is in topK for display info
      const existing = topK.find(e => e.id === i);
      if (existing) return existing;
      // Token outside top-K was selected — decode it from the ID
      return { token: `[id:${i}]`, id: i, logit: 0 };
    }
  }
  return topK[0]; // fallback
}

interface Props {
  worker: {
    topK: TopKEntry[] | null;
    logits: number[] | null;
    inputIds: number[] | null;
    isInferring: boolean;
    error: string | null;
    runForward: (ids: number[]) => void;
    tokenize: (text: string) => void;
  };
  initialText: string;
  temperature: number;
  isGenerating: boolean;
  onGeneratingChange: (v: boolean) => void;
}

export function GenerationLoop({ worker, initialText, temperature, isGenerating, onGeneratingChange }: Props) {
  const [generated, setGenerated] = useState<Array<{ token: string; id: number }>>([]);
  const [maxTokens, setMaxTokens] = useState(10);
  const currentIdsRef = useRef<number[]>([]);
  const stepRef = useRef(0);
  const stopRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Generation step: when logits arrive during generation, sample and continue
  useEffect(() => {
    if (!isGenerating || worker.isInferring || !worker.logits || !worker.topK) return;

    // Check for stop or error before sampling
    if (stopRef.current || worker.error) {
      onGeneratingChange(false);
      stopRef.current = false;
      return;
    }

    const chosen = sampleFromFullLogits(worker.logits, worker.topK, temperature);

    setGenerated(prev => [...prev, { token: chosen.token, id: chosen.id }]);
    stepRef.current += 1;

    const newIds = [...currentIdsRef.current, chosen.id];
    currentIdsRef.current = newIds;

    if (stepRef.current >= maxTokens) {
      onGeneratingChange(false);
      return;
    }

    // Schedule next step with cleanup
    timerRef.current = setTimeout(() => {
      if (!stopRef.current) {
        worker.runForward(newIds);
      } else {
        onGeneratingChange(false);
        stopRef.current = false;
      }
    }, 50);
  }, [worker.logits, worker.topK, worker.isInferring, isGenerating]);

  const handleGenerate = useCallback(() => {
    if (!worker.inputIds) return;
    setGenerated([]);
    currentIdsRef.current = [...worker.inputIds];
    stepRef.current = 0;
    stopRef.current = false;
    onGeneratingChange(true);
    worker.runForward([...worker.inputIds]);
  }, [worker, onGeneratingChange]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    onGeneratingChange(false);
  }, [onGeneratingChange]);

  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--ink-ghost)',
    }}>
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--ink-ghost)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 'var(--space-3)',
        fontWeight: 600,
      }}>
        Stage 4: Autoregressive Generation
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
          Max tokens: {maxTokens}
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={maxTokens}
          onChange={e => setMaxTokens(parseInt(e.target.value))}
          disabled={isGenerating}
          style={{ width: '8rem', accentColor: 'var(--accent)' }}
        />
        {!isGenerating ? (
          <button
            onClick={handleGenerate}
            disabled={!worker.inputIds}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Generate
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--sem-attention)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Stop
          </button>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        padding: 'var(--space-3)',
        background: 'var(--surface-3)',
        borderRadius: 'var(--radius-sm)',
        minHeight: '3rem',
        lineHeight: 1.6,
        color: 'var(--ink-primary)',
      }}>
        <span style={{ color: 'var(--ink-secondary)' }}>{initialText}</span>
        {generated.map((g, i) => (
          <span
            key={i}
            style={{
              color: 'var(--sem-ffn)',
              borderBottom: '1px dotted var(--sem-ffn-dim)',
            }}
            title={`ID: ${g.id}`}
          >
            {g.token}
          </span>
        ))}
        {isGenerating && (
          <span style={{
            display: 'inline-block',
            width: '0.5em',
            height: '1em',
            background: 'var(--accent)',
            animation: 'blink 0.8s step-end infinite',
            verticalAlign: 'text-bottom',
            marginLeft: '1px',
          }} />
        )}
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>

      {generated.length > 0 && !isGenerating && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-ghost)', marginTop: 'var(--space-2)' }}>
          Generated {generated.length} tokens. Each required a full forward pass &mdash;
          this is the autoregressive loop from the course. Tokens are sampled from the full vocabulary distribution, not just the displayed top-K.
        </div>
      )}
    </div>
  );
}
