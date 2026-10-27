# Brew & Bloom

A one-page cafe website built with React and Vite, backed by a small Express API that serves the menu, gallery and cafe info and accepts table bookings.

## Tech stack

- **Frontend:** React 18, Vite 5, CSS Modules with shared design tokens (`src/styles/tokens.css`)
- **API:** Express 4, with JSON files in `server/data/` as the data store
- **Shared:** booking validation in `shared/validateBooking.js`, imported by both the API and the booking form so they always agree

## Getting started

### Prerequisites

- Node.js 18.11 or newer (the API uses `node --watch`)
- npm

### Install

```sh
git clone <repo-url>
cd AI-driven-cofee-site
npm install
```

### Run in development

Start the API and the site together:

```sh
npm run dev:all
```

Output from each process is prefixed with `[api]` or `[web]`. Ctrl+C stops both, and if one exits the other is stopped too.

Or run them in two terminals:

```sh
npm run dev:api   # API on http://localhost:3001 (restarts on server changes)
npm run dev       # site on http://localhost:5173; Vite proxies /api to the API
```

While the dev server is running, saving `server/data/menu.json`, `gallery.json` or `info.json` refreshes that data in the browser without a full page reload.

### Build for production

```sh
npm run build     # outputs to dist/
npm run preview   # serves the built site locally
```

### Configuration

| Env var        | Default                | Purpose                                                              |
| -------------- | ---------------------- | -------------------------------------------------------------------- |
| `PORT`         | `3001`                 | Port the API listens on                                              |
| `CORS_ORIGIN`  | `*`                    | Value of the API's `Access-Control-Allow-Origin` header              |
| `VITE_API_URL` | _(empty, same origin)_ | Base URL the site uses for API calls, e.g. `https://api.example.com` |

## Project structure

```
src/
  App.jsx              page layout, sections in order
  components/<Name>/   one folder per component: <Name>.jsx, <Name>.module.css, index.js
  api/client.js        API client
  hooks/useFetch.js    data-fetching hook
  styles/tokens.css    colors, fonts and spacing variables
server/
  index.js             Express app and routes
  lib/store.js         reads and writes the JSON data files
  data/                menu, gallery, info and bookings data
shared/
  validateBooking.js   booking rules used by the API and the form
scripts/
  dev-all.js           runs the API and site together
```

## API

| Method | Path            | Description                    |
| ------ | --------------- | ------------------------------ |
| `GET`  | `/api/menu`     | Menu grouped by category       |
| `GET`  | `/api/gallery`  | Gallery images                 |
| `GET`  | `/api/info`     | Opening hours and contact info |
| `POST` | `/api/bookings` | Create a table booking         |

Every `/api` request is delayed by 400–800 ms to simulate a real network, so loading states are visible. See [API.md](API.md) for request and response formats, validation rules and error codes.

## Claude Code setup (`.claude/`)

This repo includes project configuration for [Claude Code](https://claude.com/claude-code), so everyone working on it with Claude gets the same conventions and guardrails.

```
.claude/
  settings.json          shared hooks (committed)
  settings.local.json    personal permission allowlist
  skills/cafe-section/   skill for building page sections
  agents/a11y-auditor.md accessibility review subagent
  hooks/protect-files.sh guards .env and lockfiles
```

### Skills

**`cafe-section`** (`.claude/skills/cafe-section/SKILL.md`)

Claude loads this skill when asked to add or create a page section (hero, menu, about, gallery, contact, footer). It enforces the project's conventions:

1. One folder per section in `src/components/<Name>/` with `<Name>.jsx`, `<Name>.module.css` and `index.js`.
2. Colors, fonts and spacing only from the CSS variables in `src/styles/tokens.css`; no hard-coded values.
3. Mobile-first CSS, with `@media (min-width: 768px)` for larger screens.
4. Each section is a `<section id="...">` matching the navbar anchors (`#home`, `#menu`, `#about`, `#gallery`, `#contact`) and has a heading.
5. Images have meaningful `alt` text; images below the fold use `loading="lazy"`.
6. Semantic HTML, visible focus states, and no new libraries without asking.
7. The section is added to `src/App.jsx` in page order.

Invoke it directly with `/cafe-section`, or just ask Claude to "add a testimonials section".

### Agents

**`a11y-auditor`** (`.claude/agents/a11y-auditor.md`)

A read-only subagent (tools: `Read`, `Grep`, `Glob`; model: Sonnet) that audits React, HTML and CSS against WCAG 2.2 AA. It checks for:

- Clickable `div`/`span` elements instead of semantic controls
- Missing alt text, labels or `aria-label`s, and ARIA misuse
- Keyboard access, focus order and removed focus styles (`outline: none`)
- Color contrast risks and reliance on color alone
- Heading hierarchy and form error association

It reports a table of `File:line | Issue | WCAG criterion | Suggested fix`, ranked by severity, and never edits files. Claude may run it on its own after UI changes, or you can ask: "use the a11y-auditor agent to review the Contact section".

### Hooks

Configured in `.claude/settings.json`:

| Event         | Matcher             | What it does                                                                                                                                                                                |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PreToolUse`  | `Edit\|Write\|Bash` | Runs `.claude/hooks/protect-files.sh`, which blocks any edit or shell command that touches `.env`, `package-lock.json` or `pnpm-lock.yaml` (exit code 2) and tells Claude to ask you first. |
| `PostToolUse` | `Edit\|Write\|Bash` | Formats the edited file with Prettier (`npx prettier --write`).                                                                                                                             |

Requirements: the hooks use `jq`, so install it if you don't have it (`brew install jq` on macOS). Make sure the guard script is executable:

```sh
chmod +x .claude/hooks/protect-files.sh
```

The guard only checks the file path or command text, so it blocks any shell command that names a protected file, even a read-only one like `cat package-lock.json`. It does not catch commands that change a lockfile without naming it, such as `npm install <pkg>`.

### Permissions

`.claude/settings.local.json` pre-approves a few commands (`npx eslint`, `npx vite`, and a `curl` check of the hero image) so Claude doesn't prompt for them. This file holds personal settings; add shared permissions to `settings.json` instead.
