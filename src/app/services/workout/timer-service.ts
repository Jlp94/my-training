import { Injectable, signal, inject } from '@angular/core';
import { ToastService } from '../ui/toast-service';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private readonly toastService = inject(ToastService);
  private alarmAudio = new Audio('assets/sounds/campana-de-box.mp3');
  private timerId: any = null;
  private endTime: number = 0;

  timerSeconds = signal(0);
  timerRunning = signal(false);

  /**
   * Inicia un temporizador basado en timestamps para mayor precisión.
   * @param seconds Segundos de descanso
   */
  startTimer(seconds: number) {
    // Si ya hay uno, lo limpiamos
    this.stopTimerInternal();

    // Guardamos el momento exacto en el que debe terminar
    this.endTime = Date.now() + seconds * 1000;
    this.timerSeconds.set(seconds);
    this.timerRunning.set(true);

    this.toastService.cargarToast(`Descanso: ${seconds}s`, 2000, 'primary');

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private tick() {
    const now = Date.now();
    const remaining = Math.max(0, Math.round((this.endTime - now) / 1000));
    
    this.timerSeconds.set(remaining);

    if (remaining <= 0) {
      this.finishTimer();
    }
  }

  private finishTimer() {
    this.stopTimerInternal();
    
    // Reproducir alarma
    this.alarmAudio.currentTime = 0;
    this.alarmAudio.play().catch(err => console.log('Error al reproducir audio:', err));
    
    this.toastService.success('¡A darle! 🔔');
  }

  /**
   * Cancela el timer actual
   */
  stopTimer() {
    if (this.timerRunning()) {
      this.stopTimerInternal();
      this.toastService.error('Alarma cancelada');
    }
  }

  private stopTimerInternal() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.timerSeconds.set(0);
    this.timerRunning.set(false);
  }
}
