# Smart Package Locker

Everest Engineering coding challenge: delivery agents store packages, customers retrieve them with a locker ID and pickup code.

**React + TypeScript · GraphQL · Node.js**

## How to run

Needs Node.js 20+. Open a terminal in this folder:

```bash
cd C:\xampp\htdocs\smart-package-locker
npm install
npm run dev
```

Then open **http://localhost:5174**

GraphQL API: http://localhost:4001

This app uses ports **5174** and **4001** so it does not clash with the spaceship project.

## Demo logins

Password for both: `locker-demo`

| Role | Email | Use for |
| --- | --- | --- |
| Delivery agent | `agent@locker.test` | Store packages, add lockers, see pickup codes |
| Customer | `customer@locker.test` | Retrieve a package at the kiosk |

Click a demo account on the login screen to fill the form.

## Ready-made packages to retrieve

These are already in lockers:

| Locker | Pickup code | Customer | Stored | Charge rule |
| --- | --- | --- | --- | --- |
| `S-02` | `482193` | Maya Chen | ~2 days | 2 × 10 = **20** |
| `M-01` | `719204` | Omar Haddad | ~7 days | 5×10 + 2×20 = **90** |
| `L-01` | `305881` | Priya Nair | ~12 days | 5×10 + 5×20 + 2×30 = **210** |

On **Retrieve**, click the sample chips or type the locker + code.

## What to test

1. Sign in as **agent@locker.test** / `locker-demo`
2. See the locker wall (S/M/L, some occupied) — agents only
3. **Store package** — pick a size. The app uses the *smallest* free locker that fits
4. Copy the locker ID + pickup code from the receipt
5. Sign out, sign in as **customer@locker.test** / `locker-demo`
6. Customer home is **pickup only** (no locker wall, no other customers’ packages)
7. **Retrieve** with locker + code — locker opens, charge is shown, locker becomes free
8. Try a wrong code — you get an error
9. Store a large package when only small lockers are free — you get “no suitable locker”
10. `npm test` — allocation + charge unit tests

Charge: **10 units/day** for days 1–5, **20** for days 6–10, **30** after that. A day is 24 hours from store time.

To reset demo data, delete `server/data/db.json` and restart `npm run dev`.
