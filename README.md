# FinFlow 💸 — Sistema PWA de Monitoreo de Gastos, Cuentas y Tarjetas de Crédito

**FinFlow** es una Progressive Web App (PWA) moderna, rápida y 100% orientada a la privacidad, diseñada para el control inteligente de finanzas personales, múltiples cuentas bancarias, billeteras de efectivo y tarjetas de crédito con compras en cuotas y ciclos de facturación personalizados.

Opera bajo el modelo **offline-first**: todos los datos residen en el navegador del dispositivo (`LocalStorage`) sin enviar información privada a servidores remotos. Es instalable directamente en la pantalla de inicio de teléfonos móviles (iOS / Android) y computadoras sin pasar por tiendas de aplicaciones.

---

## 🚀 Características Principales

### 1. Asistente de Configuración Inicial (Onboarding)
- **Inicio en Cero**: La aplicación comienza vacía y lista para registrar los datos reales del usuario.
- **Wizard paso a paso**:
  - Selección de **moneda principal** (`$`, `CLP`, `ARS`, `USD`, `EUR`, `MXN`, `COP`, `S/`, etc.).
  - Configuración inicial de cuentas líquidas y saldos iniciales disponibles.
  - Configuración de tarjetas de crédito con día de corte y día de vencimiento de pago.
  - Botón de reinicio o carga de datos demo accesible en cualquier momento desde *Ajustes*.

### 2. Gestión Multicuenta y Tarjetas
- **Cuentas Líquidas**: Seguimiento de cuentas corrientes bancarias, cajas de ahorro y efectivo en mano.
- **Tarjetas de Crédito y Líneas de Financiamiento**:
  - Control de saldo adeudado y crédito disponible en tiempo real con barra de consumo.
  - **Ciclos de facturación personalizados**: Día de cierre (corte) y Día de vencimiento (pago).
  - Contador de días restantes para el cierre y para la fecha límite de pago.
  - Estimación automática del monto a pagar en el próximo resumen de cada tarjeta.
  - **Botón "Pagar Resumen"**: Amortiza la deuda transfiriendo fondos desde la cuenta bancaria sin duplicar gastos.

### 2. Compras en Cuotas y Convenios
- Selector de compras en **1, 2, 3, 6, 9, 12, 18, 24 y 36 cuotas**.
- Soporte para **"Cuotas sin interés"** o con recargo financiero porcentual.
- Cálculo automático del valor de cada cuota y desglose de avance mensual (ej. *"Cuota 2 de 6"* con monto restante).

### 3. Dashboard Ejecutivo y Analítica Visual
- **Patrimonio Neto real**: `Activos líquidos totales - Deuda total de crédito`.
- Balance y métricas del mes en curso (Total Ingresos, Total Gastos, Capacidad y Tasa de Ahorro).
- **Gráficos interactivos**:
  - Distribución de gastos por categoría (gráfico donut).
  - Evolución histórica semestral (comparativa de Ingresos vs. Gastos mes a mes).
  - Top 5 de gastos mayores del período.

### 4. Filtros Avanzados y Búsqueda
- Buscador en tiempo real por concepto, categoría o notas.
- Filtros simultáneos por Tipo (Ingreso, Gasto, Transferencia), Cuenta, Categoría y Período mensual.

### 5. Boletas y Comprobantes (Cámara o Archivo)
- Permite tomar fotos de boletas y tickets directamente con la cámara del teléfono o seleccionarlas de la galería / archivos.
- **Compresión local inteligente**: Reduce fotos pesadas de teléfonos (5MB-15MB) a ~50KB-80KB automáticamente usando Canvas antes de guardar, garantizando nitidez en los números y fechas sin saturar el almacenamiento local.
- **Visor Lightbox**: Visualizador emergente para revisar la boleta ampliada en pantalla completa y opción de descarga.

### 6. Respaldo y Portabilidad Total
- **Exportación a CSV**: Compatible con Microsoft Excel, Apple Numbers y Google Sheets.
- **Copia de Seguridad en JSON**: Guarda un archivo completo de tus datos (incluyendo boletas adjuntas) para respaldarlo o transferirlo entre dispositivos.
- **Restaurador de JSON**: Permite migrar o restaurar tus finanzas con un solo clic.

