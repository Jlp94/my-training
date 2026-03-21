import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastCtrl = inject(ToastController);
  constructor() { }
  async cargarToast(message: string, duration: number, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'bottom',
      mode: 'ios'
    });
    await toast.present();
  }

  async success(message: string) {
    await this.cargarToast(message, 1500, 'success');
  }

  async error(message: string) {
    await this.cargarToast(message, 3000, 'danger');
  }

}
