# Content Review Skill

Use this skill when reviewing or writing lesson content for this course. It codifies what makes excellent self-learning material.

## The Standard

This is an interactive textbook, not a blog post, not a cheat sheet, not annotated flashcards. Every page must have **textbook-like depth**: it must explain the theory (WHY something works, not just WHAT it is), walk through the math with intermediate steps, and ground everything in practical examples the reader can compute by hand. Long-form text is good. Depth is good. The reader should be able to learn the concept from this page alone, without any other reference.

At the same time, this is not a dry textbook. Each concept must connect to concrete systems behavior: memory, compute, code, runtime performance. Theory and practice interleave on every page.

## Audience

Engineers who code professionally but have zero exposure to LLM internals. They are comfortable with logic, abstraction, and structured reasoning. They are NOT comfortable with linear algebra, probability theory, or neural network architecture. They are motivated but will abandon material that hand-waves.

## What makes a page good enough

A page is ready when a self-learner can close it and:
1. Explain the concept to a colleague without looking back at the page
2. Work through a novel example by hand
3. Predict what would happen if one parameter changed
4. Recognize the concept in real code

If any of these fail, the page is not done.

## Mandatory content checklist for every lesson page

### Intuition (the WHY)
- [ ] **Motivate the concept before defining it.** Start with the problem this concept solves, not the solution. "We have raw scores that could be anything. We need probabilities." not "Softmax converts logits to probabilities."
- [ ] **Explain WHY this design was chosen**, not just what it is. "Why exponentials? Because they preserve ordering while making everything positive." If there's a simpler alternative that doesn't work, say why it doesn't.
- [ ] **No orphan concepts.** Every term used must either be defined on this page or linked back to the page where it was taught. Never use a term the learner hasn't seen yet without flagging it as a forward reference.

### Math (the HOW)
- [ ] **Show the formula AND walk through it step by step.** A formula without a worked example is decoration. A worked example without a formula is incomplete.
- [ ] **Annotate every variable.** First time a variable appears in a formula, say what it is: "z_i is the logit for token i."
- [ ] **Show intermediate steps.** Don't jump from input to output. Show the in-between: "First exponentiate: e^2.0 = 7.389. Then sum: 7.389 + 2.718 + 1.105 = 11.212. Then divide: 7.389 / 11.212 = 0.659."
- [ ] **Explain edge cases and extremes.** What happens when inputs are all equal? All zero? Very large? Very negative? This is where real understanding lives.

### Examples (the PROOF)
- [ ] **Use the running example.** Every page should connect back to [791, 2368, 3290] / "The cat sat" where applicable. This is the scaffold that carries across the entire course.
- [ ] **Provide at least one non-trivial worked example** with actual numbers. Not just "here's the shape" but "here's the actual computation with these specific values."
- [ ] **Show what changes when you tweak something.** "If we doubled d_model, the embedding table would be twice as wide — twice the memory, twice the parameters." This builds parametric intuition.

### Connection to the system (the SO-WHAT)
- [ ] **Connect to concrete system behavior.** Every concept should eventually touch performance, memory, or code. "This embedding table is 500M parameters. At FP16, that's 1 GB of model weight just for the vocabulary lookup."
- [ ] **Forward-reference sparingly and explicitly.** "You will see this operation again inside attention in M4" is fine. Using "attention" without noting the reader hasn't seen it yet is not.

### Assessment (the CHECK)
- [ ] **Questions must test reasoning, not recall.** Bad: "What does softmax do?" Good: "If you lower temperature from 1.0 to 0.1, what happens to the distribution?"
- [ ] **At least one question should require calculation.** Not recognition of the right answer, but working out the answer from the concept.
- [ ] **Distractors should represent real misconceptions**, not absurd strawmen.

## Common failure modes to watch for

1. **Annotated flashcard syndrome.** The page states what something is in 2-3 sentences, shows a formula, and moves on. This teaches nothing — the learner could get the same from a glossary. Fix: add WHY, show intermediate steps, work through examples.

2. **Forward reference without context.** "After all transformer layers have run..." in a lesson that comes before the transformer module. Fix: use language the learner already has: "After the model's internal processing steps (which you'll learn in M4)..."

3. **Formula without walkthrough.** Showing `p_i = exp(z_i) / Σ exp(z_j)` without computing a single concrete value. Fix: pick 3 numbers and show every intermediate step.

4. **Missing the parametric question.** The page explains what happens but never asks "what if this were different?" Fix: add a section or sidebar that changes one parameter and traces the consequence.

5. **Recognition-after-instruction assessment.** The page teaches X, then immediately asks "what is X?" Fix: ask the learner to apply X to a scenario, predict consequences, or compute a novel example.

6. **Shallow WHY.** "This is used because it works well." Fix: explain the design reasoning. Why this function and not another? What would break if you used a simpler alternative?

## How to use this skill

When reviewing a page:
1. Read the page as if you have never seen the concept before.
2. Check each item in the mandatory checklist.
3. List specific failures with line numbers.
4. For each failure, draft the fix — don't just flag it.

When writing new content:
1. Start with the problem/motivation, not the definition.
2. Write the worked example FIRST, then write the explanation around it.
3. After writing, re-read as a novice and mark every moment of confusion.
