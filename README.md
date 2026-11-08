# Smart Attendance

A frontend-only prototype of an AI-powered attendance management platform for schools. It ships with realistic seeded data, a role-aware dashboard, live recognition simulation, attendance workflows, reports, and a backend-ready service layer.

> **Prototype notice** — This project does not perform facial recognition or biometric registration in the browser. Capture images stay in memory and are submitted for simulated review. Detection events are simulated by a mock provider unless a real detection backend is connected.

## Features

- **Authentication & roles** — mocked sign-in with administrator and teacher workspaces. Sessions persist in `localStorage`; passwords are never stored.
- **Dashboard** — live attendance KPIs, weekly/monthly trends, today's distribution, class breakdowns, recent sessions, and top students.
- **Students, teachers, classes, courses** — searchable/paginated tables, profile pages, create/edit dialogs, validation, and CSV export.
- **Face registry** — registration status tracking with a camera capture flow that submits frames for backend review. Submissions remain `pending`; nothing is marked `registered` client-side.
- **Live detection** — camera preview, start/stop controls, mock recognition events, confidence rejections, duplicate filtering, event history, and automatic attendance marking.
- **Attendance** — filters, status corrections with an audit reason, session/class/course chips, and CSV export.
- **Sessions** — create detection windows, start/stop sessions, and finalize attendance (unrecognized students are marked absent).
- **Reports & analytics** — date ranges, cohort breakdowns, absence/late stats, trends, and detailed CSV exports.
- **Notifications** — unread/read filtering, type filters, mark-one/all read, and deletion. Recognition and detection warnings generate notifications automatically.
- **Settings** — profile, preferences, camera, detection, notification, and API configuration persisted locally.
- **Design system** — reusable buttons, cards, inputs, modals, tables, badges, skeletons, empty/error states, and a responsive navy/blue layout.

## Tech stack

React 19 · Vite 8 · Tailwind CSS v4 · React Router v7 · TanStack Query v5 · React Hook Form + Zod · Recharts · Axios · Lucide React · Sonner · date-fns

No TypeScript and no backend are required to run the prototype.

## Getting started

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
cp .env.example .env   # optional; defaults match the example
npm run dev
```

Open `http://localhost:5173`.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@smartattendance.app` | `admin123` |
| Teacher | `teacher@smartattendance.app` | `teacher123` |

Teachers cannot access Teachers management or the Face Registry; those routes redirect to the dashboard.

### Scripts

```bash
npm run dev      # start the Vite dev server
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # run Oxlint
```

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Base URL for the future REST API; used by the Axios client. |
| `VITE_DETECTION_MODE` | `mock` | `mock` uses simulated events; `api` uses the WebSocket detection backend. |

Changing these values requires restarting the dev server. Settings can also store a preferred API/WebSocket URL locally, but environment variables drive the active adapter.

## Project structure

```
src/
  components/        design system, layout, and feature components
  constants/         navigation, status metadata, chart colors, config
  contexts/          authentication context
  hooks/             TanStack Query hooks, camera, detection, debounce
  lib/               small utilities (cn, delay)
  mocks/             deterministic seeded database
  pages/             route-level pages
  providers/         detection provider abstraction (mock + API)
  routes/            route guards
  schemas/           Zod validation schemas
  services/api/      service layer backed by localStorage
  utils/             storage, formatting, CSV helpers
```

## Data & detection architecture

The prototype uses a seeded database persisted under `localStorage` (`smart-attendance:db`) with a version check. Reset it in DevTools by removing keys prefixed with `smart-attendance:`, or use Settings → **Restore defaults** (settings only).

Detection is intentionally provider-based:

- `BaseDetectionProvider` — shared subscription/status contract.
- `MockDetectionProvider` — generates recognition events, low-confidence rejections, duplicate suppression, and simulated disconnects.
- `ApiDetectionProvider` — opens a WebSocket and posts detection start/stop commands.

`useDetection` subscribes to the active provider, so the UI does not change when switching from mock to a real backend.

### Backend integration points

Set `VITE_DETECTION_MODE=api` and implement:

- `GET /health` — used by Settings → API → **Test connection**.
- `POST /detection/start` and `POST /detection/stop` — control the detection pipeline.
- `WS /ws/detection` — stream events. Expected payloads:
  - `{ "event": "face_recognized", ... }`
  - `{ "event": "face_match_rejected", "reason": "..." }`
  - `{ "event": "error", "message": "..." }`
- Recognition events should include `student_id`, `student_name`, `student_number`, `confidence`, `status`, `timestamp`, `camera_id`, and `session_id`.

The REST service files in `src/services/api/` follow a consistent async interface (`list/get/create/update/remove`) and can be swapped from localStorage implementations to `apiClient` calls without changing hooks or pages. `apiClient` already attaches the mock bearer token and normalizes API errors.

## Prototype limitations

- Facial recognition, liveness checks, and biometric enrollment are **not** implemented in the browser. Frames are kept in memory, submitted with a simulated delay, and shown as pending review.
- Attendance, notifications, and settings are persisted locally; data is per-browser and not shared.
- Email delivery, password reset, and backend error recovery are simulated.
- Camera access requires `localhost` or HTTPS and device permission. Some environments have no camera available.
- The mock detection provider is for demonstration only and does not use computer vision.
