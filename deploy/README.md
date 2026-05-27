# Развёртывание CyberSec Lab Trainer

Проект можно запустить на любой платформе: от бесплатных облачных сервисов до собственного сервера.

## Сравнение платформ

| Платформа | Сложность | Бесплатно | Домен | SSL | База данных |
|-----------|-----------|-----------|-------|-----|-------------|
| **Vercel** | ★☆☆ | Да | `*.vercel.app` | Авто | PostgreSQL (Neon/SUPabase) |
| **Railway** | ★☆☆ | Да (квоты) | `*.railway.app` | Авто | Встроенный PostgreSQL |
| **Render** | ★★☆ | Да (медленно) | `*.onrender.com` | Авто | Встроенный PostgreSQL |
| **Fly.io** | ★★☆ | Да (квоты) | `*.fly.dev` | Авто | Встроенный PostgreSQL |
| **Docker/VPS** | ★★★ | Нет | Свой | Certbot | Любая |
| **Yandex Cloud** | ★★★ | Нет | Свой | Авто | Managed PostgreSQL |

---

## 1. Vercel (рекомендовано)

Быстрейший способ: Vercel сам определяет Next.js-проект.

### Вручную через CLI

```bash
# Установить CLI
npm i -g vercel

# Войти в аккаунт
vercel login

# Деплой (из корня проекта)
vercel --prod
```

Vercel спросит:
- **Framework**: Next.js (определит сам)
- **Root directory**: `.` (enter)
- **Build command**: оставить `bun run build`
- **Output directory**: оставить `.next`

### Через GitHub (автоматически)

