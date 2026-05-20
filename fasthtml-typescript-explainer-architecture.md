# FastHTML + TypeScript Architecture for Interactive Explainers

This document is an application architecture brief for AI agents building
interactive, essay-style explainers in this repository.

The target experience is similar in spirit to high-quality visual technical
essays: the page is primarily a readable article, with interactive components
embedded exactly where they help the explanation. The implementation should use
FastHTML for server-rendered page structure and reusable article components,
HTMX for server-returned HTML fragments, and TypeScript for client-side
interactions that need animation, local state, canvas, workers, or precise UI
control.

## Goals

- Build explainer pages that feel like articles first, not dashboards.
- Keep the writing, diagrams, controls, and simulations close to the concept
  they explain.
- Use FastHTML for Python-authored HTML components, page routing, and
  progressive enhancement.
- Use HTMX for interactions that naturally return HTML fragments from the
  server.
- Use TypeScript instead of plain JavaScript for browser-side interactive
  components.
- Keep TypeScript small, typed, colocated, and compiled to static JavaScript.
- Make components testable by separating pure state logic from rendering and
  animation.
- Preserve graceful fallback content where JavaScript is unavailable.

## Non-Goals

- Do not build a React, Vue, or SPA-style app unless explicitly requested.
- Do not move article structure into client-side rendering.
- Do not use TypeScript for every minor interaction by default.
- Do not route high-frequency animation or pointer movement through HTMX.
- Do not create decorative components that do not support the explanation.

## Technology Choices

Use:

- Python with FastHTML for routes, page composition, and reusable HTML
  components.
- HTMX for low-frequency server interactions such as step buttons, quiz
  answers, preset changes, and server-rendered diagram updates.
- TypeScript for client-side components that need animation, graph interaction,
  canvas, SVG manipulation, Web Workers, drag gestures, local playback controls,
  or browser timing APIs.
- CSS modules by convention, colocated per explainer or per component family.
- A minimal TypeScript build tool such as `esbuild`, `vite`, or `tsup`.

Prefer the simplest build pipeline that can:

- Compile TypeScript to browser-ready JavaScript.
- Bundle per-interactive entry points.
- Emit source maps in development.
- Write output into a static directory served by FastHTML.
- Avoid framework-specific assumptions.

## Recommended Repository Layout

```text
app.py
routes/
  home.py
  essays.py
content/
  example_explainer.py
components/
  layout.py
  article.py
  callouts.py
  controls.py
  code_blocks.py
  visual_shell.py
  quiz.py
interactives/
  big_o/
    model.py
    views.py
    static/
      big_o.css
    ts/
      big_o.ts
      worker.ts
      types.ts
  bloom_filter/
    model.py
    views.py
    static/
      bloom_filter.css
    ts/
      bloom_filter.ts
      types.ts
static/
  css/
    global.css
    article.css
  js/
    runtime.js
    interactives/
      big_o.js
      big_o.worker.js
      bloom_filter.js
```

Generated JavaScript belongs under `static/js/`. Source TypeScript belongs next
to the interactive it powers, usually under `interactives/<name>/ts/`.

## Architectural Boundary

Python owns:

- Routes.
- Essay structure.
- Semantic HTML.
- Reusable article components.
- Server-rendered diagrams.
- Quiz and checkpoint evaluation.
- Deterministic algorithm state transitions when server authority is useful.
- Initial interactive configuration.

TypeScript owns:

- Animation loops.
- Canvas rendering.
- SVG manipulation after page load.
- Pointer, keyboard, drag, hover, and scrub interactions.
- Web Worker execution.
- Timing measurements.
- Local playback state.
- Client-only graph interactivity.

HTMX owns:

- Replacing server-rendered fragments.
- Posting form-like control state to Python routes.
- Fetching alternative presets or explanation states.
- Progressive enhancement interactions that remain meaningful as HTML.

