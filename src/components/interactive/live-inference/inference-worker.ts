import { AutoTokenizer, AutoModelForCausalLM, type Tensor } from '@huggingface/transformers';
import type { WorkerInMessage, WorkerOutMessage, TokenPiece, TopKEntry } from './types';

const MODEL_ID = 'Xenova/distilgpt2';
const TOP_K = 15;

let tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>> | null = null;
let model: Awaited<ReturnType<typeof AutoModelForCausalLM.from_pretrained>> | null = null;

function post(msg: WorkerOutMessage) {
  self.postMessage(msg);
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
  if (!tokenizer) {
    post({ type: 'error', message: 'Tokenizer not loaded' });
    return;
  }
  try {
    const encoded = tokenizer(text, { return_tensors: false }) as any;
    const ids: number[] = Array.from(encoded.input_ids);
    const pieces: TokenPiece[] = ids.map(id => ({
      piece: tokenizer!.decode([id]),
      id,
    }));
    post({ type: 'tokenized', pieces, inputIds: ids });
  } catch (e: any) {
    post({ type: 'error', message: e.message || 'Tokenization failed' });
  }
}

async function forwardPass(inputIds: number[]) {
  if (!model || !tokenizer) {
    post({ type: 'error', message: 'Model not loaded' });
    return;
  }
  try {
    const input = { input_ids: BigInt64Array.from(inputIds.map(id => BigInt(id))), };
    // Reshape to [1, seq_len]
    const { ort } = await import('@huggingface/transformers');
    const tensor = new ort.Tensor('int64', input.input_ids, [1, inputIds.length]);

    const output = await model.forward({ input_ids: tensor });
    const logitsTensor: Tensor = output.logits;

    // Get logits for the last position: shape [1, seq_len, vocab_size]
    const vocabSize = logitsTensor.dims[2];
    const seqLen = logitsTensor.dims[1];
    const allLogits = logitsTensor.data as Float32Array;
    const lastPosStart = (seqLen - 1) * vocabSize;
    const lastLogits = Array.from(allLogits.slice(lastPosStart, lastPosStart + vocabSize));

    // Find top-K
    const indexed = lastLogits.map((logit, i) => ({ logit, i }));
    indexed.sort((a, b) => b.logit - a.logit);
    const topK: TopKEntry[] = indexed.slice(0, TOP_K).map(({ logit, i }) => ({
      token: tokenizer!.decode([i]),
      id: i,
      logit,
    }));

    post({ type: 'logits', logits: lastLogits, topK });
  } catch (e: any) {
    post({ type: 'error', message: e.message || 'Forward pass failed' });
  }
}

self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'load-model':
      await loadModel();
      break;
    case 'tokenize':
      await tokenize(msg.text);
      break;
    case 'forward-pass':
      await forwardPass(msg.inputIds);
      break;
  }
};