---

## 📱 Instalación en Teléfonos Móviles (PWA)

FinFlow no requiere descargas desde App Store ni Google Play. Al abrirse en el navegador del teléfono:

- **En iPhone (Safari)**:
  1. Abre el enlace de la app.
  2. Toca el botón de **Compartir** (ícono de caja con flecha arriba).
  3. Selecciona **"Agregar a pantalla de inicio"**.
  4. Pulsa **"Agregar"**. La app se abrirá en pantalla completa como una aplicación nativa.
- **En Android (Google Chrome)**:
  1. Abre el enlace de la app.
  2. Toca el menú de tres puntos (⋮).
  3. Selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.

---

## ☁️ Despliegue en la Nube (Hosting Gratuito en Vercel)

El proyecto incluye el archivo de configuración `vercel.json` y la estructura lista para desplegarse con un solo comando:

```bash
# Desde la carpeta del proyecto
npx vercel
```

Sigue las instrucciones de la consola:
1. Inicia sesión con GitHub, Google o email.
2. Acepta los valores por defecto (Vite detectará el framework automáticamente).
3. ¡Listo! Vercel te proporcionará una URL pública segura con HTTPS (ej. `https://tu-finflow.vercel.app`) para ingresar desde tu teléfono o compartir.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: React 19 + TypeScript + Vite.
- **Diseño & Estilos**: Tailwind CSS con diseño adaptativo móvil/desktop y modo oscuro sobrio.
- **Iconografía**: Lucide React (iconos SVG de trazo consistente).
- **Animaciones & Microinteracciones**: Canvas Confetti para celebración de pagos de deudas.
- **Almacenamiento**: LocalStorage API del navegador con datos semilla de ejemplo.

---

## 💻 Desarrollo Local

### Requisitos Previos
- Node.js (versión 18 o superior).
- npm (incluido con Node.js).

### Instalación de Dependencias
```bash
npm install
```

### Iniciar Servidor de Desarrollo con Acceso Móvil
Para probar la app en tu teléfono conectado a la misma red WiFi:
```bash
npm run dev -- --host
```
La terminal mostrará tu IP local (por ejemplo `http://192.168.1.45:5173`). Puedes ingresar a esa dirección directamente desde el navegador de tu celular.

### Compilar para Producción
```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
finflow-gastos/
├── public/
│   ├── icon.svg                 # Ícono SVG para favicon y PWA
│   └── manifest.webmanifest     # Manifiesto PWA para instalación móvil
├── src/
│   ├── components/
│   │   ├── Accounts/            # Tarjetas bancarias, límites y ciclos de corte
│   │   ├── Analytics/           # Gráficos de distribución y evolución
│   │   ├── Dashboard/           # Métricas de patrimonio neto y resúmenes
│   │   ├── Modals/              # Formularios de transacciones, cuentas y pago TC
│   │   ├── Settings/            # Respaldo JSON/CSV y guía PWA
│   │   ├── Header.tsx           # Navegador de meses y acciones rápidas
│   │   └── Navigation.tsx       # Barra de pestañas desktop y bottom bar móvil
│   ├── context/
│   │   └── FinanceContext.tsx   # Estado global y persistencia LocalStorage
│   ├── data/
│   │   └── seedData.ts          # Datos iniciales realistas con cuotas
│   ├── types/
│   │   └── index.ts             # Definiciones de tipos TypeScript
│   ├── utils/
│   │   └── financeCalculators.ts# Cálculos de ciclos, cuotas y patrimonio
│   ├── App.tsx                  # Enrutador de pestañas y modales
│   ├── index.css                # Estilos base Tailwind y safe-areas móvil
│   ├── main.tsx                 # Montaje en el DOM
│   └── vite-env.d.ts            # Tipos de cliente Vite
├── vercel.json                  # Configuración de despliegue en Vercel
├── package.json                 # Scripts y dependencias
└── tailwind.config.js           # Configuración de diseño Tailwind
```
