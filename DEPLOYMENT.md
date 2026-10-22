# Deploying to Plesk (matrixgambia.com)

The site runs as a **single Node.js application**: one Express process serves the
React build *and* the `/api` endpoints. The hosting is **Plesk on Windows/IIS**, where
Node runs behind iisnode (Node 16.x at the time of writing).

That environment has several quirks, and the steps below are written around them:

| Quirk | What we do about it |
| --- | --- |
| The Node.js page has no "environment variables" box | Settings are read from a `matrix.env` file (step 4) |
| `NPM install` on the server fails with `EPERM` | Ship `node_modules` ready-made inside a zip; never run NPM install |
| File Manager rejects uploads over ~1 MB | Split zips, imported by URL (see "Getting the files onto the server") |
| iisnode passes a named pipe in `PORT`, not a number | The server passes `PORT` to `listen()` untouched |
| The app folder is the web root | `matrix.env` lives one level above it, where it cannot be downloaded |

## 1. Create the database

Plesk → **Databases** → **Add Database**.

- Database name: e.g. `matrix_site`
- Create a database user and set a password

**Choose the MySQL 8 server** in the *Database server* dropdown (the one labelled
`v8.0.x`). Not the old `v5.1` one: it predates `utf8mb4`, so the table cannot be
created there. Not MS SQL either: the app speaks MySQL. The MySQL 8 server is **not**
on `localhost` (it was `208.91.198.197`), so note its address.

Plesk may add a prefix to the names you type. After creating, copy the name and user
exactly as the Databases list shows them. The `contact_submissions` table is created
automatically on first start.

## 2. Build the bundle

```bash
npm install
npm run build:deploy
bash scripts/make-upload-zips.sh
```

This writes three zips into `deploy/`:

| Zip | Contents |
| --- | --- |
| `matrix-upload-1-app.zip` | `index.js`, `package.json`, the site's HTML/JS/CSS |
| `matrix-upload-2-images.zip` | logos and the hero images |
| `matrix-server-and-modules.zip` | `index.js`, `package.json` and a ready-made `node_modules` |

## 3. Getting the files onto the server

Plesk's File Manager rejects even small uploads, so do not upload from the browser.
Either:

- **Import by URL** (no software needed). Publish the zips as a GitHub release asset,
  then in File Manager use **+ → Import file via URL** with each link, and
  right-click → **Extract Files**. The server downloads them itself, so no limit applies.
- **FTP** (FileZilla): upload the contents of `deploy/app/`. Credentials are under
  **Connection Info**. You would also need `node_modules` from the modules zip.

Extract all three zips into the site folder (the subdomain's folder, or `httpdocs` for
the main domain). A new subdomain starts with Plesk's placeholder files (`index.html`,
`css/`, `img/`, `favicon.ico`): delete those first, and leave any `web.config` Plesk
created. The folder should end up holding `index.js`, `package.json`, `dist/` and
`node_modules/` directly.

## 4. Settings file

In File Manager, go to the **Home directory** (the folder *above* the site folder, the
one that contains `httpdocs`), create a file called `matrix.env`, and put in it:

```
DB_HOST=<database server address from step 1>
DB_NAME=<database name from step 1>
DB_USER=<database user>
DB_PASSWORD=<database password>
```

Keep it above the web root so it can never be downloaded. For local development a
`.env` file next to `server/index.ts` works too (see `.env.example`).

## 5. Configure Node.js

Plesk → the domain or subdomain → **Node.js**.

| Setting | Value |
| --- | --- |
| Document Root / Application Root | the site folder |
| Application Startup File | `index.js` (Plesk defaults to `app.js`; click it to change) |

Do **not** click **NPM install**; the modules are already in place. Click
**Enable Node.js**, then **Restart App**.

## 6. Verify

- `/api/health` → `{"ok":true,"database":"connected"}`

  `"database":"unavailable"` means the site runs but the database settings are wrong:
  check `matrix.env`, then Restart App.
- Open **/clients** directly and refresh. It should render, not 404.
- Submit the contact form, then look for the row in **Databases → phpMyAdmin**.

## 7. DNS and HTTPS

DNS for `matrixgambia.com` is managed outside Plesk (name servers `kheweul.net`).
A subdomain must have an **A record** pointing at the Plesk server. Check where a name
really points before debugging anything else:

```bash
nslookup new.matrixgambia.com
```

A leftover record can send a name to another company's server. Once the name points
at Plesk, issue a free Let's Encrypt certificate under **SSL/TLS Certificates**
(this fails if DNS is not yet correct).

## Reading submissions

```sql
SELECT created_at, full_name, email, organization, interest, message
FROM contact_submissions
ORDER BY created_at DESC;
```

## Updating the site later

Re-run steps 2 and 3, extracting over the old files, then **Restart App**. The modules
zip only needs re-importing if dependencies changed.

## Fallback: static-only hosting

The React build can be served by IIS alone: put the contents of `dist/` in the site
folder together with `deploy/web.config.static-only` (renamed `web.config`), which
supplies the SPA routing rules. **The contact form will not work in this mode.** Do not
leave that `web.config` in place when running the Node app.
