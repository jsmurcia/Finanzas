# Finanzas

Aplicación web personal para llevar control de ingresos, egresos y préstamos, y saber en cualquier momento cuánto queda disponible en el mes. Ver [`DESIGN.md`](./DESIGN.md) para el documento de diseño completo (modelo de datos, alcance y decisiones de producto).

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security)
- Tailwind CSS
- Recharts

## Requisitos previos

- Node.js 20 o superior
- Una cuenta y un proyecto en [Supabase](https://supabase.com)
- (Opcional, para trabajar con migraciones) [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)

## Setup

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/jsmurcia/Finanzas.git
cd Finanzas
npm install
```

### 2. Crear el proyecto de Supabase

Crea un proyecto nuevo en [supabase.com](https://supabase.com/dashboard) y aplica el esquema de base de datos ejecutando, en orden, las migraciones de `supabase/migrations/` sobre tu proyecto:

- Con el [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) ya vinculado a tu proyecto (`supabase link`):

  ```bash
  supabase db push
  ```

- O manualmente, pegando el contenido de cada archivo `supabase/migrations/*.sql` (en orden por fecha) en el **SQL Editor** del dashboard de Supabase.

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las credenciales de tu proyecto de Supabase (Project Settings → API):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
```

### 4. Crear un usuario

La app usa Supabase Auth (correo y contraseña) y no tiene registro público abierto en la interfaz. Crea el usuario desde el dashboard de Supabase en **Authentication → Users → Add user**, y usa esas credenciales para iniciar sesión en `/login`.

### 5. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — la primera vez que inicies sesión, la app crea automáticamente una cuenta ("Efectivo") y el set inicial de categorías sugeridas.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo (Turbopack) |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Corre ESLint |

## Despliegue

Pensado para desplegarse en [Vercel](https://vercel.com), configurando las mismas variables de entorno del paso 3 en el proyecto de Vercel.
