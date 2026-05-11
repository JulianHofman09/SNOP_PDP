# SNOP — Comandos para arrancar el proyecto

## Estructura de carpetas

```
SNOP_PDP/
├── frontend-turnos/       ← Pantalla "Mis Turnos" (React Native)
├── backend-turnos/        ← API de turnos (Node.js + Supabase)
├── frontend-juego-libre/  ← Pantallas "Juego Libre" (React Native)
└── backend-juego-libre/   ← API de juego libre (Node.js + Supabase)
```

---

## PASO 1 — Crear las ramas en Git

Abrí una terminal en la carpeta `SNOP_PDP` y ejecutá estos comandos uno por uno:

```bash
# Crear el primer commit vacío para poder crear ramas
git commit --allow-empty -m "init"

# Crear rama de frontend de turnos
git checkout -b feature/frontend-turnos
git add frontend-turnos/
git commit -m "feat: frontend de turnos"

# Volver a main y crear rama de backend de turnos
git checkout main
git checkout -b feature/backend-turnos
git add backend-turnos/
git commit -m "feat: backend de turnos"

# Volver a main y crear rama de frontend de juego libre
git checkout main
git checkout -b feature/frontend-juego-libre
git add frontend-juego-libre/
git commit -m "feat: frontend de juego libre"

# Volver a main y crear rama de backend de juego libre
git checkout main
git checkout -b feature/backend-juego-libre
git add backend-juego-libre/
git commit -m "feat: backend de juego libre"
```

---

## PASO 2 — Instalar dependencias

Abrí 4 terminales (una por carpeta) y ejecutá `npm install` en cada una:

```bash
# Terminal 1 — Frontend Turnos
cd frontend-turnos
npm install

# Terminal 2 — Backend Turnos
cd backend-turnos
npm install

# Terminal 3 — Frontend Juego Libre
cd frontend-juego-libre
npm install

# Terminal 4 — Backend Juego Libre
cd backend-juego-libre
npm install
```

---

## PASO 3 — Configurar Supabase

1. Entrá a https://supabase.com y creá un proyecto gratis
2. En tu proyecto, andá a **Settings > API**
3. Copiá la **URL** y la **anon key**

Luego en cada carpeta de backend:

```bash
# En backend-turnos/
copy .env.example .env
# Abrí el .env y pegá tu URL y clave de Supabase

# En backend-juego-libre/
copy .env.example .env
# Abrí el .env y pegá tu URL y clave de Supabase
```

El archivo `.env` queda así:
```
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
JWT_SECRET=cualquier_texto_largo_secreto_123
PORT=3001
```

---

## PASO 4 — Crear las tablas en Supabase

En Supabase, andá a **SQL Editor** y ejecutá este script:

```sql
-- Tabla de clubes
CREATE TABLE clubes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT,
  ciudad TEXT,
  logo_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sedes
CREATE TABLE sedes (
  id SERIAL PRIMARY KEY,
  club_id INT REFERENCES clubes(id),
  nombre TEXT NOT NULL,
  direccion TEXT,
  horario_apertura TIMESTAMPTZ,
  horario_cierre TIMESTAMPTZ,
  activo BOOLEAN DEFAULT true
);

-- Tabla de mesas
CREATE TABLE mesas (
  id SERIAL PRIMARY KEY,
  sede_id INT REFERENCES sedes(id),
  numero INT NOT NULL,
  activa BOOLEAN DEFAULT true
);

-- Tabla de niveles
CREATE TABLE niveles (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  orden INT
);

-- Insertar niveles
INSERT INTO niveles (nombre, orden) VALUES
  ('Principiante', 1),
  ('Azul', 2),
  ('Intermedio', 3),
  ('Rojo', 4),
  ('Avanzado', 5);

-- Tabla de tipo de usuario
CREATE TABLE tipo_usuario (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

INSERT INTO tipo_usuario (nombre) VALUES ('socio'), ('entrenador'), ('admin');

-- Tabla de usuarios (socios, entrenadores, admins)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tipo_usuario_id INT REFERENCES tipo_usuario(id),
  club_id INT REFERENCES clubes(id),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  telefono TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nivel_id INT REFERENCES niveles(id),
  cuota_al_dia BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMPTZ DEFAULT NOW(),
  rating INT DEFAULT 0,
  clases_dadas INT DEFAULT 0
);

-- Tabla de tipo de turno
CREATE TABLE tipo_turno (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

INSERT INTO tipo_turno (nombre) VALUES ('entrenamiento'), ('clase'), ('juego libre');

-- Tabla de turnos (incluye juego libre)
CREATE TABLE turnos (
  id SERIAL PRIMARY KEY,
  tipo_turno_id INT REFERENCES tipo_turno(id),
  sede_id INT REFERENCES sedes(id),
  mesa_id INT REFERENCES mesas(id),
  user_id INT REFERENCES users(id),
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  duracion_min INT,
  estado BOOLEAN DEFAULT true,
  capacidad_maxima INT DEFAULT 1,
  nivel_minimo_id INT REFERENCES niveles(id),
  nivel_maximo_id INT REFERENCES niveles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de inscripciones a turnos (para juego libre)
CREATE TABLE socio_turno (
  id SERIAL PRIMARY KEY,
  turno_id INT REFERENCES turnos(id),
  user_id INT REFERENCES users(id),
  estado BOOLEAN DEFAULT true,
  fecha_inscripcion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  titulo TEXT,
  descripcion TEXT,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de solicitudes de clase
CREATE TABLE solicitudes_clase (
  id SERIAL PRIMARY KEY,
  solicitante_id INT REFERENCES users(id),
  user_id INT REFERENCES users(id),
  estado BOOLEAN DEFAULT false,
  mensaje TEXT,
  mensaje_respuesta TEXT,
  fecha_propuesta TEXT,
  duracion_min INT,
  turno_id INT REFERENCES turnos(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## PASO 5 — Arrancar los servidores

```bash
# Backend Turnos (puerto 3001)
cd backend-turnos
npm run dev

# Backend Juego Libre (puerto 3002)
cd backend-juego-libre
npm run dev

# Frontend Turnos
cd frontend-turnos
npm start

# Frontend Juego Libre
cd frontend-juego-libre
npm start
```

---

## Verificar que funciona

Abrí el navegador y entrá a:
- http://localhost:3001/health → debe mostrar `{"status":"ok","servicio":"backend-turnos"}`
- http://localhost:3002/health → debe mostrar `{"status":"ok","servicio":"backend-juego-libre"}`

---

## Resumen de endpoints

### Backend Turnos (puerto 3001)
| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/socios/:id/turnos` | Lista turnos del socio |
| GET | `/api/socios/:id/turnos/semana?semana=2024-W15` | Turnos de una semana |
| DELETE | `/api/turnos/:id` | Cancela un turno |

### Backend Juego Libre (puerto 3002)
| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/juego-libre` | Lista eventos disponibles |
| GET | `/api/juego-libre/:id` | Detalle de un evento |
| POST | `/api/juego-libre/:id/inscribir` | Se anota al evento |
| DELETE | `/api/juego-libre/:id/inscripcion` | Cancela inscripción |
