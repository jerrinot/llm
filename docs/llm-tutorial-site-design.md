# LLM Tutorial Website Design

## Goal

Design a website that takes a technically literate reader from zero understanding of LLMs to the point where they can:

1. understand the terminology without faking it
2. understand the major model architectures at a high level
3. understand the core math well enough to read model code without panic
4. reason about inference behavior
5. reason about performance bottlenecks in systems such as `llama.cpp`

This must be a strict guided curriculum, not a loose collection of articles.

The target role is not "generic ML practitioner."
The target role is a senior software engineer ramping into inference and systems work at an AI company.

That means the site should optimize for:

- model execution understanding
- serving and runtime intuition
- practical code reading
- disciplined performance reasoning

It must not pretend to make the learner training-research ready.

The site should feel like:

- a software engineering tutorial
- a systems tutorial
- an interactive textbook

It must not feel like:

- a marketing site
- a research survey
- a glossary dump
- a random blog collection

## Non-Negotiable Product Constraint

The site must be designed as a one-way path:

- concept A comes before concept B
- the user should never be forced to infer missing prerequisites
- each lesson must unlock the next lesson only after a mastery check

The default experience is:

`Start -> Foundations -> Math -> Transformer Block -> Architectures -> Inference -> Performance -> Case Studies`

The site may offer free navigation later, but only after the guided path is complete.

## Educational Promise

The site promises:

- no unexplained jargon
- no unexplained equations
- no performance discussion before the user understands the computation
- no architecture discussion before the user understands the block
- no code walkthrough before the user understands the math and shapes

## Audience

Primary audience:

- software engineers
- systems engineers
- performance-oriented contributors
- technically strong hobbyists

Assumptions:

- reader can read code
- reader can follow algebra if it is introduced carefully
- reader does not need prior ML training
- reader may be uncomfortable with linear algebra or probability

This means the site must teach the required math explicitly rather than assuming it.

## Scope Boundary

This course is about inference and systems.

It should teach only the minimum training and evaluation concepts needed to understand:

- next-token prediction as an objective
- logits and probabilities
- perplexity as a validation metric
- why output equivalence matters during optimization

It is not a full course on:

- optimization algorithms
- backpropagation
- distributed training
- RLHF or alignment workflows
- data curation pipelines

## Success Criteria

A reader who completes the guided path should be able to:

- define tokens, embeddings, hidden states, logits, softmax, attention, FFN, MoE, KV cache, prefill, and decode
- sketch a decoder transformer block from memory
- explain what Q, K, and V do without reciting jargon
- explain the difference between dense FFN and MoE
- explain how positional information enters attention
- explain what the output head does
- explain why prefill and decode are different workloads
- explain why single-run benchmark results and serving behavior can diverge
- explain what perplexity is measuring at a practical level
- explain why an optimization can speed up inference yet still be invalid if it changes logits
- look at a profile and produce a plausible first performance hypothesis

## Teaching Doctrine

Every concept must be taught in exactly this order:

1. intuitive story
2. toy example
3. exact tensor view
4. minimal math
5. implementation hook
6. performance consequence
7. mastery check

If a lesson cannot support all seven steps, it is too early for that lesson.

In the earliest foundation lessons, the implementation and performance steps may be preview-level rather than deep dives.
The point is to create forward reference and motivation, not to force premature code reading.

## Learning Flow Principles

The site must optimize for sustained momentum, not only correctness of topic order.

### Principle 1: Practical payoff must arrive early

Within the first 30 minutes, the learner must see:

- one end-to-end inference request
- one real code artifact
- one explanation of where the rest of the course is heading

The learner should feel:

- "I can already see the machine"

not:

- "I have done a week of prerequisites before touching reality"

### Principle 2: One running example must persist through the whole course

The site must repeatedly return to the same simple running example:

- one short prompt
- one small decoder mental model
- one concrete `llama.cpp` execution path

Each module should revisit that example from a deeper angle:

- tokenization
- shapes
- logits
- attention
- KV reuse
- profiling

This turns the course into accumulation instead of topic hopping.

### Principle 3: Early friction must be low

