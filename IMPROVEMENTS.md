# Course Improvement Plan

Based on external review feedback and a thorough audit of the current codebase: curriculum structure, lesson content, gating logic, assessment design, and homepage copy.

---

## 1. Fix the Guided Path Arithmetic

**Problem:** The homepage renders `{guidedStepCount} guided steps: {lessonCount} lessons, {quizCount} quizzes, {capstoneCount} capstone`, which currently produces "54 guided steps: 50 lessons, 4 quizzes, 1 capstone." But 50 + 4 + 1 = 55, not 54. The reviewer flagged this as a credibility issue, and they were right — on a course that emphasizes precision, off-by-one copy is a self-inflicted wound.

**Root cause:** Lesson `L04A` ("Discrete Input Synthesis: Text, IDs, and Budget") is defined in `curriculum.ts` as a lesson and listed in the M1 module's `lessonIds`, but it is **missing from the `guidedPath` array**. The `guidedPath` jumps directly from `L04` to `L05`, skipping L04A. So `guidedPath.length` is 54, but `lessonCount` counts all 50 lesson-kind entries in the `lessons` object including L04A.

**Fix:** Add `'L04A'` to `guidedPath` between `'L04'` and `'L05'`. This makes `guidedPath.length` = 55, and the rendered text becomes "55 guided steps: 50 lessons, 4 quizzes, 1 capstone" — which adds up correctly. The lesson already exists, has content, and has correct prerequisite/unlock chains (`L04` → `L04A` → `L05`), so the fix is a one-line change in `curriculum.ts`.

**Files:** `src/data/curriculum.ts` (guidedPath array, line ~770)

---

## 2. Tighten the Homepage Copy

**Problem:** The homepage says "Go from zero understanding of LLMs" and "No prerequisites beyond code literacy." The reviewer correctly identified that the course quickly introduces tensor-shape narration, RoPE equations, arithmetic intensity, machine balance, quantization block formats, and heterogeneous per-layer configs. This is absolutely accessible to a motivated engineer, but it is not "zero understanding" in the way most people read that phrase.

**What to change:**

The hero subtitle currently reads:
> Go from zero understanding of LLMs to reading model code and reasoning about inference performance. A strict, linear curriculum for engineers who want practical understanding, not hand-waving.

Change to something like:
> Go from no exposure to LLM internals to reading model code and reasoning about inference performance. A strict, linear curriculum for engineers who want real understanding, not hand-waving.

The footer currently reads:
> Built for engineers. No prerequisites beyond code literacy.

Change to something like:
> Built for engineers. Prerequisites: comfort with code and willingness to engage with math.

**Justification:** The course IS approachable for someone new to LLM internals. But "zero understanding" implies no technical bar at all, and "no prerequisites beyond code literacy" implies the math will be trivially easy. Neither is true. The learner needs to be comfortable with things like shape notation, multiplicative scaling, and structured reasoning about memory and compute. The fix is not to lower the content — it is to raise the honesty of the marketing so learners self-select accurately.

**Files:** `src/pages/index.astro` (hero subtitle ~line 27, footer ~line 152)

---

## 3. Add a Real Code Walkthrough in M2 or M3

**Problem:** The course promises "Read real code" as one of its six learning outcomes, but actual code reading does not begin until L39 (the first case study in M8). L39 is guided step 49 of 55 (after the L04A fix) — nearly the end of the course. The implementation hooks in every lesson reference specific files and functions (`src/models/gemma.cpp`, `build_attn()`, `build_ffn()`), but they describe what code does rather than showing it. Even the M8 case study pages (e.g., L39 dense-gemma.astro) describe the builder pattern in prose without embedding actual code listings.

This matters because engineer learners are motivated by seeing concrete artifacts early. The implementation hooks are doing real bridging work — they are not nothing — but there is a large gap between "this function exists in this file" and "here is what 10 lines of that function actually look like, and here is how the concepts you just learned map onto them."

**What to add:** A short code-reading exercise in the Linear Algebra Synthesis page (L10A) or as a new page immediately after it. This page already traces the full tiny pipeline end-to-end, so it is the natural place to show what that same pipeline looks like in real code.

