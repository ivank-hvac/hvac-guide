# Деплой

Пошаговый деплой/откат с объяснениями. Голые команды без объяснений — в
[commands.md](commands.md); история изменений — в
[CHANGELOG.md](CHANGELOG.md).

Проект рассчитан на постепенное открытие доступа без переписывания кода:
сначала только команда (basic auth через Caddy), потом публично.

## Требования

- Docker + Docker Compose на целевой машине.
- Для прода (Фаза 1/2): домен с A-record, указывающим на IP этой машины,
  открытые порты 80/443 (Caddy сам получает Let's Encrypt сертификат).
- Git-хуки для версии сборки — см. "Версия сборки" ниже, включаются один
  раз на каждой машине.

## Локальная разработка / быстрый тест

Без Caddy, без TLS/auth, порт 8080:

```bash
cp .env.example .env
# заполнить ANTHROPIC_API_KEY
docker compose up -d --build
```

## Фаза 1 — доступ только команде (Caddy + basic auth)

```bash
cp .env.example .env
# заполнить ANTHROPIC_API_KEY, DOMAIN
# сгенерировать хэш пароля — ОБЯЗАТЕЛЬНО с `| sed` на конце, см. ниже:
docker run --rm caddy:2-alpine caddy hash-password --plaintext 'ВАШ_ПАРОЛЬ' | sed 's/\$/\$\$/g'
# вставить результат (уже с удвоенными $$) в CADDY_BASIC_AUTH_HASH в .env

# в Caddyfile раскомментировать блок basicauth { ... }

docker compose -f docker-compose.prod.yml up --build -d
```

**Важно про `$` в хэше:** bcrypt-хэш от `caddy hash-password` содержит
несколько `$` (`$2a$14$...`). Без экранирования (`| sed 's/\$/\$\$/g'`
выше) docker compose при подстановке `${CADDY_BASIC_AUTH_HASH}` съедает
всё после первого `$` в значении из `.env` — в контейнер попадает обрубок
вида `$2a$14` вместо полного хэша (~60 символов). Basic auth в этом
случае не примет НИКАКОЙ пароль, и логин будет выпадать снова и снова у
всех — именно так это и проявляется на практике (реальный инцидент, см.
CHANGELOG). Проверить, что реально долетело до контейнера:

```bash
docker exec hvac-guide-caddy printenv CADDY_BASIC_AUTH_HASH
```

Если там короткий обрубок, а не полная строка ~60 символов —
пересоздайте хэш через команду выше (с `| sed`), обновите `.env` и:

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate caddy
```

Caddy сам получит Let's Encrypt сертификат по `DOMAIN`. За basic auth в
это время сидит только твоя команда.

## Фаза 2 — открыть всем

1. В `Caddyfile` закомментировать блок `basicauth { ... }` обратно.
2. В `.env` ужесточить `AI_ASSIST_RATE_LIMIT` (например `3/minute`), если
   ожидается много трафика.
3. `docker compose -f docker-compose.prod.yml up -d --force-recreate caddy`
   — код приложения не трогается вообще.

## Обычное обновление (день за днём)

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Git-хук `post-merge` сам обновит `GIT_COMMIT`/`GIT_COMMIT_DATE` в `.env`
при `git pull` — при условии, что хуки включены на этой машине (см.
ниже). Без них ничего не сломается, просто версия в футере/label
покажет `unknown`.

## Версия сборки

Каждый образ помечен коммитом, из которого собран — можно проверить, что
реально задеплоено, без захода в браузер:

```bash
docker inspect --format='{{index .Config.Labels "org.opencontainers.image.revision"}}' hvac-guide
```

Тот же hash — в футере UI и в `GET /api/version`.

Чтобы это работало и `.env` не устаревал — **один раз на каждой машине**,
включая деплой-таргеты (это локальный git config, `git clone`/`git pull`
его не приносят):

```bash
git config core.hooksPath .githooks
```

`post-commit`/`post-checkout`/`post-merge` из `.githooks/` дальше сами
держат `GIT_COMMIT`/`GIT_COMMIT_DATE` в `.env` в актуальном состоянии.

## Откат на предыдущую версию

```bash
git log --oneline -10                 # найти нужный коммит/тег
git checkout <commit-hash>            # detached HEAD — это ожидаемо
docker compose -f docker-compose.prod.yml up -d --build
```

Хук `post-checkout` обновит `.env` под откаченный коммит автоматически
(если хуки включены). Когда закончили — вернуться на актуальный `main`:

```bash
git checkout main
```

Если проблема не в коде, а в конфигурации/данных — сначала попробуйте
целевой `--force-recreate` нужного сервиса (см. commands.md) вместо
полного отката коммита.

## Если что-то пошло не так

- Логи: `docker compose -f docker-compose.prod.yml logs -f [сервис]`
- Basic auth зацикливается на вводе пароля → см. предупреждение про `$`
  выше в Фазе 1.
- Задеплоили фикс, но в браузере всё ещё старое поведение → скорее всего
  кэш браузера, а не проблема деплоя (жёсткий рефреш Ctrl+Shift+R); футер
  UI/`docker inspect` покажет реальную задеплоенную версию для сверки.
- Полный перечень команд диагностики — commands.md.
