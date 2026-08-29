from .development import *

DATABASES['default']['NAME'] = env('E2E_DB_NAME', default='mistri_e2e')

# Django's default password hasher is deliberately slow (that's the point,
# in production). Registering dozens of throwaway accounts per test run
# doesn't need that cost.
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'