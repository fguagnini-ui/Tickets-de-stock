# Tickets de Stock - Mecano Tools

Sistema web para la gestión de reportes de stock, control de ingresos, productos encontrados y movimientos de inventario con **Base de Datos en la Nube en Tiempo Real (Firebase Cloud Firestore)**.

---

## ☁️ Base de Datos en la Nube (Firebase Cloud Firestore)

La aplicación cuenta con sincronización instantánea y multiusuario a través de **Google Cloud Firestore**:
- **Sincronización en tiempo real:** Cuando un usuario (Franco, Matías, operarios de depósito) carga un ticket, cambia un estado o confirma un movimiento, la información se actualiza en vivo en todas las pantallas y celulares conectados sin recargar la página.
- **Acceso:** Disponible con credenciales o mediante autenticación directa con Google.
- **Persistencia garantizada:** Los datos están alojados de forma segura en los servidores de Google Cloud.

---

## 🌐 URLs de Acceso Online Inmediato

La aplicación está desplegada en Google Cloud Run y lista para utilizar:
- **URL Compartida:** `https://ais-pre-i5vxsup7pyghxbvbkjmohz-762232524396.us-east1.run.app`

---

## 🚀 Despliegue en GitHub Pages (Opcional)

Este proyecto también es 100% compatible para publicarse en **GitHub Pages**:

### Método 1: GitHub Actions (Automático)
1. Sube este repositorio a GitHub (rama `main` o `master`).
2. En tu repositorio en GitHub, ve a **Settings** > **Actions** > **General** y en **Workflow permissions** activa **"Read and write permissions"**.
3. En **Settings** > **Pages**, en la sección **Build and deployment** > **Source**, selecciona:
   👉 **GitHub Actions**

### Método 2: Despliegue Manual con `npm run deploy`
```bash
npm install
npm run deploy
```
Luego en **Settings** > **Pages** de GitHub, selecciona la rama `gh-pages`.

---

## 💻 Desarrollo Local

```bash
npm install
npm run dev
```

El servidor iniciará en `http://localhost:3000`.

---

## 🔐 Credenciales de Acceso
- **Usuario:** `Mecanotools`
- **Contraseña:** `4846`
- **O botón:** *Continuar con Google*

---

## 💾 Persistencia de Datos y Respaldos

- Al estar alojado como sitio estático en GitHub Pages, los datos se guardan de forma instantánea y persistente en el navegador (`localStorage`).
- **Copia de seguridad:** Puedes descargar en cualquier momento un archivo `database.json` con todos los reportes y movimientos desde la pestaña **Base de Datos** > **Descargar JSON**.
- **Restaurar / Migrar:** Puedes subir un archivo `database.json` en cualquier computadora para sincronizar los datos.
- **Actualizar stock base del repositorio:** Si descargas el `database.json` y reemplazas el archivo en `src/data/database.json`, al subir los cambios a GitHub la nueva versión incluirá ese inventario por defecto.
