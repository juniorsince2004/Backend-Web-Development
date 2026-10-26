# Authentication Fundamentals

## Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm start
```

The SQLite datasource keeps local setup self-contained. `.env.example` contains development defaults; do not commit `.env` or `prisma/dev.db`.

## Endpoints

- `POST /auth/register` accepts non-empty `name`, `email`, and `password` strings. Email is trimmed and lowercased; passwords are stored as asynchronous bcrypt hashes. A successful request returns `201` with `id`, `name`, and `email`. A duplicate email returns `409`.
- `POST /auth/login` accepts non-empty `email` and `password` strings. A successful request returns `200` with `id`, `name`, and `email`. Unknown emails and incorrect passwords both return `401` with the same generic invalid-credentials response.

Malformed JSON or invalid fields return `400`; unexpected errors return a generic `500`. Passwords and password hashes are never included in responses.
