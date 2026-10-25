#!/usr/bin/env sh
# Build the React frontend into core/static/app, then collect static files for production.
set -e
(cd frontend && npm install && npm run build)
python manage.py collectstatic --noinput
