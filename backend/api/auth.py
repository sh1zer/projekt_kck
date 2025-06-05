import jwt
from datetime import datetime, timedelta
from django.conf import settings

# Dummy credentials for proof of concept
DUMMY_CREDENTIALS = {
    "admin": "admin123",
    "user": "user123"
}

def generate_token(username):
    """Generate a JWT token for the given username"""
    payload = {
        'username': username,
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def verify_credentials(username, password):
    """Verify if the provided credentials are valid"""
    return (
        username in DUMMY_CREDENTIALS 
        and DUMMY_CREDENTIALS[username] == password
    ) 