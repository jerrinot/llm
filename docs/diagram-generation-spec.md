# Diagram Generation Spec

This document defines how diagrams for the site must be authored, rendered, and maintained.

The goal is not merely to "have diagrams."
The goal is to let agents and humans generate consistent, high-quality, pedagogically useful visuals autonomously.

## Design Goal

The site explains systems that are easier to understand visually than verbally:

- tokenization
- tensor shapes
- attention
- FFN structure
- MoE routing
- KV cache reuse
- serving timelines
- performance bottlenecks

Agents building the site must be able to generate these visuals without hand-drawing SVG each time.

## Core Rule

Diagrams must be authored from semantic source, not from raw SVG.

The source of truth must describe:

- what entities exist
- how they relate
- what each visual element means
- what the learner is supposed to notice

The source of truth must not be:

- a manually edited SVG file
- a screenshot
- a bitmap image
- an unstructured blob of drawing commands

## Output Stack

Use a 3-tier model.

1. semantic spec
2. render backend
3. compiled asset

This means:

- authors and agents edit semantic JSON
- renderers generate diagram source or SVG
- the site consumes compiled SVG or a live React component

## Approved Render Backends

There are three approved backends.

### 1. `react-svg`

Use for diagrams where pedagogy matters more than generic layout.

Examples:

- attention score matrices
- softmax row walkthroughs
- tensor shape overlays
- KV cache growth timelines
- MoE routing heatmaps
- serving timelines

Why:

- the site needs exact control over labels, highlights, and animation states
- these diagrams often encode teaching steps, not just graph structure

### 2. `d2`

Use as the default backend for static structural diagrams.

Examples:

- system overviews
- block diagrams
- architecture comparisons
- request pipeline diagrams
- builder/code relationship diagrams

Why:

- text-first authoring
- good visual quality
- deterministic enough for docs
- export-friendly

### 3. `graphviz`

Use only when strict DAG or layered hierarchy is the main requirement.

Examples:

- dependency graphs
- execution DAGs
- ordered pipeline maps
- graph-like code flow maps

Why:

- strong hierarchical layout
- mature SVG generation

## Disallowed as Primary Authoring Format

These may exist as exports or experiments, but not as the main source of truth:

- raw SVG hand authoring
- Figma-only sources
- PNG-only artifacts
- Mermaid as the canonical source for important pedagogical diagrams

Mermaid is acceptable for quick internal drafts, but not as the long-term primary format for key teaching visuals.

## Backend Selection Rules

Agents must choose a backend by rule, not taste.

### Choose `react-svg` if any of these are true

- the diagram must animate or step through pedagogy
- cell-level attention or matrix values matter
- the site needs hover/step highlighting
- exact placement is part of the explanation
- the same semantic diagram must render across several lesson states

### Choose `d2` if all of these are true

- the diagram is mostly nodes and edges
- auto-layout is acceptable
- the main goal is structural understanding
- the diagram can be understood as a static visual

### Choose `graphviz` if any of these are true

- rank ordering matters strongly
- a left-to-right or top-to-bottom DAG is the main message
- the diagram is hard to stabilize in D2
- graph structure matters more than visual decoration

If uncertain:

- prefer `react-svg` for pedagogical diagrams
- prefer `d2` for static architecture diagrams

## Directory Layout

Diagrams live inside the Astro source tree under `src/diagrams/`.

This is the canonical location. The stack doc and this spec agree on `src/diagrams/`.
There is no separate top-level `diagrams/` directory.

```text
src/diagrams/
  specs/
    tokens/
    math/
    block/
    architectures/
    inference/
    performance/
    case-study/
  generated/
    svg/
    d2/
    dot/
  components/
    react-svg/
  manifests/
```

### Meaning

- `src/diagrams/specs/`
  - semantic sources
- `src/diagrams/generated/d2/`
  - intermediate D2 sources generated from semantic JSON
- `src/diagrams/generated/dot/`
  - intermediate DOT sources generated from semantic JSON
