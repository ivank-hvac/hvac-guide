FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

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
