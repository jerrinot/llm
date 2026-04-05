# LLM Tutorial Site Curriculum

This document turns the website design into an implementable guided course.

It is intentionally prescriptive.

The goal is not to suggest topics. The goal is to define the exact learning path, in order, with explicit dependencies, scope, visuals, drills, and mastery gates.

Use this together with [llm-tutorial-site-design.md](./llm-tutorial-site-design.md).

## Course Contract

The default site experience must be a locked guided path:

`L00 -> ... -> CAPSTONE`

The user should not be able to skip forward in guided mode.

The guided path uses two gate strengths:

- soft gates for M0 through M3
- hard gates for M4 through M8

Soft gates require the learner to attempt the check before proceeding.
Hard gates require the learner to pass the check before proceeding.

Reference pages may remain browsable, but they are not part of guided progression.

## Lesson Metadata Schema

Every lesson page must declare:

- `lesson_id`
- `slug`
- `title`
- `module`
- `gate_strength`
- `prerequisites`
- `estimated_minutes`
- `running_example_focus`
- `new_vocabulary`
- `math_scope`
- `required_visuals`
- `required_interactive`
- `mastery_gate`
- `unlocks`

The lesson entries in this document are implementation-authoritative.
Where a lesson entry omits a schema field, the implementation must derive it:

- `module`: derived from the section the lesson appears in
- `gate_strength`: `soft` for M0 through M3, `hard` for M4 through M8 and all quizzes
- `running_example_focus`: the canonical per-lesson mapping lives in `src/data/running-example.ts`
- `new_vocabulary`, `math_scope`: derived from the `Must teach` and `Math scope` sections
- `required_visuals`, `required_interactive`: derived from the `Required visuals` and `Required interactive` sections

The lesson entries below include `gate_strength` and `running_example_focus` inline where practical.
For lessons that omit them, the defaults above apply.

## Global Page Template

Every lesson page must have these sections in this order:

1. `Header`
2. `Question`
3. `Intuition`
4. `Toy Example`
5. `Shapes`
6. `Math`
7. `Implementation Hook`
8. `Performance Hook`
9. `Check Yourself`
10. `Unlock Requirement`
11. `Next Step`

The page must not reorder these sections.

## Global Assessment Policy

Each lesson gate must include:

- at least 1 conceptual question
- when the lesson introduces explicit math or shapes, at least 1 tensor/shape or math question

For `hard` lessons, passing threshold:

- all required questions correct

For `soft` lessons:

- the learner must complete the check flow
- wrong answers trigger feedback and remediation
- the lesson does not block on a perfect score

Each module quiz must include:

- 2 vocabulary questions
- 2 reasoning questions
- 1 shape question

Passing threshold:

- 80% or better

## Module Map

The guided path has 9 modules and 48 lessons.

Modules:

- M0 Orientation
- M1 Discrete Input Representation
- M2 Linear Algebra Foundations
- M3 Probability and Prediction
- M4 Dense Transformer Block
- M5 Architecture Variants
- M6 Inference Mechanics
- M7 Performance Reasoning
- M8 Case Studies

## M0 Orientation

### L00

- `lesson_id`: `L00`
- `slug`: `/start/what-you-will-learn`
- `title`: `What This Course Teaches`
- `gate_strength`: `soft`
- `prerequisites`: none
- `estimated_minutes`: 5
- `running_example_focus`: `full_pipeline_overview`

Must teach:

- this course is about inference and systems understanding
- the path is cumulative
- the learner will move from intuition to math to code to performance
- the course teaches only the minimum evaluation concepts needed for inference work

Must not teach:

- attention
- MoE
- performance details

Required visuals:

- curriculum map from `text` to `token IDs` to `model` to `logits` to `token`

Required interactive:

- simple self-check:
  - "Which of these is a model input?"

Mastery gate:

- user correctly identifies:
  - raw text
  - token IDs
  - logits

Unlocks:

- `L01`

### L01

