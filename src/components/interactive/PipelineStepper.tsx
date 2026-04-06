import { useState } from 'react';

const STEPS = [
  {
    id: 'text',
    label: 'Raw Text',
    description: 'A string of characters. This is what the user types.',
    example: '"The cat sat"',
    color: 'var(--ink-secondary)',
    detail: 'The model cannot process raw text directly. It must first be converted into numbers.',
  },
  {
    id: 'tokenize',
    label: 'Tokenizer',
    description: 'Splits text into token pieces and maps each to an integer ID.',
    example: '["The", " cat", " sat"] → [791, 2368, 3290]',
    color: 'var(--sem-token)',
    detail: 'Tokenization is a lookup, not a neural network operation. It happens before the model runs, and it is done once for the input text rather than once per generated token.',
  },
  {
    id: 'embed',
    label: 'Embedding',
    description: 'Each token ID is looked up in a table to get a dense vector.',
    example: '[791, 2368, 3290] → [[0.12, -0.34, ...], [0.56, 0.78, ...], [-0.11, 0.45, ...]]',
    color: 'var(--sem-token)',
    detail: 'Shape: [3, d_model]. Each token is now a vector of d_model numbers.',
  },
  {
    id: 'layers',
    label: 'Transformer Layers',
    description: 'Vectors pass through N identical layers. Each layer mixes token information (attention) and transforms each token independently (FFN).',
    example: 'Layer 0 → Layer 1 → ... → Layer N-1',
    color: 'var(--sem-attention)',
    detail: 'This is where the model "thinks." Hidden states are updated layer by layer.',
  },
  {
    id: 'logits',
    label: 'Output Head',
    description: 'The final hidden state is projected to produce one score per vocabulary entry.',
    example: 'hidden → [2.1, 0.8, 5.4, 1.2, -0.3, ...]  (|V| scores)',
    color: 'var(--sem-logits)',
    detail: 'These raw scores are called logits. Larger logit = more preferred token.',
  },
  {
    id: 'sample',
    label: 'Decode Policy',
    description: 'A decoding policy turns logits into an actual next token by argmax or sampling.',
    example: 'logits → softmax / sampler → " on" → append → repeat',
    color: 'var(--sem-logits)',
    detail: 'This stage is outside the transformer layers. The model produced logits; the runtime now chooses one token ID, appends it, and repeats the model evaluation for the next step.',
  },
];

export default function PipelineStepper() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="pipeline-stepper">
      <div className="ps-pipeline">
        {STEPS.map((step, i) => (
          <div key={step.id} className="ps-stage-wrapper">
            <button
              className={`ps-stage ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'past' : ''}`}
              onClick={() => setActiveStep(i)}
              style={{ '--stage-color': step.color } as React.CSSProperties}
            >
              <span className="ps-stage-num">{i + 1}</span>
              <span className="ps-stage-label">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`ps-connector ${i < activeStep ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      <div className="ps-detail" style={{ '--active-color': STEPS[activeStep].color } as React.CSSProperties}>
        <div className="ps-detail-header">
          <span className="ps-detail-num">{activeStep + 1}/{STEPS.length}</span>
          <h4 className="ps-detail-title">{STEPS[activeStep].label}</h4>
        </div>
        <p className="ps-detail-desc">{STEPS[activeStep].description}</p>
        <div className="ps-detail-example">
          <code>{STEPS[activeStep].example}</code>
        </div>
        <p className="ps-detail-note">{STEPS[activeStep].detail}</p>
      </div>

      <div className="ps-nav">
        <button
          className="ps-nav-btn"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          ← Back
        </button>
        <button
          className="ps-nav-btn"
          onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
          disabled={activeStep === STEPS.length - 1}
        >
          Next →
        </button>
      </div>

      <style>{`
        .pipeline-stepper {
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin: var(--space-4) 0;
        }
        .ps-pipeline {
          display: flex;
          align-items: center;
          overflow-x: auto;
          padding: var(--space-2) 0;
          margin-bottom: var(--space-5);
        }
        .ps-stage-wrapper {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .ps-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: var(--space-2) var(--space-3);
          background: none;
          border: 1.5px solid var(--surface-4);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          min-width: 72px;
        }
        .ps-stage:hover {
          border-color: var(--ink-ghost);
        }
        .ps-stage.active {
          border-color: var(--stage-color);
          background: color-mix(in srgb, var(--stage-color) 8%, transparent);
        }
        .ps-stage.past {
          border-color: var(--surface-4);
          opacity: 0.6;
        }
        .ps-stage-num {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-ghost);
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid currentColor;
        }
        .ps-stage.active .ps-stage-num {
          color: var(--stage-color);
          border-color: var(--stage-color);
        }
        .ps-stage-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.03em;
          color: var(--ink-tertiary);
          white-space: nowrap;
        }
        .ps-stage.active .ps-stage-label {
          color: var(--ink-primary);
        }
        .ps-connector {
          width: 20px;
          height: 1px;
          background: var(--surface-4);
          flex-shrink: 0;
        }
        .ps-connector.active {
          background: var(--ink-ghost);
        }
        .ps-detail {
          padding: var(--space-4);
          background: var(--surface-3);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--active-color);
        }
        .ps-detail-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }
        .ps-detail-num {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-ghost);
        }
        .ps-detail-title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          color: var(--ink-primary);
        }
        .ps-detail-desc {
          font-size: var(--text-sm);
          color: var(--ink-secondary);
          line-height: var(--leading-normal);
          margin-bottom: var(--space-3);
        }
        .ps-detail-example {
          background: var(--surface-0);
          border-radius: var(--radius-sm);
          padding: var(--space-2) var(--space-3);
          margin-bottom: var(--space-3);
          overflow-x: auto;
        }
        .ps-detail-example code {
          font-size: var(--text-xs);
          background: none;
          padding: 0;
          color: var(--ink-primary);
          white-space: pre;
        }
        .ps-detail-note {
          font-size: var(--text-sm);
          color: var(--ink-tertiary);
          font-style: italic;
          margin-bottom: 0;
        }
        .ps-nav {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-4);
        }
        .ps-nav-btn {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          padding: var(--space-1) var(--space-3);
          background: none;
          border: var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .ps-nav-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--ink-primary);
        }
        .ps-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