Do not make Python responsible for frame-by-frame animation. Do not make
TypeScript responsible for rendering the whole article.

## FastHTML Component Layer

Create small Python component functions that read like article building blocks.

Suggested components:

```python
def EssayPage(title, date, *sections, assets=()):
    ...

def Section(title, *body, anchor=None):
    ...

def Explainer(id, title, *body, assets=()):
    ...

def Aside(kind, *body):
    ...

def CodeDemo(code, language="python", runnable=False):
    ...

def Figure(caption, *visual):
    ...

def Checkpoint(id, question, choices):
    ...
```

The content file for an essay should be readable as a structured explanation:

```python
def essay():
    return EssayPage(
        "Bloom Filters",
        "2026-05-18",
        Section(
            "How bloom filters work",
            P("At its core, a bloom filter is an array of bits."),
            BloomFilterDemo(bits=32),
        ),
    )
```

## TypeScript Integration Pattern

FastHTML should render a stable mount point with a JSON configuration payload.
The TypeScript entry point should discover that mount point and initialise the
component.

FastHTML view:

```python
def BloomFilterDemo(bits=32):
    config = {"bits": bits, "hashes": 3}
    return Div(
        Div(cls="bit-grid", data_role="bit-grid"),
        Div(cls="controls", data_role="controls"),
        Script(
            f"window.Explainers.mountBloomFilter('bloom-filter-demo', {json.dumps(config)})",
            type="module",
        ),
        id="bloom-filter-demo",
        cls="interactive bloom-filter-demo",
    )
```

TypeScript entry:

```ts
type BloomFilterConfig = {
  bits: number;
  hashes: number;
};

export function mountBloomFilter(rootId: string, config: BloomFilterConfig) {
  const root = document.getElementById(rootId);
  if (!root) return;

  const demo = new BloomFilterDemo(root, config);
  demo.mount();
}
```

Expose a small global runtime only for mounting:

```ts
import { mountBloomFilter } from "../../interactives/bloom_filter/ts/bloom_filter";

declare global {
  interface Window {
    Explainers: {
      mountBloomFilter: typeof mountBloomFilter;
    };
  }
}

window.Explainers = {
  ...window.Explainers,
  mountBloomFilter,
};
```

Keep the global surface small and stable. Do not attach large application state
to `window`.

## Component Types

### 1. Static Visual Explainers

Use for diagrams that change only when props or presets change.

Examples:

- Memory blocks.
- Hash buckets.
- Bloom filter bit arrays.
- Queue states.
- Complexity curve snapshots.

Implementation:

- Put pure calculation in `model.py`.
- Render HTML or SVG in `views.py`.
- Use HTMX when a control changes the canonical state.
- Return only the changed visual fragment from the server.
- Use TypeScript only for optional hover, focus, or annotation behaviour.

### 2. Stepper Components

Use for algorithms with discrete states.

Examples:

- Bubble sort.
- Binary search.
- Turing machine tape movement.
- Allocator split and merge operations.

Implementation:

- Represent state as a typed Python data structure.
- Keep transition functions pure: `step_forward(state)`,
  `step_back(state)`, `reset(state)`.
- Render the current state with FastHTML.
- Use HTMX buttons for `prev`, `next`, `play one step`, and `reset` when the
  state is server-owned.
- Use TypeScript for optional autoplay timers and keyboard shortcuts.

Pattern:

```python
def SortStepper(state):
    return Div(
        SortVisual(state),
        CodeTrace(state),
        Button("Previous", hx_post="/sort/prev", hx_target="#sort-stepper"),
        Button("Next", hx_post="/sort/next", hx_target="#sort-stepper"),
        id="sort-stepper",
    )
```

### 3. Animated Simulations

Use for high-frequency visuals or continuous movement.

Examples:

- Load balancer traffic flow.
- Queue arrivals and departures.
- Animated Big O timing bars.
- Memory allocation timelines.
- Network packet movement.

