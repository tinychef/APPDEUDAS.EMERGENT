# 🧾 App Deudas / Facturas (Emergent)

![Versión](https://img.shields.io/badge/version-1.0.0-blue) ![Licencia](https://img.shields.io/badge/license-MIT-green)

Una aplicación integral diseñada para gestionar deudas, cobros y facturas. Desarrollada con un enfoque "mobile-first" utilizando **React Native / Expo** para el Frontend y **FastAPI + MongoDB** para el Backend.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos partes principales:

1. **Frontend**: Aplicación móvil multiplataforma desarrollada con Expo (React Native). Gestiona la interfaz de usuario, navegación, y consumos a la API backend.
2. **Backend**: API RESTful de alto rendimiento desarrollada con FastAPI en Python. Utiliza Motor para conexiones asíncronas con una base de datos MongoDB.

## 🚀 Tecnologías Principales

### Frontend (Directorio `frontend/`)

- **React Native & Expo**: Framework para desarrollo móvil.
- **Expo Router**: Sistema avanzado de enrutamiento.
- **Zustand**: Gestión del estado global, simple y rápido.
- **React Navigation**: Manejo de las transiciones entre pantallas.

### Backend (Directorio `backend/`)

- **FastAPI**: Framework web asíncrono y de alto rendimiento.
- **Motor (AsyncIOMotorClient)**: Driver asíncrono para interactuar con MongoDB.
- **Uvicorn**: Servidor ASGI recomendado para FastAPI.
- **Pydantic**: Validación de datos.

---

## 🛠️ Instalación y Configuración Local

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior).
- [Python 3.9+](https://www.python.org/).
- Una instancia de [MongoDB](https://www.mongodb.com/) (local o Atlas).

### Configuración del Backend

1. Accede al directorio backend:

   ```bash
   cd backend
   ```

2. Crea el archivo de variables de entorno `.env` en base a tus credenciales (asegúrate de que este archivo no se suba a repositorios públicos):

   ```env
   MONGO_URL=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=app_deudas
   ```

3. Instala las dependencias:

   ```bash
   pip install -r requirements.txt
   ```

4. Ejecuta el servidor de desarrollo:

   ```bash
   uvicorn server:app --reload
   ```

   > El servidor estará disponible en `http://localhost:8000`. Puedes ver la documentación interactiva en `http://localhost:8000/docs`.

### Configuración del Frontend

1. Accede al directorio frontend (en una nueva terminal):

   ```bash
   cd frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   # o si usas yarn
   yarn install
   ```

3. Inicia la aplicación en Expo:

   ```bash
   npm start
   # o
   npx expo start
   ```

   > Escanea el código QR desde la app de Expo Go en tu dispositivo móvil o presiona `a` para abrir en el emulador de Android / `i` para el simulador de iOS.

---

## 📁 Estructura del Proyecto

```text
APPDEUDAS.EMERGENT/
├── backend/                  # Código del servidor (FastAPI)
│   ├── server.py             # Archivo principal de rutas y lógica
│   ├── requirements.txt      # Dependencias de Python
│   └── .env                  # Variables de entorno (ignorado en Git)
│
├── frontend/                 # Código de la aplicación móvil (Expo)
│   ├── app/                  # Rutas base de Expo Router
│   ├── components/           # Componentes reutilizables de UI
│   ├── constants/            # Colores, tipografías y constantes
│   ├── hooks/                # Custom React hooks
│   ├── scripts/              # Scripts utilitarios (ej. reset-project)
│   ├── assets/               # Imágenes, fuentes e íconos
│   ├── package.json          # Dependencias y scripts de Node.js
│   └── app.json              # Configuración de la app Expo
│
├── .gitignore                # Archivos a ignorar en Git
└── README.md                 # Documentación del proyecto
```

## 📜 Licencia

Este proyecto se distribuye bajo la licencia MIT. Eres libre de usar, modificar y distribuir el código.