For the foundational modules, self-checks should exist but should not feel punitive.

The learner should be corrected early and often, but not blocked every few minutes by hard progression walls.

### Principle 4: Practicality beats exhaustiveness

If a concept is only useful much later, it should either:

- appear as a teaser
- or move later in the sequence

It should not interrupt the first strong wave of motivation.

## Site-Level Rules

### Rule 1: One concept per lesson

Each lesson should answer one question only.

Bad:
- "Attention, KV cache, and prefill vs decode"

Good:
- "What is a token?"
- "What is a hidden state?"
- "Why does attention need softmax?"

### Rule 2: No skipped math

If a lesson uses:

- vectors
- dot products
- matrices
- softmax
- normalization

then the required math must already have been taught earlier in the curriculum.

### Rule 3: Performance always comes after mechanism

The user must first know:

- what operation is happening
- what tensors are involved
- what shapes are involved

before being asked to reason about speed.

### Rule 4: Every lesson ends with a gate

The user must answer:

- at least one conceptual question
- at least one shape/math question

before continuing.

### Rule 5: The site must repeatedly connect concept to code

The target reader wants practical understanding.

Every major concept must eventually point to a real implementation artifact in `llama.cpp`.

## Curriculum Spine

The curriculum must be linear and explicit.

This design document breaks the material into 13 conceptual modules.
The implementation may merge some of them into fewer guided modules.
The curriculum document is authoritative for the final guided module count.

Each module should have:

- learning objective
- required vocabulary
- exact math scope
- exact visual scope
- exact exercises
- mastery criteria

## Module 0: Orientation

### Objective

Give the reader the map of the journey and establish the mental model of what an LLM is.

### Must teach

- an LLM predicts the next token
- everything else is machinery for doing that prediction well
- training and inference are different concerns
- this site focuses on inference and systems understanding
- only the minimum training and evaluation concepts will be taught
- the learner will get an end-to-end request preview almost immediately

### Must not teach yet

- attention formulas
- architecture variants
- performance

### Required visual

- one diagram:
  `text -> tokenizer -> token IDs -> model -> logits -> next token`

### Exercises

- identify which stages are text processing and which are model computation

### Mastery gate

Reader can explain the difference between:

- raw text
- token IDs
- model output logits

## Module 1: Tokens and Vocabulary

### Objective

Make the reader comfortable with discrete tokenization.

### Must teach

- vocabulary is a finite set of token IDs
- text is broken into tokens, not characters or words in general
- model input is a sequence of integers
- output prediction is a distribution over the vocabulary

### Required math

- discrete set
- indexing
- categorical choice

### Required visuals

- sentence split into tokens
- token pieces to IDs
- token ID to vocabulary lookup

### Exercises

- map sample token strings to IDs
- explain why token count and word count differ

### Mastery gate

Reader can explain why "context length" is measured in tokens, not words.

## Module 2: Vectors, Embeddings, Hidden States

### Objective

Introduce vectors as learned representations.

### Must teach

- an embedding maps token ID -> dense vector
- hidden state is just "the current vector for each token"
- layers transform hidden states

### Required math

- vector as ordered list of numbers
- vector dimension
- shape notation like `[n_tokens, d_model]`

### Required visuals

- token IDs entering an embedding table
- token vectors drawn as rows in a sequence matrix

### Exercises

- identify tensor shapes after embedding lookup
- explain what changes between layer 0 and layer 10 hidden states

### Mastery gate

Reader can distinguish:

- token ID
- embedding vector
- hidden state

## Module 3: Matrix Multiplication for LLMs

### Objective

Teach the minimum linear algebra needed for everything else.

### Must teach

- matrix-vector multiplication
- matrix-matrix multiplication
- linear projection
- shape compatibility

### Required math

- dot product
- matrix multiply
- shape rule:
  `[m, k] x [k, n] -> [m, n]`

### Required visuals

- small worked 2x3 by 3x2 multiply
- projection from `d_model` to `d_ff`

### Exercises

- predict output shapes
- identify invalid multiplications

### Mastery gate