**Sourcing decision required:** This repo does not contain the llama.cpp source files that implementation hooks reference — those are external paths (`src/models/gemma.cpp`, `src/llama-graph.cpp`, etc. in the ggml-org/llama.cpp repo). Before embedding code excerpts anywhere in the course, decide on a sourcing strategy:

- **Option A: Pinned snapshot.** Copy excerpts from a specific llama.cpp commit and record the commit hash. Add a build-time or CI check that diffs the pinned excerpts against upstream to detect drift. This is the most reliable approach but requires maintenance.
- **Option B: Build-time fetch.** Write a script that extracts specific line ranges from a pinned llama.cpp tag at build time. Keeps excerpts fresh when you bump the pin, but adds build complexity.
- **Option C: Manual copy with staleness warning.** Copy excerpts and display the source commit hash alongside them. Accept that they may drift, and add a note like "based on llama.cpp commit abc1234 — the actual code may have changed." Lowest effort, highest drift risk.

This decision applies equally to Section 8 (embedding code in M8 case studies). Pick one strategy and apply it everywhere.

The exercise should:
- Show a short (10-20 line) excerpt from `gemma.cpp` or `llama-graph.cpp` (sourced per the strategy above)
- Ask the learner to identify which lines correspond to embedding lookup, which to a projection, which to a residual add
- Use annotations or side-by-side format, not just "read this and understand it"
- Make it clear this is a preview, not a deep dive — the case studies in M8 will do the full walkthrough

**Justification:** This addresses the reviewer's most impactful criticism (long runway before payoff) with minimal structural disruption. It does not require changing the course order or adding skip-ahead paths. It just pulls a small piece of the M8 payoff forward into the place where the learner has enough vocabulary to appreciate it. The learner has just finished vectors, embeddings, dot products, matrix multiply, projections, and tensor shapes — they know enough to read a simple builder function.

**Files:** New section in `src/pages/math/linear-algebra-synthesis.astro` or a new page between L10A and L11

---

## 4. Diversify Assessment Beyond Multiple Choice

**Problem:** Every "Check Yourself" section and every quiz uses the same two question types: `single_choice` and `numeric`. The questions are overwhelmingly conceptual recognition questions ("What does X do?" "What is the shape of Y?"). For a course whose stated goal is reading model code and reasoning about performance, the assessments don't exercise those skills until M8.

The reviewer correctly identified that stronger exercises would include:
- Tracing shapes through a real snippet
- Identifying a bottleneck from a trace
- Predicting the effect of changing a parameter before seeing the answer

**What to add:**

### 4a. Shape-trace exercises (starting in M2)

Add a new question type: `shape_trace`. Present a sequence of operations and ask the learner to fill in the intermediate shapes. Example:

```
Input: [8, 512]
→ Linear projection to d=2048: [?, ?]
→ Split into 8 heads: [?, ?, ?]
→ Attention output per head: [?, ?, ?]
→ Concatenate heads: [?, ?]
```

This is more demanding than MCQ but directly exercises the skill the course is building. It can be implemented with a series of numeric inputs or a structured fill-in component.

### 4b. Code-mapping exercises (starting in M4 or the new M2 code preview)

Show a short code snippet and ask the learner to match lines to concepts. Example: given 6 lines from a builder function, match each line to "RMSNorm", "Q projection", "K projection", "attention score", "residual add", or "FFN". This can be implemented as a drag-and-drop or as a series of MCQs with shared context.

### 4c. "What changes" exercises (starting in M5-M7)

Present a scenario and ask the learner to predict the consequence. Example: "If you change `n_kv_heads` from 8 to 1 (MQA) while keeping `n_heads = 32`, what happens to the KV cache size per layer?" with choices that test whether the learner understands the ratio, not just the definition.

**Justification:** The current MCQ-heavy assessment creates a false sense of competence. A learner can pass every quiz by recognizing correct definitions without being able to trace a shape through a projection or reason about what a parameter change would do. Diversifying the exercises aligns the assessment with the course's actual learning outcomes. The exercises can be added incrementally — they don't require replacing existing questions, just supplementing them.