Implementation:

- FastHTML renders a shell, canvas/SVG element, controls, and initial config.
- TypeScript owns `requestAnimationFrame`, animation state, drawing, and local
  controls.
- Python may provide scenario presets or server-rendered explanation text.
- Do not call the server on every frame.

Pattern:

```python
def SimulationShell(id, config, script_name):
    return Div(
        Canvas(id=f"{id}-canvas"),
        Div(cls="sim-controls", data_role="controls"),
        Script(src=f"/static/js/interactives/{script_name}.js", type="module"),
        Script(
            f"window.Explainers.mountSimulation('{id}', {json.dumps(config)})",
            type="module",
        ),
        id=id,
        cls="interactive simulation",
    )
```

### 4. Live Controls

Use two categories of controls.

Server controls:

- Preset selection.
- Algorithm input size when server-rendered state changes.
- Quiz answers.
- Resetting canonical state.
- Loading alternate examples.

Client controls:

- Animation speed.
- Pause and resume.
- Timeline scrubber.
- Zoom and pan.
- Hover inspection.
- Dragging items in a canvas/SVG component.

Rule: if the control changes the explanation's canonical state, consider HTMX.
If it changes presentation or animation state, keep it in TypeScript.

### 5. Code Runners and Timers

Use TypeScript and Web Workers for browser-side code timing examples.

Implementation:

- FastHTML renders code, controls, explanatory text, and result slots.
- TypeScript starts a Web Worker for CPU-heavy or timing-sensitive work.
- The worker posts progress and results back to the UI.
- Results update client-side without a server round trip.

Do not run arbitrary reader-provided code on the Python server.

### 6. Graphs

Use the lowest-complexity rendering approach that fits the graph.

- Server-render SVG from Python for static graphs.
- TypeScript-managed SVG for interactive labels, hover, sliders, and animated
  transitions.
- Canvas for many points, high-frequency updates, or particle-like visuals.

For Big O-style graphs:

- Python may generate curve definitions and initial scale.
- TypeScript handles hover, slider state, animated comparisons, and local
  redraws.

### 7. Quizzes and Checkpoints

Use FastHTML and HTMX by default.

Implementation:

- Render question and choices from Python.
- POST the selected answer to a route.
- Return a feedback fragment.
- Store progress in session only if the experience needs persistence.

These are a good fit for server-rendered HTML because they are low-frequency,
semantic interactions.

### 8. Callouts and Dialogue Blocks

Make explanation rhythm a first-class part of the component system.

Suggested callout kinds:

- `question`
- `note`
- `warning`
- `example`
- `correction`
- `summary`

Implementation:

```python
def Aside(kind, *body):
    return AsideTag(
        Div(kind.title(), cls="aside-label"),
        Div(*body, cls="aside-body"),
        cls=f"aside aside-{kind}",
    )
```

These should be server-rendered and accessible.

## TypeScript Build Pipeline

Use a minimal bundler configuration. `esbuild` is a good default.

Example package scripts:

```json
{
  "scripts": {
    "build:ts": "esbuild interactives/*/ts/*.ts --bundle --format=esm --outdir=static/js/interactives --sourcemap",
    "watch:ts": "esbuild interactives/*/ts/*.ts --bundle --format=esm --outdir=static/js/interactives --sourcemap --watch"
  },
  "devDependencies": {
    "esbuild": "^0.25.0",
    "typescript": "^5.0.0"
  }
}
```

If multiple entry points need custom output names, use an `esbuild.config.mjs`
file instead of a long package script.

The build should be boring:

- No frontend framework required.
- No hydration.
- No client-side router.
- No generated files committed unless the repo convention requires it.

## TypeScript Coding Rules

- Use strict TypeScript.
- Define explicit types for config, state, events, and worker messages.
- Keep DOM queries narrow and checked.
- Prefer classes only for stateful mounted components.
- Prefer pure functions for model calculations.
- Keep rendering functions deterministic.
- Avoid global mutable state.
- Use `AbortController` or explicit `destroy()` methods for cleanup if
  components can be replaced by HTMX.
