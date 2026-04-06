// Messages from main thread to worker
export type WorkerInMessage =
  | { type: 'load-model' }
  | { type: 'tokenize'; text: string }
  | { type: 'forward-pass'; inputIds: number[] };

// Messages from worker to main thread
export type WorkerOutMessage =
  | { type: 'model-progress'; progress: number; status: string }
  | { type: 'model-ready' }
  | { type: 'tokenized'; pieces: TokenPiece[]; inputIds: number[] }
  | { type: 'logits'; logits: number[]; topK: TopKEntry[] }
  | { type: 'error'; message: string };

export interface TokenPiece {
  piece: string;
  id: number;
}

export interface TopKEntry {
  token: string;
  id: number;
  logit: number;
}
