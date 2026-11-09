# Complete Guide: How to Deploy Any Project (Frontend & Backend) on Your Oracle Cloud VM

This document is a complete, step-by-step reference for deploying both a **Frontend (React / Vite)** and a **Backend (Node.js / Colyseus / Express / Go + Prisma / Supabase + Redis)** on an Ubuntu Virtual Machine (Oracle Cloud), using **Nginx**, **systemd**, **Cloudflare**, and **Certbot (Let's Encrypt HTTPS)**.

More importantly, **every single command and configuration line is explained in detail**, so you always understand *why* you are running it and what happens under the hood.

---

## 1. Architecture Overview: Static Frontend vs. Running Backend

Before running any commands, it is essential to understand why a **Frontend SPA (React)** and a **Backend (API / WebSocket server)** are deployed differently on a Linux server:

```mermaid
flowchart TB
    User["Visitor (Browser)"]
    CF["Cloudflare (DNS + Reverse Proxy + Edge HTTPS)"]

    subgraph VM ["Oracle Cloud VM (Ubuntu)"]
        Nginx["Nginx Web Server (Ports 80 & 443)"]

        subgraph FrontStatic ["Frontend (Static Files on Disk)"]
            Dist["/var/www/rooms-frontend\n(index.html, .js, .css)"]
        end

        subgraph BackProcess ["Backend (Live Process in RAM)"]
            Systemd["systemd (rooms-backend.service)\nNode.js listening on 127.0.0.1:8080"]
        end
    end

    subgraph CloudServices ["External Managed Services (Free Tier)"]
        Supabase[("Supabase PostgreSQL\nSession Pooler :5432")]
        Redis[("Redis Cloud / Upstash\nBullMQ Email Queue")]
    end

    User -->|"https://rooms.pedrovidaldev.com.br"| CF
    User -->|"wss://roomsapi.pedrovidaldev.com.br"| CF
    CF -->|"HTTPS (Port 443)"| Nginx
    Nginx -->|"Reads files directly from disk (root)"| Dist
    Nginx -->|"Forwards over local network (proxy_pass :8080)"| Systemd
    Systemd --> Supabase
    Systemd --> Redis
```

### Why does Nginx treat Frontend and Backend differently?

| Feature | Frontend (React + Vite) | Backend (Node.js / Colyseus / Go) |
| :--- | :--- | :--- |
| **Does it need a process running 24/7 on the VM?** | **No.** Vite compiles your React/TypeScript code into static `HTML`, `CSS`, and `JS` files. The visitor's **browser** downloads those files and executes the JavaScript on their own device. | **Yes.** Your backend must stay alive in RAM 24/7 listening for HTTP requests and WebSocket connections, querying the database, and signing JWTs. |
| **How does Nginx serve it?** | Uses `root /path/to/folder;`. Nginx itself **opens and reads the files on the hard drive** and sends them to the browser. | Uses `proxy_pass http://127.0.0.1:8080;`. Nginx **never touches your backend files on disk**; it simply forwards network traffic to port `8080`. |
| **Why do `/home/ubuntu` folder permissions matter for Frontend, but NOT for Backend?** | Nginx runs under a restricted Linux user named `www-data`. On modern Ubuntu, `/home/ubuntu` has strict permissions (`drwxr-x---`) that block other users from entering it. If Nginx tries to read files inside `/home/ubuntu/...`, Linux blocks `www-data` with **`403 Forbidden`**. That is why we copy static files to `/var/www/...` (or explicitly grant traversal permissions). | For the backend, the Node.js process runs as your `ubuntu` user (which already owns `/home/ubuntu`) and opens network port `8080`. Nginx (`www-data`) only talks to `localhost:8080` over the local network, so it never needs to enter `/home/ubuntu`. |

---

## 2. Preparing the Ubuntu VM (One-Time Setup)

### 2.1. Why shouldn't you use Ubuntu's default `sudo apt install nodejs`?
Ubuntu's default `apt` repository often ships a very old Node.js version (such as **Node 12**). Modern tools like **Vite 8** and **TypeScript 6** use newer JavaScript syntax (such as the nullish coalescing operator `??`), which causes Node 12 to crash immediately with:
> `SyntaxError: Unexpected token '?'`

The cleanest, conflict-free way to install **Node.js 22 LTS** on Ubuntu is via **NVM (Node Version Manager)**:

```bash
# 1. Remove any old apt-installed Node.js/npm so it doesn't conflict
sudo apt-get remove --purge -y nodejs npm
sudo apt-get autoremove -y

# 2. Download and run the official NVM installer script
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 3. Load NVM into your current terminal session without needing to reconnect SSH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 4. Install Node.js 22 LTS, activate it, and set it as the default for future shells
nvm install 22
nvm use 22
nvm alias default 22

# 5. Verify that Node is now v22.x.x
node -v
npm -v
```

### 2.2. Create a global symlink for `node` and `npm`
**Why do we do this?** NVM installs Node inside your personal user folder (`/home/ubuntu/.nvm/versions/node/v22.x.x/bin/node`). However, background system services managed by `systemd` do not load your interactive `.bashrc`, so they look for binaries in standard system paths like `/usr/local/bin`. Creating a symbolic link (`ln -sf`) makes Node 22 globally visible:

```bash
sudo ln -sf "$(which node)" /usr/local/bin/node
sudo ln -sf "$(which npm)" /usr/local/bin/npm
```

---

## 3. Part 1: Deploying the Frontend (React + Vite)

### Step 1: Enter the frontend directory and install dependencies
```bash
cd ~/rooms/frontend
npm ci
```
- **Why `npm ci` instead of `npm install`?**
  `npm ci` (*Clean Install*) is designed for production and CI/CD environments. It reads `package-lock.json` strictly, installs the exact dependency versions you tested locally, deletes any stale `node_modules`, runs faster, and never modifies `package-lock.json` on the server.

### Step 2: Configure production environment variables (`.env.production`)
```bash
nano .env.production
```
Add your backend URL:
```env
VITE_WEBSOCKET_SERVER=wss://roomsapi.pedrovidaldev.com.br
```
*(In standard REST projects, this might be `VITE_API_URL=https://api.pedrovidaldev.com.br`).*

- **Why must this file exist BEFORE running `npm run build`?**
  Remember that no Node.js process runs your frontend in production. When you run `vite build`, Vite reads `.env.production` and **hardcodes (replaces)** every occurrence of `import.meta.env.VITE_*` directly into the compiled `.js` bundle. If you change `.env.production` later, you must run `npm run build` again.
- **Why `wss://` instead of `ws://`?**
  When your frontend is served over `https://`, browsers enforce **Mixed Content security**: an `https://` page is forbidden from opening an unencrypted `ws://` WebSocket or `http://` request. Using `wss://` (WebSocket Secure) tells Colyseus to use `wss://` for real-time rooms and `https://` for HTTP calls (`/auth/login`, etc.).
- **Security Warning:** Because `VITE_*` variables are baked into the JavaScript downloaded by the user's browser, **never** put database passwords or private API secrets in them.

### Step 3: Build the production bundle
```bash
npm run build
```
- **What does this do?**
  It runs TypeScript type-checking (`tsc -b`) followed by `vite build`. Vite bundles, tree-shakes, and minifies your entire React application into the `dist/` directory:
  ```text
  dist/
  ├── index.html
  ├── auth-banner.png
  └── assets/
      ├── index-CkKecU35.js
      └── index-CrRK9Jt0.css
  ```

### Step 4: Copy the compiled files to the Nginx web root
```bash
sudo mkdir -p /var/www/rooms-frontend
sudo rsync -av --delete dist/ /var/www/rooms-frontend/
sudo chown -R www-data:www-data /var/www/rooms-frontend
```
- **Why `sudo mkdir -p /var/www/rooms-frontend`?**
  Creates the target folder in `/var/www` (the standard Linux directory for web files). The `-p` flag creates parent directories if needed and prevents errors if the directory already exists.
- **Why `sudo rsync -av --delete dist/ /var/www/rooms-frontend/`?**
  Copies everything inside `dist/` into `/var/www/rooms-frontend/`. Unlike `rm -rf` followed by `cp`, `rsync` replaces files atomically (no downtime while copying) and `--delete` cleans up old hashed JS/CSS files from previous builds so your disk doesn't fill up.
- **Why `sudo chown -R www-data:www-data /var/www/rooms-frontend`?**
  Changes the owner and group of all files (`-R` = recursive) to `www-data`, which is the Linux user Nginx runs as.

> [!TIP]
> **Alternative (Serving directly from `/home/ubuntu/rooms/frontend/dist`):**
> If you prefer not to copy files to `/var/www`, you can allow the `www-data` user to traverse your home folder once:
> ```bash
> sudo usermod -aG ubuntu www-data
> chmod g+x /home/ubuntu /home/ubuntu/rooms /home/ubuntu/rooms/frontend
> ```
> Then you can set `root /home/ubuntu/rooms/frontend/dist;` inside your Nginx config.

### Step 5: Configure Nginx for the Frontend
Create the Nginx virtual host file:
```bash
sudo nano /etc/nginx/sites-available/rooms-frontend
```
Paste:
```nginx
server {
    listen 80;
    server_name rooms.pedrovidaldev.com.br;

    root /var/www/rooms-frontend;
    index index.html;

    # 1. Enable Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # 2. Long-term caching for hashed Vite assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 3. Single Page Application (SPA) routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Line-by-line explanation:**
- `listen 80;`: Tells Nginx to listen on HTTP port 80 (Certbot will automatically add port 443 HTTPS later).
- `server_name rooms.pedrovidaldev.com.br;`: Tells Nginx to use this block when a request arrives with the header `Host: rooms.pedrovidaldev.com.br`. That is how a single VM with one IP address can host many different websites and APIs at the same time!
- `root /var/www/rooms-frontend;`: The folder on disk where Nginx looks for files.
- `gzip on;`: Compresses `.js` and `.css` responses before sending them over the network. Because Three.js + Rapier physics generates a ~3.5 MB JS bundle, Gzip shrinks the download size dramatically.
- `location /assets/ { expires 1y; ... }`: Every time you change code, Vite generates a new hash in the filename (e.g., `index-CkKecU35.js`). Therefore, any file inside `/assets/` can be cached by the visitor's browser for 1 year (`immutable`) without ever serving outdated code.
- `try_files $uri $uri/ /index.html;`: **Crucial for React Router.** If a user refreshes the page on `https://rooms.pedrovidaldev.com.br/login`, the browser asks Nginx for a file named `/login`. That file does not exist on disk — `/login` is a virtual route inside React! `try_files` tells Nginx: *"Look for the exact file `$uri`; if not found, look for a folder `$uri/`; if neither exists, serve `/index.html` so React Router can render the `/login` screen instead of a 404 error."*

Enable the site and reload Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/rooms-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
- **Why `ln -sf` from `sites-available` to `sites-enabled`?**
  Nginx only loads active sites from `/etc/nginx/sites-enabled/`. Keeping the actual file in `sites-available` and creating a symlink (`ln -s`) in `sites-enabled` lets you easily enable or disable a site without deleting its configuration file.
- **Why `sudo nginx -t`?**
  Tests all Nginx config files for syntax errors before applying them. If you made a typo, `nginx -t` tells you the exact file and line number without crashing your running server.
- **Why `sudo systemctl reload nginx`?**
  Gracefully reloads Nginx configuration without dropping active connections.

---

## 4. Part 2: Deploying the Backend (Node.js + Prisma/Supabase + Redis)

### 4.1. Critical Details About Supabase & Cloud Redis

#### A) Supabase: Why you MUST use Port `5432` (Session Pooler) instead of `6543`
Supabase gives you three different PostgreSQL connection URLs:
1. **Direct Connection (`db.xxx.supabase.co:5432`):** On the Supabase Free Tier, this hostname only resolves to an **IPv6** address. Most Oracle Cloud VMs only have IPv4 enabled by default, so connecting to `db.xxx.supabase.co` fails with `Can't reach database server`.
2. **Transaction Pooler (`aws-1-sa-east-1.pooler.supabase.com:6543`):** Works over IPv4, but uses PgBouncer in **Transaction Mode**. When you run `npx prisma migrate deploy`, Prisma tries to acquire a PostgreSQL *advisory lock* so two servers don't migrate the database at the same time. Transaction Pooler (`:6543`) does not support advisory locks, causing `npx prisma migrate deploy` to **hang forever**.
3. **Session Pooler (`aws-1-sa-east-1.pooler.supabase.com:5432`) — USE THIS ONE:** Uses the exact same IPv4-compatible pooler hostname, but on port **`5432`** (Session Mode). It supports both `npx prisma migrate deploy` and runtime queries without hanging.

#### B) Cloud Redis: Authentication & Sharing Across Projects
- **`REDIS_PASSWORD`:** Local Docker Redis usually has no password, but any cloud Redis (Redis Cloud, Upstash) requires a password (`REDIS_PASSWORD`).
- **Can I share the same Redis instance across multiple projects?**
  **Yes!** Redis is a key-value store. In this project, BullMQ creates keys prefixed with the queue name defined in `backend/src/mail/queues/mail.queue.ts` (`MAIL_QUEUE_NAME = "mail-queue"` -> `bull:mail-queue:*`). As long as your other project does not also have a BullMQ queue named `"mail-queue"`, they will never interfere with each other.

---

### Step 1: Create the Backend `.env` file on the VM
```bash
cd ~/rooms/backend
nano .env
```
Fill in your production credentials:
```env
PORT=8080

# Use port 5432 on the Supabase pooler host!
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

REDIS_HOST=your-endpoint.redns.redis-cloud.com
REDIS_PORT=12345
REDIS_PASSWORD=your_redis_password

SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com

JWT_SECRET=a_long_random_secret_string_for_production
```

### Step 2: Install dependencies, run Prisma migrations, and build
```bash
# 1. Install exact dependencies from package-lock.json
npm ci

# 2. Apply pending SQL migrations from prisma/migrations/ to Supabase
npx prisma migrate deploy

# 3. Generate Prisma Client, compile TypeScript to dist/, and copy Prisma engine binaries
npm run build
```
- **Why `npx prisma migrate deploy` instead of `npx prisma migrate dev`?**
  `migrate dev` is strictly for local development (it detects schema changes, generates new migration files, and may prompt to wipe the database). `migrate deploy` is safe for production: it only runs SQL migrations that have not yet been applied to the production database.

### Step 3: Create a `systemd` service to keep the Backend running 24/7
**Why do we need `systemd`?**
If you run `npm start` directly in your SSH terminal, Linux attaches that process to your SSH session. The moment you close your laptop or lose Wi-Fi, Linux sends a `SIGHUP` signal and kills your backend. Furthermore, if the VM reboots or an unhandled error crashes Node, nobody restarts it.

`systemd` is Ubuntu's built-in service manager. It runs your backend in the background as a daemon, starts it automatically when the VM boots, captures all `console.log` / `console.error` output into system logs (`journalctl`), and automatically restarts the server within 5 seconds if it ever crashes.

Create the service file:
```bash
sudo nano /etc/systemd/system/rooms-backend.service
```
Paste:
```ini
[Unit]
Description=Rooms Colyseus Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/rooms/backend
EnvironmentFile=/home/ubuntu/rooms/backend/.env
ExecStart=/usr/local/bin/node /home/ubuntu/rooms/backend/dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Line-by-line explanation:**
- `After=network.target`: Wait until the VM's network interface is online before starting the backend.
- `User=ubuntu`: Run the Node.js process as the `ubuntu` user (running web apps as `root` is a security risk).
- `WorkingDirectory=/home/ubuntu/rooms/backend`: `cd` into this folder before starting so relative paths work.
- `EnvironmentFile=/home/ubuntu/rooms/backend/.env`: Injects your `.env` variables into `process.env`.
- `ExecStart=/usr/local/bin/node /home/ubuntu/rooms/backend/dist/index.js`: Runs the compiled JavaScript entrypoint using the global Node 22 symlink we created earlier.
- `Restart=always` & `RestartSec=5`: If the process crashes for any reason, wait 5 seconds and start it again automatically.
- `WantedBy=multi-user.target`: Tells Ubuntu to start this service automatically whenever the VM boots up.

Register and start the service:
```bash
# 1. Tell systemd to re-read service files on disk
sudo systemctl daemon-reload

# 2. Enable auto-start on VM boot
sudo systemctl enable rooms-backend

# 3. Start the backend right now
sudo systemctl start rooms-backend

# 4. Check that its status is "active (running)"
sudo systemctl status rooms-backend
```

### Step 4: Configure Nginx as a Reverse Proxy (HTTP + WebSockets)
Create the Nginx config for the backend subdomain:
```bash
sudo nano /etc/nginx/sites-available/rooms-backend
```
Paste:
```nginx
server {
    listen 80;
    server_name roomsapi.pedrovidaldev.com.br;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        # Required for WebSocket connections (Colyseus)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Forward original visitor IP and protocol to Node.js
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Prevent Nginx from closing idle WebSocket connections after 60s
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

**Line-by-line explanation:**
- `proxy_pass http://127.0.0.1:8080;`: Whenever a request arrives for `roomsapi.pedrovidaldev.com.br`, Nginx forwards it internally to your Node.js backend listening on local port `8080`.
- `proxy_http_version 1.1;`: WebSockets require HTTP/1.1 (Nginx uses HTTP/1.0 for upstream proxies by default).
- `proxy_set_header Upgrade $http_upgrade;` & `proxy_set_header Connection "upgrade";`: **Essential for Colyseus.** Every WebSocket connection starts life as a normal HTTP request asking the server: *"Can we upgrade this HTTP connection into a persistent two-way WebSocket pipe?"* By default, Nginx strips hop-by-hop `Upgrade` headers. These two lines tell Nginx to pass the WebSocket upgrade handshake through to Colyseus.
- `proxy_set_header X-Real-IP` / `X-Forwarded-For` / `X-Forwarded-Proto`: Because Nginx sits between the user and Node.js, Node.js would otherwise think every single request came from `127.0.0.1` over `http`. These headers tell your backend the visitor's real IP address and that they connected via `https`.
- `proxy_read_timeout 86400s;`: By default, Nginx closes a connection if no data is sent for 60 seconds. For real-time WebSocket rooms, we increase this timeout to 24 hours (`86400s`).

Enable and reload Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/rooms-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Part 3: Cloudflare DNS & How HTTPS Certificates (`certbot`) Actually Work

Many tutorials tell you to run `sudo certbot --nginx -d yourdomain.com` without explaining what it actually does. Here is the complete explanation of **what an SSL/TLS certificate is**, **how Certbot validates your domain**, **what Certbot changes in your Nginx files**, and **how Cloudflare fits in**.

### 5.1. What is an HTTPS Certificate and Let's Encrypt?
For a browser to show the padlock icon (`https://`) and encrypt traffic (or allow `wss://` WebSockets), the server must present a cryptographic **SSL/TLS Certificate** signed by a trusted **Certificate Authority (CA)** proving: *"This server at IP `137.131.153.14` is legitimately authorized to represent `rooms.pedrovidaldev.com.br`."*

- **Let's Encrypt** is a free, automated global Certificate Authority.
- **Certbot** is the command-line tool on your Ubuntu VM that talks to Let's Encrypt to request, install, and automatically renew those free certificates.

### 5.2. Step 1: Point DNS in Cloudflare (Start with "DNS Only" / Grey Cloud)
In your Cloudflare dashboard for `pedrovidaldev.com.br`, go to **DNS → Records** and add:

| Type | Name | IPv4 Address | Proxy Status |
| :--- | :--- | :--- | :--- |
| `A` | `rooms` | `137.131.153.14` | **DNS only (Grey Cloud)** |
| `A` | `roomsapi` | `137.131.153.14` | **DNS only (Grey Cloud)** |

- **Why start with "DNS only (Grey Cloud)"?**
  When the Grey Cloud is active, Cloudflare acts purely as a phonebook: anyone looking up `rooms.pedrovidaldev.com.br` gets your VM's real IP (`137.131.153.14`) directly. This avoids any Cloudflare SSL redirect interference while Certbot performs the initial certificate verification on port `80`.

### 5.3. Step 2: Run the Certbot command on the VM

```bash
sudo certbot --nginx -d rooms.pedrovidaldev.com.br
sudo certbot --nginx -d roomsapi.pedrovidaldev.com.br
```

#### What happens behind the scenes when you run `sudo certbot --nginx -d rooms.pedrovidaldev.com.br`?

```mermaid
sequenceDiagram
    participant Certbot as Certbot (on your VM)
    participant Nginx as Nginx (on your VM)
    participant LE as Let's Encrypt Authority

    Certbot->>LE: 1. "I want a certificate for rooms.pedrovidaldev.com.br"
    LE-->>Certbot: 2. HTTP-01 Challenge: "Prove you control that domain by serving token XYZ at http://rooms.pedrovidaldev.com.br/.well-known/acme-challenge/XYZ"
    Certbot->>Nginx: 3. Temporarily configures Nginx to serve token XYZ at that path
    Certbot->>LE: 4. "Ready! Come check it."
    LE->>Nginx: 5. Requests http://rooms.pedrovidaldev.com.br/.well-known/acme-challenge/XYZ (Port 80)
    Nginx-->>LE: 6. Returns token XYZ
    LE-->>Certbot: 7. "Verified! Here are your signed certificate (fullchain.pem) and private key (privkey.pem)"
    Certbot->>Nginx: 8. Rewrites /etc/nginx/sites-available/rooms-frontend to add "listen 443 ssl" and HTTP->HTTPS redirect, then reloads Nginx
```

1. **`--nginx` flag:** Tells Certbot to use its **Nginx plugin**. Certbot inspects `/etc/nginx/sites-enabled/` to find the `server` block whose `server_name` matches `-d rooms.pedrovidaldev.com.br`.
2. **The HTTP-01 Ownership Challenge:** Let's Encrypt gives Certbot a random one-time token and says: *"If you really control `rooms.pedrovidaldev.com.br`, place this token at `http://rooms.pedrovidaldev.com.br/.well-known/acme-challenge/<token>`."*
3. **Verification:** Certbot temporarily injects a rule into your Nginx config to answer that URL, and Let's Encrypt's servers make an HTTP request (on Port 80) to your domain. When Nginx responds with the right token, Let's Encrypt knows you own the server behind that domain.
4. **Saving the Certificate Files:** Let's Encrypt issues the certificate and Certbot saves the files inside `/etc/letsencrypt/live/rooms.pedrovidaldev.com.br/`:
   - `fullchain.pem`: The public SSL certificate.
   - `privkey.pem`: Your server's private encryption key.
5. **Automatic Nginx Config Modification:** Because you passed `--nginx`, Certbot automatically edits `/etc/nginx/sites-available/rooms-frontend` for you! If you open the file afterwards (`cat /etc/nginx/sites-available/rooms-frontend`), you will see Certbot added:
   ```nginx
   listen 443 ssl; # managed by Certbot
   ssl_certificate /etc/letsencrypt/live/rooms.pedrovidaldev.com.br/fullchain.pem; # managed by Certbot
   ssl_certificate_key /etc/letsencrypt/live/rooms.pedrovidaldev.com.br/privkey.pem; # managed by Certbot
   ```
   plus a second `server` block on port `80` that automatically redirects `http://` visitors to `https://`.
6. **Automatic Renewal:** Let's Encrypt certificates expire every 90 days for security, but Certbot automatically installs a background timer (`systemctl status certbot.timer`) that checks twice a day and renews your certificates automatically before they expire.

### 5.4. Step 3: Enable Cloudflare Proxy (Orange Cloud) & `Full (strict)` SSL
Once Certbot finishes and shows `Congratulations!`:
1. Go back to **Cloudflare → DNS → Records** and switch `rooms` and `roomsapi` from **DNS only (Grey)** to **Proxied (Orange Cloud)**. Now Cloudflare hides your VM's IP address, absorbs DDoS attacks, and caches static assets at the edge.
2. Go to **Cloudflare → SSL/TLS → Overview** and select **Full (strict)**:
   - **Why `Full (strict)`?**
     - *Flexible* encrypts traffic between the browser and Cloudflare, but talks to your VM over unencrypted HTTP (and often causes infinite redirect loops when Certbot's HTTP->HTTPS redirect is enabled).
     - *Full (strict)* encrypts traffic from the **Browser → Cloudflare** AND from **Cloudflare → Your VM's Nginx**, verifying the Let's Encrypt certificate you just installed.

---

## 6. Part 4: Day-to-Day Cheat Sheet (How to Deploy New Commits)

Once the initial setup above is done, you **never** need to repeat the Nginx, systemd, Cloudflare, or Certbot steps again.

### Updating the Frontend after a new commit:
```bash
cd ~/rooms/frontend
git pull
npm ci
npm run build
sudo rsync -av --delete dist/ /var/www/rooms-frontend/
sudo chown -R www-data:www-data /var/www/rooms-frontend
```
*(No need to restart Nginx — Nginx reads the new static files from `/var/www/rooms-frontend` immediately on the next browser refresh).*

### Updating the Backend after a new commit:
```bash
cd ~/rooms/backend
git pull
npm ci
npx prisma migrate deploy
npm run build
sudo systemctl restart rooms-backend
```
- **Why do we run `sudo systemctl restart rooms-backend`?**
  Because Node.js loads your backend code into RAM when it starts. Even after `npm run build` updates the `dist/` files on disk, the running Node process is still executing the old code in memory until `systemctl restart` stops the old process and boots a fresh one.

---

## 7. Useful Troubleshooting Commands

Whenever something behaves unexpectedly on the VM, these commands will immediately tell you why:

| Goal | Command to run on the VM |
| :--- | :--- |
| Check if the Backend service is running or crashed | `sudo systemctl status rooms-backend` |
| Watch live `console.log` / `console.error` output from the Backend | `sudo journalctl -u rooms-backend -f` |
| View the last 100 lines of Backend logs | `sudo journalctl -u rooms-backend -n 100 --no-pager` |
| Test Nginx config files for syntax errors | `sudo nginx -t` |
| Watch live Nginx error logs (e.g. `403 Forbidden`, `502 Bad Gateway`) | `sudo tail -f /var/log/nginx/error.log` |
| Check if the Backend is responding locally on port 8080 | `curl http://localhost:8080/api/health` |
| Check Certbot auto-renewal timer and existing certificates | `sudo certbot certificates` |
