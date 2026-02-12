import { ToastService } from 'src/app/services/toast-service';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonIcon, IonButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonInput, IonThumbnail, IonCol } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline, timerOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { ExecutionMode } from 'src/app/common/interfaces';

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

  routineType: string = '';
  routineCategory: string = '';

  constructor() {
    addIcons({ barbell, timerOutline, alarmOutline, trashOutline, addCircleOutline, saveOutline });
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
    const EjExercises = { // Ejemplo de rutina desde API
      _id: 'mongo_id_123',
      routineType: 'FullBody', // Tipo de rutina
      category: '1', // Categoría (String)
      exercises: [
        {
          _id: 'ex_1',
          name: 'Dominadas Asistidas',
          target: 'Espalda',
          rest: 120,
          executionType: ExecutionMode.NORMAL,
          restPauseSeconds: null,
          idExSuperSet: null,
          sets: [
            { kg: 40, reps: 10, rir: 2, tempo: { eccentric: 2, isometric: 1, concentric: 0 } },
            { kg: 40, reps: 8, rir: 1, tempo: { eccentric: 2, isometric: 1, concentric: 0 } },
            { kg: 40, reps: 8, rir: 0, tempo: { eccentric: 2, isometric: 1, concentric: 0 } }
          ]
        },
        {
          _id: 'ex_2',
          name: 'Press Banca',
          target: 'Pectoral',
          rest: 90,
          executionType: ExecutionMode.SUPER_SET,
          restPauseSeconds: null,
          idExSuperSet: 'ex_3',
          sets: [
            { kg: 60, reps: 10, rir: 2, tempo: { eccentric: 3, isometric: 0, concentric: 1 } },
          ]
        },
        {
          _id: 'ex_3',
          name: 'Remo con Barra',
          target: 'Espalda',
          rest: 90,
          executionType: ExecutionMode.SUPER_SET,
          restPauseSeconds: null,
          idExSuperSet: 'ex_2',
          sets: [
            { kg: 50, reps: 10, rir: 2, tempo: { eccentric: 3, isometric: 0, concentric: 1 } },
          ]
        },
        {
          _id: 'ex_4',
          name: 'Elevaciones Laterales',
          target: 'Hombro',
          rest: 60,
          executionType: ExecutionMode.REST_PAUSE,
          restPauseSeconds: 20,
          idExSuperSet: null,
          sets: [
            { kg: 10, reps: 15, rir: 0, tempo: { eccentric: 2, isometric: 0, concentric: 1 } },
            { kg: 10, reps: 5, rir: 0, tempo: { eccentric: 2, isometric: 0, concentric: 1 } }, // Mini set
          ]
        },
        {
          _id: 'ex_5',
          name: 'Extensiones de Tríceps',
          target: 'Tríceps',
          rest: 60,
          executionType: ExecutionMode.DROP_SET,
          restPauseSeconds: null,
          idExSuperSet: null,
          sets: [
            { kg: 20, reps: 12, rir: 0, tempo: { eccentric: 2, isometric: 0, concentric: 1 } },
            { kg: 15, reps: 10, rir: 0, tempo: { eccentric: 2, isometric: 0, concentric: 1 } }, // Drop
          ]
        }
      ]
    };

    if (EjExercises) {
      this.routineType = EjExercises.routineType;
      this.routineCategory = EjExercises.category;
    }

    EjExercises.exercises.forEach(ex => {
      const exerciseGroup = this.formBuilder.group({
        _id: [ex._id],
        name: [ex.name],
        target: [ex.target],
        rest: [ex.rest], // <--- ¡AÑADE ESTA LÍNEA!
        executionType: [ex.executionType],
        idExSuperSet: [ex.idExSuperSet || null], // Aseguramos el null
        restPauseSeconds: [ex.restPauseSeconds || null],
        sets: this.formBuilder.array([])
      });

      const setsArray = exerciseGroup.get('sets') as FormArray;
      ex.sets.forEach(s => {
        setsArray.push(this.createSetGroup(s.kg, s.reps, s.rir));
      });

      this.exercises.push(exerciseGroup);
    });
  }

  createSetGroup(kg: number = 0, reps: number = 0, rir: number = 0) { // Crear Grupo de Series
    return this.formBuilder.group({
      kg: [kg, Validators.required],
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
    const ejercicio = this.exercises.at(exerciseIndex).value;
    const tiempoDescanso = ejercicio.rest || 120; // Segundos

    this.toastService.cargarToast(`Descanso: ${tiempoDescanso}s`, 2000, 'primary');

    setTimeout(() => {
      this.toastService.cargarToast('¡A darle!', 2000, 'success');
    }, tiempoDescanso * 1000);
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
