import { useState, useCallback, useRef, useEffect } from 'react';
import type { TopKEntry } from './types';

function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map(l => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function sampleFromProbs(topK: TopKEntry[], probs: number[]): TopKEntry {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (r < cumulative) return topK[i];
  }
  return topK[topK.length - 1];
}

interface Props {
  worker: {
    topK: TopKEntry[] | null;
    logits: number[] | null;
    inputIds: number[] | null;
    isInferring: boolean;
    runForward: (ids: number[]) => void;
  };
  initialText: string;
  temperature: number;
}

export function GenerationLoop({ worker, initialText, temperature }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<Array<{ token: string; id: number }>>([]);
  const [currentIds, setCurrentIds] = useState<number[] | null>(null);
  const [maxTokens, setMaxTokens] = useState(10);
  const stopRef = useRef(false);
  const stepRef = useRef(0);

  // Generation step: when logits arrive during generation, sample and continue
  useEffect(() => {
    if (!isGenerating || worker.isInferring || !worker.topK || !worker.logits) return;

    const logitsForTopK = worker.topK.map(e => e.logit);
    const probs = softmax(logitsForTopK, temperature);
    const chosen = sampleFromProbs(worker.topK, probs);

    setGenerated(prev => [...prev, { token: chosen.token, id: chosen.id }]);
    stepRef.current += 1;

    const newIds = [...(currentIds || []), chosen.id];
    setCurrentIds(newIds);

    if (stepRef.current >= maxTokens || stopRef.current) {
      setIsGenerating(false);
      stopRef.current = false;
      return;
    }

    // Next step
    setTimeout(() => worker.runForward(newIds), 50);
  }, [worker.topK, worker.isInferring, isGenerating]);

  const handleGenerate = useCallback(() => {
    if (!worker.inputIds) return;
    setGenerated([]);
    setCurrentIds([...worker.inputIds]);
    stepRef.current = 0;
    stopRef.current = false;
    setIsGenerating(true);
    worker.runForward([...worker.inputIds]);
  }, [worker]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
  }, []);

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

      {/* Output */}
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
          Generated {generated.length} tokens. Each token required a full forward pass through the model &mdash;
          this is the autoregressive loop you studied in the course.
        </div>
      )}
    </div>
  );
}
