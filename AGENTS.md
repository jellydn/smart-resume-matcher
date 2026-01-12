# AGENTS.md for smart-resume-matcher

## Project Overview
React Router v7 full-stack application with TypeScript, Tailwind CSS v4, and Zod for validation. The app tailors resumes to job descriptions using AI.

## Build Commands
- `npm run dev` - Start development server at http://localhost:5173
- `npm run build` - Production build (runs react-router build)
- `npm run start` - Run production server (uses react-router-serve)
- `npm run typecheck` - Generate types and run TypeScript compiler (react-router typegen && tsc)

## Code Style Guidelines

### TypeScript
- Use explicit types for function parameters and return values when not inferrable
- Use `zod` for runtime validation (see `app/lib/types.ts` patterns)
- Enable strict mode - no `any` types without explicit justification
- Use `~/*` path aliases (configured in tsconfig.json paths)

### Imports
- Use path aliases: `~/components/*`, `~/lib/*`, `~/hooks/*`
- Use `import type { Type }` for type-only imports when not importing values
- Group imports: React → external → internal → CSS

### Component Patterns
- Follow shadcn/ui pattern: separate component file from variants file
- Use `class-variance-authority` (CVA) for component variants
- Use `clsx` + `tailwind-merge` (`cn()` utility) for class composition
- Use Radix UI primitives (`@radix-ui/react-slot`) for polymorphic components

### Error Handling
- Use React Router's `ErrorBoundary` export with `isRouteErrorResponse`
- Provide user-friendly error messages with optional dev-only stack traces

### Styling
- Tailwind CSS v4 with CSS variables (defined in `app/app.css`)
- Use `data-*` attributes for component variants (see button.tsx)
- Follow shadcn/ui "new-york" style variant naming (default, destructive, outline, secondary, ghost, link)

### Naming Conventions
- Components: PascalCase (`Button`, `Header`)
- Hooks: camelCase with `use` prefix (`useTheme`)
- Utilities: camelCase (`cn`, `generateId`)
- Schemas: PascalCase with `Schema` suffix, types with `Type` suffix
- Files: kebab-case for utilities, PascalCase for components/routes

### Form/Schema Patterns
- Define Zod schemas first, then infer Type (`export type X = z.infer<typeof schema>`)
- Provide error messages in schema definitions: `z.string().min(1, "Error message")`
- Use helper function for IDs: `export function generateId(): string { return crypto.randomUUID(); }`

### Routing
- Use config-based routing in `app/routes.ts` with `index()` helper
- Route types auto-generated: import from `./+types/[route-name]`
- Export `meta()` for page metadata

## Technology Stack
- React 19 + React Router 7.12
- TypeScript 5.9 + Vite 7
- Tailwind CSS 4 + @tailwindcss/vite
- Zod 4 for validation
- shadcn/ui components with Radix UI primitives
