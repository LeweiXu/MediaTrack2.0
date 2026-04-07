# LOG — Command Cheatsheet

---

## FIRST-TIME SETUP

### PostgreSQL (if not installed)
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16
```

### Create the database
```bash
sudo -u postgres psql -c "CREATE USER mediauser WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "CREATE DATABASE mediatracker OWNER mediauser;"
```

---

## BACKEND — FIRST-TIME

```bash
cd backend/

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate                        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env                                       # set DATABASE_URL and CORS_ORIGINS

# Run migrations (creates all tables)
alembic upgrade head

# Optional: seed sample data
python scripts/init_db.py --seed
```

---

## FRONTEND — FIRST-TIME

```bash
cd frontend/

# Install dependencies
npm install
```

---

## DEVELOPMENT

### Start backend (with auto-reload)
```bash
cd backend/
source venv/bin/activate
python main.py                                  # → http://localhost:6443
```

### Start frontend (with hot module replacement)
```bash
cd frontend/
npm start                                       # → http://localhost:3000
```

### Run both at once (two terminals, or background the backend)
```bash
# Terminal 1
cd backend && source venv/bin/activate && python main.py

# Terminal 2
cd frontend && npm start
```

### View API docs (interactive Swagger UI)
```
http://localhost:6443/docs
```

### View alternative API docs (ReDoc)
```
http://localhost:6443/redoc
```

---

## DATABASE — MIGRATIONS

```bash
cd backend/
source venv/bin/activate

# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Roll back to the very beginning (drops all tables)
alembic downgrade base

# Create a new migration after changing a model
alembic revision --autogenerate -m "describe what changed"

# Show current migration state
alembic current

# Show full migration history
alembic history
```

---

## DATABASE — DIRECT ACCESS

```bash
# Connect to the database
psql -U mediauser -d mediatracker

# Useful psql commands once inside
\dt                                             # list all tables
\d entries                                      # describe the entries table
SELECT count(*) FROM entries;                   # count all entries
SELECT * FROM entries WHERE status = 'current'; # query current entries
\q                                              # quit
```

---

## PRODUCTION — BACKEND

### Install as a systemd service (Linux)
```bash
# Create the service file
sudo nano /etc/systemd/system/mediatracker.service
```

Paste this into the file (adjust paths):
```ini
[Unit]
Description=Media Tracker API
After=network.target postgresql.service

[Service]
User=youruser
WorkingDirectory=/path/to/backend
EnvironmentFile=/path/to/backend/.env
ExecStart=/path/to/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 6443 --workers 4
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable mediatracker
sudo systemctl start mediatracker

# Check it is running
sudo systemctl status mediatracker

# View live logs
sudo journalctl -u mediatracker -f
```

### Run manually in production (no auto-reload)
```bash
cd backend/
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 6443 --workers 4
```

---

## PRODUCTION — FRONTEND

### Build static files
```bash
cd frontend/
npm run build                                   # outputs to frontend/dist/
```

### Serve the build locally to verify it works
```bash
cd frontend/
npm run preview                                 # → http://localhost:4173
```

### Deploy with nginx
```bash
# Copy build output to web root
sudo cp -r dist/* /var/www/mediatracker/

# Create nginx site config
sudo nano /etc/nginx/sites-available/mediatracker
```

Paste this (adjust domain/paths):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/mediatracker;
    index index.html;

    # Serve the React SPA — all routes fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to the FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:6443/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable the site and reload nginx
sudo ln -s /etc/nginx/sites-available/mediatracker /etc/nginx/sites-enabled/
sudo nginx -t                                   # test config for errors
sudo systemctl reload nginx
```

---

## UPDATES — PULLING NEW CODE

```bash
# 1. Pull latest code
git pull

# 2. Update backend dependencies
cd backend/
source venv/bin/activate
pip install -r requirements.txt

# 3. Run any new migrations
alembic upgrade head

# 4. Restart the backend service
sudo systemctl restart mediatracker

# 5. Rebuild the frontend
cd ../frontend/
npm install
npm run build
sudo cp -r dist/* /var/www/mediatracker/
```

---

## TROUBLESHOOTING

```bash
# Backend won't start — check for import errors
cd backend && source venv/bin/activate && python -c "from app.main import app; print('OK')"

# Check if port 6443 is already in use
sudo lsof -i :6443

# Kill whatever is on port 6443
sudo kill -9 $(sudo lsof -t -i :6443)

# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
cd backend && source venv/bin/activate && python -c "
from app.db.session import engine
with engine.connect() as c: print('DB OK')
"

# Frontend build fails — clear cache and retry
cd frontend && rm -rf node_modules dist && npm install && npm run build

# Reset the database entirely (DESTRUCTIVE — deletes all data)
cd backend && source venv/bin/activate && alembic downgrade base && alembic upgrade head
```

---

## ENVIRONMENT VARIABLES REFERENCE

```bash
# backend/.env
DATABASE_URL=postgresql://mediauser:yourpassword@localhost:5432/mediatracker
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
HOST=0.0.0.0
PORT=6443

# External search API keys (all optional)
TMDB_API_KEY=
IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
GOOGLE_BOOKS_API_KEY=
```