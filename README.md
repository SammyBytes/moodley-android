# Moodley Auth — Android App

Mini app de Android que intercepta el esquema `moodley://` y completa el SSO de Moodle.

## ¿Para qué sirve?

Cuando Moodle redirige a `moodley://token=BASE64` tras el login de Google, Android abre esta app automáticamente. La app extrae el token y lo envía al Worker de Moodley, completando la autenticación sin que el usuario tenga que hacer nada más.

## Flujo

```
Telegram Mini App
  → abre browser → eduvirtual.unab.edu.sv/admin/tool/mobile/launch.php
  → Google OAuth login
  → Moodle redirect → moodley://token=BASE64
  → Android intent → esta app
  → POST /mobile-sso/callback
  → Worker notifica al usuario en Telegram ✅
```

## Construir APK

### Pre-requisitos
- Android Studio / Android SDK instalado
- `ANDROID_HOME` configurado en tu PATH

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Construir (build + sync + APK de debug)
./build-apk.sh

# APK quedará en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### APK de Release (para distribución)

```bash
cd android
./gradlew assembleRelease
# Luego firmar con Android Studio o apksigner
```

## Instalar en dispositivo

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

O transferir el APK al teléfono y abrirlo directamente (requiere "Instalar desde fuentes desconocidas").

## Configuración

La URL del Worker está en `src/app/home/home.page.ts`:

```typescript
const WORKER_CALLBACK_URL = 'https://moodley-nightly.samuelbeato7.workers.dev/mobile-sso/callback';
```

Cambiar a la URL de producción cuando corresponda.
