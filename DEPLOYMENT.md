# Deploying to Plesk for Windows (IIS)

The site is deployed as **static files plus a small PHP contact API**. There is no Node.js
in production.

```
website folder/
  index.html, assets/, logo.png, ...     the compiled React site
  api/contact.php, api/health.php        the contact form backend (PHP + MySQL)
  web.config                             IIS settings: page routing, MIME types, caching
matrix.env                               database settings, ONE LEVEL ABOVE the website folder
```

## Why not Node.js

Node.js was tried first and abandoned. On this Plesk (Windows, Node 16, iisnode):

- `NPM install` always fails with `EPERM` while writing `node_modules\.bin\*`, and so does
  **Auto-configure**, which runs npm itself.
- The Node.js page has no environment-variable screen.
- Plesk will not regenerate a missing `web.config` while npm keeps failing.

PHP 8.3 and MySQL 8 work without any of that.

## 1. Create the database

Plesk → **Databases** → **Add Database**.

- Database name: e.g. `matrix_site`
- Related site: the site you are deploying
- Create a database user and a **strong** password (the MySQL server accepts connections
  from the internet, as is normal on shared hosting, so the password is the protection)

**Choose the MySQL 8 server** in the *Database server* dropdown (`v8.0.x`). Not the old
`v5.1` server: it predates `utf8mb4`. Not MS SQL: the API speaks MySQL. The MySQL 8 server
is **not** `localhost` (it was `208.91.198.197`), so note its address.

Plesk may add a prefix to the names you type. Copy the database name and user exactly as
the Databases list shows them. The table is created automatically on first use.

## 2. Settings file: `matrix.env`

In File Manager open the **Home directory**: the folder that *contains* the website
folders (`httpdocs`, `preview.example.com`, ...). Create a file called `matrix.env` there:

```
DB_HOST=<database server address from step 1>
DB_NAME=<database name from step 1>
DB_USER=<database user>
DB_PASSWORD=<database password>
```

It sits above the web root, so it can never be downloaded. Quotes around values, `#`
comments and Windows line endings are all fine.

### Email notifications (optional, recommended)

Every submission is saved to the database. To also get each one **by email**, add:

```
SMTP_USER=<the Gmail address that sends the mail>
SMTP_PASSWORD=<a Google App Password for that account>
```

That is all Gmail needs. Optional extras and their defaults:

| Key | Default | Meaning |
| --- | --- | --- |
| `MAIL_TO` | `info@matrixgambia.com` | where enquiries are delivered |
| `MAIL_FROM_NAME` | `Matrix Solutions Website` | sender display name |
| `SMTP_HOST` / `SMTP_PORT` | `smtp.gmail.com` / `465` | use port `587` for STARTTLS |
| `SMTP_SECURE` | from the port | `ssl`, `starttls` or `none` |

Create the app password at <https://myaccount.google.com/apppasswords> (the account needs
2-Step Verification). **It goes only in `matrix.env` on the server. Never put it in the
code, a commit or a zip**: the repository is public. If it leaks, delete it on that same
Google page and make a new one.

How it behaves:

- The database save happens **first**. If the email then fails, the visitor still sees
  success and nothing is lost; the response carries `"emailed":false` and a `mailReason`.
- The email's *Reply-To* is the visitor's address, so replying answers them directly.
- The TLS certificate is checked against the bundled `api/cacert.pem` before the password
  is sent. Refresh that file (see `scripts/make-iis-package.sh`) every year or so.
- `mailReason` values: `not_configured` (no `SMTP_USER`/`SMTP_PASSWORD`), `cannot_connect`
  (the host blocks outgoing mail ports; try 587), `tls_failed`, `auth_failed` (wrong app
  password), `recipient_refused`, `rejected`, `send_failed`, `no_response`.

## 3. Build and publish the package

```bash
npm install
npm run build:iis
```

This builds the site, runs the SEO step (a separate HTML file per page, `sitemap.xml`, `robots.txt`
and the matching `web.config` rules; see [SEO.md](SEO.md)), and writes `deploy/matrix-site.zip` (the
whole website folder, about 650 KB).

Plesk's File Manager rejects even small browser uploads ("file is too big"), so get the
zip onto the server by **URL import** instead. Publish it as a GitHub release asset:

```bash
gh release upload plesk-test-bundle deploy/matrix-site.zip --clobber
```

(create the release once with `gh release create plesk-test-bundle deploy/matrix-site.zip`).
Delete the release after deploying if you do not want the bundle public; it contains no
passwords. FTP (FileZilla; credentials under **Connection Info**) also works, uploading the
**contents** of the zip.

## 4. Put the files on the server

