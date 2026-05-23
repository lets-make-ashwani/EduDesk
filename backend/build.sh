#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py makemigrations --noinput
python manage.py migrate

# Automatically create superuser (fails gracefully if it already exists)
python manage.py createsuperuser --noinput || true