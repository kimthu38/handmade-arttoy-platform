## Project Overview
Dedicated to buyers; must be optimized for SEO and Server-Side Rendering (SSR). It fetches data from `/backend`.

The product optimizes for:
- Time-to-insight: dashboards should load fast and be scannable at a glance
- Data accuracy: never show stale or misleading numbers
- Simplicity: one obvious way to do each task, no power-user shortcuts

Avoid over-engineering. Prefer readability over cleverness. When in doubt, make it simpler.

## Tech Stack

- Next.js 15 with App Router (not Pages Router)
- TypeScript (strict mode enabled)
- Tailwind CSS for styling
- shadcn/ui for components
- React Hook Form + Zod for all form handling
- TanStack Query for data fetching
- Zustand for global state (only where truly needed)
- Vitest + React Testing Library for tests
- npm as the package manager

Do NOT introduce:
- Redux or any other global state library
- styled-components, Emotion, or CSS Modules
- Material UI, Ant Design, or Chakra UI
- Axios (use native fetch with our wrapper in lib/api.ts)

## Architecture

This project follows a **Feature-based Architecture (Colocation)**. Code related to a specific feature or page must live inside that feature's directory to keep the codebase modular and scalable.

### Directory Structure
- `app/` — Next.js App Router folders representing application routes and features.
  - `app/[feature]/` — The core domain folder for a specific feature/page (e.g., `dashboard`, `profile`).
  - `app/[feature]/components/` — UI components exclusive to this feature.
  - `app/[feature]/hooks/` — Custom React hooks exclusive to this feature's logic.
  - `app/[feature]/page.tsx` & `layout.tsx` — Routing and structural entry points.
- `components/` — Shared, reusable global UI primitives (e.g., Button, Modal, Input) that carry no business logic.
- `hooks/` — Shared global hooks (e.g., `useAuth`, `useLocalStorage`, `useDebounce`).
- `lib/` — Third-party library configurations and initializations (e.g., `supabase.ts`, `prisma.ts`, `stripe.ts`).
- `services/` — Global API clients, data fetching handlers, or SDK wrappers.
- `utils/` — Pure utility functions (e.g., `formatCurrency.ts`, `cn.ts`).
- `types/` — Shared global TypeScript definitions and interfaces.

### Core Architecture Rules
1. **Strict Colocation:** If a component or hook is only used within a single feature (e.g., `DashboardChart` or `useDashboardData`), it **MUST** be placed inside `app/[feature]/components/` or `app/[feature]/hooks/`. Do not pollute global directories.
2. **Promotion to Shared:** A component or hook should only be moved to the global `components/` or `hooks/` directory if it is actively used by **3 or more distinct features**.
3. **Data Fetching Placement:** Page-level composition and initial data fetching should happen in server components (`page.tsx`). Pass data down to feature components or handle client-side interactivity using localized hooks.
4. **Isolate Business Logic:** Keep presentational UI clean. Extract data fetching, state management, and complex validation rules into the feature's local `hooks/` folder.

### Where New Files Go
- New Page / Route → Create a new folder under `app/[route_name]/page.tsx`
- Component for one page only → `app/[route_name]/components/MyNewComponent.tsx`
- Hook for one page only → `app/[route_name]/hooks/useNewLogic.ts`
- Global design system primitive → `components/ui/` or `components/`
- Global helper function → `utils/` or `services/`

## Coding Conventions

TypeScript:
- Strict mode is enabled. Never use `any`.
- Prefer inferred types. Only add explicit annotations when they add clarity.
- Use interfaces for objects, type aliases for unions and primitives.
- Never use non-null assertion (!). Handle null/undefined explicitly.

Components:
- Functional components only.
- Named exports for all shared components. Default export only for route files.
- Keep components under 500 lines. If longer, extract sub-components or hooks.
- Props interfaces are named ComponentNameProps and defined above the component.

Patterns:
- Use async/await. Never chain .then()/.catch() unless inside a utility.
- Extract repeated logic into hooks (in features/) or helpers (in lib/).
- Error boundaries around async data regions.
- Loading, empty, and error states are required for any data-fetching component.

