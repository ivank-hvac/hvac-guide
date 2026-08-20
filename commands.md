# Cheat sheet: prod commands

All commands are run from the repo directory on the server (e.g.
`/opt/hvac-guide`). Details and explanations are in README.md — this is just
the commands.

## Update to the latest version (routine deploy)

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

The `post-merge` hook automatically refreshes `GIT_COMMIT`/`GIT_COMMIT_DATE`
in `.env` on `git pull` — provided git hooks are enabled on this machine
(see below, one-time).

## Initial setup (once, on a new machine)

```bash
git clone <repo-url> /opt/hvac-guide
cd /opt/hvac-guide
git config core.hooksPath .githooks   # enable git hooks (version in footer/label)
cp .env.example .env
# fill in ANTHROPIC_API_KEY, CADDY_BASIC_AUTH_USER/HASH (see below)
docker compose -f docker-compose.prod.yml up -d --build
```

## Start / stop / restart

```bash
# Start (or recreate after changing .env/Caddyfile, no code rebuild)
docker compose -f docker-compose.prod.yml up -d

# Full stop (containers removed, volumes kept)
docker compose -f docker-compose.prod.yml down

# Restart a single service with no rebuild (e.g. after editing .env)
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
docker compose -f docker-compose.prod.yml up -d --force-recreate hvac-guide

# Restart with an image rebuild (after git pull, see above)
docker compose -f docker-compose.prod.yml up -d --build
```

## Logs

```bash
docker compose -f docker-compose.prod.yml logs -f              # both services, live
docker compose -f docker-compose.prod.yml logs -f hvac-guide   # app only
docker compose -f docker-compose.prod.yml logs -f caddy        # Caddy only (incl. basic auth, TLS)
docker compose -f docker-compose.prod.yml logs --tail 100 hvac-guide
```

## Checking what's actually deployed

```bash
# Short commit hash of the image
docker inspect --format='{{index .Config.Labels "org.opencontainers.image.revision"}}' hvac-guide

# Same thing from the running process
docker exec hvac-guide printenv GIT_COMMIT

# Or just in the browser — small gray text at the bottom of the page (hash · date)
```

## Health check

`hvac-guide` in prod doesn't publish its port directly (only through Caddy),
so:

```bash
# From outside, through your public domain (terminated by the edge proxy
# further up the chain, not this Caddy — see DEPLOY.md "Requirements")
curl -s https://your-domain/api/health
curl -s https://your-domain/api/version

# Directly from inside the container (doesn't depend on the external edge
# proxy/TLS; curl may not be installed in the image — use python3 instead,
# it's always there)
docker exec hvac-guide python3 -c "import urllib.request as u; print(u.urlopen('http://localhost:8000/api/health').read().decode())"

docker ps   # both containers should be "Up"
```

## Basic auth (Phase 1: login/password on the whole site)

```bash
# Generate the password hash — MUST end with | sed (see README/Caddyfile
# about escaping $, otherwise docker compose truncates the hash and no one's
# password will be accepted)
docker run --rm caddy:2-alpine caddy hash-password --plaintext 'NEW_PASSWORD' | sed 's/\$/\$\$/g'
# paste the result into .env -> CADDY_BASIC_AUTH_HASH, then:
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy

# Confirm the full hash actually made it into the container (~60 chars, not a stub)
docker exec hvac-guide-caddy printenv CADDY_BASIC_AUTH_HASH

# Disable basic auth (Phase 2 — open to everyone):
# 1. Comment out the basic_auth { ... } block in Caddyfile
# 2. docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
```

## Settings (.env) with no code rebuild

```bash
nano .env   # or vim / any editor
# change whatever's needed (AI_ASSIST_RATE_LIMIT, LOG_SESSION_RATE_LIMIT, ANTHROPIC_MODEL...)
docker compose -f docker-compose.prod.yml up -d --force-recreate hvac-guide
```

## Checklist history (SQLite)

There's no `sqlite3` CLI in the image (`python:3.12-slim` doesn't include
it) — queries go through Python's `sqlite3` module, which is always there:

```bash
# Top final nodes by equipment type
docker exec hvac-guide python3 -c "
import sqlite3
con = sqlite3.connect('/app/data/sessions.db')
for row in con.execute('''
    SELECT equipment_type, final_node_id, COUNT(*) AS n
    FROM checklist_sessions GROUP BY equipment_type, final_node_id
    ORDER BY n DESC LIMIT 20
'''):
    print(row)
"

# Total record count / most recent one
docker exec hvac-guide python3 -c "
import sqlite3
con = sqlite3.connect('/app/data/sessions.db')
print(con.execute('SELECT COUNT(*), MAX(created_at) FROM checklist_sessions').fetchone())
"

# Back up the database (works regardless of whether it's a named volume or a bind mount)
docker cp hvac-guide:/app/data/sessions.db ./sessions-backup-$(date +%F).db
```

## Rolling back to a previous version

```bash
git log --oneline -10                 # find the commit you want
git checkout <commit-hash>            # ! detached HEAD, expected for a rollback
docker compose -f docker-compose.prod.yml up -d --build
# once you're done and everything's fine — go back to the current main:
git checkout main
```

## Full reinstall (e.g. a corrupted volume/image)

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
# ⚠️ only add -v to down if you actually need to wipe data (sessions.db) —
# this permanently deletes the checklist-history volume
```

## Useful

```bash
docker ps -a                          # all containers, including stopped ones
docker system df                      # how much space images/volumes are using
docker image prune -f                 # clean up unused old images (after builds)
git status && git log --oneline -5    # what's currently deployed / any local changes
```