- Listen for `htmx:beforeSwap` or `htmx:beforeCleanupElement` when cleanup is
  needed.
- Respect `prefers-reduced-motion`.
- Keep keyboard controls available for interactive components.

Example worker message types:

```ts
type WorkerRequest =
  | { type: "run"; inputSize: number; iterations: number }
  | { type: "cancel" };

type WorkerResponse =
  | { type: "progress"; completed: number; total: number }
  | { type: "result"; milliseconds: number }
  | { type: "error"; message: string };
```

## State Strategy

Use three tiers of state.

URL or query state:

- Shareable presets.
- Selected example.
- Initial parameter values.

Server state:

- Quiz progress.
- Canonical stepper state.
- User-selected examples that should survive fragment replacement.
- Generated diagrams.

Client state:

- Animation frame.
- Playback speed.
- Drag position.
- Hovered item.
- Local graph viewport.
- Transient timing results.

Do not store high-frequency animation state on the server.

## Accessibility and Progressive Enhancement

Each interactive component must include:

- A meaningful heading or caption.
- Static fallback text or a static diagram.
- Keyboard-operable controls.
- Visible focus states.
- Reduced-motion behaviour.
- ARIA labels where native HTML labels are insufficient.

If JavaScript is disabled, the page should remain readable even if advanced
visualisations are not available.

## Styling Principles

- Article text should remain the dominant structure.
- Interactive components should sit inline with the essay, not as unrelated
  dashboards.
- Avoid nested cards and decorative containers.
- Use stable dimensions for diagrams, controls, and canvases to prevent layout
  shift.
- Keep typography consistent between article body, labels, code, and controls.
- Use colour to clarify state, not as the only state indicator.
- Avoid one-note palettes; use a restrained but varied colour system.

## Testing Strategy

Python:

- Test pure model functions.
- Test route handlers that return important fragments.
- Test key FastHTML components by rendering representative output.

TypeScript:

- Test pure state and geometry helpers.
- Type-check the whole TypeScript tree.
- Keep worker protocol types explicit and tested where practical.

Browser:

- Use Playwright for smoke tests.
- Verify each explainer loads.
- Verify primary controls work.
- Verify animated components render non-blank output.
- Verify desktop and mobile layouts do not overlap.
- Verify reduced-motion mode does not break the component.

## Implementation Workflow for Agents

When adding a new explainer:

1. Create the content file under `content/`.
2. Add any reusable article components under `components/`.
3. Create an `interactives/<name>/` package if the explainer needs custom
   visual logic.
4. Put pure Python state logic in `model.py`.
5. Put FastHTML rendering in `views.py`.
6. Put TypeScript source under `interactives/<name>/ts/`.
7. Compile TypeScript into `static/js/interactives/`.
8. Add CSS either globally only when truly shared, or colocated with the
   interactive.
9. Add focused tests for Python model logic and TypeScript pure functions.
10. Run the app and visually check the page at desktop and mobile widths.

When deciding whether to use HTMX or TypeScript, use this rule:

- If the interaction returns new semantic HTML, use HTMX.
- If the interaction redraws pixels, animates, drags, scrubs, or measures time,
  use TypeScript.

## Acceptance Criteria

An implementation follows this architecture when:

- The explainer page is readable as an article without interacting.
- FastHTML owns the document structure.
- TypeScript is used only for browser-side interaction where it adds value.
- Interactive source files are colocated by explainer.
- Generated JavaScript is served from `static/js/`.
- Components have clear Python/TypeScript boundaries.
- Controls are keyboard accessible.
- Animations respect reduced-motion preferences.
- Tests cover the pure logic behind the interaction.
- A browser smoke test confirms that the page renders and primary controls
  work.