Style:
- Descriptive variable names. No abbreviations unless universally understood (e.g., `id`, `url`).
- No dead code or commented-out blocks in committed files.
- Comments only when the intent is genuinely non-obvious. The code should explain the what; comments explain the why.

## UI and Design Rules

Foundation:
- shadcn/ui is the default component library. Use its primitives before building custom.
- Follow an 8px spacing rhythm. Use Tailwind's default spacing scale (4 = 16px).

Visual style:
- Strong typographic hierarchy. Size and weight carry more visual weight than color.
- Restrained color palette. Black, white, and one primary accent. No rainbow interfaces.
- Prefer generous whitespace over dense layouts.

Components:
- Every button has a clear primary/secondary/destructive hierarchy. Never two primary buttons side by side.
- Forms are short and scannable. One column layouts on mobile, two on desktop max.
- Modals are reserved for destructive actions and focused tasks. Not for information display.

States — every interactive element must have:
- Hover state
- Focus ring (visible for keyboard users)
- Disabled state with reduced opacity
- Loading state for async actions (spinner or skeleton, not just disabled)

Accessibility:
- Minimum 4.5:1 contrast ratio for body text, 3:1 for large text
- All form inputs have associated labels
- All images have meaningful alt text (or aria-hidden if decorative)
- Interactive elements reachable and operable by keyboard

## Content Guidelines

Voice:
- Confident and direct. Not tentative or over-qualified.
- Plain language. If a 10-year-old wouldn't know the word, consider a simpler one.
- Friendly but not sycophantic. No "Great choice!" or "Awesome!" 

Headlines:
- Clear before clever. If it takes a second to understand, rewrite it.
- Lead with user benefit, not product feature.

Body copy:
- Short paragraphs. Three sentences max per paragraph.
- Front-load the important information.
- Active voice. "Save your changes" not "Your changes will be saved."

Error messages:
- Say what happened and what to do next.
- Never blame the user.
- Be specific. "Email already in use" not "Something went wrong."

Avoid:
- Hype and empty marketing language ("game-changing", "revolutionary", "seamless")
- Jargon (unless the audience clearly expects it)
- Passive constructions
- Filler phrases ("In order to...", "Please note that...")

## Testing and Quality

Before a task is complete:
- Run typecheck: npm typecheck (must pass with zero errors)
- Run lint: npm lint (must pass)
- Run affected tests: npm test [changed files]

What to test:
- Unit tests for all reusable utility functions in lib/
- Unit tests for all custom hooks with non-trivial logic
- Integration tests for form submission flows
- Do NOT add tests for simple presentational components with no logic

For UI changes, verify manually:
- Works on mobile (375px) and desktop (1280px)
- Loading state renders correctly
- Empty state renders correctly
- Error state renders correctly
- Keyboard navigable

## File Placement Rules

Creating new files:
- New landing page section → components/marketing/sections/SectionName.tsx
- New reusable UI primitive → components/ui/ComponentName.tsx
- New feature hook → features/[feature]/hooks/use[Name].ts
- New API utility → lib/api/[resource].ts

Before creating a new component:
- Search for existing components that serve the same purpose
- If something similar exists, extend it rather than creating a near-duplicate
- Only create an abstraction if it's used in 3+ places or is genuinely complex

Naming conventions:
- React components: PascalCase (UserProfile.tsx)
- Hooks: camelCase, prefixed with "use" (useUserProfile.ts)
- Utilities: camelCase (formatDate.ts)
- Types/interfaces: PascalCase (UserProfile, UserProfileProps)
- Constants: SCREAMING_SNAKE_CASE (MAX_RETRY_COUNT)

Always backward-compatible:
- Shared components used across many features
- Exported utility functions in lib/
- TypeScript types used across multiple features

If a refactor would require changes to 5+ files, flag it before implementing.


## Commands

Package management: npm (not pnpm or yarn)

Common commands:
- Install dependencies: npm install
- Start dev server: npm run dev
- Build for production: npm run build
- Run type checking: npm run typecheck
- Run linter: npm run lint
- Fix lint issues: npm run lint:fix
- Run all tests: npm test
- Run tests in watch mode: npm run test:watch

Database (Supabase):
- Generate types: npm run db:types
- Push migrations: npm run db:push (staging only, never production)

API keys are stored in .env.local — never commit this file.
