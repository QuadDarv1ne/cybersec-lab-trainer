# 🚀 Конфигурации для деплоя

## Платформы

| Платформа | Файл | Описание |
|-----------|------|----------|
| **Vercel** | `vercel.json`, `deploy-vercel.yml` | Рекомендуемый вариант для Next.js |
| **Docker** | `Dockerfile`, `docker-compose.yml` | Универсальный контейнер |
| **Render** | `render.yaml` | PaaS с бесплатным тарифом |
| **Railway** | `railway.json` | PaaS с простым деплоем |
| **Fly.io** | `fly.toml` | Edge-деплой по всему миру |
| **Yandex Cloud** | `yandex-cloud-serverless.yaml`, `yandex-cloud-vm-cloudinit.yaml` | Serverless Containers / VM |
| **VPS/Nginx** | `nginx.conf`, `cybersec-lab-trainer.service` | Классический Linux-сервер |
| **PM2** | `pm2.config.js` | Process manager для Node.js |

## GitHub Actions

- `deploy-docker.yml` — сборка и публикация Docker-образа в GHCR
- `deploy-vercel.yml` — автоматический деплой на Vercel
- `deploy-yandex-cloud.yml` — деплой в Yandex Cloud Serverless Containers

## Быстрый старт

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Docker Compose
```bash
docker compose -f deploy/docker-compose.yml up -d
```

### Fly.io
```bash
flyctl deploy --config deploy/fly.toml
```

### Yandex Cloud Serverless Containers
```bash
yc serverless container revision deploy \
  --container-name cybersec-lab-trainer \
  --image ghcr.io/quadDarv1ne/cybersec-lab-trainer:main \
  --cpu 1 --memory 512MB
```

### VPS (systemd)
```bash
sudo cp deploy/cybersec-lab-trainer.service /etc/systemd/system/
sudo systemctl enable --now cybersec-lab-trainer
```

### PM2
```bash
pm2 start deploy/pm2.config.js
pm2 save
```

## Переменные окружения

Для любого способа деплоя потребуются:

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `NEXTAUTH_URL` | URL приложения (e.g. `https://your-domain.com`) |
| `NEXTAUTH_SECRET` | Секретный ключ для NextAuth |
| `GOOGLE_CLIENT_ID` | OAuth Client ID Google |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret Google |
| `GITHUB_ID` | OAuth Client ID GitHub |
| `GITHUB_SECRET` | OAuth Client Secret GitHub |
