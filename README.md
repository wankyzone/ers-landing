# ERS Landing

ERS is a role-based logistics platform for Lagos. The app supports three user roles:

- **Client**: creates errands and funds them via escrow.
- **Runner**: accepts and fulfills funded errands.
- **Admin**: monitors KYC, fraud, alerts, and analytics.

## Tech stack

- Next.js (App Router)
- Supabase (Auth + Postgres + Realtime)
- Resend (transactional/broadcast email)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Add these to `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server routes only)
- `RESEND_API_KEY`

## App flow

- `/` checks auth and resolves user route.
- New users without role are sent to `/select-role`.
- Role routes:
  - `admin` -> `/admin`
  - `runner` -> `/runner`
  - `client` -> `/client`

## API routes

- `POST /api/send`: send waitlist confirmation email.
- `POST /api/broadcast`: broadcast email to waitlist.
- `POST /api/admin/update-user`: update user role/KYC data from admin panel.
- `POST /api/run-fraud-check`: run fraud checks.

## Quality checks

```bash
npm run lint
npm run test
```
