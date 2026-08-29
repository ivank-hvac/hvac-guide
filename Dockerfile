FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bitwarden Secrets Manager CLI — lets docker-compose wrap the start command
# with `bws run` to inject secrets as env vars at container start, instead
# of baking them into the image or passing them via compose `environment:`/
# .env (see docker-compose.bitwarden.yml, and SECRETS.md for the self-host
# path). Only used when that override is applied — installed unconditionally
# here so it doesn't matter which architecture the image happens to be built
# on (this step just picks the matching release archive at build time).
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

# Run as a dedicated unprivileged service user rather than root. uvicorn
# binds 8000, so no privileged port is needed and nothing here requires root
# at runtime. /app/data is created and owned here because that is where the
# named volume gets mounted — Docker seeds a NEW empty volume from the
# image's directory (content and ownership), so a fresh deployment just
# works. An EXISTING volume keeps whatever ownership it already had, which
# for deployments created before this change is root — see DEPLOY.md for the
# one-time chown that upgrade needs.
RUN groupadd --system --gid 10001 hvac \
    && useradd --system --uid 10001 --gid 10001 --no-create-home hvac \
    && mkdir -p /app/data \
    && chown -R hvac:hvac /app

COPY --chown=hvac:hvac app/ .

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

USER hvac

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
