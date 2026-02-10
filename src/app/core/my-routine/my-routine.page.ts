import { ToastService } from 'src/app/services/toast-service';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonIcon, IonButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonInput, IonThumbnail, IonCol } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";

@Component({
  selector: 'app-my-routine',
  templateUrl: './my-routine.page.html',
  styleUrls: ['./my-routine.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    IonIcon,
    IonButton,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonInput,
    IonThumbnail,
    IonCol,
    LayoutComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyRoutinePage implements OnInit {
  @ViewChild('swiper') swiperRef: ElementRef | undefined;

  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly toastService: ToastService = inject(ToastService);

  routineForm: FormGroup = this.formBuilder.group({
    exercises: this.formBuilder.array([])
  });
  days: any[] = [];
  selectedDay: number = 0;

  constructor() {
    addIcons({ barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline });
    this.generateDays();
  }

  ngOnInit() {
    this.loadRoutine();
  }


  get exercises() {
    return this.routineForm.get('exercises') as FormArray;
  }

  getSets(exerciseIndex: number) {
    return this.exercises.at(exerciseIndex).get('sets') as FormArray;
  }

  generateDays() {
    // Generar fechas a partir de hoy (30 días en total: 15 anteriores + hoy + 14 siguientes)
    const today = new Date();
    this.days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + (i - 15)); // Empezar 15 días antes
      return {
        date: date.getDate(),
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        fullDate: date
      };
    });
    this.selectedDay = 15; // Seleccionar el día de hoy (índice 15)
  }

  loadRoutine() {
    const EjExercises = [ // Ejemplo de rutina
      {
        name: 'Dominadas Asistidas',
        target: 'Espalda',
        sets: [
          { weight: 40, reps: 10, rir: 2, descanso: 120, tempo: '2-1-0' },
          { weight: 40, reps: 8, rir: 1, descanso: 120, tempo: '2-1-0' },
          { weight: 40, reps: 8, rir: 0, descanso: 120, tempo: '2-1-0' }
        ]
      },
      {
        name: 'Press de Banca con Mancuernas',
        target: 'Pectoral',
        sets: [
          { weight: 24, reps: 10, rir: 2, descanso: 120, tempo: '2-1-0' },
          { weight: 24, reps: 10, rir: 1, descanso: 120, tempo: '2-1-0' },
        ]
      },
      {
        name: 'Sentadilla Búlgara',
        target: 'Piernas',
        sets: [
          { weight: 12, reps: 12, rir: 3, descanso: 120, tempo: '2-1-0' },
          { weight: 12, reps: 12, rir: 2, descanso: 120, tempo: '2-1-0' },
          { weight: 12, reps: 10, rir: 1, descanso: 120, tempo: '2-1-0' }
        ]
      }
    ];

    EjExercises.forEach(ex => {
      const exerciseGroup = this.formBuilder.group({
        name: [ex.name],
        target: [ex.target],
        sets: this.formBuilder.array([])
      });

      const setsArray = exerciseGroup.get('sets') as FormArray;
      ex.sets.forEach(s => {
        setsArray.push(this.createSetGroup(s.weight, s.reps, s.rir));
      });

      this.exercises.push(exerciseGroup);
    });
  }

  createSetGroup(weight: number = 0, reps: number = 0, rir: number = 0) { // Crear Grupo de Series
    return this.formBuilder.group({
      weight: [weight, Validators.required],
      reps: [reps, Validators.required],
      rir: [rir, Validators.required],
    });
  }

  addSet(exerciseIndex: number) { // Añadir Serie
    this.getSets(exerciseIndex).push(this.createSetGroup());
  }

  removeSet(exerciseIndex: number, setIndex: number) { // Eliminar Serie
    this.getSets(exerciseIndex).removeAt(setIndex);
  }


  startTimer(exerciseIndex: number, setIndex: number) {
    // Lógica simulada del temporizador - en una app real esto activaría una cuenta atrás/modal
    console.log(`Starting timer for Exercise ${exerciseIndex + 1}, Set ${setIndex + 1}`);

    this.toastService.cargarToast('Temporizador iniciado (2 min)', 2000, 'primary');

    setTimeout(() => {
      this.toastService.cargarToast('Timer finalizado', 2000, 'success');
      // this.playSound();
    }, 1000 * 60 * 2);
  }

  // playSound() { // Función de sonido de alarma
  //   const audio = new Audio();
  //   audio.src = 'assets/sounds/timer-beep.mp3'; // Asegúrate de tener este archivo o usa una URL externa
  //   audio.load();
  //   audio.play().catch(e => console.error('Error al reproducir sonido:', e));
  // }


  //TODO: Implementar lógica de guardado
  saveRoutine() {
    if (this.routineForm.valid) {
      console.log('Routine Data:', this.routineForm.value);
      // Implementar Lógica
      this.toastService.cargarToast('Rutina guardada correctamente', 1000, 'success');
    } else {
      console.log('Form is invalid');
      this.toastService.cargarToast('Formulario inválido', 1000, 'danger');
    }
  }



  selectDay(index: number) {
    this.selectedDay = index;
    // La lógica para cargar la rutina del día seleccionado iría aquí
    this.swiperRef?.nativeElement.swiper.slideTo(index);
  }

}
