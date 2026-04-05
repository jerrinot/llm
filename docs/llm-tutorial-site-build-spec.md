# LLM Tutorial Site Build Spec

This document turns the course design into a product that a small team can build without inventing missing structure.

Use this together with:

- [llm-tutorial-site-design.md](./llm-tutorial-site-design.md)
- [llm-tutorial-site-curriculum.md](./llm-tutorial-site-curriculum.md)

The design doc explains the teaching doctrine.
The curriculum doc defines the locked lesson order.
This document defines the website that must deliver that course.

## Product Definition

The site is a guided technical course with three equal responsibilities:

1. teach the concepts in order
2. force the learner to prove understanding before advancing
3. connect the theory to real implementation and performance reasoning

The target learner is a senior software engineer ramping into inference and systems work at an AI company.
The product is not trying to create a training researcher.

The site is not:

- a documentation portal
- a blog
- a glossary with navigation chrome
- a textbook PDF in web form

The site must behave like a progression-based learning product.

## Non-Negotiable Build Decisions

### Decision 1: Guided mode is the default mode

The first visit lands on `/start/what-you-will-learn`.
The learner progresses only by completing lesson gates.
Free navigation is hidden until the capstone is passed.

### Decision 2: Lessons are data-driven pages

Each lesson must be authored as structured content with metadata, not as ad hoc pages.

The site must be able to:

- compute prerequisites
- compute unlock state
- render lesson progress
- render shared page sections in fixed order
- generate module maps automatically

### Decision 3: Math is an explicit dependency graph

No lesson may introduce a formula before the required algebra has already been taught.

The product must track:

- which formulas were introduced
- which symbols are now legal to use
- which lessons depend on them

### Decision 3A: The site uses one tensor orientation

The site must standardize on row-major pedagogical shapes:

- hidden states: `[n_tokens, d_model]`
- Q/K/V: `[n_tokens, d_head]` or `[n_tokens, n_head, d_head]`
- attention scores: `[n_tokens, n_tokens]`

The site must not silently switch orientations between lessons.
If real code uses a different orientation internally, the lesson must state that explicitly inside the `Implementation Hook`.

### Decision 4: Interactivity is mandatory, not decorative

The site must include interactive elements because several concepts are otherwise too abstract:

- tokenization
- embeddings and shapes
- dot products
- matrix multiplication
- softmax
- causal attention
- KV cache growth
- MoE top-k routing
- performance tradeoffs

### Decision 5: Every lesson has a check, but not every check is hard

A learner cannot proceed after only scrolling.

The site must support two gate strengths:

- `soft`
- `hard`

Soft gates:

- require the learner to attempt the check
- provide correction and explanation
- do not require a perfect score to continue

Hard gates:

- require the learner to pass
- are used from M4 onward and for all module quizzes

### Decision 6: Practical payoff must appear early

Within the first 30 minutes, the learner must see:

- one end-to-end inference request
- one real source location
- one explanation of how the same example will be revisited later

### Decision 7: The course must use one running example

The site must define one running example that reappears across the whole guided path.

The running example must include:

- one short prompt
- one next-token step
- one simplified model flow
- one `llama.cpp` code anchor

## Site Map

The route structure must be fixed and unsurprising.

### Primary routes

- `/`
  - marketing-light landing page with one action: `Start Course`
- `/start/...`
  - orientation lessons
- `/tokens/...`
  - discrete input representation lessons
- `/math/...`
  - linear algebra lessons
- `/probability/...`
  - logits, softmax, and next-token choice
- `/block/...`
  - dense transformer block lessons
- `/architectures/...`
  - architecture variants
- `/inference/...`
  - prefill, decode, KV cache, batching
- `/performance/...`
  - performance reasoning
- `/case-study/...`
  - code and profiling case studies
- `/quiz/...`
  - module checkpoints
- `/capstone/...`
  - final applied assessment

### Secondary routes

- `/reference/glossary`
- `/reference/math-cheatsheet`
- `/reference/code-atlas`
- `/reference/profiler-atlas`
- `/reference/metrics-atlas`
- `/reference/serving-atlas`
- `/dashboard/progress`
- `/lab/...`

