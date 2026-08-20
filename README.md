# Hidden India — Full Project

This zip has both halves of the project. They still run separately (a browser
can't run a Node/PostgreSQL server), but you only need to download this one file.

```
hidden-india-project/
├── frontend/
│   ├── index.html         ← the website's HTML shell
│   ├── styles.css         ← all styling
│   └── app.js             ← app logic, routing, API calls (open index.html to run it)
└── backend/
    ├── package.json
    ├── src/               ← Express API + PostgreSQL schema
    └── README.md          ← deploy instructions (Render / Railway / your VPS)
```

## Quick start (local)

```bash
# 1) backend
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, CORS_ORIGINS
npm run migrate
node src/seed.js you@example.com "your-password"
npm run dev                  # → http://localhost:4000

# 2) frontend
# open frontend/index.html directly in a browser
```

`frontend/app.js` talks to the backend via the `API_BASE_URL` constant near the
top of the file — currently set to `http://localhost:4000`. Change that
to your deployed backend's URL once you host it (see `backend/README.md`).

For full deploy steps (Render, Railway, VPS), see `backend/README.md`.
