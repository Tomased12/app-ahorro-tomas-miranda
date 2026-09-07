# 💰 App de Finanzas Tomas & Miranda

Aplicación web profesional y colaborativa para la gestión de finanzas personales, gastos compartidos (Splitwise) y cálculo del Poder de Ahorro para **Tomas** y **Miranda**.

Construida con **Next.js (App Router)**, **Tailwind CSS**, **TypeScript**, **Firebase Cloud Firestore** (tiempo real mediante `onSnapshot`) y **Recharts**.

---

## 🚀 Características Principales

1. **Gestión de Perfiles ("Tomas" y "Miranda"):**
   - Switcher intuitivo en el Navbar para alternar entre la visión de **Tomas**, **Miranda** o **Hogar**.
2. **Lógica Tipo Splitwise & Balance Compartido:**
   - Cálculo automático de deudas cruzadas: División 50/50, gastos exclusivos y porcentajes personalizados.
   - Tarjeta en tiempo real con el estado: *"Miranda le debe a Tomas: $X"* o *"Tomas le debe a Miranda: $X"*.
   - Botón interactivo de **"Saldar Deuda"** con animación de confeti que genera un movimiento de compensación y deja el balance en cero.
3. **Módulo de Poder de Ahorro:**
   - Fórmula: `Ingresos - Gastos`.
   - Cálculo individual para Tomas y Miranda, y ahorro conjunto del hogar.
   - Barra de salud financiera con porcentaje de ahorro sobre ingresos.
4. **Métricas y Reportes Visuales (Recharts):**
   - Gráfico de barras mensual: Ingresos vs. Gastos.
   - Gráfico Doughnut: Distribución porcentual de gastos por categoría.
5. **Categorías Dinámicas:**
   - Categorías precargadas para servicios esenciales argentinos: Luz (Edenor/Edesur), Gas (Metrogas), ABL, Flow, Tarjetas de Crédito / Deudas Pendientes, Supermercado, Alquiler, Salidas, Transporte y Salud.
   - Creación de nuevas categorías personalizadas sobre la marcha con selector de color.
6. **Mobile-First & Formato ARS:**
   - Botón flotante (+) accesible desde celulares para registrar gastos en segundos.
   - Valores monetarios formateados en Pesos Argentinos (`$ 12.345,00`).
   - Exportación de cualquier historial filtrado a **Excel / CSV** con un solo clic.

---

## 📁 Estructura del Proyecto

```
APP AHORRO/
├── app/
│   ├── globals.css              # Estilos Tailwind y clases glassmorphism
│   ├── layout.tsx               # Shell principal, metadata y viewport mobile
│   └── page.tsx                 # Dashboard reactivo con onSnapshot de Firestore
├── components/
│   ├── BalanceCard.tsx          # Tarjeta Splitwise con botón "Saldar Deuda"
│   ├── CategoryModal.tsx        # Modal para crear nuevas categorías al vuelo
│   ├── FirebaseConfigBanner.tsx # Banner guía y cargador de datos de prueba
│   ├── MetricsCharts.tsx        # Gráficos Recharts (Evolución y Categorías)
│   ├── Navbar.tsx               # Header con switch de usuario y estado online
│   ├── SavingsPowerCard.tsx     # Poder de ahorro individual y del hogar
│   ├── TransactionFilters.tsx   # Filtros por mes, usuario, categoría y estado
│   ├── TransactionList.tsx      # Lista de transacciones con toggle de estado
│   └── TransactionModal.tsx     # Modal flotante para registrar gastos/ingresos
├── lib/
│   ├── finance.ts               # Motor de cálculo Splitwise y métricas
│   ├── firebase.ts              # Inicializador seguro de Firebase / Firestore
│   └── utils.ts                 # Formato ARS, fechas y exportador CSV
├── types/
│   └── index.ts                 # Interfaces TypeScript completas
├── firestore.rules              # Reglas de seguridad para Firebase Console
├── .env.example                 # Plantilla de variables de entorno
└── package.json
```

---

## ⚙️ Paso 1: Configurar Firebase Cloud Firestore

1. Ingresa en [Firebase Console](https://console.firebase.google.com/) con tu cuenta de Google.
2. Haz clic en **"Agregar proyecto"** y nómbralo (por ejemplo: `finanzas-tomas-miranda`).
3. Ve a **Compilación > Firestore Database** y haz clic en **"Crear base de datos"**:
   - Elige una ubicación cercana (ej: `southamerica-east1` en São Paulo o `us-east1`).
   - Inicia en **"Modo de prueba"** o pega el contenido del archivo `firestore.rules`:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /transactions/{transactionId} {
         allow read, write: if true;
       }
       match /categories/{categoryId} {
         allow read, write: if true;
       }
     }
   }
   ```
4. Ve a la **Configuración del Proyecto** (icono de engranaje ⚙️ arriba a la izquierda) > **General**.
5. En la sección **"Tus apps"**, haz clic en el icono web **`</>`**, ponle un apodo y registra la app.
6. Copia las claves que aparecen en el objeto `firebaseConfig` y pégalas en tu archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=finanzas-tomas-miranda.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=finanzas-tomas-miranda
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=finanzas-tomas-miranda.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   ```

---

## 💻 Paso 2: Ejecutar en Desarrollo Local

Para correr el proyecto en tu computadora:

```powershell
# En PowerShell (usando npm.cmd para evitar restricciones de script de Windows)
npm.cmd run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000). Si aún no configuraste Firebase, la app funcionará en **Modo Demo Local** con un botón para cargar datos de prueba al instante.

---

## 🐙 Paso 3: Subir a GitHub

Si tienes Git instalado en tu equipo, ejecuta:

```bash
git init
git add .
git commit -m "feat: app de finanzas completa para Tomas y Miranda"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/app-ahorro-tomas-miranda.git
git push -u origin main
```

*(Si no tienes Git instalado en Windows, puedes instalarlo desde [git-scm.com](https://git-scm.com/) o usar GitHub Desktop).*

---

## ☁️ Paso 4: Despliegue en Vercel (Producción)

1. Ingresa a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." > "Project"**.
3. Selecciona tu repositorio recién creado de GitHub.
4. En la sección **"Environment Variables"**, añade una por una las mismas variables de tu `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Haz clic en **"Deploy"**.
6. ¡Listo! En menos de 2 minutos tendrás tu URL pública (ej: `https://app-ahorro-tomas-miranda.vercel.app`) lista para usar en tu celular y computadora.
