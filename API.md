# Brew & Bloom API

A small Express API for the cafe site. Code lives in `server/`, data in `server/data/*.json`.
Booking rules live in `shared/validateBooking.js`, which both the API and the booking form import, so they always agree.

## Running

Run the API and the site in two terminals:

```sh
npm run dev:api   # API on http://localhost:3001
npm run dev       # site; Vite proxies /api to the API
```

The API restarts when server files change (`node --watch`). The site calls `/api/...` on its own origin; set `VITE_API_URL` (e.g. `https://api.example.com`) to call the API on another host instead.

| Env var       | Default | Purpose                                |
| ------------- | ------- | -------------------------------------- |
| `PORT`        | `3001`  | Port to listen on                      |
| `CORS_ORIGIN` | `*`     | Value of `Access-Control-Allow-Origin` |

## Conventions

- All responses are JSON.
- Every `/api` request is delayed by a random **400–800 ms** to simulate a real network, so loading states are visible.
- CORS is enabled for `GET`, `POST` and `OPTIONS` with the `Content-Type` header. Preflight `OPTIONS` requests return `204` without the delay.
- Dates are `YYYY-MM-DD`, times are 24-hour `HH:MM`, both in the **server's local time zone**.

### Errors

| Status | Body                                              | When                      |
| ------ | ------------------------------------------------- | ------------------------- |
| `400`  | `{ "error": "Request body must be valid JSON." }` | Body isn't valid JSON     |
| `404`  | `{ "error": "Not found" }`                        | Unknown `/api` route      |
| `413`  | `{ "error": "Request body is too large." }`       | Body over 10 KB           |
| `422`  | `{ "errors": { "<field>": "<message>" } }`        | Booking validation failed |
| `500`  | `{ "error": "Something went wrong." }`            | Unexpected server error   |

---

## `GET /api/menu`

Returns the menu, grouped by category. Source: `server/data/menu.json`.

**200**

```json
{
  "currency": "USD",
  "categories": [
    {
      "id": "coffee",
      "title": "Coffee",
      "items": [
        {
          "id": "espresso",
          "name": "Espresso",
          "description": "Single-origin, rich and bright.",
          "price": 3
        }
      ]
    }
  ]
}
```

`price` is a number in `currency` units; format it on the client (e.g. `3` → `$3.00`).

---

## `GET /api/gallery`

Returns the gallery photos. Source: `server/data/gallery.json`.

**200**

```json
{
  "photos": [
    {
      "id": 1,
      "src": "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&h=600&q=75",
      "width": 800,
      "height": 600,
      "alt": "Cafe counter with an espresso machine and grinders under hanging Edison bulbs",
      "caption": "Our bar, where every cup is pulled to order."
    }
  ]
}
```

`alt` describes each photo; use it as the image's `alt` text. `caption` is an optional one-line description shown under the photo. Keep it short and don't repeat the alt text.

---

## `GET /api/info`

Returns contact details, opening hours and booking limits. Source: `server/data/info.json`. Booking validation reads the hours and guest limits from this file, so editing it changes what `POST /api/bookings` accepts.

**200**

```json
{
  "name": "Brew & Bloom",
  "address": ["12 Bloom Street", "Your Town, AB 12345"],
  "phone": { "display": "(555) 012-3456", "href": "tel:+15550123456" },
  "email": "hello@brewandbloom.example",
  "timezone": "server local time",
  "hours": [
    {
      "label": "Mon – Fri",
      "days": [1, 2, 3, 4, 5],
      "open": "07:00",
      "close": "18:00"
    },
    { "label": "Sat – Sun", "days": [0, 6], "open": "08:00", "close": "17:00" }
  ],
  "booking": { "minGuests": 1, "maxGuests": 10 }
}
```

`days` uses JavaScript day numbers: `0` = Sunday … `6` = Saturday.

---

## `POST /api/bookings`

Creates a table booking. Bookings are appended to `server/data/bookings.json`.

**Request** (`Content-Type: application/json`)

```json
{
  "name": "Sam Lee",
  "email": "sam@example.com",
  "date": "2026-10-30",
  "time": "10:00",
  "guests": 4,
  "message": "Window seat if possible"
}
```

| Field     | Required | Rules                                                                                                                             |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | yes      | Non-empty after trimming, max 100 characters                                                                                      |
| `email`   | yes      | Looks like an email address (`something@domain.tld`)                                                                              |
| `date`    | yes      | Real calendar date, `YYYY-MM-DD`, today or later; the cafe must be open that day                                                  |
| `time`    | yes      | `HH:MM` (24-hour), within that day's opening hours (`open` ≤ time < `close`); if the date is today, the time must not have passed |
| `guests`  | yes      | Whole number from 1 to 10 (`minGuests`–`maxGuests` in `info.json`); `4` and `"4"` are both accepted                               |
| `message` | no       | Text, max 1000 characters                                                                                                         |

Strings are trimmed before saving; unknown fields are ignored.

**201 Created**

```json
{
  "booking": {
    "id": "5d230941-5cda-4104-9e5d-6a456fe25392",
    "name": "Sam Lee",
    "email": "sam@example.com",
    "date": "2026-10-30",
    "time": "10:00",
    "guests": 4,
    "message": "Window seat if possible",
    "createdAt": "2026-10-26T08:44:32.073Z"
  }
}
```

**422 Unprocessable Entity**: one message per invalid field; valid fields are omitted.

```json
{
  "errors": {
    "email": "Email must be a valid address, like name@example.com.",
    "time": "Time must be within opening hours (07:00–18:00) on that day."
  }
}
```

Possible messages:

| Field     | Message                                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `Name is required.` / `Name must be 100 characters or fewer.`                                                                                                                                |
| `email`   | `Email is required.` / `Email must be a valid address, like name@example.com.`                                                                                                               |
| `date`    | `Date is required.` / `Date must be a real date in YYYY-MM-DD format.` / `Date must be in the future.` / `We're closed on that day.`                                                         |
| `time`    | `Time is required.` / `Time must be in 24-hour HH:MM format.` / `Time must be within opening hours (HH:MM–HH:MM) on that day.` / `That time has already passed. Please choose a later time.` |
| `guests`  | `Number of guests is required.` / `Guests must be a whole number from 1 to 10.`                                                                                                              |
| `message` | `Message must be text.` / `Message must be 1000 characters or fewer.`                                                                                                                        |

**Example**

```sh
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"Sam Lee","email":"sam@example.com","date":"2026-10-30","time":"10:00","guests":4}'
```
