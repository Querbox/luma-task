# Luma Task

A PWA task management app built with React 19, TypeScript, and Vite.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check and build (`tsc -b && vite build`)
- `npm run lint` — Run ESLint

## Architecture

### Project Structure
```
src/
  components/       # Feature components (co-located .module.css)
    ui/             # Reusable UI primitives (Button, Card, Switch, Toast)
  context/          # React Context providers (TaskContext, NotificationContext, NetworkContext)
  hooks/            # Custom hooks (useTasks, useSuggestions, useNotifications)
  pages/            # Route pages (Focus, Calendar, Heatmap, Settings) with co-located .module.css
  services/         # Data access layer (IndexedDB via idb, NLP, task intelligence)
  types/            # TypeScript type definitions
  utils/            # Utility functions
```

### Key Patterns
- **Styling**: CSS Modules (`.module.css`) with `clsx` for conditional classes. No inline styles or global CSS.
- **Components**: Named exports, typed with `React.FC<Props>`. Framer Motion for animations (`motion.*` elements).
- **State**: React Context for global state. Custom hooks expose context consumers.
- **Data**: All DB access goes through `src/services/`. Uses IndexedDB via `idb` library.
- **Routing**: React Router v7 with layout route pattern. Base path: `/luma-task`.
- **IDs**: UUID v4 via `uuid` package.

## Conventions

- TypeScript strict mode
- ESLint with React Hooks and React Refresh plugins
- No test framework configured yet
- 4-space indentation in TSX, consistent with existing code
