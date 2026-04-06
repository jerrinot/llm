import { useMemo, useState } from 'react';

const DEFAULT_A = [
  [1, 2, 3],
  [4, 5, 6],
];

const DEFAULT_B = [
  [7, 8],
  [9, 10],
  [11, 12],
];

function parseOrZero(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MatrixMultiplyBuilder() {
  const [a, setA] = useState<string[][]>(DEFAULT_A.map(row => row.map(String)));
  const [b, setB] = useState<string[][]>(DEFAULT_B.map(row => row.map(String)));
  const [selected, setSelected] = useState<[number, number]>([0, 0]);

  const numericA = useMemo(() => a.map(row => row.map(parseOrZero)), [a]);
  const numericB = useMemo(() => b.map(row => row.map(parseOrZero)), [b]);
  const c = useMemo(
    () =>
      numericA.map(row =>
        numericB[0].map((_, colIndex) =>
          row.reduce((acc, value, k) => acc + value * numericB[k][colIndex], 0),
        ),
      ),
    [numericA, numericB],
  );

  const [rowIndex, colIndex] = selected;
  const terms = numericA[rowIndex].map((value, k) => ({
    left: value,
    right: numericB[k][colIndex],
    product: value * numericB[k][colIndex],
  }));
  const selectedValue = c[rowIndex][colIndex];

  const updateA = (row: number, col: number, value: string) => {
    setA(prev => prev.map((r, i) => (i === row ? r.map((entry, j) => (j === col ? value : entry)) : r)));
  };

  const updateB = (row: number, col: number, value: string) => {
    setB(prev => prev.map((r, i) => (i === row ? r.map((entry, j) => (j === col ? value : entry)) : r)));
  };

  return (
    <div className="mm-builder">
      <div className="mm-header">
        <div>
          <div className="mm-label">Matrix Multiply Builder</div>
          <div className="mm-subtitle">Edit the matrices. Pick one output cell and see exactly which row and column produced it.</div>
        </div>
      </div>

      <div className="mm-layout">
        <div className="mm-matrix">
          <div className="mm-matrix-title">A [2, 3]</div>
          <div className="mm-grid mm-a">
            {a.map((row, i) =>
              row.map((value, j) => (
                <input
                  key={`a-${i}-${j}`}
                  type="number"
                  step="1"
                  value={value}
                  className={`mm-cell ${i === rowIndex ? 'highlight-row' : ''}`}
                  onChange={event => updateA(i, j, event.target.value)}
                />
              )),
            )}
          </div>
        </div>

        <div className="mm-symbol">×</div>

        <div className="mm-matrix">
          <div className="mm-matrix-title">B [3, 2]</div>
          <div className="mm-grid mm-b">
            {b.map((row, i) =>
              row.map((value, j) => (
                <input
                  key={`b-${i}-${j}`}
                  type="number"
                  step="1"
                  value={value}
                  className={`mm-cell ${j === colIndex ? 'highlight-col' : ''}`}
                  onChange={event => updateB(i, j, event.target.value)}
                />
              )),
            )}
          </div>
        </div>

        <div className="mm-symbol">=</div>

        <div className="mm-matrix">
          <div className="mm-matrix-title">C [2, 2]</div>
          <div className="mm-grid mm-c">
            {c.map((row, i) =>
              row.map((value, j) => (
                <button
                  type="button"
                  key={`c-${i}-${j}`}
                  className={`mm-cell mm-output ${i === rowIndex && j === colIndex ? 'selected' : ''}`}
                  onClick={() => setSelected([i, j])}
                >
                  {value}
                </button>
              )),
            )}
          </div>
        </div>
      </div>

      <div className="mm-explain">
        <div className="mm-explain-title">Selected output: C[{rowIndex},{colIndex}]</div>
        <div className="mm-formula">
          {terms.map((term, index) => (
            <span key={`term-${index}`}>
              {index > 0 ? ' + ' : ''}
              {term.left}×{term.right}
            </span>
          ))}
          <span className="mm-equals"> = </span>
          <strong>{selectedValue}</strong>
        </div>
        <div className="mm-note">
          Row {rowIndex} of A interacts with column {colIndex} of B. Every output cell is one row-column dot product.
        </div>
      </div>

      <style>{`
        .mm-builder {
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin: var(--space-4) 0;
        }
        .mm-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--ink-ghost);
        }
        .mm-subtitle {
          margin-top: var(--space-1);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
        .mm-layout {
          margin-top: var(--space-4);
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
          gap: var(--space-4);
          align-items: start;
        }
        .mm-symbol {
          font-size: var(--text-2xl);
          color: var(--ink-ghost);
          align-self: center;
        }
        .mm-matrix-title {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ink-ghost);
          margin-bottom: var(--space-2);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
        }
        .mm-grid {
          display: grid;
          gap: 4px;
        }
        .mm-a {
          grid-template-columns: repeat(3, 48px);
        }
        .mm-b {
          grid-template-columns: repeat(2, 48px);
        }
        .mm-c {
          grid-template-columns: repeat(2, 56px);
        }
        .mm-cell {
          width: 100%;
          min-height: 42px;
          border: var(--border-default);
          border-radius: var(--radius-sm);
          background: var(--surface-0);
          color: var(--ink-primary);
          text-align: center;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
        }
        .mm-cell.highlight-row {
          border-color: rgba(91, 156, 245, 0.35);
          background: rgba(91, 156, 245, 0.06);
        }
        .mm-cell.highlight-col {
          border-color: rgba(245, 170, 91, 0.35);
          background: rgba(245, 170, 91, 0.06);
        }
        .mm-output {
          cursor: pointer;
          background: var(--surface-3);
        }
        .mm-output.selected {
          border-color: var(--accent);
          background: var(--accent-muted);
          color: var(--ink-primary);
          box-shadow: 0 0 0 1px var(--accent);
        }
        .mm-explain {
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: var(--border-subtle);
        }
        .mm-explain-title {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ink-ghost);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
        }
        .mm-formula {
          margin-top: var(--space-2);
          font-family: var(--font-mono);
          font-size: var(--text-base);
          color: var(--ink-primary);
        }
        .mm-equals {
          color: var(--ink-ghost);
        }
        .mm-note {
          margin-top: var(--space-2);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
        @media (max-width: 860px) {
          .mm-layout {
            grid-template-columns: 1fr;
          }
          .mm-symbol {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
