import { useState } from 'react';

interface Suggestion {
  label: string;
  value: string;
}

interface Props {
  initialInput?: string;
  suggestions?: Suggestion[];
}

// Simple BPE-like tokenizer simulation for teaching purposes
const VOCAB = new Map<string, number>([
  ['The', 791], [' cat', 2368], [' sat', 3290], [' on', 373], [' the', 279],
  [' mat', 1744], ['.', 13], ['Hello', 9906], [' world', 1917], ['!', 0],
  [',', 11], [':', 25], [';', 26], ['(', 320], [')', 321], ['{', 517], ['}', 518],
  ['=', 28], ['==', 452], ['+', 10], ['-', 12], ['/', 14], ['\n', 198], ['\t', 197],
  ['foo', 8134], ['bar', 5657], ['42', 2983], ['2024', 23619], ['json', 2285],
  ['return', 4712], ['func', 4822], ['print', 3902], ['🙂', 4401],
  [' ', 220], ['a', 64], ['b', 65], ['c', 66], ['d', 67], ['e', 68], ['f', 69],
  ['g', 70], ['h', 71], ['i', 72], ['j', 73], ['k', 74], ['l', 75], ['m', 76],
  ['n', 77], ['o', 78], ['p', 79], ['q', 80], ['r', 81], ['s', 82], ['t', 83],
  ['u', 84], ['v', 85], ['w', 86], ['x', 87], ['y', 88], ['z', 89],
  ['A', 32], ['B', 33], ['C', 34], ['D', 35], ['E', 36], ['F', 37], ['G', 38],
  ['H', 39], ['I', 40], ['J', 41], ['K', 42], ['L', 43], ['M', 44], ['N', 45],
  ['O', 46], ['P', 47], ['Q', 48], ['R', 49], ['S', 50], ['T', 51], ['U', 52],
  ['V', 53], ['W', 54], ['X', 55], ['Y', 56], ['Z', 57],
  ['an', 276], ['er', 388], ['in', 258], ['or', 273], ['ed', 291],
  ['at', 265], ['en', 268], ['on', 261], ['is', 271], ['it', 270],
  ['th', 339], ['he', 259], ['re', 266], ['se', 325], ['le', 293],
  ['the', 1820], ['and', 392], ['ing', 278], ['tion', 683],
  [' is', 318], [' a', 257], [' an', 281], [' to', 311], [' in', 304],
  [' of', 315], [' for', 369], [' that', 430], [' with', 449],
  ['pre', 1762], ['com', 785], ['pro', 1742], ['con', 535],
  ['token', 5765], [' token', 4037], ['model', 2746], [' model', 1904],
  ['text', 1495], [' text', 2420], ['input', 2566], [' input', 1988],
  ['predict', 6052], ['next', 4285], [' next', 2446],
  ['LL', 3069], ['LLM', 4378],
  ['0', 15], ['1', 16], ['2', 17], ['3', 18], ['4', 19],
  ['5', 20], ['6', 21], ['7', 22], ['8', 23], ['9', 24],
]);

// Sorted by longest match first for greedy tokenization
const SORTED_TOKENS = [...VOCAB.keys()].sort((a, b) => b.length - a.length);

function tokenize(text: string): Array<{ piece: string; id: number }> {
  const tokens: Array<{ piece: string; id: number }> = [];
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const token of SORTED_TOKENS) {
      if (text.startsWith(token, i)) {
        tokens.push({ piece: token, id: VOCAB.get(token)! });
        i += token.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ piece: text[i], id: 9999 });
      i++;
    }
  }
  return tokens;
}

const COLORS = [
  'var(--sem-token)', 'var(--sem-attention)', 'var(--sem-ffn)',
  'var(--sem-logits)', 'var(--sem-kvcache)', 'var(--sem-router)',
  'var(--sem-expert)',
];

