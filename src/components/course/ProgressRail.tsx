import { useState, useEffect } from 'react';
import { modules, lessons, guidedPath, type Module } from '../../data/curriculum';
import { loadProgress, isLessonUnlocked, type ProgressState } from '../../data/progress';

export default function ProgressRail({ currentLessonId }: { currentLessonId: string }) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const currentLesson = lessons[currentLessonId];
    if (currentLesson) setExpandedModule(currentLesson.module);
  }, [currentLessonId]);

  if (!progress) return null;

  const completedSet = new Set(progress.completedLessons);

  return (
    <div className="progress-rail">
      {modules.map((mod) => {
        const modLessons = mod.lessonIds.map(id => lessons[id]).filter(Boolean);
        const completed = modLessons.filter(l => completedSet.has(l.id)).length;
        const total = modLessons.length;
        const isExpanded = expandedModule === mod.id;
        const hasCurrentLesson = mod.lessonIds.includes(currentLessonId);

        return (
          <div key={mod.id} className={`rail-module ${hasCurrentLesson ? 'active' : ''}`}>
            <button
              className="rail-module-header"
              onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
              aria-expanded={isExpanded}
            >
              <div className="rail-module-indicator">
                <div
                  className="rail-module-fill"
                  style={{
                    height: `${total > 0 ? (completed / total) * 100 : 0}%`,
                    background: mod.color,
                  }}
                />
              </div>
              <div className="rail-module-info">
                <span className="rail-module-id">{mod.id}</span>
                <span className="rail-module-title">{mod.title}</span>
              </div>
              <span className="rail-module-count">
                {completed}/{total}
              </span>
            </button>
            {isExpanded && (
              <ul className="rail-lessons">
                {modLessons.map((lesson) => {
                  const isCompleted = completedSet.has(lesson.id);
                  const isUnlocked = isLessonUnlocked(lesson.id, progress);
                  const isCurrent = lesson.id === currentLessonId;

                  return (
                    <li key={lesson.id} className="rail-lesson-item">
                      <a
                        href={isUnlocked ? lesson.slug : undefined}
                        className={`rail-lesson-link ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        tabIndex={isUnlocked ? 0 : -1}
                      >
                        <span className="rail-lesson-status">
                          {isCompleted ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : isCurrent ? (
                            <span className="rail-dot current-dot" />
                          ) : !isUnlocked ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <rect x="3.5" y="5" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1"/>
                              <path d="M4.5 5V3.5C4.5 2.67 5.17 2 6 2C6.83 2 7.5 2.67 7.5 3.5V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                          ) : (
                            <span className="rail-dot" />
                          )}
                        </span>
                        <span className="rail-lesson-id">{lesson.id}</span>
                        <span className="rail-lesson-title">{lesson.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
      <style>{`
        .progress-rail {
          font-family: var(--font-body);
        }
        .rail-module {
          border-bottom: var(--border-subtle);
        }
        .rail-module.active {
          background: rgba(255,255,255,0.02);
        }
        .rail-module-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: none;
          border: none;
          color: var(--ink-secondary);
          cursor: pointer;
          font-size: var(--text-sm);
          text-align: left;
          transition: background var(--duration-fast) var(--ease-out);
        }
        .rail-module-header:hover {
          background: rgba(255,255,255,0.03);
        }
        .rail-module-indicator {
          width: 3px;
          height: 20px;
          background: var(--surface-4);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .rail-module-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          border-radius: 2px;
          transition: height var(--duration-normal) var(--ease-out);
        }
        .rail-module-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .rail-module-id {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: var(--tracking-wider);
          color: var(--ink-ghost);
          text-transform: uppercase;
        }
        .rail-module-title {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--ink-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rail-module-count {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--ink-ghost);
          flex-shrink: 0;
        }
        .rail-lessons {
          list-style: none;
          padding: 0 0 var(--space-2);
        }
        .rail-lesson-item {
          margin: 0;
        }
        .rail-lesson-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-4) var(--space-1) var(--space-8);
          text-decoration: none;
          color: var(--ink-tertiary);
          font-size: var(--text-xs);
          line-height: var(--leading-snug);
          transition: all var(--duration-fast) var(--ease-out);
          border-left: 2px solid transparent;
        }
        .rail-lesson-link:hover:not(.locked) {
          color: var(--ink-secondary);
          background: rgba(255,255,255,0.02);
        }
        .rail-lesson-link.current {
          color: var(--ink-primary);
          border-left-color: var(--accent);
          background: var(--accent-muted);
        }
        .rail-lesson-link.completed {
          color: var(--ink-secondary);
        }
        .rail-lesson-link.locked {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .rail-lesson-status {
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--ink-ghost);
        }
        .rail-lesson-link.completed .rail-lesson-status {
          color: var(--state-success);
        }
        .rail-lesson-link.current .rail-lesson-status {
          color: var(--accent);
        }
        .rail-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--ink-ghost);
        }
        .rail-dot.current-dot {
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
        }
        .rail-lesson-id {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.05em;
          color: var(--ink-ghost);
          min-width: 28px;
          flex-shrink: 0;
        }
        .rail-lesson-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
