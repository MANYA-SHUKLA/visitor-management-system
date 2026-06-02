# Visitor Management System

Full-stack visitor management for residential societies — aligned with phased requirements (actors, flows, database design, APIs, QR entry, notifications, analytics, deployment).

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, TypeScript, Tailwind, TanStack Query, Recharts, html5-qrcode |
| Mobile | Expo, React Native, React Navigation, TanStack Query, expo-camera |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer, qrcode |
| Real-time | Polling every **10 seconds** (guard dashboard + notifications) |

## Project structure

```
visitor-management-system/
├── backend/          # Express API — port 5000
├── frontend/         # Next.js — port 3000
├── app/              # React Native (Expo) — iOS & Android
└── README.md
```

---

## Phase 1 — Actors & main flow

| Actor | Responsibilities |
|-------|------------------|
| **Security Guard** | Register visitor, view status, mark entry/exit, scan QR |
| **Resident** | Approve/reject requests, view history |
| **Admin** | Analytics, all visits, register users |

**Main flow:** Visitor arrives → Guard registers → Resident notified → Approve/Reject → If approved, entry (QR or manual) → Exit → History in dashboard.

---

## Phase 2 — Database design

### Users (`users`)

| Field | Description |
|-------|-------------|
| name | Full name |
| email | Login email |
| password | Hashed |
| role | `guard` \| `resident` \| `admin` |
| apartment / flatNumber | Flat number (residents) |
| phone | Phone number |

### Visitors (`visits`)

| Field | Description |
|-------|-------------|
| visitorName | Visitor name |
| visitorPhone | Phone |
| purpose | Purpose of visit |
| residentId | Host resident |
| registeredByGuardId | Created by guard |
| entryAt / exitAt | Entry & exit timestamps |
| status | `pending` → `approved` \| `rejected` → `entered` → `exited` |

### Notifications (`notifications`)

| Field | Description |
|-------|-------------|
| userId (residentId) | Recipient |
| message (body) | Notification text |
| visitId (visitorId) | Related visit |
| read | Read status |
| createdAt | Timestamp |

---

## Phase 3 — Authentication & roles

- **POST** `/api/auth/login` — Email + password
- **POST** `/api/auth/register` — Admin only (create users)
- **GET** `/api/auth/me` — Profile

Role permissions match the spec (guard / resident / admin).

---

## Phase 4 — Pages

| Page | Route |
|------|-------|
| Login | `/login` |
| Guard dashboard | `/guard` |
| Register visitor | `/guard/register` |
| Visitor status | `/guard/visits` |
| Entry / Exit | `/guard/entry-exit` |
| Scan QR | `/guard/scan` |
| Resident approvals | `/resident` |
| Visitor history (Today / Weekly / Monthly) | `/resident/history` |
| Admin analytics | `/admin` |
| All visits | `/admin/visits` |

---

## Swagger / OpenAPI

With the backend running:

- **Swagger UI:** https://visitor-management-system-6n23.onrender.com/api-docs
- **OpenAPI YAML:** https://visitor-management-system-6n23.onrender.com/openapi.yaml
- **Spec file:** `backend/openapi.yaml`

In Swagger UI, click **Authorize** and enter `Bearer <your-jwt>` from login.

---

## Phase 5 — API summary

**Auth:** Register, Login, Get Profile  

**Visitors:** Create request, List, Approve, Reject, Mark entry, Mark exit, Scan QR, History (with `period=today\|week\|month`)  

**Notifications:** List, Mark read, Mark all read  

**Analytics:** `/api/analytics/summary` (admin)

---

## Phase 6 — Real-time updates

Guard dashboard and visitor status pages **poll every 10 seconds** so when a resident approves, the guard sees the update quickly without refreshing.

*(Socket.IO can be added later for instant push.)*

---

## Phase 7–10 — History, QR, notifications, analytics

- **History dashboard:** Admin analytics with total/approved/rejected/today, frequent visitors, charts.
- **QR entry:** Generated on approval; guard scans at `/guard/scan` (auto entry/exit).
- **Notifications:** In-app + optional email (Nodemailer).
- **Charts:** Daily visitors, weekly visitors, approval/rejection rate (Recharts).

### In-app & email messages

| Event | In-app (bell) | Email (if SMTP configured) |
|-------|---------------|----------------------------|
| Guard registers visitor | Resident: *"{name} wants to visit ({purpose})"* | Subject: `Visitor approval: {name}` — visitor details + link to approve |
| Resident approves | Guard: *"{name} at {apt} — ready for entry"* | Subject: `Visit approved: {name}` — apartment + QR hint |
| Resident rejects | Guard: *"{name} at {apt} was rejected"* | *(in-app only)* |
| Visitor enters | Resident: *"{name} checked in at the gate"* | *(in-app only)* |
| Visitor exits | Resident: *"{name} checked out"* | *(in-app only)* |

API responses expose `message` as an alias for the notification `body` field.

---

## Setup (local)

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

`npm run dev` uses **nodemon** (config in `backend/nodemon.json`) to restart the API when you change `src/`, `.env`, or `openapi.yaml`.

Copy `backend/.env.example` → `backend/.env`. Optional email (Nodemailer):

```
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Visitor Management <noreply@localhost>
```

If SMTP is not set, emails are skipped (logged as `[email skipped]`); in-app notifications still fire.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` (include `/api`, no trailing slash after the host).

Open **http://localhost:3000**. `npm run dev` uses **Turbopack** to hot-reload the UI when you edit `src/`.

Run backend and frontend in **two terminals** for full-stack development.

### Mobile app (iOS / Android)

```bash
cd app
npm install
npm start
```

See `app/README.md` for emulator URLs and device setup.

### Demo accounts

| Email | Password | Role |
|-------|----------|------|
| admin@shuklamanya99.com | admin123 | Admin |
| guard@shuklamanya99.com | guard123 | Guard |
| resident1@shuklamanya99.com | resident123 | MANYA SHUKLA (A-101) |
| resident2@shuklamanya99.com | resident123 | MAHI SHUKLA (B-204) |

---

## Phase 11 — Testing checklist

| Test | How |
|------|-----|
| Login | All three roles |
| Visitor registration | Guard → register for A-101 |
| Approval / Rejection | Resident → approve or reject |
| Entry tracking | Guard → Entry/Exit or QR scan |
| Exit tracking | Mark exit after entry |
| History dashboard | Resident filters + Admin analytics |
| Role authorization | Wrong role cannot access other portals |
| Notifications | Bell icon after registration/approval |
| Email (optional) | Configure SMTP; resident gets approval email, guard gets approved email |

---

MANYA SHUKLA 2026