export default function TokenizerExplorer({
  initialInput = 'The cat sat on the mat.',
  suggestions = [],
}: Props) {
  const [input, setInput] = useState(initialInput);
  const tokens = tokenize(input);
  const hasFallback = tokens.some(t => t.id === 9999);

  return (
    <div className="tokenizer-explorer">
      <div className="te-warning">
        Teaching approximation only. This widget demonstrates how token pieces and IDs behave, but it is not the real tokenizer for any production model.
        For cost, context, or accuracy work, always measure token counts with the exact tokenizer shipped with the model you serve.
      </div>

      <div className="te-input-section">
        <label className="te-label">Enter text</label>
        {suggestions.length > 0 && (
          <div className="te-suggestions">
            {suggestions.map(suggestion => (
              <button
                key={suggestion.label}
                type="button"
                className="te-suggestion-btn"
                onClick={() => setInput(suggestion.value)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
        <textarea
          className="te-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={2}
          placeholder="Type something to see how it tokenizes..."
          spellCheck={false}
        />
      </div>

      <div className="te-output">
        <div className="te-stat-row">
          <div className="te-stat">
            <span className="te-stat-value">{input.length}</span>
            <span className="te-stat-label">characters</span>
          </div>
          <div className="te-stat">
            <span className="te-stat-value">{input.split(/\s+/).filter(Boolean).length}</span>
            <span className="te-stat-label">words</span>
          </div>
          <div className="te-stat">
            <span className="te-stat-value te-highlight">{tokens.length}</span>
            <span className="te-stat-label">tokens</span>
          </div>
        </div>

        <div className="te-section">
          <div className="te-section-label">Token Pieces</div>
          <div className="te-pieces">
            {tokens.map((t, i) => (
              <span
                key={i}
                className="te-piece"
                style={{ borderBottomColor: COLORS[i % COLORS.length] }}
                title={`ID: ${t.id}`}
              >
                {t.piece.replace(/ /g, '·')}
              </span>
            ))}
          </div>
        </div>

        <div className="te-section">
          <div className="te-section-label">Token IDs</div>
          <div className="te-ids">
            {tokens.map((t, i) => (
              <div key={i} className="te-id-cell">
                <span className="te-id-piece" style={{ color: COLORS[i % COLORS.length] }}>
                  {t.piece.replace(/ /g, '·')}
                </span>
                <span className="te-id-arrow">↓</span>
                <span className="te-id-num">{t.id}</span>
              </div>
            ))}
          </div>
        </div>

        {hasFallback && (
          <div className="te-note">
            Some pieces used the fallback ID <code>9999</code>. This toy tokenizer is deliberately small, so unfamiliar text breaks into smaller pieces.
            Real tokenizers do the same general thing: they keep decomposing text until they can express it with known vocabulary entries.
          </div>
        )}
      </div>

      <style>{`
        .tokenizer-explorer {
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin: var(--space-4) 0;
        }
        .te-warning {
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          color: var(--ink-secondary);
          background: color-mix(in srgb, var(--sem-token) 8%, var(--surface-3));
          border: 1px solid color-mix(in srgb, var(--sem-token) 25%, transparent);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          margin-bottom: var(--space-4);
        }
        .te-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--ink-ghost);
          display: block;
          margin-bottom: var(--space-2);
        }
        .te-input {
          width: 100%;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: var(--space-3) var(--space-4);
          background: var(--surface-0);
          border: var(--border-default);
          border-radius: var(--radius-md);
          color: var(--ink-primary);
          resize: vertical;
          outline: none;
          line-height: var(--leading-relaxed);
        }
        .te-input:focus {
          border-color: var(--sem-token);
        }
        .te-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }
        .te-suggestion-btn {
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
        .te-suggestion-btn:hover {
          border-color: var(--sem-token);
          color: var(--ink-primary);
        }
        .te-output {
          margin-top: var(--space-4);
        }
        .te-stat-row {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }
        .te-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          padding: var(--space-3);
          background: var(--surface-3);
          border-radius: var(--radius-md);
        }
        .te-stat-value {
          font-family: var(--font-mono);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--ink-primary);
        }
        .te-stat-value.te-highlight {
          color: var(--sem-token);
        }
        .te-stat-label {
          font-size: var(--text-xs);
          color: var(--ink-tertiary);
          margin-top: 2px;
        }
        .te-section {
          margin-top: var(--space-4);
        }
        .te-section-label {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--ink-ghost);
          margin-bottom: var(--space-2);
        }
        .te-pieces {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }
        .te-piece {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: var(--space-1) var(--space-2);
          background: var(--surface-3);
          border-radius: var(--radius-sm);
          border-bottom: 2px solid;
          color: var(--ink-primary);
          white-space: pre;
        }
        .te-ids {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .te-id-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-2) var(--space-3);
          background: var(--surface-3);
          border-radius: var(--radius-md);
          min-width: 48px;
        }
        .te-id-piece {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          white-space: pre;
        }
        .te-id-arrow {
          font-size: 10px;
          color: var(--ink-ghost);
          margin: 2px 0;
        }
        .te-id-num {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--ink-primary);
        }
        .te-note {
          margin-top: var(--space-4);
          padding: var(--space-3) var(--space-4);
          background: var(--surface-3);
          border-left: 3px solid var(--sem-token);
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          color: var(--ink-secondary);
          line-height: var(--leading-normal);
        }
        .te-note code {
          font-size: 0.95em;
        }
      `}</style>
    </div>
  );
}
