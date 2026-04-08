# MyTraining - Cliente App 📱

Esta es la aplicación móvil para los clientes de MyTraining, desarrollada con **Ionic Framework** y **Angular**. Permite a los usuarios seguir sus planes de entrenamiento, registrar su peso y pasos, y consultar su dieta.

---

## 🚀 Puesta en Marcha

Sigue estos pasos para ejecutar la aplicación en tu entorno local.

### Requisitos Previos
*   **Node.js** (v20+)
*   **pnpm** (instalado globalmente: `npm install -g pnpm`)
*   **Ionic CLI** (opcional, pero recomendado: `npm install -g @ionic/cli`)

### Instalación
1.  Entra en la carpeta del proyecto:
    ```bash
    cd Cliente/app_training
    ```
2.  Instala las dependencias:
    ```bash
    pnpm install
    ```

### Ejecución
Para iniciar el servidor de desarrollo, ejecuta:
```bash
pnpm start
```
O si prefieres usar el comando nativo de Ionic:
```bash
ionic serve
```
La aplicación se abrirá automáticamente en `http://localhost:8100`.

---

## 🛠️ Tecnologías Principales

*   **Ionic 8 / Angular 19+**: Framework para desarrollo móvil híbrido.
*   **Signals & rxResource**: Gestión de estado reactiva y moderna.
*   **Chart.js**: Visualización de progreso en gráficos.
*   **Swiper.js**: Carruseles y navegación táctil.

---

## 📁 Estructura del Proyecto

*   `src/app/pages/`: Vistas principales de la aplicación.
*   `src/app/services/`: Servicios de comunicación con la API.
*   `src/app/components/`: Componentes reutilizables.
*   `src/app/common/interfaces.ts`: Definiciones de tipos y modelos.

---
© 2026 - Proyecto de Fin de Ciclo. Desarrollado por Jose Luis Prieto.