- `src/diagrams/generated/svg/`
  - compiled static SVG artifacts
- `src/diagrams/components/react-svg/`
  - reusable pedagogical renderers
- `src/diagrams/manifests/`
  - indexes, theme manifests, and validation metadata

## Source of Truth Format

Every diagram must begin as a semantic JSON file.

### Minimum schema

```json
{
  "diagram_id": "block_attention_overview",
  "title": "Attention Overview",
  "lesson_ids": ["L17", "L18"],
  "learning_goal": "Show how Q, K, and V turn into scores, weights, and mixed outputs.",
  "backend": "react-svg",
  "diagram_type": "attention_pipeline",
  "theme_variant": "default",
  "animation_mode": "stepper",
  "entities": [],
  "relations": [],
  "annotations": [],
  "states": [],
  "pedagogy": {
    "what_to_notice": [],
    "common_mistakes": [],
    "can_be_interactive": true
  }
}
```

### Required top-level fields

- `diagram_id`
- `title`
- `lesson_ids`
- `learning_goal`
- `backend`
- `diagram_type`
- `theme_variant`
- `entities`
- `relations`
- `pedagogy`

### Optional fields

- `animation_mode`
- `states`
- `annotations`
- `running_example_focus`
- `code_anchor`

## Entity Model

Entities are the visual objects.

Each entity must declare:

- `id`
- `kind`
- `label`
- `semantic_role`

Optional:

- `shape`
- `group`
- `value`
- `tensor_shape`
- `style_variant`
- `interactive_role`

### Example entity

```json
{
  "id": "q_proj",
  "kind": "node",
  "label": "Q",
  "semantic_role": "attention_query",
  "tensor_shape": "[n_tokens, d_k]",
  "group": "attention"
}
```

## Relation Model

Relations describe data flow or dependency.

Each relation must declare:

- `from`
- `to`
- `kind`

Optional:

- `label`
- `semantic_role`
- `highlight_in_states`

Kinds include:

- `flow`
- `contains`
- `depends_on`
- `reuses`
- `selects`
- `weights`

## Pedagogical Metadata

Every diagram must declare teaching intent explicitly.

### Required pedagogy fields

- `what_to_notice`
- `common_mistakes`
- `teaching_order`

### Example

```json
{
  "pedagogy": {
    "what_to_notice": [
      "scores are computed before softmax",
      "masking happens before normalization",
      "value mixing happens after weights exist"
    ],
    "common_mistakes": [
      "thinking V contributes to the score",
      "thinking the mask is applied after softmax"
    ],
    "teaching_order": [
      "scores",
      "mask",
      "softmax",
      "weighted_sum"
    ]
  }
}
```

This is important because two diagrams with the same graph structure may still teach different lessons.

## Theme System

The diagram theme must match the site semantics.

### Semantic color mapping

- tokens and embeddings: blue
- normalization: gray
- attention: orange
- FFN: green
- router and selection: red
- expert paths: yellow
- KV cache: teal
- logits and sampling: purple
- validation and metrics: brown
- serving and scheduling: slate

Agents must use semantic roles, not hardcoded colors.

Renderers map roles to actual CSS variables.

## Typography and Shape Rules

All diagram backends must follow one visual language.

### Rules

- use one font family shared with the site
- keep labels short
- show tensor shapes in secondary text, not as the main title
- use rectangular blocks for transforms
- use pill or chip shapes for labels and metadata
- use storage-like blocks for caches
- use matrix-like grids only when matrix structure matters pedagogically

### Do not do

- decorative gradients with no meaning
- arbitrary icons
- 3D effects
- generic flowchart styling detached from site semantics

## Diagram Types

The site should standardize on a finite list of diagram types.

### Structural types

- `request_pipeline`
- `decoder_block`
- `architecture_comparison`
- `code_flow_map`
- `serving_pipeline`

### Math and tensor types

- `embedding_lookup`
- `dot_product`
- `matrix_multiply`
- `tensor_shape_map`
- `attention_pipeline`
- `multi_head_split_merge`
- `rope_position_view`

