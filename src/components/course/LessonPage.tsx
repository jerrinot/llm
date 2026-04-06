import { useState, useEffect, type ReactNode } from 'react';
import { lessons, getModuleForLesson, getNextLesson, getPrevLesson } from '../../data/curriculum';
import { loadProgress, saveProgress, completeLesson } from '../../data/progress';
import ProgressRail from './ProgressRail';

interface Props {
  lessonId: string;
  children: ReactNode;
}

export default function LessonPage({ lessonId, children }: Props) {
  const [progress, setProgress] = useState(loadProgress());

  const lesson = lessons[lessonId];
  const mod = getModuleForLesson(lessonId);
  const next = getNextLesson(lessonId);
  const prev = getPrevLesson(lessonId);

  useEffect(() => {
    // Update last opened
    const p = loadProgress();
    p.lastOpenedLessonId = lessonId;
    if (!p.startedAt) p.startedAt = new Date().toISOString();
    saveProgress(p);
    setProgress(p);
  }, [lessonId]);

  const handleGatePass = () => {
    const updated = completeLesson(lessonId, loadProgress());
    saveProgress(updated);
    setProgress(updated);
  };

  // Expose handleGatePass to child components via a provider-like pattern
  // We use window for simplicity in this static-first architecture
  useEffect(() => {
    (window as any).__gatePass = handleGatePass;
    return () => { delete (window as any).__gatePass; };
  }, [lessonId]);

  if (!lesson || !mod) return <div>Lesson not found</div>;

  const isCompleted = progress.completedLessons.includes(lessonId);

  return (
    <div className="lesson-page-wrapper">
      {/* Sidebar */}
      <aside className="course-sidebar">
        <div className="sidebar-header">
          <a href="/" className="sidebar-logo">
            <span className="logo-mark">&gt;_</span>
            <span className="logo-text">LLM<br/>Ground Up</span>
          </a>
        </div>
        <nav className="sidebar-nav">
          <ProgressRail currentLessonId={lessonId} />
        </nav>
      </aside>

      {/* Main content */}
      <main className="course-main">
        <div className="lesson-container">
          {/* Header */}
          <div className="lesson-header">
            <div className="lesson-breadcrumb">
              <span className="module-tag" style={{ color: mod.color }}>{mod.id}</span>
              <span>/</span>
              <span>{mod.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <span className="lesson-id-tag">{lesson.id}</span>
              {isCompleted && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--state-success)' }}>
                  &#x2713; completed
                </span>
              )}
            </div>
            <h1 className="lesson-title">{lesson.title}</h1>
            <div className="lesson-meta">
              <span className="time-estimate">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.5 }}>
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M7 4V7.5L9 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                {lesson.estimatedMinutes} min
              </span>
            </div>
          </div>

          {/* Lesson content (passed as children) */}
          {children}

          {/* Navigation */}
          <nav className="lesson-nav">
            {prev ? (
              <a href={prev.slug} className="nav-btn">
                &#x2190; {prev.title}
              </a>
            ) : <div />}
            {next ? (
              <a href={next.slug} className="nav-btn primary">
                {next.title} &#x2192;
              </a>
            ) : (
              lessonId === 'CAPSTONE' ? (
                <span className="nav-btn primary" style={{ cursor: 'default' }}>
                  Course complete
                </span>
              ) : <div />
            )}
          </nav>
        </div>
      </main>

      <style>{`
        .lesson-page-wrapper {
          min-height: 100dvh;
        }
        .lesson-page-wrapper .course-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100dvh;
          background: var(--surface-1);
          border-right: var(--border-default);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          z-index: 100;
        }
        .lesson-page-wrapper .course-main {
          margin-left: var(--sidebar-width);
          min-height: 100dvh;
          padding: var(--space-10) var(--space-8);
          position: relative;
          z-index: 1;
        }
        @media (max-width: 900px) {
          .lesson-page-wrapper .course-sidebar {
            display: none;
          }
          .lesson-page-wrapper .course-main {
            margin-left: 0;
            padding: var(--space-6) var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}
