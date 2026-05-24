#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input

# Heal the database from the ephemeral migration crash
python -c "import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edudesk.settings')
django.setup()
from django.db import connection
try: connection.cursor().execute('ALTER TABLE users_user DROP COLUMN IF EXISTS school_id CASCADE;')
except: pass"

python manage.py migrate

# Automatically create superuser (fails gracefully if it already exists)
python manage.py createsuperuser --noinput || true