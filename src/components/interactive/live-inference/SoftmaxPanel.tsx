import type { TopKEntry } from './types';

function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map(l => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

interface Props {
  topK: TopKEntry[];
  temperature: number;
  onTemperatureChange: (t: number) => void;
}

export function SoftmaxPanel({ topK, temperature, onTemperatureChange }: Props) {
  const logits = topK.map(e => e.logit);
  const probs = softmax(logits, temperature);

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
        Stage 3: Softmax with Temperature
      </div>

      {/* Temperature slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)' }}>
          T = {temperature.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.1"
          max="3.0"
          step="0.05"
          value={temperature}
          onChange={e => onTemperatureChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {[0.3, 1.0, 2.0].map(t => (
            <button
              key={t}
              onClick={() => onTemperatureChange(t)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                padding: '0.15rem 0.4rem',
                background: Math.abs(temperature - t) < 0.01 ? 'var(--accent)' : 'var(--surface-3)',
                color: Math.abs(temperature - t) < 0.01 ? 'white' : 'var(--ink-ghost)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Probability bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {topK.map((entry, i) => (
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
                width: `${probs[i] * 100}%`,
                background: i === 0 ? 'var(--sem-ffn)' : 'var(--sem-kvcache)',
                borderRadius: '2px',
                transition: 'width 0.15s',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--ink-ghost)',
              minWidth: '3.5rem',
              textAlign: 'right',
            }}>
              {(probs[i] * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-ghost)', marginTop: 'var(--space-2)' }}>
        {temperature < 0.5
          ? 'Low temperature: distribution is sharp — the top token dominates.'
          : temperature > 1.5
            ? 'High temperature: distribution is flat — many tokens have similar probability.'
            : 'Default temperature: a moderate distribution across likely tokens.'}
        {' '}Drag the slider to see how temperature reshapes the probability distribution.
      </div>
    </div>
  );
}
