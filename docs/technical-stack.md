# Technical Stack

This document locks the site onto a static-first technical architecture.

The primary constraint is:

- the site must be fully deployable to GitHub Pages
- deployment must happen through GitHub Actions
- the published artifact must be static HTML, CSS, JavaScript, and assets

This is a product decision, not a temporary implementation detail.

## Top-Level Decision

The site must be built as a static site with client-side interactivity.

That means:

- no application server
- no server-side database
- no runtime API required for the core experience
- no backend-required auth for the MVP

The default deployment target is GitHub Pages.
The default CI/CD mechanism is GitHub Actions.

## Prescribed Stack

Use this stack unless there is a very strong reason to change it.

### Framework

- `Astro`

Why:

- static-first by default
- excellent for content-heavy sites
- supports page-level prerendering cleanly
- supports embedding React components only where interactivity is needed
- avoids turning the whole site into a client-rendered SPA

### Interactive UI layer

- `React`
- `TypeScript`

Why:

- the site needs interactive pedagogical components
- the team will likely want reusable diagram and assessment components
- React islands inside Astro are a good fit for this mix of content and interactivity

### Styling

- plain CSS with design tokens via CSS variables

Optional:

- a very small utility layer if needed

Do not use a heavy UI framework.

Why:

- the site has a custom pedagogical visual language
- most of the UI is content, layout, diagrams, and teaching widgets
- a generic component framework will create visual drift and unnecessary complexity

### Content authoring

- `MDX` for lesson and reference content
- structured frontmatter plus content collections

Why:

- lesson pages are mostly authored content
- the site still needs embedded React components
- MDX lets content and interactives live together cleanly

### Build language and tooling

- `Node.js`
- `pnpm`

Why:

- fast installs
- clean workspace behavior
- strong support across Astro and React tooling

## Rendering Model

The site must not be a client-rendered SPA by default.

Use:

- statically generated pages for lessons, references, quizzes, and capstone shells
- client-side hydration only for the parts that need it

This means:

- content loads fast
- GitHub Pages works naturally
- routes are stable without SPA fallback tricks
- lesson pages remain inspectable and indexable

## Route Strategy

Routes must be pre-rendered as static files.

This includes:

- lesson pages
- quiz pages
- reference pages
- dashboard shell
- capstone shell

Interactive state should hydrate in the browser after page load.

Do not rely on client-only routing for the main course path.

## State and Persistence

The MVP must use browser-local persistence.

Primary options:

- `localStorage` for small progression state
- `IndexedDB` only if lesson attempts or search indexes become too large

The first implementation should default to:

- `localStorage` for course progress
- deterministic JSON shape for saved learner state

Why:

- static deployment stays simple
- no backend is required
- GitHub Pages remains a complete hosting target

Cross-device sync is explicitly out of scope for the MVP.

## Search

Search must also be static-first.

Use:

- a prebuilt client-side search index generated at build time

Recommended approach:

- generate a compact JSON search index from lesson and reference metadata
- query it in the browser

Do not use a server-backed search service for the MVP.

## Diagram Stack

The diagram system must follow [diagram-generation-spec.md](./diagram-generation-spec.md).

Use:

- semantic JSON as the source of truth
- `react-svg` for pedagogical diagrams
- `d2` for static structural diagrams
- `graphviz` for DAG-style diagrams

Compiled SVG assets should be generated at build time or committed when appropriate.

## Assessment Stack

Assessment logic must run entirely in the browser.

Use:

- typed question definitions in content data
- client-side evaluation logic
- local persistence of attempts and completion state

The site must support:

- soft gates
- hard gates
- retries
- hints

without requiring a backend.

## Running Example Support

The running example must be represented as content/data, not hardcoded ad hoc across components.

Use:

- a structured JSON or TypeScript object describing the running example
- references to that object from lessons, diagrams, and interactives

This keeps the cross-module teaching thread consistent.

## GitHub Integration

The site may link heavily into `llama.cpp`, but must not depend on live GitHub APIs at runtime.

Use:

- pinned GitHub permalinks in lesson content
- a checked-in permalink manifest

Do not fetch GitHub metadata client-side during normal page loads.

Why:

- static hosting remains robust
- no rate-limit dependency
- lesson pages stay deterministic

## GitHub Pages Deployment Model

Deployment must use GitHub Actions.

The workflow should:

1. install dependencies
2. build the static site
3. upload the Pages artifact
4. deploy to GitHub Pages

The repository should not rely on GitHub Pages' legacy implicit Jekyll-style build flow.

Use a custom Pages workflow instead.

Why:

- full control over the build
- works with Astro and custom asset generation
- avoids accidental coupling to Pages-native Jekyll assumptions

### Base Path Policy

The site must support both deployment modes without code changes:

- **Custom domain** (e.g. `https://llm-ground-up.dev`): `base` is `/`, all routes and assets resolve from root.
- **Project site** (e.g. `https://username.github.io/llm/`): `base` is `/llm/`, all routes and assets are prefixed.

The Astro config must read `SITE_URL` and `BASE_PATH` from environment variables.
The GitHub Actions workflow must expose these as configurable repository variables.

Default assumption: custom domain with no base path prefix.
If the site is deployed as a project site, the deployer sets `BASE_PATH=/repo-name` in the repository variables.

This is important because Astro uses the `base` config to generate all internal links and asset URLs.
Getting this wrong causes broken navigation and missing CSS/JS on the deployed site.

## Repository Structure

The site repo should converge on something like this:

```text
src/
  components/
  layouts/
  pages/
  content/
  data/
  diagrams/
public/
scripts/
.github/
  workflows/
```

### Meaning

- `src/pages/`
  - route files for lessons, references, dashboard, capstone
- `src/content/`
  - MDX lessons and references
- `src/data/`
  - structured metadata, manifests, running example data
- `src/components/`
  - React and Astro UI components
- `src/diagrams/`
  - renderers and diagram integration glue
- `scripts/`
  - build-time generators for search, diagrams, manifests

## Build-Time Generators

The site will need build-time generation steps.

Expected generators:

- lesson registry generator
- prerequisite graph validator
- permalink manifest validator
- search index builder
- diagram compiler

These should run in CI and locally.

## Accessibility and Performance

Static hosting does not excuse poor client behavior.

Requirements:

- lesson content should render useful HTML before hydration
- interactives should hydrate only where needed
- SVG diagrams must remain legible and accessible
- large client bundles must be avoided

This is another reason to prefer Astro plus selective React islands over a fully client-rendered app.

## Out of Scope for MVP

Do not include these in the first version:

- server-side auth
- user accounts
- cloud sync
- server-side comments
- server-side analytics dashboards
- personalized backend APIs

If needed later, these can be added as optional external services without changing the static-first core.

## Migration Rule

Any future move away from static GitHub Pages hosting must justify:

- what user need cannot be met statically
- why browser-local persistence is insufficient
- why added operational complexity is worth it

Until that case is made, the default answer is:

- keep it static

## Final Recommendation

Build the site with:

- `Astro`
- `React`
- `TypeScript`
- `MDX`
- `pnpm`
- static asset generation
- GitHub Actions deployment to GitHub Pages

This is the cleanest fit for:

- content-heavy lessons
- selective interactivity
- autonomous diagram generation
- static deployment
- low operational overhead

