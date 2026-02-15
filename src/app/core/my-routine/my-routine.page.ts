import { ToastService } from 'src/app/services/toast-service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonInput, IonThumbnail, IonChip, IonText, IonFab, IonFabButton, IonModal, IonDatetime, IonDatetimeButton } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline, timerOutline, chatbubbleEllipsesOutline, informationCircleOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { ExecutionMode } from 'src/app/common/workoutInterface';

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
    IonChip,
    IonText,
    IonFab,
    IonFabButton,
    IonModal,
    IonDatetime,
    IonDatetimeButton,
    LayoutComponent,
    FormsModule
  ]
})
export class MyRoutinePage implements OnInit {

  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly toastService: ToastService = inject(ToastService);

  routineForm: FormGroup = this.formBuilder.group({
    exercises: this.formBuilder.array([])
  });

  // Fecha seleccionada y día de la semana
  selectedDate: string = new Date().toISOString().split('T')[0];
  dayOfWeekLabel: string = '';
  dayOfWeekFull: string = '';

  // Mapa de días de la semana: número JS (0=dom) -> etiqueta corta
  private readonly dayLabels: Record<number, string> = {
    0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S'
  };
  private readonly dayFullNames: Record<number, string> = {
    0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado'
  };

  // Día de la semana asignado a esta rutina (viene de la BBDD)
  routineDayOfWeek: string = ''; // L, M, X, J, V, S, D
  hasRoutineForDay: boolean = false;

  routineType: string = '';
  routineCategory: string = '';
  routineObservations: string = '';
  showObservations: boolean = false;

  constructor() {
    addIcons({ barbell, timerOutline, alarmOutline, trashOutline, addCircleOutline, saveOutline, chatbubbleEllipsesOutline, informationCircleOutline });
  }

  ngOnInit() {
    this.updateDayOfWeek();
    this.loadRoutine();
  }

  // Actualizar día de la semana a partir de la fecha seleccionada
  updateDayOfWeek() {
    const date = new Date(this.selectedDate + 'T12:00:00');
    const dayNum = date.getDay();
    this.dayOfWeekLabel = this.dayLabels[dayNum];
    this.dayOfWeekFull = this.dayFullNames[dayNum];
  }

  // Cuando el usuario cambia la fecha
  onDateChange(event: any) {
    const val = event?.detail?.value || event;
    if (typeof val === 'string') {
      this.selectedDate = val.split('T')[0];
      this.updateDayOfWeek();
      this.loadRoutine();
    }
  }


  get exercises() {
    return this.routineForm.get('exercises') as FormArray;
  }

  getSets(exerciseIndex: number) {
    return this.exercises.at(exerciseIndex).get('sets') as FormArray;
  }



  loadRoutine() {
    const EjExercises = { // Ejemplo de rutina desde API
      _id: 'mongo_id_123',
      routineType: 'FullBody', // Tipo de rutina
      category: '1', // Categoría (String)
      routineDayOfWeek: 'X', // Esta rutina es de Miércoles
      observations: 'lo que sea de la rutina de ese dia',
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
            { kg: 0, reps: 0, rir: 0, tempo: { eccentric: 2, isometric: 0, concentric: 1 } },
            { kg: 0, reps: 0, rir: 0, tempo: { eccentric: 2, isometric: 0, concentric: 1 } }, // Drop
          ]
        }
      ]
    };

    // Comprobar si el día seleccionado coincide con el día de la rutina
    this.routineDayOfWeek = EjExercises.routineDayOfWeek || '';
    this.hasRoutineForDay = this.dayOfWeekLabel === this.routineDayOfWeek;

    // Limpiar ejercicios previos
    this.exercises.clear();

    if (!this.hasRoutineForDay) {
      this.routineType = '';
      this.routineCategory = '';
      this.routineObservations = '';
      return;
    }

    if (EjExercises) {
      this.routineType = EjExercises.routineType;
      this.routineCategory = EjExercises.category;
      this.routineObservations = EjExercises.observations || '';
    }

    EjExercises.exercises.forEach(ex => {
      // Extraer tempo del primer set (es el mismo para todas las series)
      const primerTempo = ex.sets[0]?.tempo;
      const tempoStr = primerTempo
        ? `${primerTempo.eccentric}-${primerTempo.isometric}-${primerTempo.concentric}`
        : '2-1-0';

      const exerciseGroup = this.formBuilder.group({
        _id: [ex._id],
        name: [ex.name],
        target: [ex.target],
        rest: [ex.rest],
        tempo: [tempoStr],
        executionType: [ex.executionType],
        idExSuperSet: [ex.idExSuperSet || null],
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
      this.toastService.success('¡A darle!');
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
      this.toastService.success('Rutina guardada correctamente');
    } else {
      console.log('Form is invalid');
      this.toastService.error('Formulario inválido');
    }
  }



}
