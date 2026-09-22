# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Bubblegum is a single shared Express/MongoDB backend that serves multiple independent front-end "products" (Photos, Fusion, Fireboard, Notebase/Flash, Liquid/Circle, Storeq, etc.). Requests identify which product they're calling from via the `external-source` header; the full product registry (ids, visibility, URLs) lives in [PRODUCTS.json](PRODUCTS.json) and is loaded by [server/utils/products.js](server/utils/products.js).

## Commands

```bash
npm start          # run the server (node server/index.js)
npm run serve       # run with nodemon (auto-reload) — normal dev loop
npm run lint         # eslint
npm run lint:err      # eslint, errors only
npm run format        # prettier --write .
npm run check-deps     # list outdated deps (semver target)
npm run update-deps     # upgrade deps to semver target + npm install
```

There is no test suite/script in this repo currently.

The server needs `DB_URL`/`STAGING_DB_URL` (MongoDB) and reads config from a `.env` file (see [server/config.js](server/config.js) for the full list of env vars: JWT, CLOUDINARY_API_SECRET, GOOGLE_CLIENT_ID/SECRET, SENDGRID_API_KEY, NOTION_AUTH_KEY, MIXPANEL_TOKEN, REDIS_DB_PASSWORD, COLOR_LOGS). Without `NODE_ENV` set it defaults to `staging`; `NODE_ENV=production` or `express-lambda-production` are treated as production (`config.IS_PROD`).

## Architecture

### Routing layout

- `server/index.js` is the entrypoint: connects to Mongo and Redis, wires global middleware, then mounts `server/auth/v1/auth.routes.js` at `/api/auth` and `server/api/v1/index.js` at `/api`.
- Routes are versioned by directory (`server/auth/v1`, `server/api/v1`). Per the [CHANGELOG](CHANGELOG.md), existing endpoints stay on `v1`; any new product/endpoint should be added under a new `v2` folder rather than modified in place, so `v1` behavior stays stable for existing clients.
- Each feature area under `server/api/v1/<feature>/` follows a consistent trio: `*.routes.js` (Router + `protectedRoute` where auth is required), `*.controller.js` (handlers), `*.model.js` (Mongoose schema). Some areas nest further (e.g. `liquid/` contains `circle/`, `links/`, `photos/`, `alerts/` as sub-products under the Liquid umbrella).

### Auth

- JWT-based, via [server/utils/authentication.js](server/utils/authentication.js). `protectedRoute` = `[decodeToken, extractUser]`: `decodeToken` verifies the JWT (using `express-jwt`) into `req.user`, then `extractUser` loads the real user document from Mongo and re-populates `req.user`/`req.userId`/`req.status`/`req.verified` — route handlers should rely on the post-`extractUser` shape, not the raw decoded token.
- `transparent` is a soft variant: attaches user info if a token is present but doesn't reject the request if not.
- Global middleware ([server/middleware.js](server/middleware.js)) always runs `appendSourceInfo`, which sets `req.source` (from the `external-source` header) and `req.validSource` (whether it's a known product id) ahead of any auth check.

### Dynamic/generic CRUD routes

[server/api/v1/dynamic-routes/](server/api/v1/dynamic-routes/) is a factory (`dynamicRoutes({ Model, _customMiddleware })`) that generates standard REST CRUD (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`) plus a `POST /operations` batch-style endpoint, scoped to `req.userId` and filtered by a default `{ deleted: false, visible: true }` query. It's used to back both `/tags` and `/modules` (see [server/api/v1/index.js](server/api/v1/index.js)) rather than writing bespoke CRUD controllers for those models. `_customMiddleware` (e.g. [server/modules/tags/tags.middleware.js](server/modules/tags/tags.middleware.js)) lets a consumer transform the create payload before it's persisted. When adding a new simple CRUD resource, prefer wiring it through `dynamicRoutes` over hand-rolling a controller.

### Source-specific behavior

`server/utils/common.js`'s `getAppBasedInfo({ user, source })` and `products.js`'s `getKeysBasedOnSource(source)` centralize per-product branching (e.g. attaching `fireboardProjects` for Fireboard, or `notebase` collections/tags for Notebase/Flash) that gets merged into the user payload on login/session calls. New per-product user data should be added here rather than scattered across controllers.

### Data conventions

- Soft delete: documents used with `dynamicRoutes` carry `deleted`/`visible` flags instead of being removed; queries must include `deleted: false` (see `defaultQuery` in `dynamic-routes.controller.js`).
- Most user-owned documents are scoped by `userId` and `source`.
- `server/utils/common.js` has the shared id/slug helpers (`processId` for safe `ObjectId` casting, `generateSlug`/`generateSlugV2`) — use these instead of ad hoc slug/id logic.
- Cross-cutting collections that used to live inside per-project models were pulled out into shared collections: `server/modules/tags/` (tags across all products) and `server/modules/modules/` (e.g. Notebase collections), plus `server/models/` (`email`, `session`, `transaction`) for cross-cutting concerns.

### Cross-cutting infra

- `server/db.js` / `server/redis.js` — Mongo (Mongoose) and Redis connections, both awaited at startup in `index.js`; Redis is optional (falls back to a no-op with warnings if `REDIS_CONFIG`/connection is unavailable — see `addToRedis`/`getFromRedis`).
- `server/instrument.js` — Sentry init, imported first in `index.js` for early instrumentation; `Sentry.setupExpressErrorHandler` is only attached when `config.IS_PROD`.
- `server/middleware.js` — also tracks Mixpanel `api_request` events and Sentry API latency per request when `MIXPANEL_TOKEN` is configured.
- `server/utils/logger.js` — use `logger.log/info/error/system/fatal` instead of raw `console.*`; output is colorized when `COLOR_LOGS` is set.
- Errors bubble to a catch-all handler in `index.js`: `UnauthorizedError` (bad/missing JWT) → 401 `INVALID_JWT_TOKEN`, everything else → 500 with the error message.
