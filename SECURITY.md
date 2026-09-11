# Security policy

## Reporting a vulnerability

Please report security issues **privately**, not as a public issue.

Use GitHub's private vulnerability reporting on this repository
(Security → Report a vulnerability). That channel is visible only to the
maintainer and does not expose the report while it is being fixed.

Include what you need to make the problem reproducible: the endpoint or
page, the request, and what you observed versus what you expected. A rough
description is better than none — a report that only says "the AI endpoint
can be abused this way" is still useful.

This is a personal project maintained in spare time. Expect an
acknowledgement within a few days rather than within hours, and no bounty
programme.

Please don't run active tests against the production deployment
(`hvacdiagtree.com`) beyond passive observation — open a report first and
ask if you need a live target for anything more than that.

## Known limitations (accepted risk)

These are design trade-offs that have been deliberately accepted given the
project's current scale, not oversights — listed here so they don't need to
be independently rediscovered.

### Passwordless (magic-link) login and "Login CSRF"

Login works via a one-time link emailed to the account holder — no password
to leak or brute-force, but a link is a *bearer credential*: whoever opens
it can use it. This creates a known class of risk usually called
**Login CSRF**: an attacker requests a login link for their own account,
then tricks someone else into opening it (phishing), hoping the victim's
browser gets signed into the attacker's account rather than the victim's.

Mitigations in place:
- Each login link is bound to the browser that requested it via a same-site
  cookie. Opening the link from a *different* browser (including one it was
  forwarded to) does not sign in silently — it always requires an explicit
  confirmation step instead.
- That confirmation screen states exactly which account is about to be
  signed into, and shows a strong, visually distinct warning specifically
  when the browser wasn't the one that requested the link — as opposed to
  the milder, expected case of a legitimate second device.
- Only one active session per account at a time — signing in on a new
  device closes out any other open session for that account, so a takeover
  attempt doesn't go unnoticed indefinitely.

What this doesn't fully solve: a warning screen with an explicit
click-through is the standard, industry-accepted mitigation for this class
of issue, not a complete technical fix — a user who isn't paying attention
can still click through a forwarded/phished link. Eliminating this class of
risk outright would mean a different authentication model entirely (e.g.
OAuth/passkeys, or a mandatory second factor), which isn't implemented
today. Given no financial or otherwise sensitive personal data is stored
beyond a technician's own diagnostic session history, the practical
severity of the residual risk is considered low.

### AI-assist abuse protections

The AI-assist endpoint is rate-limited per IP, capped by a per-account and
an app-wide daily quota, and bans an IP outright after a detected abuse
pattern. These are reasonable-cost deterrents sized for the project's
current scale, not a guarantee against a sufficiently patient, distributed
abuser — see the `AI_ASSIST_RATE_LIMIT` / `AI_DAILY_LIMIT_*` settings in
`.env.example` for the current numbers.

## Scope

The parts most worth looking at:

- `/api/ai-assist` — takes technician-supplied text and passes it to a model.
  The system prompt frames user content as untrusted data, but prompt
  injection is an open problem; a bypass that makes the assistant ignore its
  safety framing is in scope.
- The session endpoints (`/api/session`, `/api/log-session`) — they accept
  and store checklist state, keyed by a client-generated session id.
- The auth endpoints (`/login/*`, `/api/session-takeover`,
  `/session-conflict`) — magic-link consumption and the account-takeover
  confirmation flow, see "Login CSRF" above.
- `/panel` — a hidden statistics page gated by a shared token. Anything that
  reveals its existence or contents without the token is in scope.
- The deployment files (`Caddyfile`, `docker-compose*.yml`) — misconfigurations
  that would expose the app without the intended TLS or authentication.

## Out of scope

- The AI giving diagnostically wrong or incomplete advice. That is a
  correctness problem, and a valuable one — please open a normal issue for
  it. The tool is explicitly not a substitute for a qualified technician's
  judgement (see the disclaimer in the README).
- Anything requiring access to the author's own infrastructure, which is not
  part of this repository.

## What this project does with data

Self-hosted by design: a deployment stores checklist sessions in its own
SQLite database and sends nothing anywhere except to the configured AI
provider, when the technician explicitly asks for AI help. There is no
telemetry back to the author.