Reference routes are always browsable, but they must not unlock guided content.

## Route Inventory

The guided path must expose these routes exactly.

| Lesson | Route | Page kind |
| --- | --- | --- |
| L00 | `/start/what-you-will-learn` | lesson |
| L01 | `/start/what-an-llm-does` | lesson |
| L01A | `/start/one-request-end-to-end` | lesson |
| L02 | `/tokens/what-is-a-token` | lesson |
| L03 | `/tokens/vocabulary-and-ids` | lesson |
| L04 | `/tokens/context-length` | lesson |
| L05 | `/math/scalars-vectors` | lesson |
| L06 | `/math/embeddings-as-vectors` | lesson |
| L07 | `/math/dot-product` | lesson |
| L08 | `/math/matrix-multiply` | lesson |
| L09 | `/math/linear-projections` | lesson |
| L10 | `/math/tensor-shapes` | lesson |
| L11 | `/probability/logits` | lesson |
| L12 | `/probability/softmax` | lesson |
| L13 | `/probability/argmax-and-sampling` | lesson |
| L14 | `/block/what-a-layer-does` | lesson |
| L15 | `/block/residuals-and-rmsnorm` | lesson |
| L16 | `/block/qkv-projections` | lesson |
| L16A | `/block/position-and-rope` | lesson |
| L17 | `/block/causal-attention` | lesson |
| L18 | `/block/attention-output` | lesson |
| L18A | `/block/multi-head-attention` | lesson |
| L19 | `/block/feed-forward-network` | lesson |
| L20 | `/block/full-decoder-block` | lesson |
| Q-M4 | `/quiz/dense-transformer` | quiz |
| L21 | `/architectures/gqa-and-mqa` | lesson |
| L22 | `/architectures/sliding-window-attention` | lesson |
| L23 | `/architectures/shared-kv-layers` | lesson |
| L24 | `/architectures/moe-router` | lesson |
| L25 | `/architectures/moe-aggregation` | lesson |
| L26 | `/architectures/gemma4-overview` | lesson |
| Q-M5 | `/quiz/architecture-variants` | quiz |
| L27 | `/inference/prefill` | lesson |
| L28 | `/inference/decode` | lesson |
| L29 | `/inference/kv-cache` | lesson |
| L30 | `/inference/batching-and-ubatching` | lesson |
| L30A | `/inference/continuous-batching` | lesson |
| L31 | `/inference/context-scaling` | lesson |
| Q-M6 | `/quiz/inference-mechanics` | quiz |
| L32 | `/performance/where-time-goes` | lesson |
| L33 | `/performance/gemm-vs-gemv` | lesson |
| L34 | `/performance/compute-vs-memory` | lesson |
| L35 | `/performance/quantization` | lesson |
| L36 | `/performance/repack-and-layout` | lesson |
| L37 | `/performance/threads-and-affinity` | lesson |
| L38 | `/performance/validate-speedups` | lesson |
| Q-M7 | `/quiz/performance-reasoning` | quiz |
| L39 | `/case-study/dense-gemma` | lesson |
| L40 | `/case-study/gemma4-attention` | lesson |
| L41 | `/case-study/gemma4-moe` | lesson |
| L42 | `/case-study/profile-interpretation` | lesson |
| L43 | `/case-study/optimization-and-regression` | lesson |
| CAPSTONE | `/capstone/zero-to-hero` | capstone |

## User Progress Model

The product must track the following learner state:

- `started_at`
- `last_opened_lesson_id`
- `completed_lessons`
- `passed_quizzes`
- `lesson_attempts`
- `quiz_attempts`
- `capstone_status`
- `notes`
- `bookmarks`

The site must support two storage modes:

1. local-only mode via browser storage
2. account-backed mode via server persistence

The local mode must be sufficient for the first release.

## Locking and Unlock Rules

Unlocking must be deterministic.

### Lesson unlock

A lesson becomes available only if:

- all prerequisites are complete

A lesson is marked complete only if:

- its gate was satisfied according to its `gate_strength`

