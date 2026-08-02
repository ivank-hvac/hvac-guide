# Шпаргалка: команды на проде

Все команды — из директории репозитория на сервере (например `/opt/hvac-guide`).
Подробности и объяснения — в README.md, здесь только сами команды.

## Обновление до последней версии (обычный деплой)

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Хук `post-merge` сам обновит `GIT_COMMIT`/`GIT_COMMIT_DATE` в `.env` при
`git pull` — при условии, что git-хуки включены на этой машине (см. ниже,
разово).

## Первоначальная настройка (один раз на новой машине)

```bash
git clone <repo-url> /opt/hvac-guide
cd /opt/hvac-guide
git config core.hooksPath .githooks   # включить git-хуки (версия в футере/label)
cp .env.example .env
# заполнить ANTHROPIC_API_KEY, DOMAIN, CADDY_BASIC_AUTH_USER/HASH (см. ниже)
docker compose -f docker-compose.prod.yml up -d --build
```

## Старт / стоп / рестарт

```bash
# Старт (или пересоздание после изменения .env/Caddyfile без пересборки кода)
docker compose -f docker-compose.prod.yml up -d

# Полная остановка (контейнеры удаляются, volumes остаются)
docker compose -f docker-compose.prod.yml down

# Рестарт одного сервиса без пересборки (например после правки .env)
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
docker compose -f docker-compose.prod.yml up -d --force-recreate hvac-guide

# Рестарт с пересборкой образа (после git pull, см. выше)
docker compose -f docker-compose.prod.yml up -d --build
```

## Логи

```bash
docker compose -f docker-compose.prod.yml logs -f              # оба сервиса, live
docker compose -f docker-compose.prod.yml logs -f hvac-guide   # только приложение
docker compose -f docker-compose.prod.yml logs -f caddy        # только Caddy (в т.ч. basic auth, TLS)
docker compose -f docker-compose.prod.yml logs --tail 100 hvac-guide
```

## Проверка, что реально задеплоено

```bash
# Короткий commit hash образа
docker inspect --format='{{index .Config.Labels "org.opencontainers.image.revision"}}' hvac-guide

# То же самое из работающего процесса
docker exec hvac-guide printenv GIT_COMMIT

# Или просто в браузере — мелкая серая строка внизу страницы (hash · дата)
```

## Проверка здоровья

`hvac-guide` в проде не публикует порт напрямую (только через Caddy), поэтому:

```bash
# Снаружи, через Caddy — подставь реальный DOMAIN из .env
curl -s https://ваш-домен/api/health
curl -s https://ваш-домен/api/version

# Изнутри контейнера напрямую (не зависит от Caddy/TLS/DOMAIN,
# curl в образе может быть не установлен — используем python3, он есть всегда)
docker exec hvac-guide python3 -c "import urllib.request as u; print(u.urlopen('http://localhost:8000/api/health').read().decode())"

docker ps   # оба контейнера должны быть "Up"
```

## Basic auth (Фаза 1: логин/пароль на весь сайт)

```bash
# Сгенерировать хэш пароля — ОБЯЗАТЕЛЬНО с | sed на конце (см. README/Caddyfile
# про экранирование $, иначе docker compose обрубает хэш и пароль не примет НИКТО)
docker run --rm caddy:2-alpine caddy hash-password --plaintext 'НОВЫЙ_ПАРОЛЬ' | sed 's/\$/\$\$/g'
# результат вставить в .env -> CADDY_BASIC_AUTH_HASH, затем:
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy

# Проверить, что хэш реально долетел до контейнера целиком (~60 символов, не обрубок)
docker exec hvac-guide-caddy printenv CADDY_BASIC_AUTH_HASH

# Отключить basic auth (Фаза 2 — открыть всем):
# 1. Закомментировать блок basicauth { ... } в Caddyfile
# 2. docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
```

## Настройки (.env) без пересборки кода

```bash
nano .env   # или vim / любой редактор
# поменять что нужно (AI_ASSIST_RATE_LIMIT, LOG_SESSION_RATE_LIMIT, ANTHROPIC_MODEL...)
docker compose -f docker-compose.prod.yml up -d --force-recreate hvac-guide
```

## История чек-листов (SQLite)

В образе нет `sqlite3` CLI (`python:3.12-slim` его не включает) — запросы
через Python-модуль `sqlite3`, он есть всегда:

```bash
# Топ финальных узлов по типу оборудования
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

# Сколько всего записей / когда последняя
docker exec hvac-guide python3 -c "
import sqlite3
con = sqlite3.connect('/app/data/sessions.db')
print(con.execute('SELECT COUNT(*), MAX(created_at) FROM checklist_sessions').fetchone())
"

# Бэкап базы (работает независимо от того, named volume это или bind mount)
docker cp hvac-guide:/app/data/sessions.db ./sessions-backup-$(date +%F).db
```

## Откат на предыдущую версию

```bash
git log --oneline -10                 # найти нужный коммит
git checkout <commit-hash>            # ! detached HEAD, это ожидаемо для отката
docker compose -f docker-compose.prod.yml up -d --build
# когда закончили и всё ок — вернуться на актуальный main:
git checkout main
```

## Полная переустановка (например, испорченный volume/образ)

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
# ⚠️ добавить -v к down только если реально нужно стереть данные (sessions.db) —
# это удалит volume с историей чек-листов безвозвратно
```

## Полезное

```bash
docker ps -a                          # все контейнеры, включая остановленные
docker system df                      # сколько места занимают образы/volumes
docker image prune -f                 # почистить неиспользуемые старые образы (после билдов)
git status && git log --oneline -5    # что сейчас задеплоено / есть ли локальные правки
```
