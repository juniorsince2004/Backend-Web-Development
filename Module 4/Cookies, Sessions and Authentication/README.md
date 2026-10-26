# LU48 — Session Authentication

## Setup

In PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run setup
npm run dev
```

Before starting, replace `COOKIE_SECRET` in `.env` with a random secret of at least 32 characters. Keep `COOKIE_SECURE=false` for local HTTP. Production always sets the `Secure` cookie flag; serve the API over HTTPS and set `NODE_ENV=production`.

`npm run setup` generates the Prisma client, creates the local SQLite database, and seeds `sam@example.com` / `SessionDemo!48`.

## Endpoints

- `POST /auth/login` — accepts `email` and `password`; sets a signed, HTTP-only `sid` cookie and returns safe user fields.
- `GET /auth/me` — requires a valid signed cookie and live server-side session.
- `POST /auth/logout` — destroys the current server-side session and clears the cookie; safe to repeat.

For a local end-to-end check in PowerShell, start the app in another terminal, then run:

```powershell
$login = Invoke-WebRequest -Method Post -Uri http://localhost:3000/auth/login -ContentType 'application/json' -Body '{"email":"sam@example.com","password":"SessionDemo!48"}' -SessionVariable auth
$login.Headers['Set-Cookie']
Invoke-RestMethod -Uri http://localhost:3000/auth/me -WebSession $auth
Invoke-WebRequest -Method Post -Uri http://localhost:3000/auth/logout -WebSession $auth
try { Invoke-WebRequest -Uri http://localhost:3000/auth/me -WebSession $auth } catch { $_.Exception.Response.StatusCode }
```

The login `Set-Cookie` header should contain `sid`, `HttpOnly`, and `SameSite=Lax`. To check missing or altered cookies, call `/auth/me` without the saved web session or modify the cookie value; both must return `401`. Logout clears the saved cookie and removes its session. `Secure` is enabled whenever `NODE_ENV=production` or `COOKIE_SECURE=true`; clients need HTTPS to send a Secure cookie.

## Session storage

The included in-memory session store is for learning and local execution only. It does not survive process restarts and is not shared across application instances. Production deployments require a shared store with expiration, such as Redis.