For `soft` lessons:

- the learner must complete the check flow
- wrong answers trigger feedback and remediation
- completion does not require a perfect score

For `hard` lessons:

- the learner must pass the gate

### Module quiz unlock

A module quiz unlocks only if:

- all lessons in the module are complete

### Capstone unlock

The capstone unlocks only if:

- all guided lessons are complete
- all module quizzes were passed

### Review mode

After a learner passes the capstone:

- all pages become freely navigable
- lesson gates remain available as optional refreshers
- the dashboard should show weak areas based on failed or repeated attempts

## Content Model

Every guided page must be authored with a structured schema.

### Required lesson schema

```yaml
lesson_id: L17
slug: /block/causal-attention
title: Causal Attention Lets Tokens Read the Past
module: M4
kind: lesson
gate_strength: hard
estimated_minutes: 18
prerequisites:
  - L16A
running_example_focus:
  - attention_scores_for_the_running_request
new_vocabulary:
  - attention score
  - causal mask
  - attention weight
new_math:
  - "Q K^T"
  - "softmax(score + mask)"
symbols_allowed:
  - Q
  - K
  - V
  - softmax
implementation_hooks:
  - src/llama-graph.cpp:1838
code_lens:
  - concept: attention_score_construction
    repository: ggml-org/llama.cpp
    commit_sha: <pinned_commit_sha>
    github_permalink: https://github.com/ggml-org/llama.cpp/blob/<pinned_commit_sha>/src/llama-graph.cpp#L1838-L1943
    repo_path: src/llama-graph.cpp
    focus_lines: "build_attn score construction, masking, softmax, value mixing"
    what_to_notice:
      - score computation is built from matrix operations, not a magic attention primitive
      - masking and softmax are explicit steps
      - value mixing happens after weights are formed
    ignore_for_now:
      - tensor library plumbing
      - backend dispatch details
    formula_mapping:
      - "Q K^T -> score tensor"
      - "softmax(score + mask) -> attention weights"
      - "A V -> attention output"
required_visuals:
  - causal_score_matrix
  - masked_attention_toy
required_interactive:
  - attention_mask_simulator
mastery_gate:
  conceptual: single_choice
  math: worked_numeric
unlocks:
  - L18
```

### Required running example contract

The site must maintain one named running example object.

It must declare:

- `example_id`
- `prompt_text`
- `tokenized_form`
- `toy_shapes`
- `concepts_covered`
- `revisited_in_lessons`
- `primary_code_anchor`

Every lesson must declare `running_example_focus`, even if the value is:

- `none_yet` for the earliest orientation pages
- one concrete aspect of the running example for all later pages

### Required quiz schema

```yaml
lesson_id: Q-M4
slug: /quiz/dense-transformer
title: Quiz: Dense Transformer Block
module: M4
kind: quiz
prerequisites:
  - L20
passing_score: 0.8
question_mix:
  vocabulary: 2
  reasoning: 2
  shape: 1
unlocks:
  - L21
```

### Required capstone schema

```yaml
lesson_id: CAPSTONE
slug: /capstone/zero-to-hero
kind: capstone
prerequisites:
  - L43
deliverables:
  - block_explanation
  - moe_explanation
  - inference_diagnosis
  - profile_hypothesis
  - correctness_argument
```

### Required code lens contract

Every lesson from M4 onward must declare at least one `code_lens` entry.

Each entry must include:

- `concept`
- `repository`
- `commit_sha`
- `github_permalink`
- `repo_path`
- `focus_lines`
- `what_to_notice`
- `ignore_for_now`
- `formula_mapping`

The permalink must be pinned to a commit SHA, not a moving branch.

The purpose of `code_lens` is not to dump source code into the lesson.
Its purpose is to answer:

- where does this concept exist in real code
- what exact lines should the learner inspect
- what should the learner notice
- what should the learner ignore for now

## Theory-to-Practice Bridge

The site must treat code reading as a guided skill, not as an optional appendix.

The bridge from theory to practice has four layers:

1. formula
2. tensor shape
3. concrete operation
4. pinned source location

Every advanced lesson must make these mappings explicit.

