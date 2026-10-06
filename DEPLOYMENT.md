# Deploying to Plesk (matrixgambia.com)

The site runs as a **single Node.js application**: one Express process serves the
React build *and* the `/api` endpoints. Hosting is Plesk on Windows/IIS, where
Node runs behind iisnode.

## 1. Create the database

Plesk → **Databases** → **Add Database**.

- Database name: e.g. `matrix_contact`
- Create a database user and set a password

Note the name, user and password — you need them in step 4. The
`contact_submissions` table is created automatically on first start.

## 2. Build the deployment bundle

Locally:

```bash
npm install
npm run build:deploy
```

This produces `deploy/app/` containing exactly what gets uploaded:

| File | Purpose |
| --- | --- |
| `index.js` | the compiled Express server |
| `package.json` | runtime dependencies only (express, mysql2, dotenv) |
| `dist/` | the compiled React site |

## 3. Upload

Upload the **contents** of `deploy/app/` into `httpdocs` (Plesk **Files**, or FTP
via **Connection Info**). Do not upload `node_modules` — Plesk installs it.

`httpdocs` should end up containing `index.js`, `package.json` and `dist/`.

## 4. Configure the Node.js application

Plesk → **Websites & Domains** → `matrixgambia.com` → **Node.js**.

| Setting | Value |
| --- | --- |
| Document Root | `/httpdocs` |
| Application Root | `/httpdocs` |
| Application Startup File | `index.js` |

Under **Custom environment variables**, add:

```
DB_HOST      localhost
DB_NAME      <database name from step 1>
DB_USER      <database user>
DB_PASSWORD  <database password>
```

Then click **NPM Install**, and **Enable Node.js** / **Restart App**.

## 5. Verify

- `https://matrixgambia.com/api/health` → `{"ok":true,"database":"connected"}`

  If it says `"database":"unavailable"`, the site is running but the credentials
  are wrong — check the environment variables and restart the app.
- Load the site, open **/clients** directly and hard-refresh. It should render,
  not 404. That confirms the SPA fallback is working.
- Submit the contact form, then check the `contact_submissions` table in
  **Databases → phpMyAdmin**.

## 6. Enable HTTPS

Plesk showed **"Domain not secured"**. Go to **SSL/TLS Certificates** and issue a
free Let's Encrypt certificate, then turn on the permanent HTTPS redirect.

## Reading submissions

Plesk → **Databases** → your database → **phpMyAdmin**:

```sql
SELECT created_at, full_name, email, organization, interest, message
FROM contact_submissions
ORDER BY created_at DESC;
```

## Updating the site later

Re-run `npm run build:deploy`, re-upload the contents of `deploy/app/`, and click
**Restart App** in Plesk. `NPM Install` only needs re-running if dependencies changed.

## Fallback: static-only hosting

If the Node app ever has to be taken out of the picture, the React build can be
served by IIS alone: upload the contents of `dist/` to `httpdocs` together with
`deploy/web.config.static-only` (renamed to `web.config`), which supplies the SPA
routing rules. **The contact form will not work in this mode** — it has no API to
call. Do not leave that `web.config` in `httpdocs` when running the Node app; it
overrides the config Plesk generates for iisnode.
