# Database Integration

The Posts API persists data in PostgreSQL through Prisma. Services and controllers
continue to use the repository contract; Prisma is confined to the database client
and repository implementation.

## Local setup

1. Install PostgreSQL and create a local `community_dev` database.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to credentials for that
   local database. Never commit `.env` or use production credentials in this file.
3. Install dependencies and generate the Prisma Client:

   ```powershell
   npm install
   npm run prisma:generate
   ```

4. Apply the committed migrations and optionally add the repeatable sample data:

   ```powershell
   npm run db:migrate
   npm run db:seed
   ```

5. Start the API with `npm start`.

The seed command upserts one sample user and two sample posts without replacing
existing records. It can be rerun safely. To reset local data, use a dedicated
disposable development database and recreate that database before applying
migrations; do not run reset operations against shared or production databases.

## Prisma commands

- `npm run prisma:format` formats `prisma/schema.prisma`.
- `npm run prisma:validate` validates the schema against `DATABASE_URL`.
- `npm run prisma:generate` generates the Prisma Client.
- `npm run db:migrate` applies committed migrations to the configured database.
- `npm run db:seed` inserts the repeatable sample records.
