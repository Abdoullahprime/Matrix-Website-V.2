# Matrix Solutions — Company Website

Marketing website for Matrix Solutions Company Limited (The Gambia): enterprise software, banking systems, IT infrastructure, and cyber security services.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7, Motion, lucide-react
- **Backend**: Express 4 + better-sqlite3 (contact form API), run with tsx

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:

   ```
   npm install
   ```

2. Start the API server (contact form submissions, port 3001):

   ```
   npm run server
   ```

3. In a second terminal, start the frontend dev server (port 3000, proxies `/api` to the API):

   ```
   npm run dev
   ```

## Production

```
npm run build
npm run server
```

When a `dist/` build exists, the Express server serves the frontend and the API from a single process (default port 3001, configurable via `PORT` in `.env`).

Contact form submissions are stored in `data/contacts.db` (SQLite, gitignored). Inspect them with any SQLite client:

```
npx better-sqlite3 data/contacts.db "SELECT * FROM contact_submissions"
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run server` | Express API (+ static frontend in production) on port 3001 |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | TypeScript type check |
