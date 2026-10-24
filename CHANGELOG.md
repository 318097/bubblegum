# Changelog

All notable changes to this project are documented in this file.

## 2026-10-22

- v1 and v2 are now served by the same deployment: v2 at `/api/v2` and `/api/v2/auth`, v1 unchanged at `/api` and `/api/auth`. The `SOURCE` env var is gone.
- v2 models (`server/api/v2/**`) live in the `circle` database; every other model stays in `bubblegum`. Both share one connection pool.
- Sessions use the same schema in both databases: v1 logins are stored in `bubblegum`, v2 logins in `circle`.
- Redis is optional at startup: if it can't connect, the server runs without cache instead of crashing.
- The former Liquid routes (`/api/liquid/*`, including short links `/api/liquid/sh/:path`) are now only at `/api/v2/*` and read from the `circle` database.
- v2 tokens are signed with the `v2` audience; v2 routes reject tokens without it (e.g. v1 tokens).

## 2026-09-22

- Moved all existing routes into a `v1` folder. Existing endpoints remain unchanged and accessible at `/auth` and `/api`. Starting today, new products will be built under `/auth/v2` and `/api/v2`.
- Added `CLAUDE.md` documenting project commands and architecture for Claude Code.