- `lesson_id`: `L01`
- `slug`: `/start/what-an-llm-does`
- `title`: `An LLM Predicts the Next Token`
- `gate_strength`: `soft`
- `prerequisites`: `L00`
- `estimated_minutes`: 8
- `running_example_focus`: `next_token_prediction_loop`

Must teach:

- next-token prediction as the central task
- repeated prediction creates sequences
- training and inference are separate concerns

Math scope:

- none

Required visuals:

- one-step prediction
- repeated autoregressive generation

Mastery gate:

- explain in one sentence what the model is predicting
- identify why generation is iterative

Unlocks:

- `L01A`

### L01A

- `lesson_id`: `L01A`
- `slug`: `/start/one-request-end-to-end`
- `title`: `One Request, End to End`
- `gate_strength`: `soft`
- `prerequisites`: `L01`
- `estimated_minutes`: 10
- `running_example_focus`: `one_request_end_to_end`

Must teach:

- one inference request can be traced from raw text to next token
- tokenization, model execution, logits, and sampling are one pipeline
- the learner will revisit this same request throughout the course

Required visuals:

- one end-to-end request map:
  `text -> tokens -> vectors -> layers -> logits -> next token`

Required interactive:

- end-to-end pipeline stepper

Implementation hook:

- point to `src/llama-graph.cpp` as the file containing `build_attn()`, `build_ffn()`, `build_moe_ffn()`
- point to `src/models/gemma.cpp` as one complete model that wires these together
- this is a lightweight preview hook, not a deep walkthrough
- the learner does not need to read the code yet, but must see that it exists

This hook satisfies the "practical payoff within 30 minutes" requirement.
The learner sees a real source location before leaving M0.

Mastery gate:

- place the stages of one request in the correct order
- identify which stage produces logits

Unlocks:

- `L02`

## M1 Discrete Input Representation

### L02

- `lesson_id`: `L02`
- `slug`: `/tokens/what-is-a-token`
- `title`: `What Is a Token?`
- `prerequisites`: `L01A`
- `estimated_minutes`: 10

Must teach:

- tokens are model symbols, not necessarily words
- tokenization can split words, punctuation, and whitespace
- token count differs from word count

Math scope:

- discrete sequence of symbols

Required visuals:

- text broken into token pieces

Required interactive:

- tokenizer explorer

Mastery gate:

- identify why one sentence can map to many token pieces
- explain why context is measured in tokens

Unlocks:

- `L03`

### L03

- `lesson_id`: `L03`
- `slug`: `/tokens/vocabulary-and-ids`
- `title`: `Vocabulary and Token IDs`
- `prerequisites`: `L02`
- `estimated_minutes`: 10

Must teach:

- vocabulary is a finite table
- each token piece has an integer ID
- model input is integer IDs, not strings

Math scope:

- indexing into a finite table

Required visuals:

- token piece -> token ID -> vocabulary lookup

Mastery gate:

- map sample token pieces to IDs
- explain what the model sees as input

Unlocks:

- `L04`

### L04

- `lesson_id`: `L04`
- `slug`: `/tokens/context-length`
- `title`: `Context Length Means Token Capacity`
- `prerequisites`: `L03`
- `estimated_minutes`: 8

Must teach:

- context length is maximum token window
- prompt size and generated tokens share that budget
- long text means more tokens, not just more characters

Math scope:

- sequence length

Required visuals:

- token window with prompt and generated continuation

Mastery gate:

- compute whether a small example fits a context budget

Unlocks:

- `L05`

## M2 Linear Algebra Foundations

### L05

- `lesson_id`: `L05`
- `slug`: `/math/scalars-vectors`
- `title`: `Scalars and Vectors`
- `prerequisites`: `L04`
- `estimated_minutes`: 12

Must teach:

- scalar
- vector
- dimension
- elementwise operations

Math scope:

- vector notation
- indexing

Required visuals:

- vector as column
- vector dimension annotation

