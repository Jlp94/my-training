import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonItem, IonLabel, IonInput, IonButton,
  IonIcon, IonSpinner, IonRow, IonCol, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonList,
  IonText, IonToggle, IonAvatar, AlertController
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { UserService } from 'src/app/services/user/user-service';
import { FoodService } from 'src/app/services/diet/food-service';
import { ToastService } from 'src/app/services/ui/toast-service';
import { Food } from 'src/app/common/diet-interface';
import { CloudinaryService } from 'src/app/services/user/cloudinary-service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, fastFoodOutline, saveOutline, thumbsUpOutline, closeOutline, notificationsOutline, cameraOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings-user',
  templateUrl: './settings-user.page.html',
  styleUrls: ['./settings-user.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner,
    IonRow, IonCol, IonModal, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonList, IonText, IonToggle, IonAvatar
  ]
})
export class SettingsUserPage implements OnInit {

  private readonly userService = inject(UserService);
  private readonly foodService = inject(FoodService);
  private readonly toastService = inject(ToastService);
  private readonly alertCtrl = inject(AlertController);
  private readonly cloudinaryService = inject(CloudinaryService);

  // Estado
  isLoading = signal(true);
  userId = signal('');
  email = signal('');
  password = signal('');
  favoriteFoodIds = signal<string[]>([]);
  allFoods = signal<Food[]>([]);
  showFoodsModal = signal(false);
  notifications = signal(true);
  avatarUrl = signal<string | null>(null);
  userInitials = signal('U');
  isUploading = signal(false);

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, fastFoodOutline, saveOutline, thumbsUpOutline, closeOutline, notificationsOutline, cameraOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  // Carga el usuario actual y la lista de alimentos
  loadData() {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.userId.set(user._id);
        this.email.set(user.email);
        this.favoriteFoodIds.set(user.profile?.favoriteFoods || []);
        this.notifications.set(user.profile?.notifications ?? true);
        this.avatarUrl.set(user.profile?.avatarUrl || null);
        const name = user.profile?.name || '';
        const lastName = user.profile?.lastName || '';
        this.userInitials.set((name.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U');
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar los datos del perfil.');
        this.isLoading.set(false);
      }
    });

    this.foodService.findAll().subscribe({
      next: (foods) => this.allFoods.set(foods),
      error: () => this.toastService.error('Error al cargar la lista de alimentos.')
    });
  }

  // Añade o quita un alimento de favoritos
  toggleFood(foodId: string) {
    const current = this.favoriteFoodIds();
    if (current.includes(foodId)) {
      this.favoriteFoodIds.set(current.filter(id => id !== foodId));
    } else {
      this.favoriteFoodIds.set([...current, foodId]);
    }
  }

  // Comprueba si un alimento es favorito
  isFavorite(foodId: string): boolean {
    return this.favoriteFoodIds().includes(foodId);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('La imagen no puede superar 5MB');
      return;
    }

    this.isUploading.set(true);
    this.cloudinaryService.uploadAvatar(file).subscribe({
      next: (url) => {
        this.avatarUrl.set(url);
        this.isUploading.set(false);
        this.toastService.success('Foto subida correctamente');

        // Guardar la URL en el perfil del usuario
        this.userService.update(this.userId(), { avatarUrl: url } as any).subscribe({
          next: () => {},
          error: () => this.toastService.error('Error al guardar la foto en el perfil')
        });
      },
      error: () => {
        this.isUploading.set(false);
        this.toastService.error('Error al subir la imagen');
      }
    });
  }

  // Guardar cambios
  async saveSettings() {
    const payload: any = {
      email: this.email(),
      favoriteFoods: this.favoriteFoodIds(),
      notifications: this.notifications()
    };

    // Si hay contraseña → confirmar antes de guardar
    if (this.password().trim() !== '') {
      const alert = await this.alertCtrl.create({
        header: 'Cambiar contraseña',
        message: '¿Seguro que quieres cambiar tu contraseña?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Confirmar', handler: () => {
            payload.password = this.password();
            this.doSave(payload);
          }}
        ]
      });
      await alert.present();
      return;
    }

    this.doSave(payload);
  }

  private doSave(payload: any) {
    this.toastService.cargarToast('Guardando cambios...', 2000, 'primary');
    this.userService.update(this.userId(), payload).subscribe({
      next: () => {
        this.toastService.success('Perfil actualizado correctamente.');
        this.password.set('');
      },
      error: () => {
        this.toastService.error('Error al actualizar el perfil.');
      }
    });
  }
}

