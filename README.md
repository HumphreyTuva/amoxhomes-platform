# AMOXHomes (Django + React)
Public website: **React** (Vite, Tailwind, React Router) in `frontend/`. Backend: **Django + DRF** (models, admin, staff console, JSON API).
Django serves the built React app, so there is still one site to deploy. Staff pages (`/console/`, `/admin/`) are unchanged Django pages.

## How the pieces fit
- `frontend/` is the React source. `npm run build` writes it to `core/static/app/` (git-ignored).
- `core/spa.py` serves that build for every public URL (same URLs as before). For each request it also puts into the HTML the page's own
  `<title>`, description and Open Graph image (WhatsApp/Google previews), the site settings, and the page's data, so the first screen needs no extra API call.
- `core/site_api.py` is the JSON API the React app uses (`/api/site/...`). Forms are described to React straight from `core/forms.py`
  and validated by the same Django forms, so field rules live in one place. The older mobile API in `core/api.py` is unchanged.
- Colours, spacing and animations are the same Tailwind setup as before (`frontend/tailwind.config.js`, `frontend/src/index.css`).

## Run locally
```
# 1) backend
python -m venv .venv && source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_demo          # optional sample listings
# 2) frontend, one of:
(cd frontend && npm install && npm run build) && python manage.py runserver     # site at http://127.0.0.1:8000
#    or, while editing React code (hot reload):  python manage.py runserver   and in another terminal   cd frontend && npm run dev   -> http://localhost:5173
```
Admin: /admin/ · Staff console: /console/ · Mobile API: /api/ · Sitemap: /sitemap.xml
If you see "Frontend not built yet", run the npm build above.

## How it works
- Every form saves a **Lead** (status: New > Contacted > House suggested > Viewing arranged > Connected > Completed > Closed), then offers a WhatsApp click-to-chat with the details pre-filled.
- Landlord submissions arrive as **pending** properties with 2 photos. In Admin use the actions: approve, reject, mark AMOX Verified, feature, mark unavailable.
- Photos are converted to WebP (max 1400px) with 480px thumbnails on upload.
- Institution pages (`/houses/near/<slug>/`) sort by distance. Add institutions and per-house distances in Admin.
- API for mobile apps: `GET /api/properties/?type=Bedsitter&max_rent=8000&near=mku-malindi`, `GET /api/institutions/`, `POST /api/leads/` (throttled).

## Production
Set `DEBUG=0`, `SECRET_KEY`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `DATABASE_URL=postgres://...`. Then run `./build.sh` (builds React, runs `collectstatic`) and start `gunicorn amox.wsgi`.
The host needs Node.js 18+ only at build time. Serve `media/` via your host or object storage.

## Not built yet (Phase 2)
Landlord/user accounts and dashboards, reviews, maps, search-term analytics, notifications.

## Building the staff-console CSS
The staff console and the server 404 page still use compiled Tailwind CSS (`core/static/core/site.css`). After changing the console templates, rebuild it:

    npm i -D tailwindcss@3
    npx tailwindcss -c tailwind.config.js -i core/static/src/input.css -o core/static/core/site.css --minify

Hero images live in `core/static/core/` (`hero-desktop.webp`, `hero-mobile.webp`, `og.jpg`).

## Quick start (local)
    python -m venv venv && venv\Scripts\activate     # Windows (use: source venv/bin/activate on Mac/Linux)
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py createsuperuser
    python manage.py seed_demo          # sample houses
    python manage.py seed_partners      # sample partners (labelled "demo", delete before launch)
    python manage.py runserver

Admin: /admin/  ·  Staff dashboard: /dashboard/

## Going live (environment variables)
SECRET_KEY, ALLOWED_HOSTS (comma separated), CSRF_TRUSTED_ORIGINS (https URL of the site), DATABASE_URL (optional),
EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD (lead alert emails). The live server will not start without SECRET_KEY and ALLOWED_HOSTS.
