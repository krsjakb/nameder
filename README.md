# Nameder

A NestJS + React alapú alkalmazás, amely segít pároknak magyar keresztneveket választani egy "Tinder-szerű" felületen. A rendszer Postgres adatbázist használ, automatikusan betölti a `hungarian-names` csomagból származó teljes magyar keresztnévlistát, és támogatja a közös kedvencek értékelését toplistakészítéshez.

## Fő funkciók

- Meghívó kód alapú szobakezelés: hozd létre a szobát, hívd meg a párodat, és dolgozzatok ugyanazon listán.
- Teljes magyar keresztnév-adatbázis (fiú és lány nevek) automatikus betöltése.
- Tinder-szerű swipelés: bal (nem tetszik) / jobb (tetszik), nyílbillentyű támogatással.
- Hangzás alapú ajánlások az adott vezetéknévhez.
- Közös kedvencek listája és második körös pontozás toplistához.
- Részletes statisztikák (like/dislike számok, közös kedvencek, értékelt nevek).

## Projektstruktúra

```
├── backend      # NestJS + TypeORM + Postgres backend
├── frontend     # React + Vite + React Query frontend
├── docker-compose.yml
└── render.yaml  # Render.com deploy blueprint
```

## Előfeltételek

- Node.js 20+
- npm 10+
- Postgres 15/16

## Backend fejlesztői futtatás

```bash
cd backend
cp .env.example .env
npm install
npm run seed:names   # első indítás előtt töltse fel a neveket
npm run start:dev
```

A `seed:names` script elindítja a Postgres kapcsolatot, törli a meglévő neveket és betölti a `hungarian-names` csomag tartalmát. A `.env` fájlban állítsd be a Postgres elérési adatokat.

## Frontend fejlesztői futtatás

```bash
cd frontend
cp .env.example .env
npm install
npm run dev -- --host
```

A `VITE_API_URL` változóval állítható be a backend URL-je (fejlesztéskor jellemzően `http://localhost:3000`).

## Docker alapú indítás

```bash
docker compose up --build
```

Ez létrehozza a Postgres adatbázist, elindítja a NestJS backend-et (`localhost:3000`) és a statikus frontend-et (`localhost:5173`). Az első indítás után futtasd a backend konténerben a `npm run seed:names` parancsot (például `docker compose exec backend npm run seed:names`).

## Render.com hosting

A repository gyökerében lévő `render.yaml` fájl tartalmaz egy blueprint-et:

- **Backend**: Docker alapú web service (`backend/Dockerfile`).
- **Frontend**: statikus site build (`frontend` könyvtár).
- **Postgres**: ingyenes Render Postgres példány.

Lépések:

1. Készíts Render accountot, majd a Dashboardon válaszd az **"New +" → "Blueprint"** opciót.
2. Add meg a repository URL-jét és a `main` branch-et.
3. Render automatikusan létrehozza a szolgáltatásokat a blueprint alapján. A `FRONTEND_URL` env változót frissítsd a Render által kiosztott frontend URL-re.
4. Az első deployment után jelentkezz be a backend konténerbe és futtasd `npm run seed:names` parancsot (Render shell vagy jobb megoldásként állítsd be a parancsot background jobként).

## Postman / API tippek

- `POST /sessions` – új szoba létrehozása
- `POST /sessions/:code/join` – csatlakozás meghívó kóddal
- `GET /sessions/:sessionId/names/next?participantId=...` – következő név a felhasználónak
- `POST /sessions/:sessionId/preferences` – like/dislike mentése
- `GET /sessions/:sessionId/preferences/mutual` – közös kedvencek listája
- `POST /sessions/:sessionId/ratings` – pontozás közös kedvencre

A legtöbb lekérdezés `participantId` query paramétert igényel a felhasználó azonosításához.

## Adatkészlet forrás

A neveket a [hungarian-names](https://www.npmjs.com/package/hungarian-names) npm csomag szolgáltatja, amely folyamatosan karbantartott hivatalos magyar keresztneveket tartalmaz.

## Tesztelés

- Backend unit/e2e tesztek: `npm run test` / `npm run test:e2e`
- Frontend lint: `npm run lint`

## Hasznos tippek

- A swipe felületen a bal/jobb nyilakkal gyorsan lehet dönteni.
- Ha elfogytak a nevek, lépjetek át a "Közös kedvencek" fülre és kezdődhet a pontozás.
- A vezetéknév módosítása új szoba létrehozásával lehetséges.

## Jövőbeni fejlesztési ötletek

- E-mail alapú meghívók küldése közvetlenül az alkalmazásból.
- Több vezetéknév támogatása (pl. kettős családnév).
- Statisztikák exportálása PDF-be.

---

A projekt teljesen greenfield módon készült ebben a repositoryban. Jó babanévvadászatot! 👶🇭🇺