1. Зайдите на [vercel.com/new](https://vercel.com/new)
2. Импортируйте репозиторий `QuadDarv1ne/cybersec-lab-trainer`
3. Vercel сам определит настройки Next.js
4. Добавьте переменные окружения (см. ниже)
5. Нажмите **Deploy** — при каждом пуше в `main` деплой происходит автоматически

### Переменные окружения для Vercel

| Переменная | Где взять |
|------------|-----------|
| `DATABASE_URL` | Neon ([neon.tech](https://neon.tech)) — бесплатный PostgreSQL |
| `NEXTAUTH_URL` | `https://<ваш-проект>.vercel.app` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Там же |
| `GITHUB_ID` | [github.com/settings/developers](https://github.com/settings/developers) |
| `GITHUB_SECRET` | Там же |

---

## 2. Railway

Платформа с интегрированной базой данных.

1. Зайдите на [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Выберите репозиторий
3. Railway сам найдёт `railway.json` и настроит деплой
4. Добавьте базу данных: **New** → **Database** → **PostgreSQL**
5. Переменная `DATABASE_URL` подставится автоматически
6. Добавьте `NEXTAUTH_SECRET` и `NEXTAUTH_URL`
7. Домен: `https://<project>.railway.app`

---

## 3. Render

PaaS с бесплатным тарифом (холодный старт ~30с).

1. Зайдите на [render.com](https://render.com) → **New Web Service**
2. Подключите GitHub-репозиторий
3. Render сам найдёт `render.yaml` и настроит:
   - **Environment**: Docker
   - **Plan**: Free
4. Он же создаст бесплатную PostgreSQL-базу
5. Домен: `https://cybersec-lab-trainer.onrender.com`
6. SSL автоматический

---

## 4. Fly.io

Глобальный edge-деплой с бесплатным тарифом.

```bash
# Установить flyctl
flyctl auth signup  # или flyctl auth login

# Развернуть с конфигом из deploy/
flyctl launch --config deploy/fly.toml --copy-config --remote-only

# Создать базу данных PostgreSQL
flyctl postgres create --name cybersec-db

# Привязать к приложению
flyctl postgres attach cybersec-db

# Установить секреты
flyctl secrets set NEXTAUTH_SECRET=$(openssl rand -base64 32)
flyctl secrets set NEXTAUTH_URL=https://<app-name>.fly.dev

# Деплой
flyctl deploy --config deploy/fly.toml
```

Домен: `https://<app-name>.fly.dev`

---

## 5. Docker (универсально)

Работает на любой Linux-ВМ или локально.

```bash
# Клонировать и перейти в директорию
git clone https://github.com/QuadDarv1ne/cybersec-lab-trainer
cd cybersec-lab-trainer

# Создать .env файл
cp .env.example .env
# Отредактировать .env — указать DATABASE_URL и NEXTAUTH_SECRET

# Запустить с PostgreSQL
docker compose -f deploy/docker-compose.yml --profile postgres up -d

# Или с SQLite (проще, без отдельной БД)
docker compose -f deploy/docker-compose.yml run --entrypoint "" app \
  bun run db:sqlite
docker compose -f deploy/docker-compose.yml up -d app
```

После запуска приложение доступно на `http://<IP-сервера>:3000`.

Для продакшена поверх Docker нужен **nginx** (см. раздел "VPS + Nginx").

---

## 6. VPS + Nginx + systemd

Для полноценного продакшена на собственном сервере (Ubuntu/Debian).

### Шаг 1. Подготовка сервера

```bash
# Подключиться к серверу
ssh root@<IP-сервера>

# Обновить пакеты
apt update && apt upgrade -y

# Установить Bun
curl -fsSL https://bun.sh/install | bash
ln -s /home/nextjs/.bun/bin/bun /usr/local/bin/bun

# Установить Nginx, Certbot
apt install -y nginx certbot python3-certbot-nginx
```

### Шаг 2. Клонировать и настроить

```bash
# Создать пользователя
adduser --system --group nextjs
mkdir -p /opt/cybersec-lab-trainer
chown -R nextjs:nextjs /opt/cybersec-lab-trainer

# Клонировать как пользователь nextjs
su - nextjs -c "git clone https://github.com/QuadDarv1ne/cybersec-lab-trainer.git /opt/cybersec-lab-trainer"

# Установить зависимости и собрать
cd /opt/cybersec-lab-trainer
cp .env.example .env
nano .env  # отредактировать

su - nextjs -c "cd /opt/cybersec-lab-trainer && bun install --frozen-lockfile"
su - nextjs -c "cd /opt/cybersec-lab-trainer && bun run build"
```

### Шаг 3. systemd + Nginx

```bash
cp deploy/cybersec-lab-trainer.service /etc/systemd/system/
cp deploy/nginx.conf /etc/nginx/sites-available/cybersec-lab-trainer

# Отредактировать nginx.conf — заменить your-domain.com
nano /etc/nginx/sites-available/cybersec-lab-trainer

# Включить сайт
ln -sf /etc/nginx/sites-available/cybersec-lab-trainer /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Запустить приложение
systemctl daemon-reload
systemctl enable --now cybersec-lab-trainer

# Проверить статус
systemctl status cybersec-lab-trainer
journalctl -u cybersec-lab-trainer -f
```

### Шаг 4. SSL (Let's Encrypt)

```bash
certbot --nginx -d your-domain.com --non-interactive --agree-tos -m your@email.com
```

### Шаг 5. Настройка домена

В DNS-панели создайте **A-запись**, указывающую на IP вашего сервера:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | `<IP-сервера>` |
| A | `www` | `<IP-сервера>` |

---

## 7. Yandex Cloud

### Serverless Containers

```bash
# Установить yc CLI
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash

# Создать Serverless Container
yc serverless container create --name cybersec-lab-trainer

# Деплой ревизии
yc serverless container revision deploy \
  --container-name cybersec-lab-trainer \
  --image ghcr.io/quadDarv1ne/cybersec-lab-trainer:main \
  --cpu 1 --memory 512MB \
  --execution-timeout 60s \
  --service-account-name cybersec-sa \
  --env DATABASE_URL=<url> \
  --env NEXTAUTH_URL=<url> \
  --env NEXTAUTH_SECRET=<secret>
```

### Виртуальная машина

Воспользуйтесь `yandex-cloud-vm-cloudinit.yaml` при создании ВМ:

```bash
yc compute instance create \
  --name cybersec-lab-trainer \
  --zone ru-central1-a \
  --platform standard-v3 \
  --cores 2 --memory 4GB \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-2204-lts,size=30GB \
  --network-interface subnet-name=<subnet>,nat-ip-version=ipv4 \
  --metadata-from-file user-data=deploy/yandex-cloud-vm-cloudinit.yaml
```

Приложение будет доступно по публичному IP ВМ после завершения cloud-init (~5 минут).

---

## 8. PM2 (альтернатива systemd)

Если не хотите systemd, используйте PM2:

```bash
npm install -g pm2
pm2 start deploy/pm2.config.js
pm2 save
pm2 startup  # чтобы PM2 запускался при старте системы
```

---

## Настройка базы данных

### SQLite (для тестов/демо)

```
DATABASE_TYPE=sqlite
DATABASE_URL=file:./prisma/dev.db
```

### PostgreSQL (рекомендуется для продакшена)

Бесплатные хостинги PostgreSQL:
- **[Neon](https://neon.tech)** — 0.5 ГБ бесплатно, serverless
- **[Supabase](https://supabase.com)** — 500 МБ бесплатно
- **[Railway](https://railway.app)** — встроенный PostgreSQL
- **[Aiven](https://aiven.io)** — 5 ГБ бесплатно

```bash
# Локально через Docker
docker run -d --name postgres \
  -e POSTGRES_USER=cybersec \
  -e POSTGRES_PASSWORD=cybersec \
  -e POSTGRES_DB=cybersec_trainer \
  -p 5432:5432 \
  postgres:16-alpine

# Строка подключения
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://cybersec:cybersec@localhost:5432/cybersec_trainer
```

### MongoDB

```bash
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/cybersec_lab
```

---

## Проверка работоспособности

После деплоя проверьте:

```bash
# Главная страница
curl -I https://<your-domain>

# API healthcheck (если реализован)
curl https://<your-domain>/api/health

# Флаги CTF
curl -I https://<your-domain>/api/flags?action=list-labs
```

Приложение должно быть доступно для подключения по указанному домену или IP-адресу.
