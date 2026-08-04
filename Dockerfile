FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bitwarden Secrets Manager CLI — lets docker-compose wrap the start command
# with `bws run` to inject secrets as env vars at container start, instead
# of baking them into the image or passing them via compose `environment:`/
# .env (see CLAUDE.md "Секреты: переход на Bitwarden Secrets Manager").
# Only ANTHROPIC_API_KEY has migrated so far (docker-compose.yml, dev/test)
# — docker-compose.prod.yml is unchanged for now and never invokes `bws`,
# so this addition has no effect there yet. Picks the right release archive
# for whichever architecture the image is actually built on (aarch64 on
# pinas01, x86_64 wherever prod builds).
ARG BWS_VERSION=2.1.0
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl unzip; \
    arch="$(uname -m)"; \
    case "$arch" in \
      x86_64) bwsArch=x86_64 ;; \
      aarch64) bwsArch=aarch64 ;; \
      *) echo "unsupported arch for bws: $arch" >&2; exit 1 ;; \
    esac; \
    curl -fsSL -o /tmp/bws.zip \
      "https://github.com/bitwarden/sdk-sm/releases/download/bws-v${BWS_VERSION}/bws-${bwsArch}-unknown-linux-gnu-${BWS_VERSION}.zip"; \
    unzip -q /tmp/bws.zip -d /usr/local/bin; \
    chmod +x /usr/local/bin/bws; \
    rm /tmp/bws.zip; \
    apt-get purge -y --auto-remove curl unzip; \
    rm -rf /var/lib/apt/lists/*

COPY app/ .

# Populated by docker-compose's build.args (see docker-compose*.yml), which
# in turn read GIT_COMMIT/GIT_COMMIT_DATE from .env — kept fresh by the
# post-commit/post-checkout git hooks in .githooks/ (see README "Версия
# сборки"). Falls back to "unknown" for a manual `docker build` with no
# build-arg passed, rather than failing.
ARG GIT_COMMIT=unknown
ARG GIT_COMMIT_DATE=unknown
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
ENV GIT_COMMIT=${GIT_COMMIT} \
    GIT_COMMIT_DATE=${GIT_COMMIT_DATE}

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
