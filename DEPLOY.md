# Deploy

Step-by-step deploy/rollback with explanations. Bare commands with no
explanations are in [commands.md](commands.md); change history is in
[CHANGELOG.md](CHANGELOG.md).

The project is built to run wide open, behind a shared team password, or
behind individual accounts — pick whichever access control fits, without
touching application code either way.

## Requirements

- Docker + Docker Compose on the target machine.
- For the Caddy-fronted shape (`docker-compose.prod.yml`): Caddy listens on
  `:80` and doesn't terminate TLS itself — an edge proxy further up the
  chain is assumed (e.g. an external Caddy on a separate host with a public
  IP, which gets the certificate and forwards traffic here, say over a
  WireGuard tunnel). If you terminate TLS directly on this machine, you'll
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

## Access control

Two independent, optional layers — use either, both, or neither. Neither is
required by the application itself; they exist for when the tool is
reachable from somewhere you don't fully trust yet.

### Option A — a shared team password (Caddy basic auth)

Simplest option: one password, no email setup, works the moment Caddy is
up. Good for "a handful of people I already trust, for now."

Basic auth is commented out in the Caddyfile by default — uncomment the
`basic_auth @not_public { ... }` block, then fill in `.env`:

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

Everyone behind it shares one password (TLS is the edge proxy's job further
up the chain, not this Caddy's — see "Requirements" above). To turn it back
off later: comment the `basic_auth { ... }` block out again and
`--force-recreate caddy`.

### Option B — invite-gate + passwordless login

Individual accounts instead of one shared password: a technician registers
through a personal invite link, then signs in with a one-time emailed
link (no password to manage or leak). Adds per-account session history,
an admin panel, and a per-account daily AI-usage quota — meaningfully more
setup than Option A, worth it once you actually want to know who's using
the tool rather than just keeping strangers out.

Entirely opt-in and independent of `docker-compose.prod.yml`/Caddy: the
app turns this on for itself the moment `RESEND_API_KEY` is set — leave it
blank and `/diagnose`/the graph API stay exactly as open as the plain
self-host path, no accounts, no invites, no code path even runs.

```bash
# .env — get a key from https://resend.com (free tier is plenty at low
# volume) and verify a sending domain there first
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Your Project <login@your-verified-domain.com>

docker compose -f docker-compose.prod.yml up -d --build
```

On first start with no accounts yet, the app mints a one-time bootstrap
invite and logs it:

```bash
docker compose -f docker-compose.prod.yml logs hvac-guide | grep "bootstrap invite"
# AUTH_ENABLED with no users yet — bootstrap invite created: visit
# /invite/<code> to register the first account, then grant it can_invite
# from /panel.
```

Register through that link. The very first account is automatically
granted admin (`/panel` access) — from there, grant yourself `can_invite`
(so you can generate invite links for everyone else via
`/manage-invites`) and `is_admin` to any other trusted account, both from
`/panel`'s "Invite-gate accounts" section. `GET /api/health` reports
`"auth_configured": true` once this is wired up correctly.

This project's own deployment ran Option A first (team-only, while the
tool was still rough) and switched to Option B for the public launch —
see CHANGELOG around 27 Aug 2026 for that specific cutover. Neither order
is required; pick whichever matches where you're at.

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
  Option A above.
- `/api/health` shows `"auth_configured": false` after setting
  `RESEND_API_KEY` → the container needs a rebuild/recreate to pick up a
  changed `.env` (`up -d --build`, not just editing the file); also double-
  check `RESEND_FROM_EMAIL`'s domain is actually verified in your Resend
  account, not just any address.
- Nobody can reach `/panel` → the very first registered account is admin
  automatically; if that account is unknown/lost, the only recovery path
  today is editing `users.is_admin` directly in `sessions.db`.
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
