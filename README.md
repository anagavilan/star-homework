# StarHomeWork

Unifica tus tareas de Google Classroom y las tuyas propias en una sola lista inteligente con un diseño premium y móvil-first.

## 🚀 Despliegue en Vercel

Este proyecto está listo para ser desplegado en Vercel. Una vez conectado tu repositorio de GitHub, deberás configurar las siguientes variables de entorno:

### 1. Base de Datos (Supabase / Postgres)
- `DATABASE_URL`: Tu cadena de conexión de PostgreSQL.

### 2. Autenticación (Google Cloud Console)
Configura un proyecto en [Google Cloud Console](https://console.cloud.google.com/) con el "OAuth Consent Screen" y crea las credenciales:
- `GOOGLE_CLIENT_ID`: ID de cliente de OAuth 2.0.
- `GOOGLE_CLIENT_SECRET`: Secreto de cliente.
- `NEXTAUTH_SECRET`: Una cadena aleatoria (puedes usar `openssl rand -base64 32`).
- `NEXTAUTH_URL`: La URL de tu sitio en Vercel (ej: `https://vuestra-app.vercel.app`).

### 3. Google Classroom API
Debes habilitar la API de **Google Classroom** en tu proyecto de Google Cloud y asegurarte de que el usuario que inicia sesión tenga los siguientes permisos (scopes) configurados en el consentimiento:
- `classroom.courses.readonly`
- `classroom.coursework.me.readonly`
- `classroom.rosters.readonly`

## ✨ Características

- **Dashboard Unificado**: Lista única de tareas ordenadas por fecha de entrega.
- **Sincronización Automática**: Al iniciar sesión con Google se cargan tus clases y deberes.
- **Gestión Manual**: Añade tareas que no estén en Classroom de forma sencilla.
- **Diseño Responsive**: Optimizado para dispositivos móviles y tablets.
- **Interfaz Premium**: Animaciones fluidas, modo oscuro y estética cuidada.

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4.0
- **Base de Datos**: Prisma ORM + PostgreSQL
- **Autenticación**: NextAuth.js