### Code Lens block

Every lesson from M4 onward must render a `Code Lens` block inside the `Implementation Hook` section.

The `Code Lens` block must contain:

- one pinned GitHub permalink
- one repository-relative source path
- one short explanation of what to inspect
- one short explanation of what to ignore
- one formula-to-code mapping table

The learner must be able to look at the code without being abandoned inside it.

### Formula-to-code mapping table

Every lesson from M4 onward must include a compact table of this form:

| Theory | Shape meaning | Code construct | What to notice |
| --- | --- | --- | --- |
| `Q = H W_Q` | project hidden states to query space | `ggml_mul_mat(...)` | projection is still matrix multiplication |
| `softmax(score + mask)` | normalize valid attention scores | `ggml_soft_max(...)` | masking and normalization are separate steps |

### GitHub permalink policy

The product must never rely on floating links such as `main` or `master`.

All GitHub links shown to learners must be:

- pinned to a specific commit SHA
- line-bounded when possible
- paired with a human explanation

The site must maintain a single source of truth for the pinned revision:

- one `llama.cpp` revision per site release
- one manifest file that maps concepts to permalinks

If the site updates to a newer `llama.cpp` revision, the manifest must be regenerated and reviewed.

## Fixed Page Layout

Each lesson page must render these sections in this order:

1. Header
2. Question
3. Intuition
4. Toy Example
5. Shapes
6. Math
7. Implementation Hook
8. Performance Hook
9. Check Yourself
10. Unlock Requirement
11. Next Step

No lesson page may invent a custom order.

## Shared UI Components

The first implementation must include a small, fixed component library.

### Structural components

- `CourseShell`
- `LessonHeader`
- `PrerequisiteChipList`
- `ProgressRail`
- `LockedLessonCard`
- `MathNotationBox`
- `ShapeCard`
- `ImplementationHookCard`
- `PerformanceHookCard`
- `MisconceptionCallout`
- `GatePanel`
- `UnlockBanner`
- `CodeLensCard`
- `CodeReadingLabCard`
- `FormulaToCodeTable`
- `PermalinkBadge`
- `RepoPathBadge`

### Visual components

- `TokenSequenceView`
- `EmbeddingTableView`
- `VectorBarView`
- `MatrixGridView`
- `AttentionMatrixView`
- `KVCacheTimelineView`
- `MoERouterHeatmap`
- `ProfileStackBar`

### Assessment components

- `SingleChoiceQuestion`
- `MultiChoiceQuestion`
- `NumericEntryQuestion`
- `ShapeMatchingQuestion`
- `OrderTheBlockQuestion`
- `ShortReasoningQuestion`
- `CodeReadingQuestion`

## Interactive Catalog

The site must implement the following interactives because they unlock understanding that static text will not.

### I1 Tokenizer Explorer

Used in:

- L02
- L03
- L04

Inputs:

- raw text
- tokenizer preset

Outputs:

- token pieces
- token IDs
- token count

Must teach:

- text is not split into words reliably
- context budget is token-based

### I2 Embedding Lookup Explorer

Used in:

- L06

Inputs:

- token ID sequence
- toy embedding table

Outputs:

- stacked token vectors
- output shape

Must teach:

- integer IDs become vectors
- a sequence becomes a matrix

### I3 Dot Product Playground

Used in:

- L07

Inputs:

- two short vectors

Outputs:

- elementwise products
- summed result

Must teach:

- positive and negative contribution
- magnitude matters

### I4 Matrix Multiply Builder

Used in:

- L08
- L09

Inputs:

- left matrix
- right matrix

Outputs:

- output shape
- cell-by-cell dot products

Must teach:

- shape compatibility
- why matrix multiplication is repeated dot products

### I5 Softmax Inspector

Used in:

- L11
- L12
- L13

Inputs:

- logit vector
- optional temperature

Outputs:

- probabilities
- argmax
- sample preview

Must teach:

- logits are scores
- softmax normalizes
- decoding policy is downstream

### I6 Attention Simulator

Used in:

- L16
- L17
- L18

Inputs:

