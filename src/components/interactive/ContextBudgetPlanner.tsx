import { useState } from 'react';

const PRESETS = [
  { label: 'Short chat', contextLength: 4096, promptTokens: 700, requestedOutput: 400 },
  { label: 'RAG answer', contextLength: 8192, promptTokens: 6200, requestedOutput: 800 },
  { label: 'Long code review', contextLength: 32768, promptTokens: 24000, requestedOutput: 2000 },
];

export default function ContextBudgetPlanner() {
  const [contextLength, setContextLength] = useState(8192);
  const [promptTokens, setPromptTokens] = useState(6200);
  const [requestedOutput, setRequestedOutput] = useState(800);

  const remainingBudget = Math.max(0, contextLength - promptTokens);
  const actualOutput = Math.min(requestedOutput, remainingBudget);
  const overflow = Math.max(0, requestedOutput - remainingBudget);
  const promptPct = Math.min(100, (promptTokens / contextLength) * 100);
  const outputPct = Math.min(100 - promptPct, (actualOutput / contextLength) * 100);
  const overflowPct = Math.min(100 - promptPct - outputPct, (overflow / contextLength) * 100);

  return (
    <div className="budget-planner">
      <div className="cbp-header">
        <div>
          <div className="cbp-label">Try a scenario</div>
          <div className="cbp-presets">
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                className="cbp-preset-btn"
                onClick={() => {
                  setContextLength(preset.contextLength);
                  setPromptTokens(preset.promptTokens);
                  setRequestedOutput(preset.requestedOutput);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <div className={`cbp-status ${overflow > 0 ? 'overflow' : 'fit'}`}>
          {overflow > 0 ? 'Request does not fit' : 'Request fits'}
        </div>
      </div>

      <div className="cbp-grid">
        <label className="cbp-control">
          <span>Context length</span>
          <input
            type="number"
            min={128}
            step={128}
            value={contextLength}
            onChange={e => setContextLength(Math.max(128, Number(e.target.value) || 128))}
          />
        </label>
        <label className="cbp-control">
          <span>Prompt tokens</span>
          <input
            type="number"
            min={0}
            max={contextLength}
            value={promptTokens}
            onChange={e => setPromptTokens(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
        <label className="cbp-control">
          <span>Requested output tokens</span>
          <input
            type="number"
            min={0}
            value={requestedOutput}
            onChange={e => setRequestedOutput(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
      </div>

      <div className="cbp-bar-shell" aria-label="Context budget bar">
        <div className="cbp-bar">
          <div className="cbp-segment prompt" style={{ width: `${promptPct}%` }}>
            {promptPct > 12 ? 'prompt' : ''}
          </div>
          <div className="cbp-segment output" style={{ width: `${outputPct}%` }}>
            {outputPct > 12 ? 'output' : ''}
          </div>
          {overflow > 0 && (
            <div className="cbp-segment overflow" style={{ width: `${overflowPct}%` }}>
              {overflowPct > 12 ? 'overflow' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="cbp-stats">
        <div className="cbp-stat">
          <span className="cbp-stat-value">{remainingBudget}</span>
          <span className="cbp-stat-label">tokens left after prompt</span>
        </div>
        <div className="cbp-stat">
          <span className="cbp-stat-value">{actualOutput}</span>
          <span className="cbp-stat-label">tokens the model can actually generate</span>
        </div>
        <div className="cbp-stat">
          <span className="cbp-stat-value">{overflow}</span>
          <span className="cbp-stat-label">tokens that do not fit</span>
        </div>
      </div>

      <div className="cbp-explainer-grid">
        <div className="cbp-note">
          <strong>Prefill cost:</strong> all {promptTokens.toLocaleString()} prompt tokens must be processed before generation starts.
          Longer prompts delay the first output token even if you only want a short answer.
        </div>
        <div className="cbp-note">
          <strong>Generation budget:</strong> the requested answer is capped by the remaining {remainingBudget.toLocaleString()} tokens.
          If you ask for more, the runtime must truncate, reject, or evict earlier context.
        </div>
      </div>

      <style>{`
        .budget-planner {
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin: var(--space-4) 0;
        }
        .cbp-header {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }
        .cbp-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--ink-ghost);
          margin-bottom: var(--space-2);
        }
        .cbp-presets {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .cbp-preset-btn {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.04em;
          padding: var(--space-1) var(--space-2);
          background: var(--surface-3);
          border: var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
        }
        .cbp-preset-btn:hover {
          border-color: var(--accent);
          color: var(--ink-primary);
        }
        .cbp-status {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: var(--space-1) var(--space-3);
          border-radius: 999px;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .cbp-status.fit {
          color: var(--state-success);
          background: rgba(92, 201, 142, 0.12);
          border-color: rgba(92, 201, 142, 0.25);
        }
        .cbp-status.overflow {
          color: var(--state-error);
          background: rgba(232, 91, 91, 0.12);
          border-color: rgba(232, 91, 91, 0.25);
        }
        .cbp-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-3);
        }
        .cbp-control {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
        .cbp-control span {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink-ghost);
        }
        .cbp-control input {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: var(--space-2) var(--space-3);
          background: var(--surface-0);
          border: var(--border-default);
          border-radius: var(--radius-md);
          color: var(--ink-primary);
        }
        .cbp-bar-shell {
          margin: var(--space-5) 0 var(--space-4);
          padding: var(--space-3);
          background: var(--surface-3);
          border-radius: var(--radius-md);
        }
        .cbp-bar {
          display: flex;
          width: 100%;
          min-height: 40px;
          background: var(--surface-0);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .cbp-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          min-width: 0;
        }
        .cbp-segment.prompt {
          background: color-mix(in srgb, var(--sem-token) 18%, transparent);
          color: var(--sem-token);
        }
        .cbp-segment.output {
          background: color-mix(in srgb, var(--sem-logits) 18%, transparent);
          color: var(--sem-logits);
        }
        .cbp-segment.overflow {
          background: repeating-linear-gradient(
            -45deg,
            rgba(232, 91, 91, 0.18),
            rgba(232, 91, 91, 0.18) 8px,
            rgba(232, 91, 91, 0.28) 8px,
            rgba(232, 91, 91, 0.28) 16px
          );
          color: var(--state-error);
        }
        .cbp-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }
        .cbp-stat {
          background: var(--surface-3);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cbp-stat-value {
          font-family: var(--font-mono);
          font-size: var(--text-xl);
          color: var(--ink-primary);
        }
        .cbp-stat-label {
          font-size: var(--text-xs);
          color: var(--ink-tertiary);
        }
        .cbp-explainer-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-3);
        }
        .cbp-note {
          padding: var(--space-3) var(--space-4);
          background: var(--surface-3);
          border-left: 3px solid var(--accent);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
          line-height: var(--leading-normal);
        }
        @media (max-width: 840px) {
          .cbp-header,
          .cbp-grid,
          .cbp-stats,
          .cbp-explainer-grid {
            grid-template-columns: 1fr;
            display: grid;
          }
          .cbp-header {
            display: grid;
          }
          .cbp-status {
            justify-self: start;
          }
        }
      `}</style>
    </div>
  );
}
