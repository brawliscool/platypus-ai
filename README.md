# Garage Roll

A mobile-first PWA for collecting and organizing photos of cars — built for iOS.

## Features

- **Camera capture** — uses `capture="environment"` to open the rear camera directly on iPhone/iPad
- **Car metadata** — tag make, model, year, color, location, and notes for each spot
- **Searchable gallery** — filter your collection by any field in real time
- **Favorites** — star the cars worth revisiting
- **Detail view** — full-bleed photo with specs at a glance
- **Offline-first** — photos and data are persisted locally in `localStorage` so your collection is always available, even without a connection
- **Install to home screen** — fully-configured PWA manifest and service worker; on iOS, tap Share → Add to Home Screen

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide React](https://lucide.dev)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/cars` | List all saved cars (server-side in-memory store) |
| `POST` | `/api/cars` | Save a new car entry |
| `DELETE` | `/api/cars?id=<id>` | Remove a car by id |

The client writes to `localStorage` on every save so the collection is always available offline; the server store is used as the authoritative source when the app is online.