- toy Q, K, V
- causal mask toggle

Outputs:

- score matrix
- masked matrix
- attention weights
- weighted output

Must teach:

- QK scoring
- masking
- weighted V aggregation

### I7 FFN Width Explorer

Used in:

- L19
- L20

Inputs:

- `d_model`
- `d_ff`

Outputs:

- projection shapes
- per-token independence view

Must teach:

- attention mixes tokens
- FFN transforms each token independently

### I8 Architecture Variant Comparator

Used in:

- L21
- L22
- L23
- L26

Inputs:

- dense vs GQA vs SWA vs shared-KV settings

Outputs:

- changed tensor shapes
- changed memory usage
- changed visibility window

Must teach:

- variants are shape and memory-policy changes, not magic

### I9 MoE Router Lab

Used in:

- L24
- L25
- L41

Inputs:

- router logits per token
- top-k
- expert outputs

Outputs:

- selected experts
- normalized selected weights
- weighted expert sum

Must teach:

- top-k expert selection
- post-selection weighting
- routing cost vs dense FFN cost

### I10 KV Cache Growth Simulator

Used in:

- L28
- L29
- L31

Inputs:

- layer count
- KV heads
- context length

Outputs:

- cache size growth
- reuse across decode steps

Must teach:

- decode reuses state
- long context changes memory and runtime behavior

### I11 Execution Policy Lab

Used in:

- L30
- L37

Inputs:

- threads
- batch size
- ubatch size
- affinity policy

Outputs:

- synthetic throughput trend
- operator mix explanation

Must teach:

- runtime policy changes performance without changing math

### I12 Performance Tradeoff Lab

Used in:

- L33
- L34
- L35
- L36
- L38
- L42
- L43

Inputs:

- operator type
- tensor shapes
- bytes moved
- layout choice

Outputs:

- compute intensity estimate
- likely bottleneck classification
- validation warning path

Must teach:

- speed reasoning must connect math, layout, and correctness

## Math Ladder

The site must introduce math in a strict sequence.

### Level A: Discrete objects

Introduced in:

- L02
- L03
- L04

Allowed symbols:

- token sequence `x_1, x_2, ..., x_n`
- vocabulary size `|V|`

### Level B: Vectors and matrices

Introduced in:

- L05
- L06
- L07
- L08
- L09
- L10

Allowed formulas:

- `X in R^(n_tokens x d_model)`
- `a . b = sum_i a_i b_i`
- `Y = X W`
- `[m, k] x [k, n] -> [m, n]`

### Level C: Scores and probabilities

Introduced in:

- L11
- L12
- L13

Allowed formulas:

- `z in R^{|V|}`
- `p_i = exp(z_i) / sum_j exp(z_j)`
- `argmax_i p_i`

### Level D: Transformer core

Introduced in:

- L14
- L15
- L16
- L17
- L18
- L19
- L20

Allowed formulas:

- `Q = H W_Q`
- `K = H W_K`
- `V = H W_V`
- `A = softmax((Q K^T) / sqrt(d_k) + mask)`
- `O = A V`
- `FFN(h) = W_down phi(W_up h)`

### Level E: Variant math

Introduced in:

- L21
- L22
- L23
- L24
- L25
- L26

Allowed formulas:

- `router_probs = softmax(router_logits)`
- `selected = topk(router_probs)`
- `y = sum_i w_i E_i(h)`

### Level F: Performance math

Introduced in:

- L27 through L43

Allowed quantities:

- FLOPs
- bytes moved
- arithmetic intensity
- throughput
- latency
- cache reuse
- validation metrics such as perplexity and logit drift

## Lesson Authoring Contract

Every lesson author must satisfy this checklist.

### Question section

Must state one question only.

Examples:

- "What is a token?"
- "Why does causal masking exist?"
- "Why can long prefill slow down even when the main kernel stays the same?"

### Intuition section

Must use plain language and no formulas not yet introduced.

### Toy Example section

Must include one fully worked tiny example.
The learner should be able to inspect every number.

### Shapes section

Must explicitly name:

- tensor axes
- tensor ranks
- output shapes