**Files:** `src/components/assessment/GatePanel.tsx` (add new question types), individual lesson .astro files (add new questions)

---

## 5. Fix the Gate/Progress Pipeline (Not Just Threshold Copy)

**Problem:** The four module quizzes have inconsistent passing requirements in their display text:
- Q-M4 (Dense Transformer): "You need 80% or better to proceed"
- Q-M5 (Architecture Variants): "You must pass all questions to proceed"
- Q-M6 (Inference Mechanics): "All questions must be answered correctly to pass"
- Q-M7 (Performance Reasoning): "You need 80% or better to proceed"

But the inconsistent copy is the surface symptom. **The actual bug is in the gate-to-progress pipeline.** Three things are broken:

1. **GatePanel always signals pass.** `GatePanel.tsx:46-48` calls `window.__gatePass()` 800ms after every submit, regardless of the learner's score. There is no threshold check — a learner who gets 0/5 triggers the same callback as one who gets 5/5.

2. **LessonPage marks complete on any submit.** `LessonPage.tsx:28-31` wires `__gatePass` to `handleGatePass()`, which calls `completeLesson()`. So every quiz submit — at any score — marks the lesson as completed in localStorage.

3. **`passQuiz()` is dead code.** `progress.ts:60-68` defines `passQuiz()` which adds a quiz ID to `passedQuizzes[]`, but nothing in the codebase calls it. The quiz-specific progress tracking was written but never connected.

4. **`isLessonUnlocked()` is a no-op.** `progress.ts:45-47` always returns `true`, so even if completion and quiz-pass were tracked correctly, the path wouldn't be gated.

This means: standardizing the threshold copy (the original Option A) would not fix the behavior. A learner would still see "80% required" but get marked complete regardless.

**What to fix (in order):**

### Step 1: Make GatePanel score-aware

`GatePanel.tsx` already computes `correctCount` and `allCorrect`. Change `handleSubmit` to only call `__gatePass()` when the score meets the threshold. The threshold should be passed as a prop (e.g., `passThreshold: number` where 1.0 = all correct, 0.8 = 80%). When the learner fails, show the retry button and a clear message about what's needed — but do NOT call `__gatePass`.

### Step 2: Distinguish lesson completion from quiz pass

For regular lessons (kind='lesson'), the current behavior is fine — completing the Check Yourself section marks the lesson done. For quizzes (kind='quiz'), `handleGatePass` should call `passQuiz()` instead of (or in addition to) `completeLesson()`. This makes the `passedQuizzes` array in progress state actually meaningful.

### Step 3: Implement `isLessonUnlocked()`

Replace the `return true` stub with logic that checks:
- For lessons with `gateStrength: 'soft'`: always unlocked (current behavior, intentional for M0-M3)
- For lessons with `gateStrength: 'hard'`: check that all prerequisites are in `completedLessons[]` (and for quiz prerequisites, in `passedQuizzes[]`)

This is where the `gateStrength` field in `curriculum.ts` finally does what it was designed to do.

### Step 4: Standardize threshold copy

Pick one threshold for all four quizzes (80% is reasonable) and update the page text. This step is trivial once the pipeline above actually enforces it.

**Files:**
- `src/components/assessment/GatePanel.tsx` (score-aware pass signal, threshold prop)
- `src/components/course/LessonPage.tsx` (distinguish lesson completion from quiz pass)
- `src/data/progress.ts` (`isLessonUnlocked()` implementation, wire `passQuiz()`)
- `src/pages/quiz/*.astro` (standardize threshold text, pass threshold prop to GatePanel)

---

## 6. Introduce Messier Artifacts Earlier

**Problem:** The running example (`"The cat sat"` / `[791, 2368, 3290]` / `d_model=4`) is excellent scaffolding. The course reuses it across 23 lessons with tracked per-lesson focus (defined in `running-example.ts`). But the reviewer's concern is valid: the course leans on this toy setup for a long time, and engineers improve their transfer when they encounter messier inputs earlier.

The issue isn't the running example itself — it should stay. The issue is that it's the *only* concrete input the learner sees for many modules.