Mastery gate:

- identify scalar vs vector
- identify vector length

Unlocks:

- `L06`

### L06

- `lesson_id`: `L06`
- `slug`: `/math/embeddings-as-vectors`
- `title`: `Embeddings Turn Token IDs into Vectors`
- `prerequisites`: `L05`
- `estimated_minutes`: 12

Must teach:

- embedding table lookup
- one token becomes one vector
- a sequence becomes a matrix of vectors

Math scope:

- shape notation like `[n_tokens, d_model]`

Required visuals:

- embedding table
- token sequence -> stacked embedding vectors

Mastery gate:

- give the output shape of an embedding lookup

Unlocks:

- `L07`

### L07

- `lesson_id`: `L07`
- `slug`: `/math/dot-product`
- `title`: `Dot Product as Weighted Comparison`
- `prerequisites`: `L06`
- `estimated_minutes`: 15

Must teach:

- dot product formula
- dot product as weighted similarity
- why it appears everywhere in LLMs

Math scope:

- `a · b = sum_i a_i b_i`

Required visuals:

- two short vectors and their dot product

Mastery gate:

- compute one dot product by hand
- explain why sign and magnitude matter

Unlocks:

- `L08`

### L08

- `lesson_id`: `L08`
- `slug`: `/math/matrix-multiply`
- `title`: `Matrix Multiplication Without Fear`
- `prerequisites`: `L07`
- `estimated_minutes`: 18

Must teach:

- matrix-vector multiply
- matrix-matrix multiply
- output shape rule

Math scope:

- `[m, k] x [k, n] -> [m, n]`

Required visuals:

- one tiny 2x3 by 3x2 worked example

Mastery gate:

- compute a small multiply by hand
- identify valid and invalid shapes

Unlocks:

- `L09`

### L09

- `lesson_id`: `L09`
- `slug`: `/math/linear-projections`
- `title`: `Linear Projections Change Representation Size`
- `prerequisites`: `L08`
- `estimated_minutes`: 12

Must teach:

- weight matrix as learned projection
- projecting from model width to another width
- why Q, K, V, and FFN use projections

Math scope:

- shape reasoning for learned linear maps

Required visuals:

- `d_model -> d_q`
- `d_model -> d_ff`

Mastery gate:

- predict projection output shape in several examples

Unlocks:

- `L10`

### L10

- `lesson_id`: `L10`
- `slug`: `/math/tensor-shapes`
- `title`: `Tensor Shapes Are the Language of Model Code`
- `prerequisites`: `L09`
- `estimated_minutes`: 12

Must teach:

- shape notation
- common LLM shapes
- token axis vs feature axis

Math scope:

- 2D and 3D tensor shapes

Required visuals:

- `[n_tokens, d_model]`
- `[n_tokens, n_head, d_head]`

Mastery gate:

- explain which axis means what in two sample tensors

Unlocks:

- `L11`

## M3 Probability and Prediction

### L11

- `lesson_id`: `L11`
- `slug`: `/probability/logits`
- `title`: `The Output Head Produces One Logit Per Vocabulary Entry`
- `prerequisites`: `L10`
- `estimated_minutes`: 10

Must teach:

- final hidden state is projected through an output head
- the output head produces one score per vocabulary entry
- logits can be any real numbers
- larger logit means more preferred token before normalization

Required visuals:

- vocabulary bar chart with raw logits

Mastery gate:

- identify which token is preferred from a logit vector

Unlocks:

- `L12`

### L12

- `lesson_id`: `L12`
- `slug`: `/probability/softmax`
- `title`: `Softmax Turns Scores into a Distribution`
- `prerequisites`: `L11`
- `estimated_minutes`: 15

Must teach:

- softmax formula
- positive probabilities
- sum to 1
- relative dominance of larger logits

Math scope:

- `softmax(z_i) = exp(z_i) / sum_j exp(z_j)`

Required visuals:

- logits before softmax
- probabilities after softmax