Reader can compute a tiny matrix multiply by hand and track shapes correctly.

## Module 4: Probability, Logits, Softmax

### Objective

Teach how model scores become probabilities.

### Must teach

- logits are raw scores
- the output head maps hidden states to vocabulary scores
- softmax turns logits into probabilities
- argmax vs sampling

### Required math

- exponentials at an intuitive level
- normalization to sum to 1
- softmax formula

### Required visuals

- bar chart of logits
- bar chart after softmax

### Exercises

- compare two logit vectors and predict which token becomes more likely
- explain why larger logits dominate after softmax

### Mastery gate

Reader can explain what logits are and what softmax changes.

## Module 5: The Decoder Transformer Block

### Objective

Establish the standard repeated block.

### Must teach

- input hidden state
- normalization
- attention
- residual
- normalization
- FFN
- residual

### Required math

- none beyond shapes

### Required visuals

- one canonical decoder block diagram
- the same diagram annotated with tensor flow

### Exercises

- place the components in the correct order
- identify where token mixing happens and where per-token transformation happens

### Mastery gate

Reader can sketch the standard decoder block from memory.

## Module 6: Attention in Depth

### Objective

Teach exactly what attention does.

### Must teach

- Q, K, V as learned projections
- positional information must enter the attention path
- score matrix from `Q K^T`
- masking for causality
- softmax over scores
- weighted sum over V
- multi-head attention as parallel smaller attentions

### Required math

- dot product as similarity
- score matrix shape
- softmax over one axis
- head splitting and recombination

### Required visuals

- token-to-token score table
- causal mask
- weighted combination of values

### Exercises

- compute a toy attention example with 2 or 3 tokens
- explain why causal masking is needed

### Mastery gate

Reader can explain:

- what Q, K, V are for
- why attention mixes tokens
- why masking matters

## Module 7: Normalization, Residuals, FFN

### Objective

Teach the non-attention half of the block in depth.

### Must teach

- residual connection meaning
- RMSNorm intuition
- FFN as expand -> activate -> contract
- gate path in GLU-style FFNs

### Required math

- elementwise multiply
- nonlinear activation at a conceptual level

### Required visuals

- residual shortcut diagram
- FFN width expansion and contraction

### Exercises

- identify which operations are token-mixing and which are per-token
- explain why FFN can dominate compute even though it does not mix tokens

### Mastery gate

Reader can explain why attention and FFN have different roles.

## Module 8: Architecture Variants

### Objective

Teach how major model families differ from the canonical dense block.

### Must teach

- dense transformer
- grouped-query attention
- multi-query attention
- sliding-window attention
- shared-KV layers
- MoE

### Required math

- mostly shape reasoning

### Required visuals

- side-by-side architecture deltas
- what changes in Q/K/V shape
- what changes in FFN path

### Exercises

- classify a block as dense, SWA, GQA, or MoE-enhanced
- identify which change is for memory reduction and which for compute reduction

### Mastery gate

Reader can explain the reason each variant exists.

## Module 9: Mixture of Experts

### Objective

Teach MoE carefully enough that the user can follow a real implementation.

### Must teach

- router logits per token
- softmax or sigmoid gating
- top-k expert selection
- expert weights
- weighted aggregation
- shared branch vs expert branch

### Required math

- top-k selection
- weighted sum
- optional renormalization of selected expert weights

### Required visuals

- one token routed to experts
- many tokens routed independently
- weighted sum of expert outputs

### Required implementation hook

Use the shared MoE builder `build_moe_ffn()` in `src/llama-graph.cpp`.

### Exercises

- given router probabilities, pick top-k experts
- renormalize selected expert weights
- compute weighted sum of expert outputs in a toy example

### Mastery gate

Reader can explain how experts are selected and how their outputs are combined.

## Module 10: Inference Mechanics

### Objective

Teach how the graph behaves at runtime.

### Must teach

- prefill
- decode
- KV cache
- why decode reuses old work
- why long context changes costs
- batching
- microbatching / ubatching
- request scheduling and continuous batching in serving systems
- single-run benchmarking and serving are different realities

### Required math

