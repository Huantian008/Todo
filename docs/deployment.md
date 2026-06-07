# Production Deployment

This project can run on a single Ubuntu server with Docker Compose.

The production setup is designed to avoid breaking existing server business:

- Docker exposes the Todo frontend only on `127.0.0.1:8088`.
- Existing public `80/443` services remain owned by the server's current Nginx/Caddy/Apache.
- Add a new virtual host for your domain, such as `todo.example.com`, and proxy it to `127.0.0.1:8088`.

## Server

The current Droplet public IPv4 is:

```text
YOUR_SERVER_IP
```

## One-time server setup

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
```

Do not change firewall or reverse-proxy rules until you have checked the existing business on this server.

## Deploy

Clone or upload the repository to the server, then run:

```bash
cd todo-app-multiai
cp .env.production.example .env
nano .env
bash scripts/deploy-ubuntu.sh
```

Edit `.env` before starting the stack:

```env
AMAP_KEY=your_real_amap_key
CORS_ORIGIN=https://todo.example.com
VITE_API_BASE_URL=
```

After the containers start, add a reverse proxy entry in the existing public web server:

```nginx
server {
    listen 80;
    server_name todo.example.com;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The app will be available after DNS and reverse proxy are active:

```text
https://todo.example.com
```

## Check status

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
curl http://127.0.0.1:8088/health
```

## Update

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Notes

- MongoDB is not exposed to the public internet.
- The frontend calls `/api/...`, and Nginx proxies those requests to the Go backend.
- Add a domain and HTTPS later by pointing DNS to your server IP and putting a TLS proxy in front of the frontend container.
