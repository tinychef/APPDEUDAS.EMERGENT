from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URL: str
    DB_NAME: str = "freedeuda"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:8081" # Default para desarrollo Expo Web/Localhost
    
    class Config:
        env_file = ".env"

settings = Settings()
