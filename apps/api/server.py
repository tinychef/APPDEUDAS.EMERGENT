from fastapi import FastAPI, APIRouter, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from config import settings
from auth import verify_token

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class Debt(BaseModel):
    id: str
    nombre: str
    tipo: str
    entidad: str
    monto: float
    tasa_ea: float
    plazo_meses: int
    fecha_desembolso: str
    estrategia: str
    snapshot: Optional[str] = None
    dashboard_layout: Optional[str] = None
    is_archived: int = 0
    created_at: str
    updated_at: str

class Event(BaseModel):
    id: str
    debt_id: str
    tipo: str
    cuota_numero: int
    fecha: str
    monto: float
    descripcion: Optional[str] = None
    es_recurrente: int = 0
    recurrencia: Optional[str] = None
    created_at: str
    updated_at: str
    deleted_at: Optional[str] = None

class Preference(BaseModel):
    theme: str = 'light'
    locale: str = 'es-CO'
    default_dashboard_layout: Optional[str] = None
    updated_at: str

class SyncPayload(BaseModel):
    debts: List[Debt] = []
    events: List[Event] = []
    preferences: Optional[Preference] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate, user_id: str = Depends(verify_token)):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    
    # Agregar el user_id para soportar Multi-tenant isolation
    insert_data = status_obj.dict()
    insert_data["user_id"] = user_id
    
    _ = await db.status_checks.insert_one(insert_data)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(user_id: str = Depends(verify_token)):
    # Restringir la busqueda solo a los datos del tenant
    status_checks = await db.status_checks.find({"user_id": user_id}).to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/import")
async def import_data(payload: SyncPayload, user_id: str = Depends(verify_token)):
    # 1. Debts
    if payload.debts:
        debts_data = [debt.dict() | {"user_id": user_id} for debt in payload.debts]
        # Eliminar las anteriores para el sync o utilizar reemplazo
        await db.debts.delete_many({"user_id": user_id})
        await db.debts.insert_many(debts_data)
        
    # 2. Events
    if payload.events:
        events_data = [event.dict() | {"user_id": user_id} for event in payload.events]
        await db.events.delete_many({"user_id": user_id})
        await db.events.insert_many(events_data)
        
    # 3. Preferences
    if payload.preferences:
        pref_data = payload.preferences.dict() | {"user_id": user_id}
        await db.preferences.update_one(
            {"user_id": user_id},
            {"$set": pref_data},
            upsert=True
        )
        
    return {"message": "Sincronización de importación completada exitosamente"}

@api_router.get("/export", response_model=SyncPayload)
async def export_data(user_id: str = Depends(verify_token)):
    debts = await db.debts.find({"user_id": user_id}, {"_id": 0, "user_id": 0}).to_list(None)
    events = await db.events.find({"user_id": user_id}, {"_id": 0, "user_id": 0}).to_list(None)
    preference = await db.preferences.find_one({"user_id": user_id}, {"_id": 0, "user_id": 0})
    
    return SyncPayload(
        debts=debts,
        events=events,
        preferences=preference if preference else None
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[settings.FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
