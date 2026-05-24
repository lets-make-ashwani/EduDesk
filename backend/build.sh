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
try:
    with connection.cursor() as c:
        c.execute('ALTER TABLE users_user ADD COLUMN school_id bigint NULL REFERENCES core_school(id);')
except: pass
try:
    with connection.cursor() as c:
        c.execute('DROP TABLE users_parentprofile;')
except: pass"

python manage.py makemigrations --noinput || true
python manage.py migrate || true

# Automatically create superuser (fails gracefully if it already exists)
python manage.py createsuperuser --noinput || true