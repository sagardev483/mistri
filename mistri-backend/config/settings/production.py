from .base import *
import dj_database_url

DEBUG = False

# Railway injects one DATABASE_URL string (postgres://user:pass@host:port/db).
# dj-database-url parses that into Django's DATABASES dict for us — but we
# still force the PostGIS backend, because plain psycopg2/postgresql doesn't
# know how to handle the geography column Provider.location uses.
DATABASES = {
    'default': dj_database_url.config(
        default=env('DATABASE_URL'),
        conn_max_age=600,
        engine='django.contrib.gis.db.backends.postgis',
    )
}

# WhiteNoise serves collected static files straight from gunicorn — no
# separate nginx/CDN needed at this scale. It must sit right after
# SecurityMiddleware, before anything else touches the request.
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

# Railway's reverse proxy terminates SSL before the request reaches Django.
# Without this header, request.is_secure() is always False, and
# SECURE_SSL_REDIRECT below would redirect-loop forever.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True

CSRF_TRUSTED_ORIGINS = [o for o in env('CSRF_TRUSTED_ORIGINS', default='').split(',') if o]
CORS_ALLOWED_ORIGINS = [o for o in env('CORS_ALLOWED_ORIGINS', default='').split(',') if o]