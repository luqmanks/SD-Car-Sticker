# SD Car Sticker (Sime Darby Car Sticker)

NFC car stickers for double parking. A blocked driver taps the sticker on the car in their way and the owner gets an SMS,
without anyone sharing their phone number.

One Next.js app, deployable to Vercel with no separate server:

- **Frontend:** Next.js 15 (App Router), Tailwind, shadcn/ui
- **Backend:** Next.js route handlers in `app/api/*`
- **Database:** Supabase Postgres, accessed server-side only (`lib/supabase.ts`)
- **Auth:** email + password, session in an httpOnly JWT cookie; the 4-digit PIN is stored hashed and checked on the server
- **SMS:** Zavu (`lib/zavu.ts`), `POST https://api.zavu.dev/v1/messages` on the `sms_oneway` channel

There are no phone calls: Zavu's voice calls need a purchased number and a paid plan, and run an AI agent rather than
reading a fixed message.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill it in.
3. In the Supabase dashboard, open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). It is safe to re-run.
4. Set up Zavu (below).
5. `npm run dev` and open http://localhost:3000

### Zavu setup

1. Sign up at https://dashboard.zavu.dev (free plan, no card) and create a team and project.
2. **Settings > API Keys:** create a live key (`zv_live_...`). It is shown once. Put it in `ZAVU_API_KEY`.
3. Create a one-way SMS sender, which needs no purchased phone number. Either use the dashboard (Senders) or run:

   ```bash
   curl -X POST https://api.zavu.dev/v1/senders \
     -H "Authorization: Bearer $ZAVU_API_KEY" -H "Content-Type: application/json" \
     -d '{"name":"SD Car Sticker","enableSmsOneway":true,"setAsDefault":true}'
   ```

   If it is not the default sender, set its ID in `ZAVU_SENDER_ID`.

Limits to know about (from Zavu's docs, which may change):

- Unverified accounts can send **25 SMS per day**. Verifying identity, saving a card, or a paid plan raises it.
- Every SMS is screened before sending. Ordinary traffic goes straight out, but a message can be held for review
  (about 2 hours) or refused. Refused messages aren't charged.
- Free plan credit is $2 and then you pay per message. Check the dashboard for the Malaysia rate.

### Malaysian SMS rules

Messages should start with `RM0.00 ` and name the brand, and **messages containing URLs are blocked**. The templates in
`app/api/notify/route.ts` follow this, and custom messages containing links are rejected. Rules change over time.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | Server-side database access. Never expose the secret key to the browser. |
| `AUTH_JWT_SECRET` | 32+ random characters used to sign session cookies. |
| `ZAVU_API_KEY` | Zavu live API key. |
| `ZAVU_SENDER_ID` | Optional. Pin a sender instead of using the project default. |
| `TEST_PHONE_OVERRIDE` | **Testing only.** Sends every SMS to this number instead of the owner. Remove before going live. |

## NFC stickers

Each car has an `nfc_code`. Write this URL to the sticker as an NDEF URL record:

```
https://<your-domain>/blocked/scan?code=<nfc_code>
```

The activate page shows the exact link for each registered plate. You can also share
`https://<your-domain>/blocked/scan/<PLATE>`. Opening a link asks the driver to confirm before the owner is contacted.

## Deploying to Vercel

1. Push the repo and import it in Vercel (framework: Next.js, no extra config).
2. Add every variable from the table above in **Project Settings > Environment Variables**.
3. Do not set `TEST_PHONE_OVERRIDE` in production.

## Layout

- `app/api/auth/*`: register, login, logout, me, profile (phone + PIN)
- `app/api/cars`, `app/api/cars/status`: list/add cars, toggle double park mode (PIN required)
- `app/api/notify`: public endpoint that SMSes the owner a predefined template. Limited to one per car per minute and logged in `scan_events`.
