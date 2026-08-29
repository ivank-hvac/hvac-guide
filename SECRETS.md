# Moving secrets to Bitwarden Secrets Manager (free tier)

The documented way to run this project is the plain one: a `.env` file with
`ANTHROPIC_API_KEY` in it, exactly as in the README's Quick start. That path
is not deprecated and this document does not replace it.

What follows is the optional setup used on this project's own deployments,
where the API key is never written to disk at all: it is fetched from
[Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/)
at container start and injected only into the application process. It is
worth the extra moving parts if you run more than one environment, if
several people (or machines) touch the same deployment, or if you would
rather rotate a key in one place than hunt for copies of it.

Everything here works on the **free tier**, which allows up to 3 projects
and a small number of machine accounts — enough for a dev and a prod
environment. Where the free tier forces a compromise, it says so.

---

## The model in one paragraph

A **project** holds secrets. A **machine account** is a non-human identity
that can read one or more projects, and it authenticates with an **access
token**. On the host, the only thing stored on disk is that access token;
the actual secrets live in Bitwarden and are pulled at runtime by `bws run`,
which injects them as environment variables into the process it spawns —
and nothing else.

The one structural limit worth knowing before you start: **access is granted
per project, not per secret.** An account that can read a project reads all
of it. That single fact drives most of the layout decisions below.

---

## 1. Install the CLI

`bws` is a Rust binary from the Bitwarden SDK, not an npm package. Download
the release for your architecture from
<https://github.com/bitwarden/sdk-sm/releases> and put it on `PATH`:

```bash
# adjust version/arch to taste
curl -sSLO https://github.com/bitwarden/sdk-sm/releases/download/bws-v2.1.0/bws-x86_64-unknown-linux-gnu-2.1.0.zip
unzip bws-*.zip
sudo install -m 755 bws /usr/local/bin/bws
bws --version
```

## 2. Create one project per environment

In the Bitwarden web vault, under Secrets Manager, create a project per
environment rather than a single shared one:

```
hvac-guide-dev      # the dev/test machine
hvac-guide-prod     # production
```

Then create a **machine account for each project**, and grant each one
access only to its own. Two accounts instead of one is the whole point: a
leaked dev token must not open production. Copy each account's access token
once — the vault will not show it again.

> **Free-tier caveat.** With a 3-project cap you will be tempted to put
> unrelated things in one project to save slots. Resist it where identities
> differ: since access is per project, everything sharing a project shares
> visibility. If you genuinely run out of slots, that is the signal to move
> to a paid tier rather than to merge projects.

## 3. Name the secrets after the environment variables

`bws run` exports each secret using its **key** as the variable name. A
secret named `hvac-guide-prod` produces `$hvac-guide-prod`, which the
application will never look at. Name it exactly:

```
ANTHROPIC_API_KEY
```

This sounds obvious and is the single most common way to lose an afternoon:
the container starts fine, `/api/health` reports `ai_configured: false`, and
nothing in the logs points at the name. Create it with:

```bash
bws secret create ANTHROPIC_API_KEY "sk-ant-..." <PROJECT_ID>
```

## 4. Store the access token on the host

Put the token in `~/.bws_token` with mode `600`, and note the `export` —
without it the variable exists in your shell but is never inherited by the
processes that need it:

```bash
printf 'export BWS_ACCESS_TOKEN="%s"\n' '<token>' > ~/.bws_token
chmod 600 ~/.bws_token
echo '[ -f ~/.bws_token ] && source ~/.bws_token' >> ~/.bashrc
```

The token is itself a secret: never commit it, never bake it into an image,
and keep it out of the `.env` file — the whole point is that `.env` no
longer holds anything sensitive.

## 5. Point the deployment at the project

The repository ships an optional override file,
[`docker-compose.bitwarden.yml`](docker-compose.bitwarden.yml), which
replaces the container's start command with `bws run … -- uvicorn …` and
passes through only `BWS_ACCESS_TOKEN`. The base `docker-compose.yml` is
untouched, so the plain `.env` path in the README keeps working for anyone
who does not want any of this.

Put the project id in `.env` (it is an identifier, not a secret) and leave
`ANTHROPIC_API_KEY` out of that file entirely:

```dotenv
BWS_PROJECT_ID=<project id for THIS host>
```

Then start with both files:

```bash
source ~/.bws_token
docker compose -f docker-compose.yml -f docker-compose.bitwarden.yml up -d --build
```

For a production deployment behind Caddy, combine the override with
`docker-compose.prod.yml` instead of the base file:

```bash
source ~/.bws_token
docker compose -f docker-compose.prod.yml -f docker-compose.bitwarden.yml up -d --build
```

Getting that combination wrong is not cosmetic: the base compose file
publishes the app on a host port for local development, so using it in
production exposes the application directly and bypasses Caddy's TLS and
basic auth.

If you run compose through `sudo`, use `sudo -E`. Plain `sudo` scrubs the
environment, `BWS_ACCESS_TOKEN` never reaches compose, and the container
starts with an empty token.

## 6. Verify — and know what a healthy deploy looks like

```bash
curl -s localhost:8080/api/health     # -> {"status":"ok","ai_configured":true}
```

Then make one real request to `/api/ai-assist`. `ai_configured` only proves
a non-empty string reached the process; it cannot tell a valid key from a
revoked one.

**Do not verify with `docker exec <container> env | grep ANTHROPIC_API_KEY`.**
It prints nothing on a perfectly healthy deployment, because `bws run`
injects secrets into the process it spawns — not into the container's global
environment — and `docker exec` starts a *new* process that never inherited
them. Check `/proc/<uvicorn-pid>/environ` inside the container if you want
to see it directly.

---

## Rotating a key

This is where the setup pays for itself. No file edits, no image rebuild:

```bash
bws secret edit <secret-id> --value "sk-ant-...new..."
docker compose -f docker-compose.prod.yml -f docker-compose.bitwarden.yml \
  up -d --force-recreate
```

`bws run` fetches the new value at start. Verify with a live request, then
revoke the old key at the provider.

## Requirements and failure modes

- **The host needs outbound internet at container start.** `bws run` calls
  the Bitwarden API on every start and restart. If that call fails, the
  container starts without the secret. On an isolated network, resolve
  secrets once at deploy time instead of at every start.
- **The token is a single point of failure.** Losing it means no deploys
  until a new machine account is issued; leaking it means everything in the
  projects it can read is compromised. Treat it like an SSH private key.
- **Secret names are a contract.** Renaming a secret in the vault silently
  changes the environment variable the application sees.