The page fails review if it says "the shape is obvious."

### Math section

Must use only formulas legal at the learner's current math level.
Every new symbol must be defined in the same section.

### Implementation Hook section

Must connect the concept to real code.
This can be:

- one source file
- one helper function
- one call site

The hook must explain what the learner should notice in code, not only link to it.

For lessons in M0 through M3, the `Implementation Hook` may be a lightweight preview hook rather than a deep walkthrough.

For lessons in M4 through M8, the `Implementation Hook` section is incomplete unless it contains:

- a `Code Lens` block
- a pinned GitHub permalink
- a repository-relative path for deeper reading
- a formula-to-code mapping table
- an `ignore this for now` note

### Performance Hook section

Must answer:

- what operation is expensive here
- what shapes drive cost
- what changes between prefill and decode, if relevant

For lessons in M0 through M3, the `Performance Hook` may answer why the concept matters later for inference or systems work rather than forcing a full bottleneck discussion.

### Check Yourself section

Must ask:

- one conceptual question
- one math or shape question

### Unlock Requirement section

Must explain:

- exactly what must be answered correctly
- whether retries are unlimited
- whether hints exist

Retries should be unlimited.
Hints should appear only after one failed attempt.

## Assessment Design

The site needs assessments that force reasoning, not memorization.

### Lesson gate question types

Allowed:

- single choice
- numeric answer
- shape matching
- order the pipeline
- tiny worked example

Disallowed:

- freeform essay for ordinary lessons
- vague "what do you think" prompts

### Quiz question policy

Every module quiz must include:

- 2 vocabulary questions
- 2 reasoning questions
- 1 shape or math question

### Capstone structure

The capstone must be multi-part:

1. explain a dense transformer block from a diagram
2. explain how a toy MoE layer selects experts
3. compare prefill and decode for the same model
4. read a small synthetic profile and name one plausible bottleneck
5. reject a fake speedup that changes logits

The capstone must combine auto-graded and manually reviewable parts.

## Reference Pages

Reference content exists to support review, not to replace guided lessons.

### Required reference pages

- glossary
- math cheatsheet
- tensor shape cheatsheet
- transformer block atlas
- architecture variants atlas
- inference mechanics atlas
- profiler atlas
- validation metrics atlas
- serving systems atlas
- `llama.cpp` code atlas
- GitHub permalink index
- formula-to-code atlas

The code atlas should map concepts to implementation files:

- norms -> `src/llama-graph.cpp`
- FFN -> `src/llama-graph.cpp`
- MoE -> `src/llama-graph.cpp`
- attention -> `src/llama-graph.cpp`
- Gemma 4 builder -> `src/models/gemma4-iswa.cpp`

The GitHub permalink index should map each concept to:

- pinned GitHub URL
- repo path
- owning lesson IDs
- last reviewed `llama.cpp` commit SHA

## Module Code-Reading Labs

The site needs a parallel code-reading track that becomes active once the learner is ready for it.

These labs must be short, concrete, and scoped to one observation each.

### M0 to M3

No external code-reading labs yet.

Rationale:

- the learner is still building the language needed to survive real source code

### M4 Dense Transformer Block Labs

- `LAB-M4-1`: find where RMSNorm is built
  - primary file: `src/llama-graph.cpp`
  - target concept: normalization as an explicit graph op
- `LAB-M4-2`: trace Q, K, V, masking, softmax, and value mixing
  - primary file: `src/llama-graph.cpp`
  - target concept: attention is assembled from ordinary tensor ops
- `LAB-M4-3`: identify where positional treatment enters the attention path
  - primary file: `src/models/gemma4-iswa.cpp`
  - target concept: token order is introduced explicitly, not magically
- `LAB-M4-4`: locate the dense decoder block composition
  - primary file: `src/models/gemma.cpp`
  - target concept: block order is visible in builder code

### M5 Architecture Variant Labs

- `LAB-M5-1`: identify where Gemma 4 switches between attention variants
  - primary file: `src/models/gemma4-iswa.cpp`
  - target concept: architecture variants appear as real branches and parameters