- complexity reasoning
- not full asymptotics, but enough to understand growth

### Required visuals

- prefill timeline
- decode timeline
- KV cache reuse diagram

### Exercises

- identify what gets recomputed in prefill vs decode
- explain why decode may be memory-sensitive
- explain what ubatch changes operationally
- explain why the best single-run benchmark setting may not be the best serving setting

### Mastery gate

Reader can explain the difference between prefill and decode in both computation and memory reuse.

## Module 11: Performance Reasoning

### Objective

Teach the user to reason about bottlenecks without cargo culting.

### Must teach

- compute-bound vs memory-bound
- GEMM vs GEMV
- why FFN often dominates prefill
- why decode can become cache / bandwidth limited
- quantization
- repack
- thread count
- affinity
- serving throughput vs latency tradeoffs
- what perplexity means at a practical level
- why speed wins need equivalence validation

### Required math

- bytes moved vs operations performed
- rough operational intensity intuition

### Required visuals

- prefill operator mix
- decode operator mix
- simplified roofline-style intuition graphic

### Exercises

- given a profile, identify the likely first bottleneck
- decide whether a knob targets compute, memory, or scheduling
- explain why a speedup could still be invalid

### Mastery gate

Reader can form a first performance hypothesis from a profile and defend it coherently.

## Module 12: Real Case Studies

### Objective

Connect all abstractions to real `llama.cpp` code.

### Case study sequence

1. dense Gemma block
2. Gemma 4 attention path
3. Gemma 4 MoE layer
4. prefill vs decode profile interpretation
5. optimization + validation failure

### Required code anchors

- dense Gemma builder:
  `src/models/gemma.cpp`
- Gemma 4 builder:
  `src/models/gemma4-iswa.cpp`
- shared FFN helper:
  `build_ffn()` in `src/llama-graph.cpp`
- shared attention helper:
  `build_attn()` in `src/llama-graph.cpp`
- shared MoE helper:
  `build_moe_ffn()` in `src/llama-graph.cpp`

### Mastery gate

Reader can walk through a real model builder and explain what happens at each major stage.

## Mandatory Math Progression

The site must introduce math in this exact order.

### Math 0

- scalar
- list
- index

### Math 1

- vector
- vector dimension
- elementwise operation

### Math 2

- dot product
- why dot product can act as similarity

### Math 3

- matrix multiply
- projection
- shape propagation

### Math 4

- logits
- probability distribution
- softmax

### Math 5

- weighted sum
- top-k selection
- normalization of selected weights

### Math 6

- rough complexity intuition
- rough bandwidth intuition

The site must stop short of research-level proofs. The purpose is operational understanding.

## Prescribed Lesson Template

Every lesson must use the same structure.

### Section A: Question

Open with exactly one user-level question.

Examples:

- "What is a token?"
- "Why does attention need Q, K, and V?"
- "Why is decode often slower than expected?"

### Section B: Intuition

Explain in plain language, no symbols.

### Section C: Toy Example

Use the smallest possible example that is still honest.

### Section D: Shapes

Show exact tensor shapes.

### Section E: Math

Introduce only the math needed for this concept.

### Section F: Implementation

Point to the real place it exists in code.

### Section G: Performance

Explain why this concept matters for runtime.

### Section H: Check

One conceptual check and one shape/math check.

### Section I: Drill Down

Optional deeper links, never required for the main path.

## Interactive Components

The site should include only interactivity that improves understanding.

## Mandatory Interactive Components

### 1. Tokenizer Explorer

User enters text.

The tool shows:

- token pieces
- token IDs
- token count

Purpose:
- break the "words in, words out" mental model early

### 2. Shape Explorer

User inputs:

- sequence length
- `d_model`
- number of heads
- number of KV heads
- FFN width

The tool shows:

- embedding shape
- Q/K/V shapes
- attention score shape
- FFN input/output shapes

Purpose:
- shape reasoning should become automatic

### 3. Attention Simulator

Must support:

- 3-token toy example
- causal mask on/off
- score matrix
- softmax result
- weighted sum result

Purpose:
- make attention concrete

