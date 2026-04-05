# Page-by-Page Review Plan

## Goal

Every page in the guided path must be reviewed for rendering, interactivity, and content accuracy before the site is considered complete. The review is iterative and exhaustive — no page is skipped, no finding is deferred.

## Scope

56 pages in guided-path order:

| Group | Pages |
|---|---|
| Landing | `/` |
| M0 Orientation | L00, L01, L01A |
| M1 Discrete Input | L02, L03, L04 |
| M2 Linear Algebra | L05, L06, L07, L08, L09, L10 |
| M3 Probability | L11, L12, L13 |
| M4 Transformer Block | L14, L15, L16, L16A, L17, L18, L18A, L19, L20, Q-M4 |
| M5 Architecture Variants | L21, L22, L23, L24, L25, L26, Q-M5 |
| M6 Inference Mechanics | L27, L28, L29, L30, L30A, L31, Q-M6 |
| M7 Performance | L32, L33, L34, L35, L36, L37, L38, Q-M7 |
| M8 Case Studies | L39, L40, L41, L42, L43, CAPSTONE |
| Reference | Glossary, Dashboard |

## Review Order

Pages are reviewed in curriculum order. This matters because:

- earlier lessons define vocabulary used by later lessons
- fixes to early pages may require propagating changes forward
- progression and gate behavior must be tested sequentially

## Per-Page Review Protocol

Each page goes through three phases. All three must pass before moving to the next page.

### Phase 1: Rendering and Interactivity (Playwright)

**Tool**: Playwright browser automation

**Steps**:

1. Navigate to the page URL
2. Take a full-page screenshot at desktop width (1440×900)
3. Verify visually:
   - page renders without blank areas or broken layout
   - sidebar shows with correct module highlighted
   - lesson header displays correct ID, title, module breadcrumb
   - all section labels render (Question, Intuition, Toy Example, Shapes, Math, Implementation Hook, Performance Hook, Check Yourself)
   - code blocks render with monospace font and correct syntax highlighting
   - shape cards render with correct border colors
   - implementation and performance hook boxes render with correct left-border accent
4. If the page has interactive components:
   - verify the component renders (not blank or errored)
   - interact with it (type text, click buttons, adjust sliders)
   - verify output updates correctly
   - check console for JavaScript errors
5. Test the gate:
   - select correct answers
   - click "Check Answers"
   - verify gate shows "Gate passed"
   - verify the "Next lesson →" navigation becomes active
   - check console for errors during gate submission
6. If any rendering or interaction issue is found:
   - fix the code
   - rebuild
   - re-run Phase 1 from step 1

**Exit criterion**: full-page screenshot looks correct, all interactives work, gate passes without console errors, navigation unlocks.

### Phase 2: Content Review (Self)

**Tool**: read the lesson file directly

**Steps**:

1. Read the full lesson source file
2. Check each section against these criteria:

| Section | Check |
|---|---|
| Question | Exactly one question. Matches the lesson's learning objective. |
| Intuition | Plain language, no formulas not yet introduced. No jargon not yet defined. |
| Toy Example | Fully worked. All numbers verifiable by hand. Matches the running example where applicable. |
| Shapes | Tensor shapes explicitly named. Axes labeled. No "obvious" hand-waving. |
| Math | Only formulas legal at this point in the math ladder. Every new symbol defined in this section. |
| Implementation Hook | Points to a real file/function. For M4+, has a code lens reference. No forward-references to concepts not yet taught. |
| Performance Hook | Explains what is expensive and why. Does not discuss performance concepts before they are taught. |
| Check Yourself | At least one conceptual question. At least one shape/math question (when the lesson introduces shapes or math). Correct answer is unambiguously correct. Distractors are plausible but clearly wrong. Explanation is accurate. |

3. Check for cross-lesson consistency:
   - does the lesson use vocabulary defined in a prior lesson?
   - does the lesson reference the running example correctly?
   - does the lesson avoid forward-references to later modules?
4. If any content issue is found:
   - fix the source file
   - rebuild
   - re-run Phase 2 from step 1

**Exit criterion**: all content checks pass on a clean read-through.

### Phase 3: Codex Review (Iterative)

**Tool**: Codex agent (codex:codex-rescue)

**Steps**:

1. Send the page to Codex with this prompt template:

```
Review this lesson page for an LLM tutorial website.
File: [path]
Lesson: [ID] — [title]
Module: [module name]
Prerequisites taught so far: [list of concepts from prior lessons]

Check for:
1. Factual errors about LLMs, inference, attention, or performance
2. Arithmetic mistakes in toy examples
3. Ambiguous or misleading wording
4. Gate questions where the "correct" answer is debatable or a distractor is arguably correct
5. Forward-references to concepts not yet taught at this point in the curriculum
6. Inconsistency with the running example ("The cat sat" → [791, 2368, 3290])

Report ONLY actual problems. If no issues, say "No issues found."
```

2. If Codex reports issues:
   - fix each issue in the source file
   - rebuild
   - re-submit the same page to Codex with: "The following issues were fixed: [list]. Re-review the page. Report only NEW or remaining issues."
3. Repeat step 2 until Codex responds with "No issues found."
4. If Codex finds no issues on first submission, move to the next page.

**Exit criterion**: Codex returns "No issues found" on a clean pass.

## Interactive Component Test Matrix

Pages with interactive components require additional Playwright testing:

| Component | Pages | Test Actions |
|---|---|---|
| Tokenizer Explorer | L02, L03, L04 | Type text → verify token count, pieces, IDs update. Try empty string, long string, special characters. |
| Pipeline Stepper | L01A | Click each stage → verify detail panel updates. Use Next/Back buttons. Verify all 6 stages render. |
| Softmax Inspector | L11, L12, L13 | Adjust logit values → verify bar charts update. Change temperature → verify distribution sharpens/flattens. Verify argmax label updates. |
| Attention Simulator | L17 | Toggle causal mask → verify score matrix updates. Click each token → verify output calculation updates. Verify masked cells show -∞. |

## Gate Progression Test

After all individual pages pass, run one end-to-end progression test:

1. Clear localStorage (reset progress)
2. Start at L00
3. For each lesson in order:
   - answer all gate questions correctly
   - verify gate passes
   - click "Next lesson →"
   - verify the next page loads
4. Continue through at least M0-M1 (6 lessons)
5. Verify the dashboard shows correct progress counts

## Defect Tracking

During review, issues fall into three categories:

| Category | Action |
|---|---|
| **Rendering** | Fix CSS/HTML, rebuild, re-screenshot |
| **Interactivity** | Fix component code, rebuild, re-test with Playwright |
| **Content** | Fix in source, rebuild, re-submit to Codex |

All fixes are committed incrementally. Do not batch fixes across multiple pages — commit after each page passes all three phases.

## Completion Criteria

The review is complete when:

- all 56 pages have passed Phase 1, Phase 2, and Phase 3
- the end-to-end progression test passes
- all fixes are committed and pushed
- the deployed site at `llm.jerrinot.info` renders correctly

## Estimated Effort

- ~2-3 minutes per simple lesson (no interactives, clean content)
- ~5-8 minutes per lesson with interactives
- ~10 minutes per lesson that triggers Codex findings and requires iteration
- Total: approximately 3-5 hours for all 56 pages
