import { useState, useCallback, useRef, useEffect } from 'react';

interface Props {
  worker: {
    inputIds: number[] | null;
    isInferring: boolean;
    error: string | null;
    lastGeneratedToken: { token: string; id: number; runId: number } | null;
    generateStep: (inputIds: number[], temperature: number, runId: number) => void;
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
  const runIdRef = useRef(0);
  const stopRef = useRef(false);

  // When a generated token arrives, check runId and continue
  useEffect(() => {
    if (!isGenerating || worker.isInferring || !worker.lastGeneratedToken) return;

    // Ignore stale tokens from previous runs
    if (worker.lastGeneratedToken.runId !== runIdRef.current) return;

    // Check for stop or error
    if (stopRef.current || worker.error) {
      onGeneratingChange(false);
      stopRef.current = false;
      return;
    }

    const { token, id } = worker.lastGeneratedToken;
    setGenerated(prev => [...prev, { token, id }]);
    stepRef.current += 1;

    const newIds = [...currentIdsRef.current, id];
    currentIdsRef.current = newIds;

    if (stepRef.current >= maxTokens) {
      onGeneratingChange(false);
      return;
    }

    // Next step — worker serializes, so no race condition
    worker.generateStep(newIds, temperature, runIdRef.current);
  }, [worker.lastGeneratedToken, worker.isInferring, isGenerating]);

  const handleGenerate = useCallback(() => {
    if (!worker.inputIds) return;
    setGenerated([]);
    currentIdsRef.current = [...worker.inputIds];
    stepRef.current = 0;
    stopRef.current = false;
    runIdRef.current += 1; // New run ID invalidates any pending results
    onGeneratingChange(true);
    worker.generateStep([...worker.inputIds], temperature, runIdRef.current);
  }, [worker, temperature, onGeneratingChange]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
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
          type="range" min="1" max="30" value={maxTokens}
          onChange={e => setMaxTokens(parseInt(e.target.value))}
          disabled={isGenerating}
          style={{ width: '8rem', accentColor: 'var(--accent)' }}
        />
        {!isGenerating ? (
          <button
            onClick={handleGenerate}
            disabled={!worker.inputIds || worker.isInferring}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
              padding: 'var(--space-2) var(--space-4)',
              background: (!worker.inputIds || worker.isInferring) ? 'var(--surface-3)' : 'var(--accent)',
              color: (!worker.inputIds || worker.isInferring) ? 'var(--ink-ghost)' : 'white',
              border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: (!worker.inputIds || worker.isInferring) ? 'default' : 'pointer',
            }}
          >
            Generate
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--sem-attention)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}
          >
            Stop
          </button>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
        padding: 'var(--space-3)', background: 'var(--surface-3)',
        borderRadius: 'var(--radius-sm)', minHeight: '3rem',
        lineHeight: 1.6, color: 'var(--ink-primary)',
      }}>
        <span style={{ color: 'var(--ink-secondary)' }}>{initialText}</span>
        {generated.map((g, i) => (
          <span key={i} style={{ color: 'var(--sem-ffn)', borderBottom: '1px dotted var(--sem-ffn-dim)' }} title={`ID: ${g.id}`}>
            {g.token}
          </span>
        ))}
        {isGenerating && (
          <span style={{
            display: 'inline-block', width: '0.5em', height: '1em',
            background: 'var(--accent)', animation: 'blink 0.8s step-end infinite',
            verticalAlign: 'text-bottom', marginLeft: '1px',
          }} />
        )}
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>

      {generated.length > 0 && !isGenerating && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-ghost)', marginTop: 'var(--space-2)' }}>
          Generated {generated.length} tokens. Each required a full forward pass through the model &mdash;
          this is the autoregressive loop. Sampling uses the full vocabulary distribution with temperature {temperature.toFixed(2)}.
        </div>
      )}
    </div>
  );
}
