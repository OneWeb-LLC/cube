# Cube — OWeb satellite

Semantic-layer analytics for the OWeb constellation. Cube is deployed as its own Vercel app, shares OneID / Supabase Auth with OWeb, and explores workspace data through a Cube-compatible query API.

## Satellite contract

Follows [`SATELLITE_ONBOARDING_KIT.md`](https://github.com/SalesflowOne/OWeb/blob/main/docs/SATELLITE_ONBOARDING_KIT.md):

1. Shared Auth at One OS (`ao-supabase-auth` session key)
2. Namespaced projection table `cube_profiles`
3. Continue with OWeb + `/sso?launch_token=` redeem
4. App Store `app_id = cube`
5. OneID activation via `ao_upsert_app_activation`

## Local

```bash
cd apps/oweb-satellite
cp .env.example .env
npm install
npm run dev
```

Dev server: `http://localhost:3000`

## Deploy

Vercel project `cube` on team `oweb`, root directory `apps/oweb-satellite`. Borrow Supabase + OWeb URL env vars from the `oweb` / `inbox` projects.
