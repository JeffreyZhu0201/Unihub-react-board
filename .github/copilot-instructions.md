# Copilot Instructions for Unihub-react-board

## Project Overview
This is a Full Stack React application built with **React Router v7** (Framework Mode) and **Tailwind CSS v4**. It uses Server-Side Rendering (SSR) by default.

## Architecture & Structure
- **Framework:** React Router v7 (`@react-router/node`, `@react-router/dev`).
- **Routing:** Configured in `app/routes.ts`. Prefer updating this file over relying on file-system routing conventions if adding new routes.
- **Entry Point:** `app/root.tsx` defines the root HTML document, layout, and global providers.
- **Components:**
  - Route components live in `app/routes/`.
  - Reusable UI components should live in `app/components/` (create if needed).
- **Styling:** Tailwind CSS v4.
  - Configuration is in `app/app.css` using the `@theme` directive.
  - There is **NO** `tailwind.config.js`.



## Core Workflows

### 1. Data Loading & Mutations (Server-Side)
- Use `loader` for data fetching (GET).
- Use `action` for mutations (POST, PUT, DELETE).
- These run on the **server** only.
- **Type Safety:** Always use the generated types from `react-router typegen`.

```tsx
// Example Route Component
import type { Route } from "./+types/home"; // Generated types

export function loader({ request }: Route.LoaderArgs) {
  // Server-side logic
  return { message: "Hello World" };
}

export function action({ request }: Route.ActionArgs) {
  // Form submission handling
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.message}</h1>;
}
```

### 2. Styling (Tailwind v4)
- Use standard utility classes.
- For custom values, edit `app/app.css` inside the `@theme` block.
- **Do not** look for `tailwind.config.js`.

```css
/* app/app.css */
@import "tailwindcss";

@theme {
  --color-brand: #ff0000;
  --font-sans: "Inter", sans-serif;
}
```

### 3. SEO & Links
- Export `meta` function for `<meta>` tags.
- Export `links` function for `<link>` tags (stylesheets, preconnect).

## Development Commands
- **Start Dev Server:** `npm run dev` (starts on port 5173).
- **Typecheck:** `npm run typecheck` (Runs `react-router typegen` + `tsc`). passing this is required for CI.
- **Build:** `npm run build` (Generates server and client bundles).

## Conventions
- **Imports:** Use standard relative imports or set up aliases in `tsconfig.json` if needed (currently standard structure).
- **Forms:** Use `<Form>` from `react-router` for data mutations to trigger automatic revalidation of loaders.
- **Error Handling:** Export an `ErrorBoundary` component in route modules to handle errors gracefully.

