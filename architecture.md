# GiGi's Strolling Adventure — Architecture

This document describes the system architecture, conventions, and operational context for **GiGi's Strolling Adventure** (internal project name: `myapp`). It is intended for human developers and AI assistants working on the codebase.

For product intent and implemented features, see [`blueprint.md`](./blueprint.md). For Angular coding standards enforced by AI tooling, see [`GEMINI.md`](./GEMINI.md).

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Project Structure](#4-project-structure)
5. [Application Bootstrap](#5-application-bootstrap)
6. [Component Layer](#6-component-layer)
7. [Routing](#7-routing)
8. [State Management](#8-state-management)
9. [Styling & Design System](#9-styling--design-system)
10. [Static Assets](#10-static-assets)
11. [Configuration & Build](#11-configuration--build)
12. [Development Environment](#12-development-environment)
13. [Testing Strategy](#13-testing-strategy)
14. [Coding Conventions](#14-coding-conventions)
15. [Extending the Application](#15-extending-the-application)
16. [Known Gaps & Technical Debt](#16-known-gaps--technical-debt)
17. [Related Documentation](#17-related-documentation)

---

## 1. System Overview

**GiGi's Strolling Adventure** is a client-only, single-page web application built with Angular. There is no backend server, database, or API layer in this repository.

| Attribute | Value |
|-----------|-------|
| **Type** | Single-page application (SPA) |
| **Deployment model** | Static files (HTML/JS/CSS) served from a web host |
| **Current scope (v1)** | Home view with title and feature image |
| **Architecture style** | Standalone components, signal-based state, zone.js change detection |

The application is intentionally small today. The architecture is set up to grow via lazy-loaded feature routes, standalone feature components, and root-scoped services without introducing NgModules.

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Angular | 20.3.x |
| Language | TypeScript | 5.9.x (strict mode) |
| Reactive primitives | RxJS | 7.8.x |
| Change detection | Zone.js | 0.15.x |
| Build tool | `@angular/build` (esbuild-based) | 20.3.x |
| Unit tests | Jasmine + Karma | — |
| Package manager | npm | — |
| Dev environment | Google IDX (Nix) | Node 20 |

**Not currently used:** NgModules, NgRx/state libraries, CSS frameworks (Tailwind, Bootstrap), HTTP client, Firebase SDK (MCP tooling is configured but no Firebase app code exists yet).

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  index.html  →  <app-root>                            │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │  main.ts                                                │  │
│  │    bootstrapApplication(App, appConfig)                 │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │  app.config.ts  (ApplicationConfig providers)         │  │
│  │    • provideRouter(routes)                            │  │
│  │    • provideZoneChangeDetection({ eventCoalescing })  │  │
│  │    • provideBrowserGlobalErrorListeners()             │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │  App (root component)                                   │  │
│  │    • Inline template (app.html)                         │  │
│  │    • Component-scoped styles                            │  │
│  │    • signal('GiGi\'s Strolling Adventure')             │  │
│  │    • <router-outlet /> (ready for future routes)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Static assets served from /public → build root             │
└─────────────────────────────────────────────────────────────┘
```

**Data flow today:** Unidirectional and local. The root `App` component holds a `title` signal; the template reads it via `{{ title() }}`. No services, HTTP calls, or shared stores exist yet.

---

## 4. Project Structure

```
StrollingAdventure/
├── .idx/                    # Google IDX workspace config
│   ├── dev.nix              # Nix packages, preview server, extensions
│   └── mcp.json             # MCP servers (Angular CLI, Firebase)
├── .vscode/                 # Editor tasks, launch configs (committed)
├── public/                  # Static assets copied verbatim to build output
│   ├── favicon.ico
│   └── sun-color-2020-09-26.jpg
├── src/
│   ├── index.html           # Shell document; mounts <app-root>
│   ├── main.ts              # Application entry point
│   ├── styles.css           # Global styles (currently empty)
│   └── app/
│       ├── app.ts           # Root component class
│       ├── app.html           # Root template + scoped CSS
│       ├── app.config.ts    # DI providers / app-wide configuration
│       ├── app.routes.ts    # Route definitions (empty)
│       └── app.spec.ts      # Root component unit tests
├── angular.json             # CLI project & build configuration
├── package.json
├── tsconfig.json            # Strict TypeScript + Angular compiler options
├── blueprint.md             # Product/feature specification
├── GEMINI.md                # AI developer persona & Angular conventions
└── architecture.md          # This file
```

### Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Angular project name (CLI) | `myapp` | `ng build` targets `myapp` |
| Component selector prefix | `app` | `app-root` |
| Component files | `feature.ts`, `feature.html` | `app.ts`, `app.html` |
| Routes file | `app.routes.ts` | Single file at app root today |

---

## 5. Application Bootstrap

Bootstrapping follows the modern **standalone** pattern (no `AppModule`).

```
index.html
    └── main.ts
            └── bootstrapApplication(App, appConfig)
                    ├── App          (root component)
                    └── appConfig    (providers)
```

### Entry point — `src/main.ts`

```typescript
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

### Application config — `src/app/app.config.ts`

Providers registered at startup:

| Provider | Purpose |
|----------|---------|
| `provideRouter(routes)` | Client-side routing (routes array is empty) |
| `provideZoneChangeDetection({ eventCoalescing: true })` | Zone.js with batched DOM events |
| `provideBrowserGlobalErrorListeners()` | Global unhandled error/rejection logging |

When adding cross-cutting concerns (HTTP, image loader, animations), register new `provide*` functions here.

---

## 6. Component Layer

### Current components

There is **one** component: the root `App` component.

| File | Role |
|------|------|
| `app.ts` | Component class; declares `title` signal |
| `app.html` | Template, inline `<style>` block, and `<router-outlet>` |

### Component definition pattern

```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'   // referenced but file does not exist — see §16
})
export class App {
  protected readonly title = signal('GiGi\'s Strolling Adventure');
}
```

### Intended patterns for new components

All new components **must** follow the conventions in [`GEMINI.md`](./GEMINI.md):

- **Standalone by default** — do not add `standalone: true` explicitly; it is implicit in Angular 20+
- **`ChangeDetectionStrategy.OnPush`** — required on every component
- **Signals** — `signal()`, `computed()`, `input()`, `output()` instead of decorators
- **Native control flow** — `@if`, `@for`, `@switch` in templates (never `*ngIf` / `*ngFor`)
- **Dependency injection** — `inject()` function, not constructor parameters
- **No NgModules** — the app is 100% standalone

### Recommended feature layout (future)

When the app grows beyond a single view, organize by feature:

```
src/app/
├── app.ts
├── app.config.ts
├── app.routes.ts
├── core/              # Singleton services, guards, interceptors
├── shared/            # Reusable presentational components & pipes
└── features/
    └── home/
        ├── home.ts
        └── home.html
```

Use **lazy loading** for feature routes:

```typescript
{
  path: 'gallery',
  loadComponent: () => import('./features/gallery/gallery').then(m => m.Gallery)
}
```

---

## 7. Routing

Routing is configured but **unused**. `app.routes.ts` exports an empty array:

```typescript
export const routes: Routes = [];
```

The root template includes `<router-outlet />` at the bottom of `app.html`, so future routed views will render below the current home content unless the template is refactored.

### Adding a route

1. Define the route in `app.routes.ts`
2. Create a standalone feature component
3. Decide whether the home content stays in `App` or moves to a dedicated `Home` component
4. Prefer `loadComponent` lazy loading for non-default routes

---

## 8. State Management

| Scope | Mechanism | Current usage |
|-------|-----------|---------------|
| Component-local | `signal()`, `computed()` | `App.title` |
| Shared / app-wide | `@Injectable({ providedIn: 'root' })` services | None yet |
| Async streams | RxJS + `async` pipe in templates | None yet |
| Global store (NgRx, etc.) | — | Not adopted |

**Guidance:** Start with signals in components. Extract to a root service when two or more components need the same state. Avoid introducing a global store until cross-feature state complexity justifies it.

---

## 9. Styling & Design System

### Global vs component styles

| Location | Scope | Current content |
|----------|-------|-----------------|
| `src/styles.css` | Application-wide | Empty placeholder |
| `app.html` `<style>` block | `:host` scoped to `App` | Full design system |

Most styling lives **inline in `app.html`**, not in a separate stylesheet. CSS custom properties are defined on `:host`.

### Design tokens (defined in `app.html`)

**Colors (OKLCH):**

| Token | Usage |
|-------|-------|
| `--bright-blue` | Primary accent |
| `--electric-violet`, `--french-violet` | Purple accents |
| `--vivid-pink`, `--hot-red`, `--orange-red` | Warm accents |
| `--gray-900`, `--gray-700`, `--gray-400` | Text hierarchy |

**Gradients:**

- `--red-to-pink-to-purple-vertical-gradient`
- `--red-to-pink-to-purple-horizontal-gradient`

**Typography:**

- Body: `"Inter"` stack
- Headings (`h1`): `"Inter Tight"` stack

### Layout

- Centered flex layout in `<main>`
- Max content width: `700px`
- Responsive breakpoint at `650px` — stacks content vertically, horizontal divider becomes vertical gradient line

### Styling rules for contributors

- Use **native CSS** unless explicitly asked to add a framework
- Prefer CSS custom properties for theme values
- Use `[class]` and `[style]` bindings — not `NgClass` / `NgStyle`
- Consider moving shared tokens to `src/styles.css` or a dedicated `styles/tokens.css` as the app grows

---

## 10. Static Assets

Assets in `public/` are copied to the build output root by `angular.json`:

```json
"assets": [{ "glob": "**/*", "input": "public" }]
```

| Asset | Referenced as | Notes |
|-------|---------------|-------|
| `public/favicon.ico` | `/favicon.ico` | Linked from `index.html` |
| `public/sun-color-2020-09-26.jpg` | `sun-color-2020-09-26.jpg` | Feature image on home view |

Reference public assets with **root-relative paths** (no `public/` prefix in templates).

### Image optimization (future)

[`GEMINI.md`](./GEMINI.md) recommends `NgOptimizedImage` with a loader provider in `app.config.ts` for static images. This is not implemented yet.

---

## 11. Configuration & Build

### TypeScript

- **Strict mode** enabled (`strict: true`)
- Angular template strictness: `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`
- Target: ES2022; module: `preserve`

### Build configurations (`angular.json`)

| Configuration | Use case | Key settings |
|---------------|----------|--------------|
| `production` (default for `ng build`) | Release | Output hashing, bundle budgets |
| `development` | Local dev / `ng serve` | Source maps, no optimization |

**Production budgets:**

- Initial bundle: warn at 500 kB, error at 1 MB
- Per-component styles: warn at 4 kB, error at 8 kB

### npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `start` | `ng serve` | Dev server (port 4200 locally) |
| `build` | `ng build` | Production build → `dist/` |
| `watch` | `ng build --watch --configuration development` | Incremental dev builds |
| `test` | `ng test` | Karma unit tests |

### Output

Production builds emit to `dist/myapp/browser/` (Angular application builder default).

---

## 12. Development Environment

### Local development

```bash
npm install
npm start          # http://localhost:4200
npm run build      # verify compilation
npm test           # unit tests
```

### Google IDX / Firebase Studio

The `.idx/dev.nix` file configures:

- **Node.js 20** via Nix
- **Extensions:** Angular Language Service, Gemini CLI companion
- **Preview server:** `npm run start -- --port $PORT --host 0.0.0.0`

In IDX, the dev server is managed by the workspace preview — AI assistants should **not** start `ng serve` manually when working in that environment (see [`GEMINI.md`](./GEMINI.md)).

### MCP servers (`.idx/mcp.json`)

| Server | Purpose |
|--------|---------|
| `angular-cli` | Angular CLI MCP integration |
| `firebase` | Firebase tools experimental MCP |

These support AI-assisted development; no Firebase application code is wired up in the repo yet.

### VS Code

Committed configs under `.vscode/`:

- `tasks.json` — background `npm start` and `npm test` tasks
- `launch.json` — Chrome debug against localhost:4200
- `extensions.json` — recommended Angular extension

---

## 13. Testing Strategy

### Unit tests

- **Framework:** Jasmine assertions + Karma runner
- **Location:** `*.spec.ts` alongside source files
- **Root test:** `src/app/app.spec.ts`

Run with:

```bash
npm test
```

### Current test status

`app.spec.ts` contains a **stale assertion**: it expects `'Hello, myapp'` in the `h1`, but the component renders `'GiGi's Strolling Adventure'`. This test will fail until updated.

### Testing conventions for new code

- Test standalone components by importing them directly into `TestBed.configureTestingModule({ imports: [Component] })`
- Call `fixture.detectChanges()` before querying the DOM
- Prefer testing behavior and rendered output over implementation details

### E2E

No end-to-end framework is configured. `ng e2e` is documented in README but requires adding a framework (Playwright, Cypress, etc.).

---

## 14. Coding Conventions

This project follows modern Angular 20+ patterns. The authoritative AI-facing rules live in [`GEMINI.md`](./GEMINI.md). Summary for quick reference:

### Required

| Area | Rule |
|------|------|
| Components | Standalone, `OnPush`, signals for state |
| Inputs/outputs | `input()` / `output()` functions |
| Templates | `@if`, `@for` (with `track`), `@switch` |
| DI | `inject()` in services and components |
| Services | `providedIn: 'root'` for singletons |
| TypeScript | Strict typing; avoid `any` |
| CSS | Native CSS; `[class]` / `[style]` bindings |

### Forbidden

| Pattern | Replacement |
|---------|-------------|
| `@NgModule` | Standalone components |
| `*ngIf`, `*ngFor`, `*ngSwitch` | `@if`, `@for`, `@switch` |
| `@Input()`, `@Output()` | `input()`, `output()` |
| `NgClass`, `NgStyle` | `[class]`, `[style]` |
| Constructor injection | `inject()` |

### Prettier

Configured in `package.json`: 100 char print width, single quotes, Angular HTML parser for `*.html`.

### Post-change verification

After substantive changes, run:

```bash
ng build
```

Fix any compiler errors before considering the work complete.

---

## 15. Extending the Application

### Adding a new page

1. Generate a standalone component: `ng generate component features/my-feature`
2. Add `ChangeDetectionStrategy.OnPush` and apply GEMINI conventions
3. Register a lazy route in `app.routes.ts`
4. Refactor `App` if the home content should not appear on every page
5. Update [`blueprint.md`](./blueprint.md) with the new feature
6. Run `ng build` and fix tests

### Adding a service

1. `ng generate service core/my-service`
2. Use `@Injectable({ providedIn: 'root' })`
3. Inject dependencies with `inject()`
4. Expose state as signals where appropriate

### Adding HTTP / backend integration

1. Add `provideHttpClient()` to `app.config.ts`
2. Create a service in `core/` for API calls
3. Use the `async` pipe or `toSignal()` for template consumption
4. Document the API contract in this file or a dedicated `docs/` note

### Adding Firebase

1. Install Firebase SDK packages
2. Configure environment files (not present today)
3. Add initialization in `app.config.ts` or an `APP_INITIALIZER`
4. Firebase MCP is already configured in `.idx/mcp.json` for tooling support

### AI assistant workflow

When making changes in an AI-assisted session:

1. Read [`blueprint.md`](./blueprint.md) for current product state
2. Read this file for structural context
3. Follow [`GEMINI.md`](./GEMINI.md) for code patterns
4. Update `blueprint.md` after completing feature work
5. Run `ng build` to validate

---

## 16. Known Gaps & Technical Debt

| Item | Severity | Details |
|------|----------|---------|
| Missing `app.css` | Low | `app.ts` references `styleUrl: './app.css'` but the file does not exist. Styles are inline in `app.html`. Either create an empty `app.css` or remove the `styleUrl` reference. |
| Stale unit test | Medium | `app.spec.ts` expects `'Hello, myapp'`; actual title is `'GiGi's Strolling Adventure'`. |
| Empty routes | Info | Router is wired but unused; home content is hardcoded in root component. |
| Placeholder comments in template | Low | `app.html` still contains Angular CLI scaffold comments. |
| Package name mismatch | Info | `package.json` name is `myapp`; product title is GiGi's Strolling Adventure. |
| No E2E tests | Info | Framework not chosen or configured. |
| Global styles unused | Info | `src/styles.css` is empty; all styling is component-scoped in `app.html`. |
| README is generic | Low | README still reflects default Angular CLI boilerplate. |

---

## 17. Related Documentation

| Document | Purpose |
|----------|---------|
| [`blueprint.md`](./blueprint.md) | Product overview, implemented features, current plan |
| [`GEMINI.md`](./GEMINI.md) | AI developer persona, non-negotiable Angular rules |
| [`README.md`](./README.md) | CLI commands and getting started |
| [Angular docs](https://angular.dev) | Official framework reference |
| [Angular style guide](https://angular.dev/style-guide) | Framework best practices |

---

*Last updated: reflects repository state as of initial v1 — single-page app with title and feature image, Angular 20 standalone architecture.*
