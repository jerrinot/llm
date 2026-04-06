import type { TopKEntry } from './types';

interface Props {
  topK: TopKEntry[];
}

export function LogitsChart({ topK }: Props) {
  const maxLogit = Math.max(...topK.map(e => e.logit));
  const minLogit = Math.min(...topK.map(e => e.logit));
  const range = maxLogit - minLogit || 1;

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
        Stage 2: Raw Logits &mdash; Top {topK.length} next-token predictions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {topK.map((entry, i) => {
          const width = ((entry.logit - minLogit) / range) * 100;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-primary)',
                minWidth: '5rem',
                textAlign: 'right',
                whiteSpace: 'pre',
              }}>
                {JSON.stringify(entry.token)}
              </span>
              <div style={{
                flex: 1,
                height: '1rem',
                background: 'var(--surface-3)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.max(width, 1)}%`,
                  background: i === 0 ? 'var(--sem-token)' : 'var(--sem-attention)',
                  borderRadius: '2px',
                  transition: 'width 0.3s',
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--ink-ghost)',
                minWidth: '3rem',
                textAlign: 'right',
              }}>
                {entry.logit.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-ghost)', marginTop: 'var(--space-2)' }}>
        Raw logits are unbounded scores. The highest logit is the model's best guess. To convert to probabilities, we need softmax.
      </div>
    </div>
  );
}
