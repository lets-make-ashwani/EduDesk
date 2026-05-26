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

# Force-fake users 0003 since the schema was manually updated in production
python manage.py migrate users 0003 --fake || true

# Run remaining migrations
python manage.py migrate || true

# Automatically create or update superuser matching Render environment variables
python -c "import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edudesk.settings')
django.setup()
from users.models import User
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
if username and password:
    user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_superuser': True, 'is_staff': True, 'role': 'SUPERADMIN'})
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.role = 'SUPERADMIN'
    user.email = email
    user.save()
    print('Superuser created/updated successfully.')
else:
    print('No superuser credentials defined in environment variables.')"