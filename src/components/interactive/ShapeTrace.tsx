import { useState, type CSSProperties } from 'react';

interface Step {
  label: string;
  description?: string;
  shape: number[];      // expected answer, e.g. [8, 2048]
  hint?: string;
}

interface Props {
  title?: string;
  steps: Step[];
}

const inputStyle: CSSProperties = {
  width: '3.5rem',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-sm)',
  textAlign: 'center',
  padding: '0.25rem 0.4rem',
  background: 'var(--surface-3)',
  border: '1px solid var(--ink-ghost)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--ink-primary)',
  outline: 'none',
};

const correctStyle: CSSProperties = {
  ...inputStyle,
  borderColor: 'var(--sem-ffn)',
  background: 'var(--surface-2)',
};

const wrongStyle: CSSProperties = {
  ...inputStyle,
  borderColor: 'var(--sem-attention)',
  background: 'var(--surface-2)',
};

export default function ShapeTrace({ title, steps }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const allFilled = steps.every((step, si) =>
    step.shape.every((_, di) => {
      const v = values[`${si}-${di}`];
      return v !== undefined && v.trim() !== '';
    })
  );

  const handleChange = (si: number, di: number, val: string) => {
    if (checked) return;
    const numeric = val.replace(/[^0-9]/g, '');
    setValues(prev => ({ ...prev, [`${si}-${di}`]: numeric }));
  };

  const handleCheck = () => {
    setChecked(true);
    setAttempts(prev => prev + 1);
  };

  const handleRetry = () => {
    setValues({});
    setChecked(false);
  };

  const isCorrect = (si: number, di: number): boolean => {
    const v = parseInt(values[`${si}-${di}`] || '', 10);
    return v === steps[si].shape[di];
  };

  const allCorrect = checked && steps.every((step, si) =>
    step.shape.every((_, di) => isCorrect(si, di))
  );

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--ink-ghost)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4) var(--space-5)',
      margin: 'var(--space-4) 0',
    }}>
      {title && (
        <div style={{
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-primary)',
          marginBottom: 'var(--space-3)',
        }}>
          {title}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {steps.map((step, si) => (
          <div key={si} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}>
            <div style={{
              minWidth: '14rem',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-secondary)',
            }}>
              {si > 0 && <span style={{ color: 'var(--ink-ghost)', marginRight: '0.5rem' }}>&rarr;</span>}
              {step.label}
              {step.description && (
                <span style={{ color: 'var(--ink-ghost)', marginLeft: '0.5rem' }}>
                  ({step.description})
                </span>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
            }}>
              <span style={{ color: 'var(--ink-ghost)' }}>[</span>
              {step.shape.map((expected, di) => (
                <span key={di} style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={values[`${si}-${di}`] || ''}
                    onChange={e => handleChange(si, di, e.target.value)}
                    placeholder="?"
                    disabled={checked}
                    style={
                      !checked
                        ? inputStyle
                        : isCorrect(si, di)
                          ? correctStyle
                          : wrongStyle
                    }
                  />
                  {di < step.shape.length - 1 && (
                    <span style={{ color: 'var(--ink-ghost)', margin: '0 0.1rem' }}>,</span>
                  )}
                </span>
              ))}
              <span style={{ color: 'var(--ink-ghost)' }}>]</span>
              {checked && !step.shape.every((_, di) => isCorrect(si, di)) && attempts >= 2 && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--sem-attention)',
                  marginLeft: 'var(--space-2)',
                }}>
                  expected [{step.shape.join(', ')}]
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!allFilled}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              padding: '0.4rem 1rem',
              background: allFilled ? 'var(--accent)' : 'var(--surface-3)',
              color: allFilled ? 'white' : 'var(--ink-ghost)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: allFilled ? 'pointer' : 'default',
            }}
          >
            Check
          </button>
        ) : (
          <>
            {allCorrect ? (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--sem-ffn)', fontWeight: 600 }}>
                All correct!
              </span>
            ) : (
              <>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--sem-attention)' }}>
                  {attempts >= 2
                    ? 'Some shapes are wrong — expected values are shown. Study them and retry.'
                    : 'Some shapes are wrong — the incorrect cells are highlighted. Think about the operation and try again.'}
                </span>
                <button
                  onClick={handleRetry}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    padding: '0.4rem 1rem',
                    background: 'var(--surface-3)',
                    color: 'var(--ink-secondary)',
                    border: '1px solid var(--ink-ghost)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
