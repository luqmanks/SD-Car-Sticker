# ParkSyde

**Solve double parking with a tap.** ParkSyde lets drivers who double park register an NFC sticker on their windshield. Anyone blocked in can scan the sticker to notify the owner by WhatsApp or a phone call. Passers-by can also use it to send non-emergency alerts, such as lights left on or exposed valuables.

> **Status: hackathon prototype.** The web UI and REST API work end to end for accounts, car registration and double-park status. NFC scanning, plate lookup for notifications, sticker ordering and authority escalation are still simulated. See [Known limitations](#known-limitations).

## How it works

1. **Register and stick.** A car owner creates an account, registers a plate number, phone number and 4-digit PIN, then places an NFC sticker on the windshield.
2. **Activate.** Before double parking, the owner opens *Activate Double Park Mode*, picks a car and enters their PIN. The car's status is set to active and the activation time is recorded.
3. **Get notified.** A blocked driver scans the sticker through *I'm Blocked*. The owner is messaged on WhatsApp, and the blocked driver can also trigger a voice call that reads out a "please move your car" message.
4. **Send an alert.** *Send Car Alert* lets anyone report lights left on, exposed valuables, a security concern or a custom message.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, shadcn/ui (Radix UI), lucide-react |
| Backend | FastAPI, SQLAlchemy, Uvicorn |
| Database | PostgreSQL (via `psycopg2`) |
| Auth | JWT (`python-jose`) with bcrypt-hashed passwords (`passlib`) |
| Messaging | 360dialog WhatsApp sandbox API, Twilio Voice |

## Project structure

```
.
├── app/                         # Next.js pages (App Router)
│   ├── page.tsx                 # Landing page, auth-aware navigation
│   ├── login/                   # Email + password login
│   ├── register/                # Account creation
│   ├── car-owner/
│   │   ├── register/            # Two-step car + PIN registration (+ success page)
│   │   ├── activate/            # Activate / deactivate double park mode
│   │   └── order/               # NFC sticker order form (+ success page)
│   ├── blocked/scan/            # "I'm blocked" flow: notify, call, escalate
│   └── general-notification/scan/  # Non-emergency car alerts
├── components/ui/               # shadcn/ui components
├── api/
│   ├── config/database.py       # SQLAlchemy engine and session
│   ├── models.py                # Users and Cars tables
│   └── routes/
│       ├── auth.py              # Users, login, JWT, profile update
│       └── route.py             # Cars, status, WhatsApp and Twilio calls
├── main.py                      # FastAPI app, CORS, 360dialog webhook
├── testing360                   # Standalone script to test the 360dialog sandbox
└── requirements.txt
```

## Getting started

### Prerequisites

- Node.js 18+ and npm (or pnpm)
- Python 3.12+
- A PostgreSQL database (a hosted one such as Supabase works)
- Optional: a 360dialog sandbox API key and a Twilio account for notifications

### 1. Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install python-jose requests twilio   # used by the code, see note below
```

Create a `.env` file in the project root:

```env
URL_DATABASE=postgresql://USER:PASSWORD@HOST:5432/DBNAME
SECRET_KEY=a-long-random-string
ALGORITHM=HS256

# Optional: notifications
D360_API_KEY=your-360dialog-sandbox-key
YOUR_PHONE_NUMBER=60123456789
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

Start the API. Tables are created automatically on startup, and `users` relies on Postgres's `gen_random_uuid()`.

```bash
uvicorn main:app --host 0.0.0.0 --reload --port 8000
```

Interactive docs are at `http://localhost:8000/docs`.

> `requirements.txt` still lists several incorrect or duplicate entries (`jose`, `jwt`, `JWTError`, `jose-python`) and omits `python-jose`, `requests` and `twilio`, which the code imports. Clean it up before deploying.

### 2. Frontend

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

**Point the frontend at your API.** The API base URL is hardcoded as `http://192.168.4.183:8000` in every page that calls the backend. Replace it with your own address (your machine's LAN IP if you want to test from a phone, or `http://localhost:8000` for local use):

```bash
grep -rl "192.168.4.183:8000" app | xargs sed -i 's#192.168.4.183:8000#localhost:8000#g'
```

Moving this into a `NEXT_PUBLIC_API_URL` environment variable would be a worthwhile cleanup.

### Testing on a phone

Run uvicorn with `--host 0.0.0.0`, set the API URL to your computer's LAN IP, and open `http://<your-ip>:3000` on a phone connected to the same network. `pyngrok` is also listed in the requirements for tunnelling a public webhook URL.

## API reference

### Auth (`api/routes/auth.py`)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/users` | Create a user (`email`, `password`) |
| `GET` | `/allUsers` | List all users |
| `GET` | `/users/{user_id}` | Get one user |
| `DELETE` | `/users/{user_id}` | Delete a user |
| `POST` | `/token` | OAuth2 password login (form-encoded `username` = email, `password`). Returns a JWT valid for 60 minutes |
| `GET` | `/is_authenticated` | Validates the bearer token and returns the user's `email`, `user_id`, `pin_number`, `phone_number` |
| `PATCH` | `/update` | Set a user's `pin_number` and/or `phone_number` |

### Cars and notifications (`api/routes/route.py`)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/allCars` | List all cars |
| `GET` | `/cars/{plateNumber}` | Get a car, or `false` if it doesn't exist |
| `POST` | `/cars` | Register a car (`plateNumber`, `user_id`, `car_status`) |
| `PUT` | `/cars/status` | Activate or deactivate double park mode (`plateNumber`, `status`). Sets or clears `activated_at` |
| `DELETE` | `/cars/{plateNumber}` | Delete a car |
| `GET` | `/carsUser/{user_id}` | Plates registered to a user |
| `GET` | `/carsUser/status/{user_id}` | Plates and active status for a user |
| `GET` | `/send-message-notify-owner` | Send a WhatsApp message through the 360dialog sandbox |
| `POST` | `/call-owner` | Place a Twilio voice call to the owner |
| `GET` | `/userPhoneNumber/{plateNumber}` | Look up an owner's phone number (currently broken, see below) |
| `POST` | `/webhook` | 360dialog inbound webhook. Echoes an auto-reply (`main.py`) |

### Data model

- **`users`**: `user_id` (UUID, PK), `email` (unique), `hashed_password`, `pin_number`, `phone_number`
- **`cars`**: `plateNumber` (PK), `user_id` (FK to `users`), `car_status` (bool), `activated_at`, `nfc_code` (unique UUID, generated by the database)

## Frontend routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page with "I'm a Car Owner", "I'm Blocked" and "Send Car Alert" entry points |
| `/register`, `/login` | Account creation and login. The JWT is stored in `localStorage` |
| `/car-owner/register` | Add a plate, phone number and PIN, with a password re-check |
| `/car-owner/activate` | Pick a plate, then activate or deactivate with the PIN |
| `/car-owner/order` | NFC sticker order form (RM 5 sticker plus RM 5 shipping) |
| `/blocked/scan` | Notify the owner, call them, or escalate to authorities |
| `/general-notification/scan` | Pick an alert type and notify the owner |

## Known limitations

This is a prototype, and a few things are stubbed or need fixing before real use:

- **NFC scanning is simulated.** The scan pages wait two seconds and then use a hardcoded plate (`ABC1234`). Web NFC or an NFC-URL sticker flow isn't implemented, and `nfc_code` isn't yet used to resolve a car.
- **Notifications ignore the car.** `/send-message-notify-owner` and `/call-owner` use a hardcoded phone number and message. Alert type and custom text from the alert page are not sent. `route.py` and `testing360` also contain a hardcoded 360dialog sandbox key, which should be moved to an environment variable and rotated.
- **`/userPhoneNumber/{plateNumber}` is broken.** It calls the async `get_car` without `await` and queries a nonexistent `Users.id` column.
- **PIN checks happen on the client.** The activate page compares the PIN against the value in the JWT, and `/cars/status` has no authentication, so anyone who can reach the API can toggle a car. PINs are stored unhashed.
- **API endpoints are unauthenticated.** `/allUsers`, `/allCars`, `DELETE` routes and `PATCH /update` are open, and the CORS policy allows all origins.
- **Sticker ordering and escalation are mock flows.** Submitting the order form just redirects to a success page, and "Escalate to Authorities" runs a scripted animation without contacting anyone.
- **Frontend build checks are off.** `next.config.mjs` sets `ignoreBuildErrors` and `ignoreDuringBuilds`.
- **Committed artefacts.** `__pycache__` folders and `.DS_Store` are tracked in git and should be added to `.gitignore`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js linting |
| `uvicorn main:app --reload` | Start the API |
