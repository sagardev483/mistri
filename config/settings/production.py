# config/settings/production.py
import dj_database_url
from .base import *

DEBUG = False

ALLOWED_HOSTS = env('ALLOWED_HOSTS', default='').split(',')
CORS_ALLOWED_ORIGINS = env('CORS_ALLOWED_ORIGINS', default='').split(',')

DATABASES = {
    'default': dj_database_url.config(default=env('DATABASE_URL'))
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
] + MIDDLEWARE[1:]

STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True