### 4. MoE Simulator

Must support:

- router logits
- softmax
- top-k selection
- renormalization
- weighted sum of expert outputs

Purpose:
- MoE should become mechanical, not mystical

### 5. Inference Timeline Simulator

Must show:

- prefill
- decode
- KV cache reuse
- where compute repeats

Purpose:
- teach inference behavior visually

### 6. Performance Diagnosis Lab

Given a synthetic profile, user must decide:

- compute-bound or memory-bound
- likely hot operator
- likely first knob to try
- whether correctness validation is needed

Purpose:
- teach disciplined reasoning

## Assessment Design

Assessments must be cumulative.

### Per-lesson gate

2 to 4 questions.

Required types:

- one concept question
- one shape question

### Per-module quiz

5 to 10 questions.

Required types:

- terminology
- diagram labeling
- shape reasoning
- performance reasoning where applicable

### Capstone assessments

The site should end with 3 capstones:

1. Explain a dense block
2. Explain an MoE layer
3. Diagnose a profile

The user passes only if they can do all three.

## Navigation Rules

The default UI must enforce order.

### Home page must show only:

- `Start Guided Path`
- `Resume`
- `Reference`

### Guided mode must show:

- current module
- current lesson
- what the user already knows
- what comes next

### Locked progression

The user should not jump to:

- MoE
- KV cache
- performance

until prerequisite modules are complete.

### Reference mode

Glossary and cheatsheets may always be available.

## Visual Design Rules

The site must use a consistent visual language.

### Color semantics

- tokens and embeddings: blue
- normalization: gray
- attention: orange
- FFN: green
- router and selection: red
- expert paths: yellow
- KV cache: teal
- logits and sampling: purple

### Diagram semantics

- boxes for transformations
- cylinders or memory blocks for caches
- arrows for tensor flow
- dotted arrows for reused state

### Do not do

- fancy gradients with no semantic meaning
- decorative animations that do not teach anything
- overly abstract circles-and-lines diagrams with no tensor explanation

## Content Style Guide

### Tone

- direct
- calm
- rigorous
- practical

### Sentence style

- short paragraphs
- no unnecessary hype
- no academic throat clearing

### Forbidden content style

- "Imagine magic vector spaces"
- "This is complicated but trust us"
- unexplained notation
- hand-wavy performance claims

## `llama.cpp` Integration Policy

The site should repeatedly connect concepts to concrete implementation points in `llama.cpp`.

Required integration themes:

- model metadata loading
- graph building
- attention helper
- FFN helper
- MoE helper
- CPU kernel and repack selection
- runtime concepts such as prefill, decode, batching, and profiling

This is important because the target reader wants practical understanding, not just theory.

## MVP Specification

The first release must include the entire guided path, but with the minimum number of lessons needed for continuity.

### Required MVP modules

- Module 0 through Module 12

### Required MVP interactivity

- Tokenizer Explorer
- Shape Explorer
- Attention Simulator
- MoE Simulator
- Inference Timeline Simulator
- one Performance Diagnosis Lab

### Required MVP case studies

- dense Gemma
- Gemma 4 attention
- Gemma 4 MoE

## Version 2 Specification

Only after the guided path is solid:

- multimodal modules
- deeper quantization modules
- backend-specific performance labs
- guided reading of profiles from real benchmark runs
- optimization validation labs

## Acceptance Criteria

The design is complete only if a future implementer can answer these questions from this document alone:

- what is the exact module order?
- what does each module teach?
- what math must appear in each module?
- what interactive components are mandatory?
- what assessments are mandatory?
- what navigation constraints enforce the one-way journey?
- what implementation/code touchpoints should be used?

If the document leaves those unspecified, it is too vague.

## Final Recommendation

Build this as a strict guided systems curriculum.

The differentiator should be:

- one-way structured learning
- concept -> shapes -> math -> code -> performance
- repeated connection to `llama.cpp`
- mandatory mastery gates

The site should not try to be "everything about AI."

It should aim to be:

- the most practical path from "I know almost nothing" to
- "I can read model code and reason about performance without bluffing."