Mastery gate:

- explain what softmax changes
- compare two logit vectors qualitatively

Unlocks:

- `L13`

### L13

- `lesson_id`: `L13`
- `slug`: `/probability/argmax-and-sampling`
- `title`: `Argmax, Sampling, and Next-Token Choice`
- `prerequisites`: `L12`
- `estimated_minutes`: 10

Must teach:

- deterministic top choice vs stochastic sampling
- logits are upstream of both
- generation quality is not the same as model architecture

Mastery gate:

- distinguish model computation from decoding policy

Unlocks:

- `L14`

## M4 Dense Transformer Block

### L14

- `lesson_id`: `L14`
- `slug`: `/block/what-a-layer-does`
- `title`: `What a Transformer Layer Does`
- `prerequisites`: `L13`
- `estimated_minutes`: 8

Must teach:

- a layer transforms all token hidden states
- some subparts mix tokens
- some subparts transform each token independently

Mastery gate:

- identify which operations are token-mixing in a simple diagram

Unlocks:

- `L15`

### L15

- `lesson_id`: `L15`
- `slug`: `/block/residuals-and-rmsnorm`
- `title`: `Residual Connections and RMSNorm`
- `prerequisites`: `L14`
- `estimated_minutes`: 14

Must teach:

- residual path preserves information
- RMSNorm stabilizes scale
- why norms appear before or after large transforms

Implementation hook:

- `build_norm()` in `src/llama-graph.cpp`

Mastery gate:

- explain residual connection in plain language
- identify where normalization happens in a block diagram

Unlocks:

- `L16`

### L16

- `lesson_id`: `L16`
- `slug`: `/block/qkv-projections`
- `title`: `Q, K, and V Are Just Learned Projections`
- `prerequisites`: `L15`
- `estimated_minutes`: 15

Must teach:

- Q, K, V all come from linear projections of hidden states
- they serve different roles but are built similarly

Math scope:

- projection shapes for Q, K, V

Mastery gate:

- identify Q/K/V shapes from a toy setup

Unlocks:

- `L16A`

### L16A

- `lesson_id`: `L16A`
- `slug`: `/block/position-and-rope`
- `title`: `Attention Needs Positional Information`
- `prerequisites`: `L16`
- `estimated_minutes`: 16

Must teach:

- token order is not recoverable from token embeddings alone
- attention needs positional information to distinguish reordered sequences
- RoPE is a practical way to inject position into Q and K

Math scope:

- positional modification of Q and K at a conceptual level

Required visuals:

- same token set in different orders producing different positional views
- Q/K before and after positional treatment

Mastery gate:

- explain why attention without position cannot model order correctly
- identify which tensors receive positional treatment in a toy setup

Unlocks:

- `L17`

### L17

- `lesson_id`: `L17`
- `slug`: `/block/causal-attention`
- `title`: `Causal Attention Lets Tokens Read the Past`
- `prerequisites`: `L16A`
- `estimated_minutes`: 18

Must teach:

- Q `K^T` gives scores
- causal mask blocks future tokens
- softmax converts scores to weights
- weighted V sum yields attention output

Math scope:

- attention formula at toy level

Required visuals:

- 3-token causal attention matrix

Mastery gate:

- explain why masking is required
- compute a toy masked attention example

Unlocks:

- `L18`

### L18

- `lesson_id`: `L18`
- `slug`: `/block/attention-output`
- `title`: `Attention Output Is a Token-Mixing Operation`
- `prerequisites`: `L17`
- `estimated_minutes`: 12

Must teach:

- attention output for each token is a weighted mix of value vectors
- this is where cross-token information moves

Implementation hook:

- `build_attn()` in `src/llama-graph.cpp`

Mastery gate:

- distinguish score computation from value mixing

Unlocks:

- `L18A`

### L18A

- `lesson_id`: `L18A`
- `slug`: `/block/multi-head-attention`
- `title`: `Multi-Head Attention Runs Several Smaller Attentions in Parallel`
- `prerequisites`: `L18`
- `estimated_minutes`: 16

