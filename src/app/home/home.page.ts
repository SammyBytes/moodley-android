import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';

const WORKER_CALLBACK_URL = 'https://moodley-nightly.samuelbeato7.workers.dev/mobile-sso/callback';

type Status = 'waiting' | 'processing' | 'success' | 'error';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  status: Status = 'waiting';
  message = 'Abre un enlace de Moodle para iniciar sesión.';

  ngOnInit() {
    App.addListener('appUrlOpen', (event) => {
      this.handleMoodleyUrl(event.url);
    });

    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        this.handleMoodleyUrl(result.url);
      }
    });
  }

  private async handleMoodleyUrl(url: string) {
    let token: string | null = null;

    // Case 1: moodley://token=BASE64 (custom scheme from Moodle)
    if (url.startsWith('moodley://')) {
      const m = url.match(/[?&]?token=([^&]+)/);
      token = m ? decodeURIComponent(m[1]) : null;
    }
    // Case 2: https://worker/mobile-sso/callback?token=BASE64 (Android App Link)
    else if (url.includes('/mobile-sso/callback')) {
      try {
        token = new URL(url).searchParams.get('token');
      } catch {
        token = null;
      }
    }

    if (!token) {
      this.status = 'error';
      this.message = '❌ No se encontró el token en el enlace.';
      return;
    }

    this.status = 'processing';
    this.message = '⏳ Conectando con Moodley...';

    try {
      const response = await fetch(WORKER_CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json() as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      this.status = 'success';
      this.message = '✅ ¡Sesión iniciada! Vuelve a Telegram.';
    } catch (err: unknown) {
      this.status = 'error';
      const msg = err instanceof Error ? err.message : String(err);
      this.message = `❌ Error: ${msg}`;
    }
  }
}
