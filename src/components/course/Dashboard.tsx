import { useState, useEffect } from 'react';
import { modules, lessons, guidedPath } from '../../data/curriculum';
import { loadProgress, getProgressPercent, getNextUncompletedLesson, resetProgress, type ProgressState } from '../../data/progress';

export default function Dashboard() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return null;

  const percent = getProgressPercent(progress);
  const nextId = getNextUncompletedLesson(progress);
  const nextLesson = nextId ? lessons[nextId] : null;
  const completedSet = new Set(progress.completedLessons);
  const totalLessons = guidedPath.length;
  const completedCount = progress.completedLessons.length;

  return (
    <div className="dashboard">
      <header className="dash-header">
        <a href="/" className="dash-back">&larr; Home</a>
        <h1 className="dash-title">Your Progress</h1>
      </header>

      {/* Overview */}
      <div className="dash-overview">
        <div className="dash-progress-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-4)" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - percent / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
            <text x="60" y="56" textAnchor="middle" fontSize="28" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--ink-primary)">
              {percent}%
            </text>
            <text x="60" y="74" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-ghost)">
              {completedCount}/{totalLessons}
            </text>
          </svg>
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-value">{completedCount}</span>
            <span className="dash-stat-label">completed</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{totalLessons - completedCount}</span>
            <span className="dash-stat-label">remaining</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{progress.passedQuizzes.length}</span>
            <span className="dash-stat-label">quizzes passed</span>
          </div>
        </div>

        {nextLesson && (
          <a href={nextLesson.slug} className="dash-continue">
            Continue: {nextLesson.title} &rarr;
          </a>
        )}
      </div>

      {/* Module breakdown */}
      <div className="dash-modules">
        <h2 className="dash-section-title">Module Progress</h2>
        {modules.map(mod => {
          const modLessons = mod.lessonIds.map(id => lessons[id]).filter(Boolean);
          const completed = modLessons.filter(l => completedSet.has(l.id)).length;
          const total = modLessons.length;
          const pct = total > 0 ? (completed / total) * 100 : 0;

          return (
            <div key={mod.id} className="dash-module-row">
              <div className="dash-module-info">
                <span className="dash-module-id" style={{ color: mod.color }}>{mod.id}</span>
                <span className="dash-module-name">{mod.title}</span>
                <span className="dash-module-count">{completed}/{total}</span>
              </div>
              <div className="dash-module-bar">
                <div
                  className="dash-module-fill"
                  style={{ width: `${pct}%`, background: mod.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset */}
      <div className="dash-reset">
        <button
          className="dash-reset-btn"
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) {
              resetProgress();
              setProgress(loadProgress());
            }
          }}
        >
          Reset Progress
        </button>
      </div>

      <style>{`
        .dashboard {
          max-width: 52rem;
          margin: 0 auto;
          padding: var(--space-10) var(--space-6);
          position: relative;
          z-index: 1;
        }
        .dash-header {
          margin-bottom: var(--space-10);
        }
        .dash-back {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ink-tertiary);
          text-decoration: none;
          display: inline-block;
          margin-bottom: var(--space-4);
        }
        .dash-back:hover { color: var(--accent); }
        .dash-title {
          font-family: var(--font-display);
          font-size: var(--text-4xl);
        }
        .dash-overview {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-6);
          background: var(--surface-2);
          border: var(--border-default);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-10);
          flex-wrap: wrap;
        }
        .dash-stats {
          display: flex;
          gap: var(--space-6);
        }
        .dash-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dash-stat-value {
          font-family: var(--font-mono);
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--ink-primary);
        }
        .dash-stat-label {
          font-size: var(--text-xs);
          color: var(--ink-tertiary);
          margin-top: 2px;
        }
        .dash-continue {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          padding: var(--space-2) var(--space-5);
          background: var(--accent);
          color: var(--ink-inverse);
          text-decoration: none;
          border-radius: var(--radius-md);
          margin-left: auto;
          transition: all var(--duration-fast) var(--ease-out);
          white-space: nowrap;
        }
        .dash-continue:hover {
          background: var(--accent-hover);
          color: var(--ink-inverse);
        }
        .dash-section-title {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          margin-bottom: var(--space-5);
        }
        .dash-modules {
          margin-bottom: var(--space-10);
        }
        .dash-module-row {
          margin-bottom: var(--space-4);
        }
        .dash-module-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-1);
        }
        .dash-module-id {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          min-width: 24px;
        }
        .dash-module-name {
          font-size: var(--text-sm);
          color: var(--ink-secondary);
          flex: 1;
        }
        .dash-module-count {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--ink-ghost);
        }
        .dash-module-bar {
          height: 4px;
          background: var(--surface-4);
          border-radius: 2px;
          overflow: hidden;
        }
        .dash-module-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s var(--ease-out);
          min-width: 0;
        }
        .dash-reset {
          padding-top: var(--space-6);
          border-top: var(--border-subtle);
        }
        .dash-reset-btn {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          padding: var(--space-2) var(--space-4);
          background: none;
          border: 1px solid var(--state-error);
          color: var(--state-error);
          border-radius: var(--radius-md);
          cursor: pointer;
          opacity: 0.6;
          transition: opacity var(--duration-fast);
        }
        .dash-reset-btn:hover { opacity: 1; }
        @media (max-width: 640px) {
          .dash-overview { flex-direction: column; align-items: flex-start; }
          .dash-continue { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