**What to add:**

### 6a. A "messy input" sidebar in M1 (tokens module)

After L04A (Discrete Input Synthesis), or within it, show what happens with edge cases:
- A prompt that exhausts the context budget
- A multi-byte Unicode token that splits unexpectedly
- The same word tokenized differently at the start of a sentence vs. mid-sentence (leading space handling)

These don't need full lessons. A "Did You Know?" or "Edge Case" callout box within an existing lesson would be enough.

### 6b. Real tensor names in M4 (transformer block)

When the block module introduces attention and FFN, show the actual tensor names from a real model config alongside the abstract notation. For example: "What we call `W_Q` is stored as `model.layers.0.self_attn.q_proj.weight` in a Gemma checkpoint." This bridges the gap between course notation and what the learner will see in the wild.

### 6c. A profiler screenshot or trace excerpt in M7 (performance)

The performance module (L32-L38) discusses GEMM vs GEMV, compute-bound vs memory-bound, and quantization — but entirely in prose. A real profiler output (even a simplified/annotated one) would make this material far more concrete. The case study L42 does this, but that's 10 lessons later.

**Justification:** The running example provides stability. The messy artifacts provide transfer. Both are needed. The key is that the messy artifacts supplement the running example rather than replacing it — they appear as callouts, sidebars, or "in the wild" sections within existing lessons rather than requiring new lessons.

**Files:** Various lesson .astro files in M1, M4, M7

---

## 7. Add an Early Milestone Checkpoint

**Problem:** The course is a 50-lesson linear sequence with no explicit milestones until the M4 quiz (lesson ~26 in the guided path). The first 16 lessons (M0 through M3) build foundations without any formal acknowledgment that the learner has achieved something. This is a long time to go without a sense of progress beyond a completion percentage.

**What to add:** A lightweight checkpoint page at the end of M2 or M3 — before the M4 material ramps up. This is not a quiz. It is a short page that:

1. Summarizes what the learner now knows: "You can now tokenize text, trace a token through embedding, follow a projection, and read tensor shapes. You know what logits are and how softmax turns them into a distribution."
2. Shows the running example in its current state: from raw text to probability distribution over next tokens.
3. Previews what's coming: "Next, you will see how the model actually transforms these vectors — the transformer block."

This creates a natural breathing point and a sense of arrival. The learner has just completed the foundations and is about to enter the dense technical core. Marking that transition explicitly improves motivation.

**Justification:** The reviewer's criticism about "mediocre motivational architecture" is overstated, but the kernel of truth is that the course doesn't celebrate intermediate achievement. A checkpoint page is cheap to build and directly addresses the pacing concern without changing the content or sequencing.

**Wiring required:** Adding a new page to the course is not just a file + guidedPath entry. The page must be registered in three places to appear correctly:

1. **`curriculum.ts` `lessons` object** — add a new entry (e.g., `L13A`) with `kind: 'lesson'`, `module: 'M3'`, `gateStrength: 'soft'`, and correct `prerequisites`/`unlocks` chains (`L13` → `L13A` → `L14`).
2. **`curriculum.ts` `guidedPath` array** — insert `'L13A'` between `'L13'` and `'L14'`.
3. **`curriculum.ts` `modules` array** — add `'L13A'` to the M3 module's `lessonIds` array. This drives the sidebar via `ProgressRail.tsx` and the homepage lesson counts via `index.astro`'s `countLessons()`.

If any of these three is missed, the page will be invisible in the sidebar, unreachable via navigation, or excluded from progress tracking.

**Files:** New page (e.g., `src/pages/probability/foundations-checkpoint.astro`), `src/data/curriculum.ts` (lessons object, guidedPath array, M3 module lessonIds)

---

## 8. Embed Actual Code in Case Study Pages

**Problem:** Even the M8 case study pages, which are explicitly about "reading real code," do not embed actual code. L39 (dense-gemma.astro) describes the builder pattern in prose — "the layer loop calls `build_norm()`, then `build_attn()`, then adds the residual" — but never shows the actual lines from `gemma.cpp`. The implementation hook at the bottom gives a file path but no code listing.