Must teach:

- one attention layer is split into multiple heads
- each head attends in a smaller subspace
- head outputs are combined back into one representation
- architecture variants like GQA and MQA make sense only relative to standard multi-head attention

Math scope:

- head-splitting and head-merging shapes

Required visuals:

- one hidden state split into heads
- per-head attention then merge

Mastery gate:

- explain why multi-head attention is not the same as repeating one head
- identify the shapes before split, per head, and after merge

Unlocks:

- `L19`

### L19

- `lesson_id`: `L19`
- `slug`: `/block/feed-forward-network`
- `title`: `The FFN Transforms Each Token Independently`
- `prerequisites`: `L18A`
- `estimated_minutes`: 15

Must teach:

- expand width
- apply activation
- project back down
- gated variants

Implementation hook:

- `build_ffn()` in `src/llama-graph.cpp`

Mastery gate:

- explain the difference between attention and FFN

Unlocks:

- `L20`

### L20

- `lesson_id`: `L20`
- `slug`: `/block/full-decoder-block`
- `title`: `Putting the Whole Decoder Block Together`
- `prerequisites`: `L19`
- `estimated_minutes`: 12

Must teach:

- full block order
- where residuals are added
- where token mixing occurs

Implementation hook:

- `src/models/gemma.cpp`

Mastery gate:

- sketch the dense block from memory

Unlocks:

- `Q-M4`

### Q-M4

- `lesson_id`: `Q-M4`
- `slug`: `/quiz/dense-transformer`
- `title`: `Quiz: Dense Transformer Block`
- `prerequisites`: `L20`
- `estimated_minutes`: 10

Unlock condition:

- 80% or better

Unlocks:

- `L21`

## M5 Architecture Variants

### L21

- `lesson_id`: `L21`
- `slug`: `/architectures/gqa-and-mqa`
- `title`: `Grouped-Query and Multi-Query Attention`
- `prerequisites`: `Q-M4`
- `estimated_minutes`: 14

Must teach:

- fewer KV heads than Q heads
- why this saves memory and bandwidth

Mastery gate:

- explain what changes in the shape of K/V

Unlocks:

- `L22`

### L22

- `lesson_id`: `L22`
- `slug`: `/architectures/sliding-window-attention`
- `title`: `Sliding-Window Attention Limits What a Layer Can See`
- `prerequisites`: `L21`
- `estimated_minutes`: 14

Must teach:

- local attention window
- why this reduces long-context cost
- interleaving local and full-attention layers

Mastery gate:

- explain what information is lost and what cost is saved

Unlocks:

- `L23`

### L23

- `lesson_id`: `L23`
- `slug`: `/architectures/shared-kv-layers`
- `title`: `Shared-KV Layers Reuse Memory Instead of Rebuilding It`
- `prerequisites`: `L22`
- `estimated_minutes`: 14

Must teach:

- some layers compute fresh K/V
- some layers compute only fresh Q and reuse earlier K/V

Mastery gate:

- explain why this changes runtime cost

Unlocks:

- `L24`

### L24

- `lesson_id`: `L24`
- `slug`: `/architectures/moe-router`
- `title`: `The MoE Router Scores Experts Per Token`
- `prerequisites`: `L23`
- `estimated_minutes`: 16

Must teach:

- router logits
- softmax or sigmoid gating
- expert probabilities per token

Mastery gate:

- compute top-2 experts from a toy router output

Unlocks:

- `L25`

### L25

- `lesson_id`: `L25`
- `slug`: `/architectures/moe-aggregation`
- `title`: `MoE Runs Selected Experts and Weights Their Outputs`
- `prerequisites`: `L24`
- `estimated_minutes`: 18

Must teach:

- top-k selection
- selected weight normalization
- weighted sum of expert outputs

Implementation hook:

- `build_moe_ffn()` in `src/llama-graph.cpp`

