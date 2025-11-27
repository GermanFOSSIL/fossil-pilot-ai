# FOSSIL Completions AI Pilot

Capa de inteligencia para Systems Completions e ITRs en proyectos Oil & Gas.

## 🏗️ Arquitectura

Esta aplicación es un piloto que simula la "capa de inteligencia" que se conectaría con:
- GoTechnology® (CMS de completions)
- SAP (ERP corporativo)
- Power BI (visualización de datos)
- SharePoint (gestión documental)

El piloto utiliza **datos de ejemplo** de un proyecto EPF real para demostrar las capacidades del sistema.

## 🚀 Características

- **Dashboard de Proyectos y Sistemas**: Visualización de KPIs en tiempo real
- **Vista de Subsistemas**: Detalle de ITRs, Punch Lists y Preservación
- **Copiloto IA**: Asistente inteligente para análisis de completions
- **Historial de Insights**: Registro de análisis generados
- **Autenticación**: Sistema de login/registro con roles

## 📊 Modelo de Datos

### Tablas Principales

- `projects`: Proyectos (EPF, plantas, ductos)
- `systems`: Sistemas críticos del proyecto
- `subsystems`: Subsistemas dentro de cada sistema
- `tags`: Tags/equipos individuales
- `itrs`: Inspection Test Records (A: construcción, B: precomisionado)
- `punch_items`: Lista de punch por categoría (A/B/C)
- `preservation_tasks`: Tareas de preservación de equipos
- `ai_insights`: Historial de análisis del copiloto IA
- `user_profiles`: Perfiles de usuario con roles

### Roles de Usuario

- **ADMIN**: Puede crear y editar datos
- **MANAGER**: Gestión general
- **QAQC**: Quality Assurance / Quality Control
- **PRECOM**: Precomisionado
- **VIEWER**: Solo lectura

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Lovable Cloud (Supabase)
- **Base de Datos**: PostgreSQL
- **IA**: Lovable AI Gateway (Google Gemini)
- **Gráficos**: Recharts

## 🏃 Cómo Ejecutar

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

Las siguientes variables se configuran automáticamente a través de Lovable Cloud:

- `VITE_SUPABASE_URL`: URL del proyecto Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY`: API key pública
- `LOVABLE_API_KEY`: API key para el copiloto IA (configurada automáticamente)

## 🔐 Datos de Prueba

### Proyecto de Ejemplo

**Proyecto**: EPF Bajada de Añelo – LACA32
- **Sistemas**:
  - 101P_02C – Oil Processing Train
  - 101EL_02E – Power Distribution
- **Subsistemas**: 5 subsistemas con estado variado
- **Tags**: 17 equipos/instrumentos
- **ITRs**: 40+ registros (A y B)
- **Punch Items**: 10 items de diferentes categorías
- **Preservación**: 7 tareas (algunas vencidas)

### Usuario de Demo

Para acceder al sistema, regístrate con cualquier email o usa:
- **Email**: Cualquier email válido
- **Password**: Cualquier contraseña (mínimo 6 caracteres)

El primer usuario registrado tendrá rol VIEWER. Para cambiar roles, ejecuta:

```sql
UPDATE user_profiles 
SET role = 'ADMIN' 
WHERE email = 'tu-email@example.com';
```

## 📱 Páginas de la Aplicación

1. **/** - Dashboard principal con selección de proyecto/sistema
2. **/systems/:systemId** - Dashboard detallado del sistema con KPIs y gráficos
3. **/systems/:systemId/subsystems/:subsystemId** - Detalle del subsistema
4. **/copilot** - Copiloto IA para consultas sobre el proyecto
5. **/insights** - Historial de análisis generados por la IA

## 🤖 Copiloto IA

El copiloto analiza datos de ITRs, Punch Lists y Preservación para responder preguntas como:

- "¿Qué falta para que este sistema esté listo para energización?"
- "Mostrame un resumen de ITR B pendientes por disciplina"
- "¿Cuáles son los punch críticos A que bloquean el handover?"

### Cómo Funciona

1. Selecciona proyecto y sistema
2. Haz una pregunta o usa las preguntas rápidas
3. El copiloto:
   - Consulta la base de datos
   - Construye contexto con datos relevantes
   - Usa Lovable AI (Google Gemini) para generar respuesta
   - Guarda el análisis en la tabla `ai_insights`

## 📈 Cálculo de KPIs

Los KPIs se calculan en tiempo real mediante funciones en `src/lib/kpis.ts`:

- **% ITR A/B Completados**: `completados / total * 100`
- **Estado del Sistema**: 
  - Si hay punch A abiertos → Crítico
  - Si falta ITR B → No listo para energización
- **Preservación Vencida**: `next_due_date < hoy`

## 🎨 Sistema de Diseño

Paleta de colores industrial:

- **Primario**: Azul oscuro (`hsl(215 35% 25%)`)
- **Secundario**: Índigo (`hsl(245 50% 58%)`)
- **Warning**: Naranja (`hsl(30 95% 55%)`)
- **Success**: Verde (`hsl(142 70% 45%)`)
- **Destructive**: Rojo (`hsl(0 85% 60%)`)

Todos los colores están definidos en `src/index.css` y `tailwind.config.ts` usando tokens semánticos.

## 🔄 Próximos Pasos

Para producción, integrar con:

1. **GoTechnology® API**: Sincronización automática de ITRs y punch
2. **SAP**: Datos de materiales, órdenes de trabajo, recursos
3. **Power BI**: Dashboards corporativos
4. **SharePoint**: Gestión documental y certificados

## 📚 Documentación Adicional

- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud)
- [Lovable AI Docs](https://docs.lovable.dev/features/ai)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Contribución

Este es un proyecto piloto para demostración de concepto.

## 📄 Licencia

Propietario: FOSSIL / Wood Group
