# SD Car Sticker

**Solve double parking with a tap.** Car owners put an NFC sticker on their windshield. If someone is blocked in, they tap the sticker (or type the plate number) and the owner gets an SMS asking them to move. Anyone can also use the sticker to send a non-emergency alert, such as lights left on or exposed valuables.

> **Status: prototype.** Accounts, car registration, double park mode and SMS notifications work end to end. Sticker ordering is still a mock. See [Known limitations](#known-limitations).

## How it works

1. **Register.** A car owner signs up, adds a phone number and a 4-digit PIN, and registers a plate number. Each car gets a unique NFC code.
2. **Stick.** The owner writes the car's link, `https://<your-domain>/blocked/scan?code=<nfc code>`, to an NFC sticker and puts it on the windshield. The *Activate* page shows the exact link for each car.
3. **Activate.** Before double parking, the owner turns on double park mode with their PIN.
4. **Get notified.** A blocked driver taps the sticker, picks what the owner needs to know (for example "Owner left car keys inside"), and presses **Notify the owner**. The owner receives an SMS. The blocked driver stays anonymous.
5. **Send an alert.** *Send Car Alert* is a separate flow for non-blocking issues: lights on, valuables visible, a security concern, or a custom message.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) with API route handlers, React 19, TypeScript |
| UI | Tailwind CSS 3, shadcn/ui (Radix UI), lucide-react |
| Database | Supabase (Postgres), accessed server-side with `@supabase/supabase-js` |
| Auth | Email and password, bcrypt (`bcryptjs`), signed JWT session in an httpOnly cookie (`jose`) |
| SMS | [Zavu](https://zavu.dev) one-way SMS channel |
| NFC | Web NFC (Chrome on Android), with a plate-number fallback |

## Project structure

```
.
├── app/
│   ├── page.tsx                       # Landing page
│   ├── login/, register/              # Account pages
│   ├── car-owner/
│   │   ├── register/                  # Add phone, PIN and plate (+ success page)
│   │   ├── activate/                  # Pick a car, show its sticker link, toggle double park mode
│   │   └── order/                     # NFC sticker order form (mock) (+ success page)
│   ├── blocked/scan/                  # "I'm Blocked": identify car, choose enquiry, notify owner
│   ├── general-notification/scan/     # "Send Car Alert": template or custom alert
│   └── api/
│       ├── auth/{register,login,logout,me,profile}/
│       ├── cars/ and cars/status/
│       └── notify/                    # Anonymous: sends the SMS to the car's owner
├── components/
│   ├── sticker-lookup.tsx             # NFC tap, ?code= / ?plate= links, plate input
│   └── ui/                            # shadcn/ui components
├── hooks/use-session.ts               # useSession() and the api() fetch helper
├── lib/
│   ├── supabase.ts                    # Server-only Supabase client (secret key)
│   ├── session.ts                     # JWT cookie session, bcrypt helpers
│   ├── cars.ts                        # Find a car and its owner by plate or NFC code
│   ├── contact-owner.ts               # Lookup, per-car cooldown, send, audit log
│   ├── zavu.ts                        # Zavu SMS client
│   └── phone.ts                       # Malaysian phone number normalisation to E.164
└── supabase/schema.sql                # Database schema
```

## Getting started

### Prerequisites

- Node.js 18.18 or newer
- A [Supabase](https://supabase.com) project
- A [Zavu](https://zavu.dev) account with an API key, for SMS (optional while developing)

### 1. Set up the database

Open your Supabase project, go to **SQL Editor**, and run [supabase/schema.sql](supabase/schema.sql). It creates the `users`, `cars` and `scan_events` tables. Row level security is on with no policies, so the publishable key can't read or write anything. All access goes through the server using the secret key.

### 2. Configure environment variables

Create a `.env` file in the project root (a template is in `.env.example` in git history if you need one):

```env
# Supabase > Project Settings > API
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=...            # server-only, never expose this
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_JWKS_URL=...

# 32+ random characters. Generate one with:
# node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
AUTH_JWT_SECRET=

# Zavu SMS: https://dashboard.zavu.dev > Settings > API Keys
ZAVU_API_KEY=
ZAVU_SENDER_ID=                    # optional: pin a sender, otherwise the project default is used

# While testing, every SMS goes to this number instead of the car owner.
# Remove it before going live.
TEST_PHONE_OVERRIDE=
```

The app needs `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and `AUTH_JWT_SECRET` to start working. Without `ZAVU_API_KEY`, notifications fail with a clear error and everything else still works.

### 3. Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

To test from a phone on the same Wi-Fi, open `http://<your-computer-ip>:3000`. Web NFC only works in Chrome on Android and needs HTTPS, so for real sticker taps deploy the app or use a tunnel.

## Notifications

All SMS go through `POST /api/notify`, which looks up the car, checks the cooldown, sends the message and logs the attempt to `scan_events`. A car can be messaged **once every 60 seconds**. Every message starts with `RM0.00 Sime Darby Car Sticker: `, because Malaysian SMS rules require it, and contains no links.

### Blocked page enquiries

On `/blocked/scan` the driver identifies the car, then picks an **enquiry** on the left and presses **Notify the owner** on the right. The SMS always says the car is blocking someone and adds the chosen reason.

| Enquiry | Appended to the message |
| --- | --- |
| Just blocking me | *Please move it as soon as you can.* |
| Owner left car keys inside | Your car keys look like they are still inside the car. |
| Someone crashed into the car | Someone has crashed into your car. |
| Owner forgot to turn off the lights | Your car lights are still on. |
| Window or door left open | Your car window or door is open. |
| Valuables visible inside | Valuables are visible inside your car. |
| Car alarm is going off | Your car alarm is going off. |
| Flat tyre | Your car seems to have a flat tyre. |
| Custom message | Sent on its own as `About your car {plate}: <text>` (up to 90 characters), without the "blocking someone" sentence |

Example: `RM0.00 Sime Darby Car Sticker: Your car ABC1234 is blocking someone. Your car keys look like they are still inside the car.`

### Car alert page

`/general-notification/scan` sends one of these without the "blocking" sentence:

| Alert type | Message |
| --- | --- |
| `lights` | The lights on your car {plate} are on. This may drain your battery. |
| `valuables` | Valuables are visible inside your car {plate}. Please check on it. |
| `security` | There may be a security concern with your car {plate}. Please check on it. |
| `other` | About your car {plate}: *your text* (up to 90 characters) |

Custom text has whitespace collapsed and links rejected. To add a new enquiry or alert, add it to the templates in [app/api/notify/route.ts](app/api/notify/route.ts) and to the matching list in the page.

### Shareable links

Both flows accept the car in the URL, but the person still has to confirm before anything is sent, so link previews can't message an owner.

| URL | Purpose |
| --- | --- |
| `/blocked/scan?code=<nfc code>` | What the NFC sticker should open |
| `/blocked/scan/ABC1234` | Blocked flow with the plate pre-filled |
| `/general-notification/scan/ABC1234` | Alert flow with the plate pre-filled |

## API reference

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | none | Create an account (`email`, `password` of 8+ characters) and sign in |
| `POST` | `/api/auth/login` | none | Sign in (`email`, `password`) |
| `POST` | `/api/auth/logout` | session | Sign out |
| `GET` | `/api/auth/me` | session | Current user: `id`, `email`, `phoneNumber`, `hasPin` |
| `PATCH` | `/api/auth/profile` | session | Set `phoneNumber` and/or a 4-digit `pin`. Setting a PIN requires the account `password` |
| `GET` | `/api/cars` | session | The signed-in user's cars, with status and `nfcCode` |
| `POST` | `/api/cars` | session | Register a car (`plateNumber`) |
| `PUT` | `/api/cars/status` | session + PIN | Turn double park mode on or off (`plateNumber`, `status`, `pin`) |
| `POST` | `/api/notify` | none | SMS the owner. Body: `plate` or `code`, plus `type` (`blocked`, `lights`, `valuables`, `security`, `other`), and for `blocked` an optional `enquiry`, and `message` for custom text. Returns the `plateNumber` and the exact SMS `message` that was sent |

## Database

- **`users`**: `id`, `email` (unique), `password_hash`, `pin_hash`, `phone_number`
- **`cars`**: `plate_number` (primary key, uppercase with no spaces), `user_id`, `car_status`, `activated_at`, `nfc_code` (unique UUID)
- **`scan_events`**: one row per SMS attempt (`plate_number`, `kind`, `alert_type`, `status`, `detail`). Used for the cooldown and as an audit log. Blocked messages with an enquiry are logged as `blocked:<enquiry>`.

## Known limitations

- **Sticker ordering is a mock.** Submitting the order form just goes to a success page. Stickers have to be written manually with the link from the *Activate* page.
- **Web NFC is limited.** Reading a tag in the browser works only in Chrome on Android over HTTPS. Elsewhere, a sticker that opens a URL still works, and anyone can type the plate number.
- **`/api/notify` is anonymous by design.** The only protection against abuse is the 60-second cooldown per car. There is no per-sender rate limit or CAPTCHA.
- **Double park mode doesn't gate notifications.** An owner can be messaged whether or not it is active.
- **Escalation is informational.** The "Still blocked?" button points to the local council and 999. It doesn't contact anyone.
- **SMS length.** Messages are written to fit one 160-character GSM-7 SMS. Custom text with non-ASCII characters (emoji, curly quotes) can split into multiple parts.
- **Build checks are off.** `next.config.mjs` sets `ignoreBuildErrors` and `ignoreDuringBuilds`, so TypeScript and ESLint errors don't fail `npm run build`. There are no automated tests.
- **Leftover Python files.** `requirements.txt` and the committed `__pycache__` folders are from an earlier FastAPI backend that has been replaced by the Next.js API routes. They aren't used.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js linting |
