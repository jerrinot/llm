import { AutoTokenizer, AutoModelForCausalLM } from '@huggingface/transformers';
import type { WorkerInMessage, WorkerOutMessage, TokenPiece, TopKEntry } from './types';

const MODEL_ID = 'Xenova/distilgpt2';
const TOP_K = 15;

let tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>> | null = null;
let model: Awaited<ReturnType<typeof AutoModelForCausalLM.from_pretrained>> | null = null;

let workQueue: Promise<void> = Promise.resolve();

function post(msg: WorkerOutMessage) {
  self.postMessage(msg);
}

function enqueue(fn: () => Promise<void>) {
  workQueue = workQueue.then(fn).catch(e => {
    post({ type: 'error', message: e?.message || 'Unknown worker error' });
  });
}

// Helper: extract integer array from a Transformers.js tensor (v4 returns BigInt64Array)
function tensorToIds(tensor: any): number[] {
  const data = tensor.data || tensor;
  return Array.from(data).map(Number);
}

async function loadModel() {
  try {
    post({ type: 'model-progress', progress: 0, status: 'Loading tokenizer...' });

    tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
      progress_callback: (p: any) => {
        if (p.status === 'progress' && p.progress != null) {
          post({ type: 'model-progress', progress: p.progress * 0.1, status: 'Loading tokenizer...' });
        }
      },
    });

    post({ type: 'model-progress', progress: 10, status: 'Downloading model weights...' });

    model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
      dtype: 'q8',
      progress_callback: (p: any) => {
        if (p.status === 'progress' && p.progress != null) {
          post({ type: 'model-progress', progress: 10 + p.progress * 0.9, status: 'Downloading model weights...' });
        }
        if (p.status === 'ready') {
          post({ type: 'model-progress', progress: 100, status: 'Model ready' });
        }
      },
    });

    post({ type: 'model-ready' });
  } catch (e: any) {
    post({ type: 'error', message: e.message || 'Failed to load model' });
  }
}

async function tokenize(text: string) {
  if (!tokenizer) { post({ type: 'error', message: 'Tokenizer not loaded' }); return; }
  try {
    const encoded = tokenizer(text);
    const ids = tensorToIds(encoded.input_ids);
    const pieces: TokenPiece[] = ids.map(id => ({
      piece: tokenizer!.decode([id]),
      id,
    }));
    post({ type: 'tokenized', pieces, inputIds: ids });
  } catch (e: any) {
    post({ type: 'error', message: e.message || 'Tokenization failed' });
  }
}

async function runModelForward(text: string): Promise<{ lastLogits: number[]; vocabSize: number }> {
  const encoded = tokenizer!(text);
  const output = await model!.forward(encoded);
  const logitsTensor = output.logits;
  const vocabSize = logitsTensor.dims[2];
  const seqLen = logitsTensor.dims[1];
  const allLogits = logitsTensor.data as Float32Array;
  const lastPosStart = (seqLen - 1) * vocabSize;
  return {
    lastLogits: Array.from(allLogits.slice(lastPosStart, lastPosStart + vocabSize)),
    vocabSize,
  };
}

function getTopK(lastLogits: number[]): TopKEntry[] {
  const indexed = lastLogits.map((logit, i) => ({ logit, i }));
  indexed.sort((a, b) => b.logit - a.logit);
  return indexed.slice(0, TOP_K).map(({ logit, i }) => ({
    token: tokenizer!.decode([i]),
    id: i,
    logit,
  }));
}

async function forwardPass(inputIds: number[]) {
  if (!model || !tokenizer) { post({ type: 'error', message: 'Model not loaded' }); return; }
  try {
    const text = tokenizer.decode(inputIds);
    const { lastLogits } = await runModelForward(text);
    const topK = getTopK(lastLogits);
    post({ type: 'logits', logits: lastLogits, topK });
  } catch (e: any) {
    post({ type: 'error', message: e.message || 'Forward pass failed' });
  }
}

function softmaxSample(logits: number[], temperature: number): number {
  const scaled = logits.map(l => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const r = Math.random() * sum;
  let cumulative = 0;
  for (let i = 0; i < exps.length; i++) {
    cumulative += exps[i];
    if (r < cumulative) return i;
  }
  return exps.length - 1;
}

async function generateStep(inputIds: number[], temperature: number, runId: number) {
  if (!model || !tokenizer) { post({ type: 'error', message: 'Model not loaded' }); return; }
  try {
    const text = tokenizer.decode(inputIds);
    const { lastLogits } = await runModelForward(text);
    const chosenId = softmaxSample(lastLogits, temperature);
    const chosenToken = tokenizer.decode([chosenId]);
    post({ type: 'generated-token', token: chosenToken, id: chosenId, runId });
  } catch (e: any) {
    post({ type: 'error', message: e.message || 'Generation step failed' });
  }
}

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'load-model':
      enqueue(() => loadModel());
      break;
    case 'tokenize':
      enqueue(() => tokenize(msg.text));
      break;
    case 'forward-pass':
      enqueue(() => forwardPass(msg.inputIds));
      break;
    case 'generate-step':
      enqueue(() => generateStep(msg.inputIds, msg.temperature, msg.runId));
      break;
  }
};
