import type { TokenPiece } from './types';

// Deterministic color based on token ID
const COLORS = [
  'var(--sem-token)', 'var(--sem-attention)', 'var(--sem-ffn)',
  'var(--sem-kvcache)', 'var(--sem-router)', 'var(--sem-expert)',
];

function tokenColor(id: number): string {
  return COLORS[id % COLORS.length];
}

interface Props {
  pieces: TokenPiece[];
  label?: string;
}

export function TokenizationPanel({ pieces, label }: Props) {
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
        marginBottom: 'var(--space-2)',
        fontWeight: 600,
      }}>
        {label || 'Stage 1: Tokenization'} &mdash; {pieces.length} tokens
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
        {pieces.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0.2rem 0.4rem',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: `3px solid ${tokenColor(p.id)}`,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-primary)',
              whiteSpace: 'pre',
            }}>
              {p.piece.replace(/ /g, '\u00B7')}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--ink-ghost)',
            }}>
              {p.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
