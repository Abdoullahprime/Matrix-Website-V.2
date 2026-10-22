# Matrix Solutions — Company Website

Marketing website for Matrix Solutions Company Limited (The Gambia): enterprise
software, banking systems, IT infrastructure, and cyber security services.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7, Motion, lucide-react
- **Contact form backend, production**: PHP 8 + MySQL (`iis/api/*.php`) on Plesk for Windows/IIS
- **Contact form backend, development**: Express + MySQL (`server/index.ts`), a stand-in that
  serves the same URLs

In production the site is static files plus the PHP API. There is no Node.js on the server.

## Run Locally

**Prerequisites:** Node.js 20+, and a MySQL database for the contact form.

1. Install dependencies:

   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your MySQL details.

3. Start the development API (port 3001):

   ```
   npm run server
   ```

4. In a second terminal, start the frontend dev server (port 3000, proxies `/api`
   to the API):

   ```
   npm run dev
   ```

The `contact_submissions` table is created automatically on first use. If the database is
unreachable the site still works; only the contact form returns an error, so you can work on
the frontend without MySQL running.

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full Plesk (Windows/IIS) walkthrough. In short:

```
npm run build:iis
```

builds `deploy/matrix-site.zip`, which you import into the website folder on the server.

## Client logos

Logos live in `src/assets/clients/` and are matched to clients by filename: the client's short
name (the part before ` - ` in the client list), lower-cased with dashes, e.g. `kgh.webp` for
"KGH - KANIFING GENERAL HOSPITAL". Clients without a logo show a lettered badge.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run server` | Development API on port 3001 (watch mode) |
| `npm run build` | Frontend production build to `dist/` |
| `npm run build:iis` | Build and package the site for Plesk: `deploy/matrix-site.zip` |
| `npm run lint` | TypeScript type check |
