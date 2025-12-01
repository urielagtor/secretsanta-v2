# Secret Santa - Self-Hosting Guide

This guide covers how to build and deploy your own instance of Secret Santa.

For general usage instructions, see the main [README](README.md).

---

## Prerequisites

- Node.js 18+
- Yarn (via Corepack) or npm
- A web server (nginx, Caddy, Apache, etc.)

---

## Quick Start

```bash
git clone https://github.com/arcanis/secretsanta.git
cd secretsanta
```

### Option A: Yarn (recommended - project default)

```bash
corepack enable
yarn install
yarn vite build
```

### Option B: npm

```bash
npm install
npx vite build
```

The built files will be in `dist/`.

---

## Setting the Base Path

By default, the app builds with `base: '/secretsanta/'` (configured for GitHub Pages).

**For root domain hosting** (e.g., `https://secret-santa.example.com/`):

```bash
# Yarn
yarn vite build --base=/

# npm
npx vite build --base=/
```

**For subdirectory hosting** (e.g., `https://example.com/gifts/`):

```bash
# Yarn
yarn vite build --base=/gifts/

# npm
npx vite build --base=/gifts/
```

To change the default permanently, edit `vite.config.ts`:

```ts
export default defineConfig({
  base: '/',  // Change from '/secretsanta/'
  plugins: [react()],
})
```

---

## Deployment

### Nginx

```nginx
server {
    listen 80;
    server_name secret-santa.example.com;
    root /var/www/secret-santa/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Add SSL with Certbot:

```bash
certbot --nginx -d secret-santa.example.com
```

### Caddy

```caddyfile
secret-santa.example.com {
    root * /var/www/secret-santa/dist
    file_server
    try_files {path} /index.html
}
```

Caddy handles SSL automatically.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && yarn install && yarn vite build --base=/

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

Build and run:

```bash
docker build -t secret-santa .
docker run -p 8080:80 secret-santa
```

---

## Development

```bash
# Start dev server with hot reload
yarn vite        # or: npx vite

# Run tests
yarn vitest      # or: npx vitest
```

---

## How It Works

- Pairings are generated entirely client-side
- Recipient names are encrypted before being added to shareable URLs
- The server never sees who is matched with whom
- All data stays in the browser (localStorage)
- Each participant receives a unique link that decrypts only their assigned person

---

## Customisation

### Background

Edit `src/index.css` to change the background:

```css
body {
  background: url(../static/snow.png), url(../static/snow.png), #fefae8 url(../static/cats.png) bottom left no-repeat;
  /* ... */
}
```

- `#fefae8` - base colour (warm cream)
- `snow.png` - falling snow animation overlay
- `cats.png` - corner decoration (replace with your own image)

### Colours

The app uses Tailwind CSS. Edit `tailwind.config.js` and `src/index.css` for theme changes.

---

## Credits

Original project by [Maël Nison](https://github.com/arcanis) - helping people organize secret santas without leaking guest information since 2015.

## License

MIT - see [README.md](README.md) for full license.
