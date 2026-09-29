FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Same posture as the main app's Dockerfile: unprivileged user, no state,
# nothing here needs root. Deliberately no Bitwarden CLI, no data volume,
# no API keys — this app has none of that to begin with (see main.py).
RUN groupadd --system --gid 10002 hvacdemo \
    && useradd --system --uid 10002 --gid 10002 --no-create-home hvacdemo

COPY --chown=hvacdemo:hvacdemo main.py .

EXPOSE 8000

USER hvacdemo

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
