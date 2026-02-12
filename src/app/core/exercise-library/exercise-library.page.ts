import { Component, OnInit, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonButton
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { addIcons } from 'ionicons';
import { barbell, logoYoutube } from 'ionicons/icons';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { EquipmentType, MuscleGroup, Ejercicio } from 'src/app/common/interfaces';

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
    LayoutComponent
  ]
})
export class ExerciseLibraryPage implements OnInit {

  searchTerm: WritableSignal<string> = signal<string>('');

  // Datos de ejemplo (se reemplazarán por datos del servicio)
  exercises: Ejercicio[] = [
    {
      _id: '1',
      name: 'abdominales en v',
      categories: [MuscleGroup.CORE],
      equipment: EquipmentType.LIBRE,
      description: 'acostado, eleva el tronco llevando las manos hacia los pies. mantén tensión constante en la zona superior del abdomen.',
      tags: ['abdominales', 'tumbado'],
      videoUrl: 'https://www.youtube.com/watch?v=xUsHyWZGm0w'
    },
    {
      _id: '2',
      name: 'abdominales tipo crunch en máquina',
      categories: [MuscleGroup.CORE],
      equipment: EquipmentType.MAQUINA,
      description: 'realiza la flexión del tronco utilizando la resistencia de la máquina de crunch abdominal.',
      tags: ['abdominales', 'maquina'],
      videoUrl: 'https://www.youtube.com/watch?v=2'
    },
    {
      _id: '3',
      name: 'abdominales tipo crunch en paralelas',
      categories: [MuscleGroup.CORE],
      equipment: EquipmentType.LIBRE,
      description: 'realiza la flexión del tronco en las barras paralelas elevando las piernas o el torso.',
      tags: ['abdominales', 'paralelas'],
      videoUrl: 'https://www.youtube.com/watch?v=3'
    },
    {
      _id: '4',
      name: 'aducción horizontal con poleas en pie',
      categories: [MuscleGroup.PECTORAL],
      equipment: EquipmentType.POLEA,
      description: 'tracción de las poleas hacia el centro del pecho manteniendo la posición de pie.',
      tags: ['pectoral', 'polea'],
      videoUrl: 'https://www.youtube.com/watch?v=4'
    }
  ];

  constructor() {
    addIcons({ barbell, logoYoutube });
  }

  ngOnInit() {
  }

  // Signal computada que filtra ejercicios por nombre, categoría, equipamiento o etiquetas
  filteredExercises = computed(() => {
    const termino = this.searchTerm().toLowerCase().trim();

    if (!termino) return this.exercises;

    return this.exercises.filter(ejercicio =>
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