Mastery gate:

- perform a toy weighted sum of selected expert outputs

Unlocks:

- `L26`

### L26

- `lesson_id`: `L26`
- `slug`: `/architectures/gemma4-overview`
- `title`: `Gemma 4 Combines Several Variants at Once`
- `prerequisites`: `L25`
- `estimated_minutes`: 16

Must teach:

- SWA pattern
- shared-KV layers
- MoE layers
- per-layer embedding path

Implementation hook:

- `src/models/gemma4-iswa.cpp`

Mastery gate:

- explain what makes Gemma 4 more complex than a plain dense decoder

Unlocks:

- `Q-M5`

### Q-M5

- `lesson_id`: `Q-M5`
- `slug`: `/quiz/architecture-variants`
- `title`: `Quiz: Architecture Variants`
- `prerequisites`: `L26`
- `estimated_minutes`: 12

Unlock condition:

- 80% or better

Unlocks:

- `L27`

## M6 Inference Mechanics

### L27

- `lesson_id`: `L27`
- `slug`: `/inference/prefill`
- `title`: `Prefill Processes the Prompt`
- `prerequisites`: `Q-M5`
- `estimated_minutes`: 14

Must teach:

- prompt tokens flow through the graph in bulk
- attention and FFN are computed for many tokens

Mastery gate:

- explain why prefill tends to use large matrix multiplies

Unlocks:

- `L28`

### L28

- `lesson_id`: `L28`
- `slug`: `/inference/decode`
- `title`: `Decode Adds One Token at a Time`
- `prerequisites`: `L27`
- `estimated_minutes`: 14

Must teach:

- one new token is processed at a time
- prior K/V state is reused

Mastery gate:

- explain why decode is not just "smaller prefill"

Unlocks:

- `L29`

### L29

- `lesson_id`: `L29`
- `slug`: `/inference/kv-cache`
- `title`: `The KV Cache Stores Past Attention State`
- `prerequisites`: `L28`
- `estimated_minutes`: 16

Must teach:

- what is cached
- why it saves recomputation
- why it consumes memory

Mastery gate:

- explain what is reused across decoding steps

Unlocks:

- `L30`

### L30

- `lesson_id`: `L30`
- `slug`: `/inference/batching-and-ubatching`
- `title`: `Batch Size and Ubatch Size Change Execution Policy`
- `prerequisites`: `L29`
- `estimated_minutes`: 16

Must teach:

- logical batch
- physical microbatch
- why operational settings can change throughput without changing math

Mastery gate:

- explain the difference between model behavior and execution policy

Unlocks:

- `L30A`

### L30A

- `lesson_id`: `L30A`
- `slug`: `/inference/continuous-batching`
- `title`: `Serving Adds Scheduling, Not Just Math`
- `prerequisites`: `L30`
- `estimated_minutes`: 16

Must teach:

- real serving systems handle many requests with different arrival times
- continuous batching changes how prompt and decode work are interleaved
- a benchmark result for one prompt is not automatically a serving result
- throughput and latency can trade off against each other

Required visuals:

- static batch vs continuous batch timeline
- request queue with interleaved decode steps

Mastery gate:

- explain why the best single-run benchmark setting may not be the best serving setting
- identify one serving tradeoff in a toy scheduler example

Unlocks:

- `L31`

### L31

- `lesson_id`: `L31`
- `slug`: `/inference/context-scaling`
- `title`: `Long Context Changes Which Costs Grow`
- `prerequisites`: `L30A`
- `estimated_minutes`: 15

Must teach:

- longer sequences increase prompt work
- attention and secondary operators can grow differently
- not all slowdowns come from the same kernel

Mastery gate:

- explain why a 32k prompt is not just "16k twice"

Unlocks:

- `Q-M6`

### Q-M6

- `lesson_id`: `Q-M6`
- `slug`: `/quiz/inference-mechanics`
- `title`: `Quiz: Inference Mechanics`
- `prerequisites`: `L31`
- `estimated_minutes`: 12

