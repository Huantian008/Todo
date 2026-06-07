#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
DOMAIN="${DOMAIN:-todo.leadertestofcn.site}"
LOCAL_PORT="${LOCAL_PORT:-8088}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

cd "$APP_DIR"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Cannot find $COMPOSE_FILE in $APP_DIR"
  echo "Run this script from the project root, or set APP_DIR=/path/to/todo-app-multiai"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not available after Docker install."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo "Created .env from .env.production.example"
fi

if grep -q "your_amap_key_here" .env; then
  echo "Edit .env and set AMAP_KEY before deploying:"
  echo "  nano $APP_DIR/.env"
  exit 1
fi

docker compose -f "$COMPOSE_FILE" up -d --build

echo
echo "Todo containers are running behind local port $LOCAL_PORT."
echo "Local health check:"
curl -fsS "http://127.0.0.1:${LOCAL_PORT}/health" || true
echo
echo
echo "If this server already has Nginx for other business, add this server block without deleting existing configs:"
cat <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${LOCAL_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

echo
echo "Cloudflare DNS: add A record ${DOMAIN} -> 142.93.22.124"
