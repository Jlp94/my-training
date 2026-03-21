import { Component, OnInit, signal, computed, WritableSignal, inject } from '@angular/core';

import {
  IonContent,
  IonItem,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  IonThumbnail,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonText,
  IonButton,
  IonSpinner,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { addIcons } from 'ionicons';
import { barbell, logoYoutube } from 'ionicons/icons';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { Ejercicio } from 'src/app/common/exercises-interface';
import { ExercisesService } from 'src/app/services/workout/exercises-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-exercise-library',
  templateUrl: './exercise-library.page.html',
  styleUrls: ['./exercise-library.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonAccordionGroup,
    IonAccordion,
    IonThumbnail,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonText,
    CommonModule,
    FormsModule,
    HeaderComponent,
    LayoutComponent,
    IonSpinner,
    IonCard,
    IonCardContent
  ]
})
export class ExerciseLibraryPage implements OnInit {
  private readonly exercisesService: ExercisesService = inject(ExercisesService);

  searchTerm: WritableSignal<string> = signal<string>('');

  // Ejercicios cargados desde la API
  exercises: WritableSignal<Ejercicio[]> = signal<Ejercicio[]>([]);
  isLoading = signal(true);

  constructor() {
    addIcons({ barbell, logoYoutube });
  }

  // Carga los ejercicios de la API al iniciar
  ngOnInit() {
    this.exercisesService.findAll().subscribe({
      next: (ejercicios) => {
        this.exercises.set(ejercicios);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Signal computada que filtra ejercicios por nombre, categoría, equipamiento o etiquetas
  filteredExercises = computed(() => {
    const termino = this.searchTerm().toLowerCase().trim();
    const lista = this.exercises();

    if (!termino) return lista;

    return lista.filter(ejercicio =>
      ejercicio.name.toLowerCase().includes(termino) ||
      ejercicio.categories.some(categoria => categoria.toLowerCase().includes(termino)) ||
      ejercicio.equipment.toLowerCase().includes(termino) ||
      ejercicio.tags.some(etiqueta => etiqueta.toLowerCase().includes(termino))
    );
  });

  // Manejador del evento de búsqueda
  onSearch(event: any) {
    this.searchTerm.set(event.detail.value || '');
  }

}
