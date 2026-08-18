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

## Scope

The parts most worth looking at:

- `/api/ai-assist` — takes technician-supplied text and passes it to a model.
  The system prompt frames user content as untrusted data, but prompt
  injection is an open problem; a bypass that makes the assistant ignore its
  safety framing is in scope.
- The session endpoints (`/api/session`, `/api/log-session`) — they accept
  and store checklist state, keyed by a client-generated session id.
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
