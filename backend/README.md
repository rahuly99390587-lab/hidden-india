# Hidden India — Backend API

Node/Express + PostgreSQL backend, matching the `hidden-india-2.html` frontend's data model
(destinations + images + tips + sources, admin JWT auth, CSV import).

## 1. Local setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, CORS_ORIGINS
npm run migrate           # creates tables
node src/seed.js admin@hiddenindia.in "a-strong-password"   # creates first admin
npm run dev                # http://localhost:4000
```

## 2. API summary

Public (no auth):
- `GET /api/destinations?q=&state=&category=&sort=name|state`
- `GET /api/destinations/nearby?lat=&lng=&radius_km=`
- `GET /api/destinations/:slug`
- `GET /api/meta/states`

Auth:
- `POST /api/auth/login` → `{ email, password }` → `{ token }`

Admin (send `Authorization: Bearer <token>`):
- `GET /api/admin/dashboard`
- `GET /api/admin/destinations` (all statuses)
- `POST /api/admin/destinations`
- `PUT /api/admin/destinations/:id`
- `DELETE /api/admin/destinations/:id`
- `POST /api/admin/destinations/import` → `{ rows: [...] }` (same shape as the CSV template
  in the frontend's admin import screen)

## 3. Deploy — Render (easiest)

1. Push this folder to a GitHub repo.
2. Render dashboard → **New → PostgreSQL** → create a free/starter instance → copy the
   **Internal Database URL**.
3. Render dashboard → **New → Web Service** → connect the repo.
   - Build command: `npm install`
   - Start command: `npm start`
   - Add env vars from `.env.example` (`DATABASE_URL` = the internal URL from step 2,
     `DATABASE_SSL=true`, `JWT_SECRET`, `CORS_ORIGINS` = your frontend's URL).
4. Once deployed, open the Render **Shell** tab for the web service and run:
   ```bash
   npm run migrate
   node src/seed.js you@example.com "your-password"
   ```
5. Your API is live at `https://<your-service>.onrender.com/api`.

## 4. Deploy — Railway

1. `railway init` in this folder (or connect the GitHub repo from the dashboard).
2. **+ New → Database → PostgreSQL** in the same project — Railway auto-injects `DATABASE_URL`
   into your service's env.
3. Add the remaining env vars (`JWT_SECRET`, `CORS_ORIGINS`, `DATABASE_SSL=true`) in the
   service's **Variables** tab.
4. Deploy, then run migrate/seed via `railway run npm run migrate` and
   `railway run node src/seed.js you@example.com "your-password"`.

## 5. Deploy — your own VPS (Ubuntu, e.g. DigitalOcean/Hetzner)

```bash
sudo apt update && sudo apt install -y postgresql nginx
sudo -u postgres createuser hidden_india --pwprompt
sudo -u postgres createdb hidden_india -O hidden_india

# app
git clone <your-repo> && cd hidden-india-backend
npm install --production
cp .env.example .env   # DATABASE_URL=postgres://hidden_india:<pw>@localhost:5432/hidden_india
npm run migrate
node src/seed.js you@example.com "your-password"

# run with pm2 so it survives reboots
sudo npm install -g pm2
pm2 start src/server.js --name hidden-india-api
pm2 save && pm2 startup
```
Put nginx in front as a reverse proxy to `localhost:4000` and get a free TLS cert with
`certbot --nginx`.

## 6. Wiring the existing frontend to this API

The uploaded `hidden-india-2.html` currently reads/writes `STATE` in memory (and likely
localStorage via `persist()`). To point it at this backend instead:
- Replace `loadData()` with a `fetch('/api/destinations')` call (and `fetch` per-slug for
  detail pages).
- Replace `adminLogin()` with a `POST /api/auth/login` call; store the returned token
  (e.g. in memory / `sessionStorage`, not `localStorage`, to reduce XSS exposure) and send
  it as `Authorization: Bearer <token>` on every `/api/admin/*` call.
- Replace `confirmImport()`'s local push with `POST /api/admin/destinations/import`.

Happy to make those frontend edits directly in the HTML file if you want — just say so.
