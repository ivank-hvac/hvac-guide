# Deploy

Step-by-step deploy/rollback with explanations. Bare commands with no
explanations are in [commands.md](commands.md); change history is in
[CHANGELOG.md](CHANGELOG.md).

The project is built for gradually opening up access without rewriting code:
team-only first (basic auth via Caddy), then public.

## Requirements

- Docker + Docker Compose on the target machine.
- For prod (Phase 1/2): the Caddy in this repo (`docker-compose.prod.yml`)
  listens on `:80` and doesn't terminate TLS itself — an edge proxy further
  up the chain is assumed (e.g. an external Caddy on a separate host with a
  public IP, which gets the certificate and forwards traffic here, say over
  a WireGuard tunnel). If you terminate TLS directly on this machine, you'll
  need to reconfigure Caddy separately for a real domain and port 443 — the
  config below isn't built for that.
- Git hooks for the build version — see "Build version" below, enabled once
  per machine.

## Local development / quick test

No Caddy, no TLS/auth, port 8080:

```bash
cp .env.example .env
# fill in ANTHROPIC_API_KEY
docker compose up -d --build
```

## Phase 1 — team-only access (Caddy + basic auth)

Basic auth is enabled in the Caddyfile by default — nothing in the file
itself needs touching, just fill in `.env`:

```bash
cp .env.example .env
# fill in ANTHROPIC_API_KEY
# generate the password hash — MUST end with `| sed`, see below:
docker run --rm caddy:2-alpine caddy hash-password --plaintext 'YOUR_PASSWORD' | sed 's/\$/\$\$/g'
# paste the result (with the doubled $$) into CADDY_BASIC_AUTH_HASH in .env

docker compose -f docker-compose.prod.yml up --build -d
```

**Important about `$` in the hash:** a bcrypt hash from `caddy hash-password`
contains several `$` (`$2a$14$...`). Without escaping (`| sed
's/\$/\$\$/g'` above), docker compose swallows everything after the first
`$` in the value from `.env` when substituting `${CADDY_BASIC_AUTH_HASH}` —
the container ends up with a stub like `$2a$14` instead of the full ~60
character hash. In that case basic auth won't accept ANY password, and the
login prompt will keep reappearing for everyone — that's exactly how it
shows up in practice (a real incident, see CHANGELOG). Check what actually
made it into the container:

```bash
docker exec hvac-guide-caddy printenv CADDY_BASIC_AUTH_HASH
```

If it's a short stub rather than the full ~60-character string, regenerate
the hash with the command above (with `| sed`), update `.env`, and:

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
```

Only your team sits behind basic auth in the meantime (TLS is the edge
proxy's job further up the chain, not this Caddy's — see "Requirements"
above).

## Phase 2 — open to everyone

1. In `Caddyfile`, comment the `basicauth { ... }` block back out.
2. In `.env`, tighten `AI_ASSIST_RATE_LIMIT` (e.g. `3/minute`) if you expect
   a lot of traffic.
3. `docker compose -f docker-compose.prod.yml up -d --force-recreate caddy`
   — the application code isn't touched at all.

## Routine updates (day to day)

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

The `post-merge` git hook automatically refreshes
`GIT_COMMIT`/`GIT_COMMIT_DATE` in `.env` on `git pull` — provided the hooks
are enabled on this machine (see below). Without them nothing breaks, the
version in the footer/label will just show `unknown`.

## Upgrading past the non-root container change (one time)

The image runs as the unprivileged user `hvac` (uid 10001) rather than root.
A brand-new deployment needs nothing extra — Docker seeds an empty named
volume from the image directory, ownership included.

A deployment that already has a `hvac_data` volume from before this change
does need one step. The existing volume is still owned by root, the new
non-root process cannot write to it, and the container will fail to open the
sessions database:

```bash
docker compose -f docker-compose.prod.yml down
docker run --rm -v hvac-guide_hvac_data:/data alpine chown -R 10001:10001 /data
docker compose -f docker-compose.prod.yml -f docker-compose.bitwarden.yml up -d --build
```

Check the volume name first with `docker volume ls` — compose prefixes it
with the project directory name, so it is usually `hvac-guide_hvac_data`.

Verify afterwards that the process is no longer root:

```bash
docker exec hvac-guide id     # uid=10001(hvac)
```

## Build version

Every image is tagged with the commit it was built from — you can check
what's actually deployed without opening a browser:

```bash
docker inspect --format='{{index .Config.Labels "org.opencontainers.image.revision"}}' hvac-guide
```

The same hash shows up in the UI footer and in `GET /api/version`.

For this to work and for `.env` to stay current — **once per machine**,
including deploy targets (this is local git config, `git clone`/`git pull`
don't bring it along):

```bash
git config core.hooksPath .githooks
```

`post-commit`/`post-checkout`/`post-merge` in `.githooks/` then keep
`GIT_COMMIT`/`GIT_COMMIT_DATE` in `.env` up to date on their own.

## Rolling back to a previous version

```bash
git log --oneline -10                 # find the commit/tag you want
git checkout <commit-hash>            # detached HEAD - expected
docker compose -f docker-compose.prod.yml up -d --build
```

The `post-checkout` hook updates `.env` for the checked-out commit
automatically (if hooks are enabled). When you're done, go back to the
current `main`:

```bash
git checkout main
```

If the problem is in config/data rather than code, try a targeted
`--force-recreate` of the relevant service first (see commands.md) before a
full commit rollback.

## If something's wrong

- Logs: `docker compose -f docker-compose.prod.yml logs -f [service]`
- Basic auth loops on the password prompt → see the `$`-escaping warning in
  Phase 1 above.
- `ERR_TOO_MANY_REDIRECTS` in the browser → a real incident (see CHANGELOG):
  if the site is addressed in the Caddyfile by a domain name (not `:80`),
  Caddy triggers automatic HTTPS and redirects the already-decrypted HTTP
  (from the edge proxy further up the chain) back to https — the redirect
  comes back through the edge proxy as HTTP again, in a loop. The current
  Caddyfile is addressed `:80` specifically for this reason — don't switch
  it to a domain name without `auto_https off`.
- Deployed a fix, but the browser still shows the old behavior → most likely
  browser cache, not a deploy problem (hard refresh Ctrl+Shift+R); the UI
  footer / `docker inspect` will show the actually-deployed version so you
  can compare.
- Full diagnostic command list — commands.md.
