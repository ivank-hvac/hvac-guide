# Roadmap

Direction for the tool going forward — what's planned next, at the level of
user-facing features. No implementation details or internal working plans.

## Planned

- **Landing page, 3 modes**: PM (preventative maintenance) / Troubleshooting
  / Commissioning & Startup — separate graphs cross-linked with each other.
  Commissioning/Startup — mobile-first, structured measurement input
  (refrigerant charge, amp draw per phase, pressures before/after the valve),
  same as in current troubleshooting.
- **Deep-link procedure search** — clickable links to specific procedures
  (e.g. "RTU condenser fan replacement, Carrier 48TC"), not just a link to
  the manufacturer's whole portal.
- **Manufacturer submissions** — users add links to manufacturers, but with
  moderation (no auto-publish), domain/URL validation, rate limiting, and
  attribution to an authenticated user for tracking and reverting changes.

## Later (not in the near-term plan)

- **Psychrometrics** (air-side calculations: enthalpy, humidity, mixed air) —
  a separate future module, not mixed in with the current
  superheat/subcooling.
- **Multi-provider AI** — fallback if the primary AI provider fails, a
  user-facing assistant switcher.