- `LAB-M5-2`: trace MoE selection and weighted aggregation
  - primary file: `src/llama-graph.cpp`
  - secondary file: `src/models/gemma4-iswa.cpp`
  - target concept: routing is explicit top-k and weighted combination logic
- `LAB-M5-3`: inspect model metadata loading for Gemma 4
  - primary file: `src/llama-model.cpp`
  - target concept: architecture behavior starts in model metadata, not only in kernels

### M6 Inference Mechanics Labs

- `LAB-M6-1`: inspect where server timing fields are produced
  - primary file: `tools/server/server-context.cpp`
  - target concept: prompt and generation timing are separate measured quantities
- `LAB-M6-2`: inspect benchmark tooling inputs and outputs
  - primary file: `tools/llama-bench/README.md`
  - target concept: benchmark configuration shapes what you think you measured
- `LAB-M6-3`: inspect how build and runtime docs frame device choice and execution policy
  - primary file: `docs/build.md`
  - target concept: execution policy is operational, not architectural
- `LAB-M6-4`: inspect server-facing timing and scheduling concepts
  - primary file: `tools/server/server-context.cpp`
  - target concept: serving metrics and request execution are not the same as one-shot benchmarking

### M7 Performance Reasoning Labs

- `LAB-M7-1`: inspect repack selection logic
  - primary file: `ggml/src/ggml-cpu/repack.cpp`
  - target concept: layout selection changes the executed path without changing the model file
- `LAB-M7-2`: inspect a CPU kernel family entry point
  - primary file: `ggml/src/ggml-cpu/arch/x86/repack.cpp`
  - target concept: layout and kernel family choices are often more important than ISA slogans
- `LAB-M7-3`: inspect validation tooling for perplexity and KL divergence
  - primary file: `tools/perplexity/perplexity.cpp`
  - target concept: performance work needs correctness instrumentation

### M8 Case Study Labs

- `LAB-M8-1`: read one dense Gemma block builder top to bottom
  - primary file: `src/models/gemma.cpp`
  - target concept: theory should now map cleanly to builder code
- `LAB-M8-2`: read one Gemma 4 attention path top to bottom
  - primary file: `src/models/gemma4-iswa.cpp`
  - target concept: mixed architectures are still compositional code
- `LAB-M8-3`: inspect one optimization path and one validation path together
  - primary files:
    - `ggml/src/ggml-cpu/repack.cpp`
    - `tools/perplexity/perplexity.cpp`
  - target concept: the right optimization question is always speed plus equivalence

## Content Production Backlog

The site should be built in four content waves.

### Wave 1: first publishable slice

Ship:

- M0
- M1
- M2
- M3
- progress dashboard
- reference glossary
- math cheatsheet
- interactives I1 through I5

This wave is enough to prove:

- the locked progression works
- the lesson schema works
- the assessment engine works
- the math ladder works
- early practical payoff works

### Wave 2: transformer core

Ship:

- M4
- quiz Q-M4
- interactives I6 and I7
- code atlas starter
- `Code Lens` renderer
- first three code-reading labs

This wave is the first place the course becomes recognizably "LLM internals."

### Wave 3: variants and inference

Ship:

- M5
- M6
- quizzes Q-M5 and Q-M6
- interactives I8, I9, I10, I11
- architecture and inference code labs
- permalink index

### Wave 4: performance and case studies

Ship:

- M7
- M8
- quiz Q-M7
- capstone
- interactive I12
- profiler atlas
- performance and case-study code labs
- formula-to-code atlas

## First Wave Detailed Backlog

Wave 1 must be broken down into buildable work items.

### Product shell

- landing page
- course shell
- lesson page template
- quiz page template
- progress dashboard
- lock state rendering

### Content system

- lesson frontmatter parser
- module registry
- prerequisite validator
- unlock engine
- glossary cross-linking

### Assessment engine

- lesson gate runner
- quiz scorer
- retry flow
- hint flow

### Interactives

- tokenizer explorer
- embedding lookup explorer
- dot product playground
- matrix multiply builder
- softmax inspector

### Wave 1 lesson matrix

