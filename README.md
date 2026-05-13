<div align="center">
  <img src="https://www.uan.edu.co/" alt="Logo" width="100" />
  <h1>🛡️ Cyber-Lab: Seguridad Web Educativa</h1>
  <p><em>Un "Mini-Twitter" interactivo diseñado para enseñar ciberseguridad mediante la comparación de código vulnerable y código seguro bajo los estándares de OWASP.</em></p>

  <p>
    <a href="https://cyber-lab-demo.vercel.app">Ver Demo en Vivo</a>
    ·
    <a href="#características">Características</a>
    ·
    <a href="#vulnerabilidades-exploradas">Vulnerabilidades Exploradas</a>
  </p>
</div>

---

## 📖 Sobre el Proyecto

**Cyber-Lab** es una plataforma educativa de doble cara. La aplicación permite a los usuarios alternar entre un **Modo Vulnerable** (lleno de agujeros de seguridad clásicos) y un **Modo Seguro** (blindado con buenas prácticas). 

El objetivo es permitir a estudiantes, desarrolladores y entusiastas de la ciberseguridad observar, explotar y comprender cómo las malas prácticas de programación pueden comprometer un sistema entero, y cómo solucionarlo adecuadamente.

---

## ⚡ Modos de Operación

### 🔴 Modo Vulnerable (El patio de juegos de los hackers)
En esta versión de la aplicación, todas las defensas están abajo intencionalmente. Aquí puedes:
* **Inyectar código malicioso (XSS):** Escribir scripts (`<script>alert(1)</script>`) en las publicaciones que se ejecutarán en los navegadores de los demás usuarios conectados.
* **Escalar privilegios (IDOR):** Modificar, editar o eliminar usuarios sin ser administrador, interceptando y modificando peticiones a la API.
* **Ver contraseñas en texto plano:** El panel de administración (accesible para cualquiera si conocen la ruta) expone las contraseñas de todos los usuarios sin ningún tipo de cifrado.
* **Suplantar identidad:** Los endpoints confían ciegamente en los IDs de usuario enviados desde el cliente sin validarlos en el servidor.

### 🟢 Modo Seguro (El estándar de la industria)
En esta versión, se aplican estrictas medidas de seguridad basadas en el **OWASP Top 10**:
* **Sanitización de Entradas:** Todas las publicaciones pasan por un filtro riguroso (`DOMPurify`) antes de ser renderizadas, neutralizando cualquier intento de inyección XSS.
* **Criptografía Fuerte:** Las contraseñas nunca se guardan crudas. Se protegen utilizando algoritmos de hashing fuertes (`bcryptjs` con 10 rondas de salt).
* **Control de Acceso (Autorización):** El panel de administración exige y valida criptográficamente que el usuario posea el rol de `admin` antes de procesar cualquier solicitud (`GET`, `PUT`, `DELETE`).
* **Verificación de Identidad:** No se puede publicar ni alterar contenido en nombre de otro usuario. El backend exige pruebas de sesión y verifica al propietario del recurso.

---

## 🚀 Características Principales

- **Sesión Unificada (Cross-Mode):** ¡La magia del sistema! Inicias sesión una vez y puedes cambiar entre el lado seguro y vulnerable manteniendo tu identidad, gracias a la sincronización en tiempo real de bases de datos duales.
- **Mensajería en Tiempo Real:** Un feed global que se actualiza constantemente. Publica desde un navegador y velo aparecer al instante en el otro mediante *short-polling*.
- **Radar de Usuarios:** Sistema de *Heartbeat* que muestra qué usuarios están conectados ahora mismo y en qué modo (vulnerable o seguro) están navegando.
- **Panel de Administración Dinámico:** Un dashboard que revela crudas realidades en su versión vulnerable, y restringe el acceso como debe ser en su versión segura.

---

## 🛠️ Stack Tecnológico

Este proyecto fue construido priorizando el rendimiento, la escalabilidad y las capacidades modernas de la web:

- **Frontend:** React 19, Next.js 16 (App Router), TailwindCSS v3.
- **Backend:** Next.js Serverless Route Handlers.
- **Base de Datos:** Supabase (PostgreSQL) con tablas espejadas (`perfiles_seguros` vs `perfiles_vulnerables`).
- **Seguridad / Utils:** `bcryptjs` (Hashing), `dompurify` (Sanitización XSS).
- **Despliegue:** Vercel (CI/CD Automático).

---

## 💡 Instalación Local

Si deseas correr este laboratorio de hacking en tu propia máquina:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Bromeropk12/seguridad.git
   cd seguridad
   ```

2. **Instala las dependencias:**
   ```bash
   pnpm install
   ```

3. **Configura el entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto y agrega tus llaves de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) y comienza la demostración.

---

## ⚠️ Descargo de Responsabilidad

Este repositorio y su código han sido creados **únicamente con fines educativos y académicos**. Las técnicas descritas e implementadas en el "Modo Vulnerable" no deben ser utilizadas en sistemas de producción reales sin consentimiento. El autor no se hace responsable del mal uso de las vulnerabilidades aquí expuestas. **Hackea con ética.**