### Runtime and performance types

- `kv_cache_timeline`
- `prefill_decode_timeline`
- `continuous_batching_timeline`
- `operator_mix`
- `roofline_intuition`
- `validation_workflow`

### Case-study types

- `builder_walkthrough`
- `profile_interpretation`
- `optimization_vs_validation`

## Interactive State Model

If a diagram is interactive, the states must be part of the semantic source.

### State schema

```json
{
  "state_id": "after_softmax",
  "label": "After Softmax",
  "highlights": ["score_row_2", "weight_row_2"],
  "callout": "The masked scores are now normalized into attention weights."
}
```

This is mandatory for:

- attention step-throughs
- MoE routing
- serving timelines
- performance diagnosis labs

## Compiled Artifact Rules

Compiled artifacts may be committed if they improve site performance and build simplicity.

### Static diagrams

Commit:

- semantic JSON
- generated SVG

Optional:

- generated D2 or DOT as debug artifacts

### Interactive diagrams

Commit:

- semantic JSON
- React renderer

Do not commit raster screenshots as the main artifact.

## Agent Workflow

Agents generating a new diagram must follow this sequence.

1. Identify the `learning_goal`.
2. Choose the `diagram_type`.
3. Choose the backend by rule.
4. Create semantic JSON.
5. Declare pedagogy metadata.
6. Compile to the target artifact.
7. Validate against the checklist.

Agents must not skip directly to SVG.

## Validation Checklist

Every diagram must pass these checks.

### Pedagogy checks

- one clear learning goal
- one primary thing to notice
- no unexplained labels
- no decorative elements without meaning

### Consistency checks

- semantic roles match site color semantics
- tensor orientation matches the site standard
- labels use the same vocabulary as the lessons

### Asset checks

- static diagrams render cleanly as SVG
- text is selectable in the SVG
- diagram works at mobile and desktop widths
- line widths and font sizes remain legible

## Backend-Specific Guidance

### `react-svg`

Use for:

- step-through diagrams
- matrices
- timelines
- diagrams with pedagogical highlight states

Implementation rule:

- render from semantic JSON props
- do not hardcode lesson-specific text into the renderer

### `d2`

Use for:

- block diagrams
- architecture diagrams
- code-relationship maps

Implementation rule:

- generate D2 source from semantic JSON
- do not hand-maintain D2 if the semantic JSON already exists

### `graphviz`

Use for:

- DAGs
- rank-sensitive dependency views
- ordered graph explanations

Implementation rule:

- generate DOT from semantic JSON
- configure layout for determinism first, prettiness second

## Diagram Manifest

The site must keep a manifest of all diagrams.

### Manifest fields

- `diagram_id`
- `title`
- `lesson_ids`
- `backend`
- `source_path`
- `compiled_asset_path`
- `running_example_focus`
- `status`
- `last_reviewed_at`

This manifest allows agents to:

- reuse diagrams across lessons
- find stale assets
- detect missing diagrams

## Initial Diagram Backlog

The first implementation wave should create these first.

### Foundation diagrams

- end-to-end request pipeline
- tokenization breakdown
- embedding lookup
- dot product walkthrough
- matrix multiply walkthrough
- logits to softmax

### Core block diagrams

- decoder block overview
- Q/K/V projection path
- attention score and value flow
- multi-head split and merge
- RoPE position injection
- FFN width expansion

### Runtime diagrams

- prefill vs decode timeline
- KV cache reuse
- batching vs ubatching
- continuous batching timeline

### Performance diagrams

- GEMM vs GEMV intuition
- compute vs memory-bound intuition
- repack/layout explanation
- validation workflow

## Recommendation

Use this default policy:

- `react-svg` for pedagogical diagrams
- `d2` for static structural diagrams
- `graphviz` for strict DAGs

The winning pattern is:

- semantic meaning first
- rendering second
- SVG last

That is the only approach that scales to autonomous agent authorship without visual drift.

