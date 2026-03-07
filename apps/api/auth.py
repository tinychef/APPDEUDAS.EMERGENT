import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        # Supabase JWT default audience is "authenticated"
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False} # Some supabase tokens don't explicitly set the 'aud' claim to authenticated for simple setups, safe to ignore if signature is solid
        )
        user_id = payload.get("sub")
        if not user_id:
            raise jwt.InvalidTokenError()
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado. Por favor, inicie sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas o token mal formado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
