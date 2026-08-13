import { Component, OnInit, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { environment } from '../../environments/environment';

const WORKER_CALLBACK_URL = `${environment.workerUrl}/mobile-sso/callback`;

type Status = 'waiting' | 'processing' | 'success' | 'error';

const ERROR_MESSAGES: Record<string, string> = {
  token_invalid_on_moodle:
    'Tu token de Moodle está expirado o fue revocado por el servidor de tu universidad.',
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  status: Status = 'waiting';
  message = 'Listo para recibir tokens de Moodle.';
  errorCode: string | null = null;
  manageTokensUrl: string | null = null;
  countdown = 0;
  readonly version = environment.appVersion;
  readonly commit = environment.appCommit;

  constructor(private zone: NgZone) {}

  ngOnInit() {
    App.addListener('appUrlOpen', (event) => {
      this.zone.run(() => this.handleMoodleyUrl(event.url));
    });

    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        this.zone.run(() => this.handleMoodleyUrl(result.url));
      }
    });
  }

  private async handleMoodleyUrl(url: string) {
    let token: string | null = null;

    if (url.startsWith('moodlemobile://')) {
      const m = url.match(/[?&]?token=([^&]+)/);
      token = m ? decodeURIComponent(m[1]) : null;
    } else if (url.includes('/mobile-sso/callback')) {
      try {
        token = new URL(url).searchParams.get('token');
      } catch {
        token = null;
      }
    }

    if (!token) {
      this.status = 'error';
      this.errorCode = null;
      this.message = 'No se encontró el token en el enlace.';
      return;
    }

    this.status = 'processing';
    this.errorCode = null;
    this.manageTokensUrl = null;
    this.message = 'Conectando con Moodley...';

    try {
      const response = await fetch(WORKER_CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json() as { ok: boolean; error?: string; manage_tokens_url?: string };

      if (!response.ok || !data.ok) {
        const code = data.error ?? `http_${response.status}`;
        const manageUrl = data.manage_tokens_url ?? null;
        const err = new Error(code) as Error & { manage_tokens_url?: string };
        err.manage_tokens_url = manageUrl ?? undefined;
        throw err;
      }

      this.status = 'success';
      this.message = '¡Sesión iniciada! Vuelve a Telegram.';
      this.startCountdown();
    } catch (err: unknown) {
      this.status = 'error';
      const code = err instanceof Error ? err.message : String(err);
      this.errorCode = code;
      this.message = ERROR_MESSAGES[code] ?? `Error: ${code}`;
      if (err instanceof Error && 'manage_tokens_url' in err) {
        this.manageTokensUrl = (err as Error & { manage_tokens_url?: string }).manage_tokens_url ?? null;
      }
    }
  }

  openManageTokens() {
    const url = this.manageTokensUrl ?? 'https://eduvirtual.unab.edu.sv/user/managetoken.php';
    window.open(url, '_system');
  }

  private startCountdown() {
    this.countdown = 3;
    const timer = setInterval(() => {
      this.zone.run(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
          App.minimizeApp();
        }
      });
    }, 1000);
  }
}
