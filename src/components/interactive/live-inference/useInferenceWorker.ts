import { useState, useRef, useCallback, useEffect } from 'react';
import type { WorkerInMessage, WorkerOutMessage, TokenPiece, TopKEntry } from './types';

export type ModelStatus = 'idle' | 'downloading' | 'ready' | 'error';

export interface InferenceState {
  modelStatus: ModelStatus;
  downloadProgress: number;
  downloadLabel: string;
  isInferring: boolean;
  tokens: TokenPiece[] | null;
  inputIds: number[] | null;
  logits: number[] | null;
  topK: TopKEntry[] | null;
  error: string | null;
}

export function useInferenceWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<InferenceState>({
    modelStatus: 'idle',
    downloadProgress: 0,
    downloadLabel: '',
    isInferring: false,
    tokens: null,
    inputIds: null,
    logits: null,
    topK: null,
    error: null,
  });

  const getWorker = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!workerRef.current) {
      try {
        const w = new Worker(
          new URL('./inference-worker.ts', import.meta.url),
          { type: 'module' }
        );
        w.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
          const msg = e.data;
          switch (msg.type) {
            case 'model-progress':
              setState(s => ({
                ...s,
                modelStatus: 'downloading',
                downloadProgress: msg.progress,
                downloadLabel: msg.status,
              }));
              break;
            case 'model-ready':
              setState(s => ({ ...s, modelStatus: 'ready', downloadProgress: 100, downloadLabel: 'Model ready' }));
              break;
            case 'tokenized':
              setState(s => ({ ...s, tokens: msg.pieces, inputIds: msg.inputIds, isInferring: false }));
              break;
            case 'logits':
              setState(s => ({ ...s, logits: msg.logits, topK: msg.topK, isInferring: false }));
              break;
            case 'error':
              setState(s => ({
                ...s,
                error: msg.message,
                isInferring: false,
                modelStatus: s.modelStatus === 'downloading' ? 'error' : s.modelStatus,
              }));
              break;
          }
        };
        w.onerror = (e) => {
          setState(s => ({
            ...s,
            error: `Worker error: ${e.message || 'unknown'}`,
            isInferring: false,
            modelStatus: s.modelStatus === 'downloading' ? 'error' : s.modelStatus,
          }));
        };
        workerRef.current = w;
      } catch (e: any) {
        setState(s => ({
          ...s,
          error: `Failed to create worker: ${e.message}`,
          modelStatus: 'error',
        }));
        return null;
      }
    }
    return workerRef.current;
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const send = useCallback((msg: WorkerInMessage) => {
    const w = getWorker();
    if (w) w.postMessage(msg);
  }, [getWorker]);

  const loadModel = useCallback(() => {
    setState(s => ({ ...s, modelStatus: 'downloading', downloadProgress: 0, error: null }));
    send({ type: 'load-model' });
  }, [send]);

  const tokenize = useCallback((text: string) => {
    setState(s => ({ ...s, isInferring: true, error: null }));
    send({ type: 'tokenize', text });
  }, [send]);

  const runForward = useCallback((inputIds: number[]) => {
    setState(s => ({ ...s, isInferring: true, logits: null, topK: null, error: null }));
    send({ type: 'forward-pass', inputIds });
  }, [send]);

  return { ...state, loadModel, tokenize, runForward };
}
