import { useState, useMemo } from 'react';

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

const TOKENS = ['The', 'cat', 'sat'];

const DEFAULT_Q = [
  [1.0, 0.5],
  [0.3, 1.2],
  [0.8, 0.9],
];
const DEFAULT_K = [
  [0.9, 0.4],
  [0.5, 1.1],
  [0.7, 0.8],
];
const DEFAULT_V = [
  [1.0, 0.0],
  [0.0, 1.0],
  [0.5, 0.5],
];

function matMulVec(row: number[], cols: number[][]): number[] {
  return cols[0].map((_, j) => row.reduce((sum, r, i) => sum + r * cols[i][j], 0));
}

export default function AttentionSimulator() {
  const [causalMask, setCausalMask] = useState(true);
  const [selectedToken, setSelectedToken] = useState(2);

  const scores = useMemo(() => {
    return DEFAULT_Q.map(q =>
      DEFAULT_K.map(k =>
        q.reduce((sum, qi, i) => sum + qi * k[i], 0)
      )
    );
  }, []);

  const maskedScores = useMemo(() => {
    return scores.map((row, i) =>
      row.map((s, j) => (causalMask && j > i ? -Infinity : s))
    );
  }, [scores, causalMask]);

  const weights = useMemo(() => {
    return maskedScores.map(row => {
      const valid = row.filter(v => v !== -Infinity);
      if (valid.length === 0) return row.map(() => 0);
      return softmax(row.map(v => (v === -Infinity ? -1e9 : v)));
    });
  }, [maskedScores]);

  const outputs = useMemo(() => {
    return weights.map(w =>
      DEFAULT_V[0].map((_, d) =>
        w.reduce((sum, wi, i) => sum + wi * DEFAULT_V[i][d], 0)
      )
    );
  }, [weights]);

  const fmt = (n: number) => {
    if (n === -Infinity) return '-∞';
    return n.toFixed(2);
  };

  return (
    <div className="attn-sim">
      <div className="attn-controls">
        <label className="attn-toggle">
          <input
            type="checkbox"
            checked={causalMask}
            onChange={e => setCausalMask(e.target.checked)}
          />
          <span className="attn-toggle-label">Causal mask</span>
        </label>
        <div className="attn-token-select">
          <span className="attn-label">Focus token:</span>
          {TOKENS.map((t, i) => (
            <button
              key={i}
              className={`attn-token-btn ${i === selectedToken ? 'active' : ''}`}
              onClick={() => setSelectedToken(i)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="attn-matrices">
        {/* Score matrix */}
        <div className="attn-matrix-block">
          <div className="attn-matrix-title">
            Scores (Q &middot; K<sup>T</sup>)
          </div>
          <table className="attn-table">
            <thead>
              <tr>
                <th></th>
                {TOKENS.map((t, j) => <th key={j}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((t, i) => (
                <tr key={i} className={i === selectedToken ? 'highlight-row' : ''}>
                  <th>{t}</th>
                  {maskedScores[i].map((s, j) => (
                    <td
                      key={j}
                      className={`${s === -Infinity ? 'masked' : ''} ${i === selectedToken ? 'in-focus' : ''}`}
                    >
                      {fmt(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="attn-arrow">softmax &rarr;</div>

        {/* Weights matrix */}
        <div className="attn-matrix-block">
          <div className="attn-matrix-title">Attention Weights</div>
          <table className="attn-table">
            <thead>
              <tr>
                <th></th>
                {TOKENS.map((t, j) => <th key={j}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((t, i) => (
                <tr key={i} className={i === selectedToken ? 'highlight-row' : ''}>
                  <th>{t}</th>
                  {weights[i].map((w, j) => (
                    <td
                      key={j}
                      className={i === selectedToken ? 'in-focus' : ''}
                      style={{
                        background: `rgba(232, 148, 74, ${w * 0.4})`,
                      }}
                    >
                      {w.toFixed(3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Output for selected token */}
      <div className="attn-output">
        <div className="attn-matrix-title">
          Output for "{TOKENS[selectedToken]}" (weighted V sum)
        </div>
        <div className="attn-output-calc">
          {weights[selectedToken].map((w, i) => (
            <span key={i} className="attn-calc-term">
              <span className="attn-calc-weight">{w.toFixed(3)}</span>
              <span className="attn-calc-times">&times;</span>
              <span className="attn-calc-v">[{DEFAULT_V[i].join(', ')}]</span>
              {i < weights[selectedToken].length - 1 && <span className="attn-calc-plus">+</span>}
            </span>
          ))}
          <span className="attn-calc-equals">=</span>
          <span className="attn-calc-result">[{outputs[selectedToken].map(v => v.toFixed(3)).join(', ')}]</span>
        </div>
      </div>

      <style>{`
        .attn-sim {
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin: var(--space-4) 0;
        }
        .attn-controls {
          display: flex;
          align-items: center;
          gap: var(--space-6);
          margin-bottom: var(--space-5);
          flex-wrap: wrap;
        }
        .attn-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
        .attn-toggle input {
          accent-color: var(--accent);
        }
        .attn-token-select {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .attn-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ink-ghost);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .attn-token-btn {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          padding: 2px 10px;
          background: var(--surface-3);
          border: 1px solid var(--surface-4);
          border-radius: var(--radius-sm);
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .attn-token-btn.active {
          border-color: var(--sem-attention);
          background: var(--sem-attention-bg);
          color: var(--sem-attention);
        }
        .attn-matrices {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          overflow-x: auto;
          margin-bottom: var(--space-5);
        }
        .attn-matrix-block {
          flex-shrink: 0;
        }
        .attn-matrix-title {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: 0.04em;
          color: var(--ink-ghost);
          text-transform: uppercase;
          margin-bottom: var(--space-2);
        }
        .attn-table {
          border-collapse: collapse;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
        }
        .attn-table th {
          padding: 6px 10px;
          font-weight: 400;
          color: var(--ink-ghost);
          text-align: center;
        }
        .attn-table td {
          padding: 6px 10px;
          text-align: center;
          color: var(--ink-secondary);
          border: 1px solid var(--surface-4);
          transition: background var(--duration-fast);
        }
        .attn-table td.masked {
          color: var(--ink-ghost);
          background: rgba(232, 91, 91, 0.06);
        }
        .attn-table tr.highlight-row td {
          border-color: var(--sem-attention-dim);
        }
        .attn-table td.in-focus {
          color: var(--ink-primary);
        }
        .attn-arrow {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--accent);
          flex-shrink: 0;
          white-space: nowrap;
        }
        .attn-output {
          background: var(--surface-3);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }
        .attn-output-calc {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ink-secondary);
        }
        .attn-calc-term {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .attn-calc-weight {
          color: var(--sem-attention);
          font-weight: 600;
        }
        .attn-calc-times { color: var(--ink-ghost); }
        .attn-calc-v { color: var(--ink-secondary); }
        .attn-calc-plus { color: var(--ink-ghost); margin: 0 2px; }
        .attn-calc-equals {
          color: var(--ink-ghost);
          margin: 0 6px;
          font-size: var(--text-sm);
        }
        .attn-calc-result {
          color: var(--sem-ffn);
          font-weight: 600;
          font-size: var(--text-sm);
        }
      `}</style>
    </div>
  );
}
