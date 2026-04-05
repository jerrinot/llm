import { useState, type ReactNode } from 'react';

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface GateQuestion {
  id: string;
  type: 'single_choice' | 'numeric';
  prompt: string;
  choices?: Choice[];
  correctAnswer?: string;
  explanation: string;
  tag: 'conceptual' | 'shape' | 'math';
}

interface Props {
  lessonId: string;
  gateStrength: 'soft' | 'hard';
  questions: GateQuestion[];
  children?: ReactNode;
}

export default function GatePanel({ lessonId, gateStrength, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  const allCorrect = questions.every(q => {
    if (q.type === 'single_choice') {
      return q.choices?.find(c => c.id === answers[q.id])?.isCorrect;
    }
    return answers[q.id]?.trim().toLowerCase() === q.correctAnswer?.toLowerCase();
  });

  const handleSubmit = () => {
    setSubmitted(true);
    const exps: Record<string, boolean> = {};
    questions.forEach(q => { exps[q.id] = true; });
    setShowExplanations(exps);

    if (allCorrect || gateStrength === 'soft') {
      setTimeout(() => {
        const gatePass = (window as any).__gatePass;
        if (typeof gatePass === 'function') gatePass();
      }, 800);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setAnswers({});
    setShowExplanations({});
  };

  const canSubmit = questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');

  return (
    <div className="gate-panel">
      <div className="gate-panel-title">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 6 }}>
          <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
        </svg>
        Check Yourself
        <span className="gate-strength-tag">{gateStrength}</span>
      </div>

      {questions.map((q, i) => (
        <div key={q.id} className={`gate-question ${submitted ? (isCorrect(q, answers[q.id]) ? 'correct' : 'incorrect') : ''}`}>
          <div className="gate-question-meta">
            <span className="gate-tag">{q.tag}</span>
            <span className="gate-number">Q{i + 1}</span>
          </div>
          <p className="gate-prompt">{q.prompt}</p>

          {q.type === 'single_choice' && q.choices && (
            <div className="gate-choices">
              {q.choices.map(c => (
                <label
                  key={c.id}
                  className={`gate-choice ${answers[q.id] === c.id ? 'selected' : ''} ${submitted ? (c.isCorrect ? 'is-correct' : answers[q.id] === c.id ? 'is-wrong' : '') : ''}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={c.id}
                    checked={answers[q.id] === c.id}
                    onChange={() => !submitted && setAnswers(a => ({ ...a, [q.id]: c.id }))}
                    disabled={submitted}
                  />
                  <span className="gate-choice-radio" />
                  <span className="gate-choice-text">{c.text}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'numeric' && (
            <input
              type="text"
              className="gate-numeric-input"
              value={answers[q.id] || ''}
              onChange={e => !submitted && setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              disabled={submitted}
              placeholder="Your answer"
            />
          )}

          {submitted && showExplanations[q.id] && (
            <div className={`gate-explanation ${isCorrect(q, answers[q.id]) ? 'correct' : 'incorrect'}`}>
              <span className="gate-result-icon">
                {isCorrect(q, answers[q.id]) ? '✓' : '✗'}
              </span>
              {q.explanation}
            </div>
          )}
        </div>
      ))}

      <div className="gate-actions">
        {!submitted ? (
          <button
            className="gate-submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Check Answers
          </button>
        ) : allCorrect ? (
          <div className="gate-passed">
            <span className="gate-passed-icon">&#x2713;</span>
            Gate passed — continue to next lesson
          </div>
        ) : gateStrength === 'soft' ? (
          <div className="gate-soft-pass">
            Review the explanations above. You may continue.
          </div>
        ) : (
          <button className="gate-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        )}
      </div>

      <style>{`
        .gate-panel {
          background: var(--surface-2);
          border: var(--border-strong);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin: var(--space-8) 0;
        }
        .gate-panel-title {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: var(--space-6);
          display: flex;
          align-items: center;
        }
        .gate-strength-tag {
          margin-left: auto;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          background: var(--surface-4);
          color: var(--ink-tertiary);
          text-transform: uppercase;
        }
        .gate-question {
          padding: var(--space-4) 0;
          border-bottom: var(--border-subtle);
        }
        .gate-question:last-of-type {
          border-bottom: none;
        }
        .gate-question.correct {
          border-left: 3px solid var(--state-success);
          padding-left: var(--space-4);
        }
        .gate-question.incorrect {
          border-left: 3px solid var(--state-error);
          padding-left: var(--space-4);
        }
        .gate-question-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }
        .gate-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink-ghost);
          background: var(--surface-4);
          padding: 1px 6px;
          border-radius: var(--radius-sm);
        }
        .gate-number {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-ghost);
        }
        .gate-prompt {
          font-size: var(--text-base);
          color: var(--ink-primary);
          margin-bottom: var(--space-3);
          line-height: var(--leading-normal);
        }
        .gate-choices {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .gate-choice {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--surface-4);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
        }
        .gate-choice:hover:not([class*="is-"]) {
          border-color: var(--ink-ghost);
          background: rgba(255,255,255,0.02);
        }
        .gate-choice.selected {
          border-color: var(--accent);
          background: var(--accent-muted);
          color: var(--ink-primary);
        }
        .gate-choice.is-correct {
          border-color: var(--state-success);
          background: rgba(92,201,142,0.08);
        }
        .gate-choice.is-wrong {
          border-color: var(--state-error);
          background: rgba(232,91,91,0.08);
        }
        .gate-choice input { display: none; }
        .gate-choice-radio {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1.5px solid var(--ink-ghost);
          flex-shrink: 0;
          margin-top: 2px;
          transition: all var(--duration-fast);
          position: relative;
        }
        .gate-choice.selected .gate-choice-radio {
          border-color: var(--accent);
        }
        .gate-choice.selected .gate-choice-radio::after {
          content: '';
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: var(--accent);
        }
        .gate-choice.is-correct .gate-choice-radio {
          border-color: var(--state-success);
        }
        .gate-choice.is-correct .gate-choice-radio::after {
          background: var(--state-success);
        }
        .gate-numeric-input {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: var(--space-2) var(--space-3);
          background: var(--surface-3);
          border: var(--border-default);
          border-radius: var(--radius-md);
          color: var(--ink-primary);
          width: 100%;
          max-width: 200px;
          outline: none;
        }
        .gate-numeric-input:focus {
          border-color: var(--accent);
        }
        .gate-explanation {
          margin-top: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          line-height: var(--leading-normal);
          color: var(--ink-secondary);
        }
        .gate-explanation.correct {
          background: rgba(92,201,142,0.06);
          border: 1px solid rgba(92,201,142,0.15);
        }
        .gate-explanation.incorrect {
          background: rgba(232,91,91,0.06);
          border: 1px solid rgba(232,91,91,0.15);
        }
        .gate-result-icon {
          font-weight: 600;
          margin-right: var(--space-2);
        }
        .gate-explanation.correct .gate-result-icon { color: var(--state-success); }
        .gate-explanation.incorrect .gate-result-icon { color: var(--state-error); }
        .gate-actions {
          margin-top: var(--space-5);
          display: flex;
          align-items: center;
        }
        .gate-submit-btn, .gate-retry-btn {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: var(--space-2) var(--space-5);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
        }
        .gate-submit-btn {
          background: var(--accent);
          color: var(--ink-inverse);
        }
        .gate-submit-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .gate-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .gate-retry-btn {
          background: var(--surface-4);
          color: var(--ink-primary);
          border: var(--border-default);
        }
        .gate-retry-btn:hover {
          border-color: var(--accent);
        }
        .gate-passed {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--state-success);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .gate-passed-icon {
          font-size: var(--text-lg);
        }
        .gate-soft-pass {
          font-size: var(--text-sm);
          color: var(--ink-secondary);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

function isCorrect(q: GateQuestion, answer: string | undefined): boolean {
  if (!answer) return false;
  if (q.type === 'single_choice') {
    return q.choices?.find(c => c.id === answer)?.isCorrect ?? false;
  }
  return answer.trim().toLowerCase() === q.correctAnswer?.toLowerCase();
}
