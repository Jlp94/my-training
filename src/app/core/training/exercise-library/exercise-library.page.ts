import { Component, signal, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
export class ExerciseLibraryPage {
  private readonly exercisesService: ExercisesService = inject(ExercisesService);

  private readonly searchTerm = signal<string>('');

  // Ejercicios cargados desde la API mediante rxResource
  private readonly exercisesResource = rxResource({
    stream: () => this.exercisesService.findAll()
  });

  protected readonly exercises = computed(() => this.exercisesResource.value() ?? []);
  protected readonly isLoading = this.exercisesResource.isLoading;

  constructor() {
    addIcons({ barbell, logoYoutube });
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
