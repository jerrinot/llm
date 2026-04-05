import { useState } from 'react';

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

const DEFAULT_LOGITS = [2.1, 0.8, 5.4, 1.2, -0.3];
const TOKEN_LABELS = ['"the"', '"a"', '"cat"', '"dog"', '"."'];

export default function SoftmaxInspector() {
  const [logits, setLogits] = useState<number[]>(DEFAULT_LOGITS);
  const [temperature, setTemperature] = useState(1.0);

  const scaledLogits = logits.map(l => l / temperature);
  const probs = softmax(scaledLogits);
  const maxProb = Math.max(...probs);
  const argmaxIdx = probs.indexOf(maxProb);

  const updateLogit = (idx: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setLogits(prev => prev.map((l, i) => i === idx ? num : l));
  };

  return (
    <div className="softmax-inspector">
      <div className="si-controls">
        <div className="si-logit-inputs">
          <div className="si-label">Logits (raw scores)</div>
          <div className="si-input-row">
            {logits.map((l, i) => (
              <div key={i} className="si-input-cell">
                <span className="si-token-label">{TOKEN_LABELS[i]}</span>
                <input
                  type="number"
                  step="0.1"
                  className="si-logit-input"
                  value={l}
                  onChange={e => updateLogit(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="si-temp-control">
          <div className="si-label">
            Temperature: <span className="si-temp-value">{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="si-temp-slider"
          />
          <div className="si-temp-labels">
            <span>sharp</span>
            <span>uniform</span>
          </div>
        </div>
      </div>

      <div className="si-viz">
        <div className="si-chart-pair">
          <div className="si-chart">
            <div className="si-chart-label">Logits</div>
            <div className="si-bars">
              {scaledLogits.map((l, i) => {
                const maxL = Math.max(...scaledLogits.map(Math.abs));
                const height = maxL > 0 ? (Math.abs(l) / maxL) * 100 : 0;
                const isNeg = l < 0;
                return (
                  <div key={i} className="si-bar-col">
                    <div className="si-bar-track">
                      <div
                        className={`si-bar logit ${isNeg ? 'negative' : ''}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="si-bar-value">{l.toFixed(1)}</span>
                    <span className="si-bar-label">{TOKEN_LABELS[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="si-arrow">
            <span>softmax</span>
            <svg width="32" height="16" viewBox="0 0 32 16">
              <path d="M0 8H28M28 8L22 2M28 8L22 14" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>

          <div className="si-chart">
            <div className="si-chart-label">Probabilities</div>
            <div className="si-bars">
              {probs.map((p, i) => (
                <div key={i} className="si-bar-col">
                  <div className="si-bar-track">
                    <div
                      className={`si-bar prob ${i === argmaxIdx ? 'argmax' : ''}`}
                      style={{ height: `${p * 100}%` }}
                    />
                  </div>
                  <span className="si-bar-value">{(p * 100).toFixed(1)}%</span>
                  <span className="si-bar-label">{TOKEN_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="si-summary">
          <span className="si-summary-item">
            argmax → <strong style={{ color: 'var(--sem-logits)' }}>{TOKEN_LABELS[argmaxIdx]}</strong>
            ({(probs[argmaxIdx] * 100).toFixed(1)}%)
          </span>
          <span className="si-summary-item">
            sum → {probs.reduce((a, b) => a + b, 0).toFixed(4)}
          </span>
        </div>
      </div>

      <style>{`
        .softmax-inspector {
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin: var(--space-4) 0;
        }
        .si-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--ink-ghost);
          margin-bottom: var(--space-2);
        }
        .si-input-row {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .si-input-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .si-token-label {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-tertiary);
        }
        .si-logit-input {
          width: 60px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: var(--space-1) var(--space-2);
          background: var(--surface-0);
          border: var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--ink-primary);
          text-align: center;
          outline: none;
        }
        .si-logit-input:focus { border-color: var(--sem-logits); }
        .si-temp-control {
          margin-top: var(--space-4);
        }
        .si-temp-value {
          color: var(--accent);
          font-weight: 600;
        }
        .si-temp-slider {
          width: 100%;
          max-width: 200px;
          accent-color: var(--accent);
          margin-top: var(--space-1);
        }
        .si-temp-labels {
          display: flex;
          justify-content: space-between;
          max-width: 200px;
          font-size: 10px;
          color: var(--ink-ghost);
        }
        .si-viz {
          margin-top: var(--space-5);
        }
        .si-chart-pair {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .si-chart {
          flex: 1;
        }
        .si-chart-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--ink-ghost);
          margin-bottom: var(--space-3);
          text-align: center;
        }
        .si-bars {
          display: flex;
          gap: var(--space-2);
          justify-content: center;
          align-items: flex-end;
          height: 120px;
        }
        .si-bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
          max-width: 48px;
        }
        .si-bar-track {
          width: 100%;
          height: 80px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .si-bar {
          width: 100%;
          border-radius: 2px 2px 0 0;
          transition: height 0.3s var(--ease-out);
          min-height: 2px;
        }
        .si-bar.logit {
          background: var(--sem-logits);
          opacity: 0.7;
        }
        .si-bar.logit.negative {
          background: var(--sem-router);
          opacity: 0.5;
        }
        .si-bar.prob {
          background: var(--sem-token);
          opacity: 0.7;
        }
        .si-bar.prob.argmax {
          background: var(--sem-token);
          opacity: 1;
          box-shadow: 0 0 8px rgba(91, 156, 245, 0.3);
        }
        .si-bar-value {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-tertiary);
        }
        .si-bar-label {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--ink-ghost);
          white-space: nowrap;
        }
        .si-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          flex-shrink: 0;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--accent);
        }
        .si-summary {
          display: flex;
          gap: var(--space-6);
          justify-content: center;
          margin-top: var(--space-4);
          padding-top: var(--space-3);
          border-top: var(--border-subtle);
        }
        .si-summary-item {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
      `}</style>
    </div>
  );
}
