import type { ModelStatus } from './useInferenceWorker';

interface Props {
  status: ModelStatus;
  progress: number;
  label: string;
  error: string | null;
  onLoad: () => void;
}

export function ModelStatusBar({ status, progress, label, error, onLoad }: Props) {
  if (status === 'ready') {
    return (
      <div style={{
        padding: 'var(--space-2) var(--space-3)',
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-xs)',
        color: 'var(--sem-ffn)',
        fontFamily: 'var(--font-mono)',
      }}>
        DistilGPT-2 loaded and ready
      </div>
    );
  }

  if (status === 'downloading') {
    return (
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--ink-ghost)',
      }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', marginBottom: 'var(--space-2)' }}>
          {label}
        </div>
        <div style={{
          height: '6px',
          background: 'var(--surface-3)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(progress, 100)}%`,
            background: 'var(--accent)',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--ink-ghost)',
          marginTop: 'var(--space-1)',
          fontFamily: 'var(--font-mono)',
        }}>
          {Math.round(progress)}%
        </div>
      </div>
    );
  }

  // idle or error
  return (
    <div style={{
      padding: 'var(--space-5)',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--ink-ghost)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-secondary)', marginBottom: 'var(--space-3)' }}>
        This demo runs <strong>DistilGPT-2</strong> (82M parameters) entirely in your browser.
        No server, no API key. The model weights (~80 MB) are downloaded once and cached.
      </div>
      {typeof navigator !== 'undefined' && (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4 && (
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--sem-router)',
          marginBottom: 'var(--space-3)',
          padding: 'var(--space-2)',
          background: 'var(--surface-3)',
          borderRadius: 'var(--radius-sm)',
        }}>
          Low memory detected. The demo may be slow or fail to load on this device.
        </div>
      )}
      {error && (
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--sem-attention)',
          marginBottom: 'var(--space-3)',
        }}>
          {error}
        </div>
      )}
      <button
        onClick={onLoad}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          padding: 'var(--space-2) var(--space-5)',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
        }}
      >
        Load Model
      </button>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-ghost)', marginTop: 'var(--space-2)' }}>
        ~80 MB download, cached after first load
      </div>
    </div>
  );
}