1. **Files** → open the website folder (e.g. `preview.matrixgambia.com`).
2. Delete everything inside it.
3. **+ → Import file via URL** with the release link
   `https://github.com/<owner>/<repo>/releases/download/plesk-test-bundle/matrix-site.zip`
4. Right-click the zip → **Extract Files**.

`index.html`, `assets/`, `api/` and `web.config` must sit directly in the website folder,
not inside another folder.

**Do not enable Node.js on the site.** If it is enabled, click **Disable Node.js** first, or
Plesk's iisnode configuration will fight `web.config`.

## 5. Verify

- `/api/health.php` → `{"ok":true,"database":"connected"}`

  If `"database":"unavailable"`, the `reason` tells you why (it never includes credentials):

  | reason | meaning | fix |
  | --- | --- | --- |
  | `not_configured` | `matrix.env` is missing, in the wrong folder, or has no `DB_NAME`/`DB_USER` | recheck step 2: it must be in the folder ABOVE the website folder |
  | `access_denied` | wrong user or password | correct them in `matrix.env` |
  | `unknown_database` | wrong database name | copy it exactly from the Databases list |
  | `database_not_permitted` | the user may not use this database | assign the user to it in Plesk |
  | `cannot_connect` | wrong `DB_HOST` or port | use the address of the MySQL 8 server |
  | `extension_missing` | PHP has no `mysqli` | enable it in Plesk's **PHP Settings** |

  If `/api/health.php` shows the PHP source, or a 404/500, PHP is not enabled for the site:
  turn it on under **PHP Settings** (or **Hosting Settings → PHP support**).
- Open the home page and **/clients**, then refresh. They should load, not 404.
- Send a contact form message, then look for the row in **Databases → phpMyAdmin**.
- If the whole site shows a 500 error, the server lacks the IIS **URL Rewrite** module,
  which `web.config` needs for page routing. Ask the host to enable it.

## 6. DNS and HTTPS

DNS for `matrixgambia.com` is managed outside Plesk (name servers `kheweul.net`), and a
leftover record can send a name to another company's server. Check where a name really
points before debugging anything else:

```bash
nslookup preview.matrixgambia.com
```

It must be `208.91.198.171`. Other names already resolve there through a wildcard record;
`new.matrixgambia.com` has its own leftover record pointing at `192.185.165.135`.

Once the name points at Plesk, issue a free Let's Encrypt certificate under **SSL/TLS
Certificates**. It fails if DNS is wrong, and until then browsers show "Not secure".

## The blog and the admin area

Staff manage the blog at `https://matrixgambia.com/admin`. Posts, pictures and admin logins are
stored in the same MySQL database (tables are created automatically on first use). Pictures live
in the database too, so no writable upload folder is needed.

**First-time setup (once):**

1. Add one line to `matrix.env` on the server, with a secret of your own (8+ characters):
   `ADMIN_SETUP_KEY=<your secret>`
2. Open `/admin`. Because no admin exists yet, the page asks for the setup key, a username and a
   password (10+ characters). That creates the first admin and signs you in.
3. Setup then refuses to run again. You can remove the `ADMIN_SETUP_KEY` line afterwards.

**Writing a post:** "New post", then fill in the title, topic, summary and an optional header
image, and add content blocks in the order they should appear: paragraph, heading, image (small,
medium or wide, with caption), list, quote, YouTube video. "Preview" shows the finished post.
"Save draft" keeps it hidden; "Publish" puts it on `/blog` (newest first; visitors can sort by
oldest, search, and filter by topic). Setting a publish date in the future hides it until then.

**Safety:** sign-in uses a session cookie (HttpOnly, SameSite=Strict, Secure on HTTPS), a secret
token on every change, a same-site check, and a lock after repeated wrong passwords (10 per
address or 6 per username in 15 minutes). Posts hold plain text only, never HTML. `/admin` is
excluded in `robots.txt` and marked `noindex`.

`/sitemap.xml` is generated live by `api/sitemap.php` (fixed pages plus published posts).

## Reading submissions

```sql
SELECT created_at, full_name, email, organization, interest, message
FROM contact_submissions
ORDER BY created_at DESC;
```

## Updating the site later

Repeat steps 3 and 4. Deleting the folder contents first is safe: `matrix.env` is outside it,
so the database settings survive.

## Local development

```bash
npm run server   # API on port 3001, using ./.env (see .env.example)
npm run dev      # site on port 3000, proxying /api to it
```

`server/index.ts` is a development stand-in for the contact form only. The blog and admin exist
only as PHP (`iis/api/`), so to try them locally run the PHP files against a MySQL database
(for example `php -S 127.0.0.1:3001 -t iis` with `MATRIX_ENV_FILE` pointing at a settings file).