This is a surprising omission for case study pages. The earlier modules correctly use prose to describe code they haven't shown yet. But by M8, the learner has earned the right to see real code, and the case study format should deliver it.

**What to add:** Actual annotated code excerpts in each M8 case study page. For L39 (dense Gemma), this means showing the layer loop from `gemma.cpp` with inline annotations mapping each function call to the concept it implements. The excerpt should be 15-30 lines — enough to see the full block pattern, short enough to read carefully.

The annotation format could be:
- Side-by-side: code on the left, concept labels on the right
- Inline comments: `// ← attention pre-norm (Phase 1)`
- Highlighted regions: color-code the code to match the course's semantic color system (attention = blue, FFN = orange, etc.)

**Sourcing constraint:** Same as Section 3 — this repo does not contain the llama.cpp source files. The current case study pages only reference external paths (e.g., `src/models/gemma.cpp` in the file-path div of `dense-gemma.astro:113`, `gemma4-attention.astro:89`, `gemma4-moe.astro:95`, `optimization-and-regression.astro:96`). Embedding real code means adopting the sourcing strategy decided in Section 3 (pinned snapshot, build-time fetch, or manual copy with commit hash). This is not a "medium-effort content edit" — it requires the sourcing infrastructure first, then the content work on top.

**Justification:** The case studies are the culmination of the course. If they don't show actual code, the promise of "reading real code" is only partially delivered. The learner has been told for 38 lessons that everything is building toward this — the payoff should be tangible.

**Files:** `src/pages/case-study/dense-gemma.astro`, `src/pages/case-study/gemma4-attention.astro`, `src/pages/case-study/gemma4-moe.astro`, `src/pages/case-study/profile-interpretation.astro`, `src/pages/case-study/optimization-and-regression.astro`

---

## 9. Consider Exercise Variation Within the Template

**Problem:** Every lesson follows the same scaffold: Question, Intuition, Toy Example, Shapes, Math, Implementation Hook, Performance Hook, Check Yourself. The reviewer flagged "template fatigue" as a risk over 50 lessons. The consistency is genuinely valuable — it makes the course predictable and teaches learners to expect certain sections. But by the middle modules, the pattern can flatten the experience.

**What to do (conservative approach):** Keep the template but vary the *exercises* within it. The scaffold should stay stable; it's the "Do It Yourself" and "Check Yourself" sections that need variation. Specific ideas:

- **Narration exercises** (already present in some lessons): "Say this shape in plain English." Keep these — they're good.
- **Prediction exercises**: "Before reading the next section, predict what shape this operation will produce." This forces engagement before the answer is given.
- **Comparison exercises**: "How is this operation different from the one in lesson X?" This builds connections across the curriculum.
- **Debugging exercises**: "This tensor shape trace has one error. Find it." This exercises careful reading rather than recall.

These variations can be introduced gradually. Not every lesson needs every type. The goal is that no two consecutive lessons feel identical in their interactive sections, even though the overall page structure remains consistent.

**Justification:** This is the lowest-risk improvement because it doesn't change the template — it enriches the content within it. The template is a strength; the exercises are where the repetition becomes problematic.

**Files:** Individual lesson .astro files throughout the course

---

## Summary: Priority Order

| Priority | Improvement | Effort | Impact |
|----------|------------|--------|--------|
| 1 | Fix guidedPath arithmetic (add L04A) | Trivial | Credibility |
| 2 | Fix gate/progress pipeline | Medium | Correctness |
| 3 | Tighten homepage copy | Small | Trust/self-selection |
| 4 | Add code walkthrough in M2/M3 | Medium (requires sourcing decision) | Motivation |
| 5 | Embed actual code in M8 case studies | Medium-Large (requires sourcing infra) | Payoff |
| 6 | Add shape-trace exercises | Medium | Assessment quality |
| 7 | Add early milestone checkpoint | Small (three wiring points) | Motivation |
| 8 | Introduce messier artifacts | Small-Medium | Transfer |
| 9 | Vary exercises within template | Ongoing | Engagement |
