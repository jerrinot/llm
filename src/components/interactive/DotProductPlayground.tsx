import { useMemo, useState } from 'react';

const DEFAULT_A = [2, 3, -1];
const DEFAULT_B = [4, -1, 2];

function parseOrZero(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function DotProductPlayground() {
  const [a, setA] = useState<string[]>(DEFAULT_A.map(String));
  const [b, setB] = useState<string[]>(DEFAULT_B.map(String));

  const numericA = useMemo(() => a.map(parseOrZero), [a]);
  const numericB = useMemo(() => b.map(parseOrZero), [b]);
  const products = useMemo(() => numericA.map((value, index) => value * numericB[index]), [numericA, numericB]);
  const sum = useMemo(() => products.reduce((acc, value) => acc + value, 0), [products]);

  const update = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string,
  ) => {
    setter(prev => prev.map((entry, i) => (i === index ? value : entry)));
  };

  return (
    <div className="dot-playground">
      <div className="dp-header">
        <div>
          <div className="dp-label">Dot Product Playground</div>
          <div className="dp-subtitle">Edit the vectors and watch each element contribute to the final score.</div>
        </div>
        <button
          type="button"
          className="dp-reset"
          onClick={() => {
            setA(DEFAULT_A.map(String));
            setB(DEFAULT_B.map(String));
          }}
        >
          reset
        </button>
      </div>

      <div className="dp-grid">
        <div className="dp-row">
          <span className="dp-vector-label">a</span>
          {a.map((value, index) => (
            <input
              key={`a-${index}`}
              type="number"
              step="0.1"
              value={value}
              onChange={event => update(setA, index, event.target.value)}
              className="dp-input"
            />
          ))}
        </div>

        <div className="dp-row">
          <span className="dp-vector-label">b</span>
          {b.map((value, index) => (
            <input
              key={`b-${index}`}
              type="number"
              step="0.1"
              value={value}
              onChange={event => update(setB, index, event.target.value)}
              className="dp-input"
            />
          ))}
        </div>

        <div className="dp-row">
          <span className="dp-vector-label">a·b</span>
          {products.map((value, index) => (
            <div key={`p-${index}`} className={`dp-product ${value >= 0 ? 'positive' : 'negative'}`}>
              {numericA[index]} × {numericB[index]} = <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="dp-summary">
        <div className="dp-sum-line">
          {products.map((value, index) => (
            <span key={`sum-${index}`}>
              {index > 0 ? ' + ' : ''}
              {value}
            </span>
          ))}
          <span className="dp-equals"> = </span>
          <strong>{sum}</strong>
        </div>
        <div className="dp-note">
          Same-sign pairs push the result up. Opposite-sign pairs push it down. Large magnitudes matter more than small ones.
        </div>
      </div>

      <style>{`
        .dot-playground {
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin: var(--space-4) 0;
        }
        .dp-header {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }
        .dp-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--ink-ghost);
        }
        .dp-subtitle {
          margin-top: var(--space-1);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
        .dp-reset {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ink-secondary);
          border: var(--border-default);
          background: var(--surface-3);
          border-radius: var(--radius-sm);
          padding: var(--space-2) var(--space-3);
          cursor: pointer;
        }
        .dp-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .dp-row {
          display: grid;
          grid-template-columns: 48px repeat(3, minmax(0, 1fr));
          gap: var(--space-2);
          align-items: center;
        }
        .dp-vector-label {
          font-family: var(--font-mono);
          color: var(--ink-tertiary);
          font-size: var(--text-sm);
        }
        .dp-input,
        .dp-product {
          min-width: 0;
          border-radius: var(--radius-sm);
          padding: var(--space-2) var(--space-3);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
        }
        .dp-input {
          border: var(--border-default);
          background: var(--surface-0);
          color: var(--ink-primary);
        }
        .dp-product {
          border: var(--border-default);
          background: var(--surface-3);
          color: var(--ink-secondary);
        }
        .dp-product.positive {
          border-color: rgba(91, 156, 245, 0.2);
        }
        .dp-product.negative {
          border-color: rgba(232, 91, 91, 0.2);
        }
        .dp-summary {
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: var(--border-subtle);
        }
        .dp-sum-line {
          font-family: var(--font-mono);
          font-size: var(--text-base);
          color: var(--ink-primary);
        }
        .dp-equals {
          color: var(--ink-ghost);
        }
        .dp-note {
          margin-top: var(--space-2);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
        @media (max-width: 720px) {
          .dp-row {
            grid-template-columns: 36px 1fr;
          }
          .dp-row > :nth-child(n + 3) {
            grid-column: 2;
          }
        }
      `}</style>
    </div>
  );
}
