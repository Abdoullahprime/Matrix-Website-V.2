# Matrix Solutions — Company Website

Marketing website for Matrix Solutions Company Limited (The Gambia): enterprise
software, banking systems, IT infrastructure, and cyber security services.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7, Motion, lucide-react
- **Backend**: Express 4 + MySQL (`mysql2`) for contact form submissions

In production a single Express process serves both the React build and the
`/api` endpoints.

## Run Locally

**Prerequisites:** Node.js 20+, and a MySQL database for the contact form.

1. Install dependencies:

   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your MySQL details.

3. Start the API server (port 3001):

   ```
   npm run server
   ```

4. In a second terminal, start the frontend dev server (port 3000, proxies `/api`
   to the API):

   ```
   npm run dev
   ```

The `contact_submissions` table is created automatically on first start. If the
database is unreachable the site still serves — only the contact form returns an
error, so you can work on the frontend without MySQL running.

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full Plesk (Windows/IIS) walkthrough.

In short:

```
npm run build:deploy
```

...then upload the contents of `deploy/app/` to `httpdocs` and point the Plesk
Node.js app at `index.js`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run server` | Express API on port 3001 (watch mode) |
| `npm run build` | Frontend production build to `dist/` |
| `npm run build:server` | Compile the server to `deploy/app/index.js` |
| `npm run build:deploy` | Full deployment bundle in `deploy/app/` |
| `npm run lint` | TypeScript type check |