The first wave must be tracked lesson by lesson, not only module by module.

| Lesson | Core learner question | Required visual | Required interactive | Gate type |
| --- | --- | --- | --- | --- |
| L00 | What will this course actually teach me? | course map | model-pipeline sorter | soft |
| L01 | What does an LLM predict? | next-token loop | one-step prediction stepper | soft |
| L01A | What does one real inference request look like end to end? | end-to-end request map | request pipeline stepper | soft |
| L02 | What is a token? | tokenized sentence | tokenizer explorer | soft |
| L03 | What is a vocabulary ID? | token-piece to ID mapping | tokenizer explorer | soft |
| L04 | What does context length measure? | context budget window | tokenizer explorer | soft |
| L05 | What is a vector? | vector column view | scalar-vs-vector classifier | soft |
| L06 | How do token IDs become vectors? | embedding table | embedding lookup explorer | soft |
| L07 | What does a dot product mean? | pairwise multiply-and-sum | dot product playground | soft |
| L08 | How does matrix multiply work? | 2x3 by 3x2 worked example | matrix multiply builder | soft |
| L09 | What is a linear projection? | width-change diagram | matrix multiply builder | soft |
| L10 | Why are shapes the language of model code? | axis-labeled tensors | shape annotation drill | soft |
| L11 | What is a logit? | raw score bar chart | softmax inspector | soft |
| L12 | What does softmax change? | before/after distribution | softmax inspector | soft |
| L13 | How is the next token chosen? | argmax vs sample branches | softmax inspector | soft |

### Lessons

- L00 through L13, plus L01A, authored and reviewed

## Acceptance Criteria

The product is not ready unless all of these are true.

### Curriculum criteria

- all lessons exist in the route registry
- each lesson declares prerequisites
- no route in guided mode is orphaned
- no lesson uses math before it is introduced

### UX criteria

- a first-time learner can start in one click
- the next required lesson is always obvious
- locked lessons explain why they are locked
- failed gates explain what was wrong
- the learner sees one practical end-to-end system trace within the first 30 minutes

### Educational criteria

- each lesson has one question only
- each lesson includes one toy example
- each lesson includes shapes
- each lesson includes a performance hook
- each lesson includes a code hook once code is relevant
- each lesson from M4 onward includes a pinned GitHub permalink
- each lesson from M4 onward includes a formula-to-code mapping
- the site uses one explicit tensor orientation throughout
- the same running example appears in every module

### Engineering criteria

- lesson order is generated from data, not hardcoded in the UI
- progress can survive reload
- interactives are reusable across lessons
- quizzes use content data, not page-specific logic
- GitHub permalinks are generated from one pinned revision manifest
- code-reading labs use shared components, not page-specific custom widgets
- gate behavior is data-driven and supports both soft and hard modes

## Example Lesson Contract

L17 should be treated as the reference implementation for a mature lesson page.

### Page promise

Question:

- "How does one token read useful information from earlier tokens without reading the future?"

### Required toy example

- 3 tokens
- 3x3 score matrix
- explicit causal mask
- explicit softmax row
- explicit weighted value sum for one token

### Required shape explanation

- `Q`: `[n_tokens, d_k]`
- `K`: `[n_tokens, d_k]`
- `V`: `[n_tokens, d_v]`
- `Q K^T`: `[n_tokens, n_tokens]`
- `A V`: `[n_tokens, d_v]`

### Required implementation hook

- connect the lesson to `build_attn()` in `src/llama-graph.cpp`
- explicitly point out score computation, masking, softmax, and value mixing

### Required performance hook

- explain that longer sequences enlarge score and value-mixing work during prefill
- explain that decode instead reuses prior K/V

### Required gate

- conceptual:
  - "Why must token 3 be unable to read token 4?"
- numeric:
  - compute one masked softmax row or choose the correct masked matrix

## Editorial Voice

The writing style must be:

- direct
- patient
- practical
- mathematically explicit

The writing style must not be:

- hype-heavy
- cute
- professorly
- vague
- full of unexplained metaphors

The target tone is:

"A strong engineer is showing you exactly what matters, in the order you need it."