Unlock condition:

- 80% or better

Unlocks:

- `L32`

## M7 Performance Reasoning

### L32

- `lesson_id`: `L32`
- `slug`: `/performance/where-time-goes`
- `title`: `Where Time Goes in an LLM`
- `prerequisites`: `Q-M6`
- `estimated_minutes`: 14

Must teach:

- operator inventory
- attention vs FFN vs output projection
- prefill vs decode operator mix

Mastery gate:

- identify likely dominant operators in prefill and decode

Unlocks:

- `L33`

### L33

- `lesson_id`: `L33`
- `slug`: `/performance/gemm-vs-gemv`
- `title`: `GEMM and GEMV Feel Different on Hardware`
- `prerequisites`: `L32`
- `estimated_minutes`: 15

Must teach:

- matrix-matrix workloads
- matrix-vector-like workloads
- why throughput patterns differ

Mastery gate:

- explain why prefill often likes GEMM improvements more than decode does

Unlocks:

- `L34`

### L34

- `lesson_id`: `L34`
- `slug`: `/performance/compute-vs-memory`
- `title`: `Compute-Bound and Memory-Bound`
- `prerequisites`: `L33`
- `estimated_minutes`: 18

Must teach:

- operations performed
- bytes moved
- why low FLOP count can still be slow

Mastery gate:

- classify a toy example as more compute-bound or memory-bound

Unlocks:

- `L35`

### L35

- `lesson_id`: `L35`
- `slug`: `/performance/quantization`
- `title`: `Quantization Changes Both Math and Data Movement`
- `prerequisites`: `L34`
- `estimated_minutes`: 16

Must teach:

- why quantization exists
- `Q8_0` as a practical example
- lower precision changes layout and kernels

Mastery gate:

- explain why quantization can affect both speed and output quality

Unlocks:

- `L36`

### L36

- `lesson_id`: `L36`
- `slug`: `/performance/repack-and-layout`
- `title`: `Repack and Layout Matter as Much as ISA Tricks`
- `prerequisites`: `L35`
- `estimated_minutes`: 16

Must teach:

- layout transforms
- kernel selection
- why same weights can be rearranged for faster access

Mastery gate:

- explain why a layout change can speed up inference without changing the model file

Unlocks:

- `L37`

### L37

- `lesson_id`: `L37`
- `slug`: `/performance/threads-and-affinity`
- `title`: `Threads, Affinity, and Scheduling`
- `prerequisites`: `L36`
- `estimated_minutes`: 16

Must teach:

- thread count as execution policy
- physical cores vs SMT
- affinity and placement

Mastery gate:

- explain why best thread count can differ between prefill and decode

Unlocks:

- `L38`

### L38

- `lesson_id`: `L38`
- `slug`: `/performance/validate-speedups`
- `title`: `A Speedup Is Not Valid Until You Validate Outputs`
- `prerequisites`: `L37`
- `estimated_minutes`: 18

Must teach:

- speed benchmark is not enough
- perplexity measures next-token uncertainty in a practical validation setting
- logits and perplexity can detect regressions
- performance work must include equivalence checks

Mastery gate:

- explain why "faster but different logits" is not a successful optimization
- explain why lower perplexity is usually better in validation

Unlocks:

- `Q-M7`

### Q-M7

- `lesson_id`: `Q-M7`
- `slug`: `/quiz/performance-reasoning`
- `title`: `Quiz: Performance Reasoning`
- `prerequisites`: `L38`
- `estimated_minutes`: 15

Unlock condition:

- 80% or better

Unlocks:

- `L39`

## M8 Case Studies

### L39

- `lesson_id`: `L39`
- `slug`: `/case-study/dense-gemma`
- `title`: `Case Study: Reading a Dense Gemma Block`
- `prerequisites`: `Q-M7`
- `estimated_minutes`: 18

Implementation hook:

- `src/models/gemma.cpp`

Mastery gate:

- explain each major phase of one dense block

Unlocks:

- `L40`

### L40

- `lesson_id`: `L40`
- `slug`: `/case-study/gemma4-attention`
- `title`: `Case Study: Gemma 4 Attention Path`
- `prerequisites`: `L39`
- `estimated_minutes`: 20

Implementation hook:

- `src/models/gemma4-iswa.cpp`

Mastery gate:

- explain SWA layers and shared-KV behavior in the builder

Unlocks:

- `L41`

### L41

- `lesson_id`: `L41`
- `slug`: `/case-study/gemma4-moe`
- `title`: `Case Study: Gemma 4 MoE Layer`
- `prerequisites`: `L40`
- `estimated_minutes`: 22

Implementation hooks:

- Gemma 4 call site:
  `src/models/gemma4-iswa.cpp`
- shared MoE helper:
  `build_moe_ffn()` in `src/llama-graph.cpp`

Mastery gate:

- explain expert selection and weighted aggregation in code terms

Unlocks:

- `L42`

### L42

- `lesson_id`: `L42`
- `slug`: `/case-study/profile-interpretation`
- `title`: `Case Study: Interpreting a Prefill vs Decode Profile`
- `prerequisites`: `L41`
- `estimated_minutes`: 20

Must teach:

- how to read hotspot distribution
- how to avoid overly local first hypotheses

Mastery gate:

- propose a plausible bottleneck explanation from a sample profile

Unlocks:

- `L43`

### L43

- `lesson_id`: `L43`
- `slug`: `/case-study/optimization-and-regression`
- `title`: `Case Study: A Speed Win That Failed Equivalence`
- `prerequisites`: `L42`
- `estimated_minutes`: 20

Must teach:

- why validation matters
- how to isolate a regression
- why a selector/layout change can be the real cause

Mastery gate:

- explain how you would prove whether a speed optimization is acceptable

Unlocks:

- `CAPSTONE`

## Capstone

### CAPSTONE

- `lesson_id`: `CAPSTONE`
- `slug`: `/capstone/zero-to-hero`
- `title`: `Capstone: From Concept to Performance Diagnosis`
- `prerequisites`: `L43`
- `estimated_minutes`: 30

The capstone must require the user to do all of the following:

1. explain a dense transformer block
2. explain how an MoE layer selects experts
3. explain how positional information enters attention
4. explain prefill vs decode
5. identify a plausible bottleneck from a profile
6. explain why correctness validation is required for performance work

Completion criteria:

- all five tasks completed successfully

## Required Reference Pages

These pages are not in the main progression but must exist:

- Glossary
- Tensor Shape Cheat Sheet
- Q/K/V Shape Cheat Sheet
- FFN and GLU Variants Cheat Sheet
- MoE Pipeline Cheat Sheet
- Prefill vs Decode Cheat Sheet
- Performance Debugging Checklist

## Required Interactive Components by Stage

The following mapping is mandatory.

### After M1

- Tokenizer Explorer

### After M2

- Shape Explorer

### After M4

- Attention Simulator

### After M5

- MoE Simulator

### After M6

- Inference Timeline Simulator

### After M7

- Performance Diagnosis Lab

## Implementation Guidance

If the site is implemented in phases, the order must be:

### Phase 1

- M0 through M4
- Tokenizer Explorer
- Shape Explorer
- Attention Simulator

### Phase 2

- M5 and M6
- MoE Simulator
- Inference Timeline Simulator

### Phase 3

- M7 and M8
- Performance Diagnosis Lab
- Capstone

Do not build later phases before earlier phases are complete. The site is only useful if the guided path is coherent end to end.

## Final Rule

If a future contributor proposes a new page, they must answer:

- where exactly does this fit in the sequence?
- which lesson does it depend on?
- what exact new math does it introduce?
- what exact mastery gate proves the user understands it?

If those answers are unclear, the new page does not belong in the guided path.
