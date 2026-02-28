import { ToastService } from 'src/app/services/toast-service';
import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonInput, IonThumbnail, IonChip, IonText, IonFab, IonFabButton, IonModal, IonDatetime, IonDatetimeButton, IonSpinner, IonRow, IonCol, IonGrid } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline, timerOutline, chatbubbleEllipsesOutline, informationCircleOutline, checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { RoutinesService } from 'src/app/services/routines-service';
import { UserService } from 'src/app/services/user-service';
import { ExecutionMode, SesionRutina } from 'src/app/common/routine-interface';

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
    FormsModule,
    IonSpinner,
    IonCol,
    IonRow,
    IonGrid
]
})
export class MyRoutinePage implements OnInit {

  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly routinesService: RoutinesService = inject(RoutinesService);
  private readonly userService: UserService = inject(UserService);

  routineForm: FormGroup = this.formBuilder.group({
    exercises: this.formBuilder.array([])
  });

  // Estado de carga
  loading = signal(true);

  // ID de la rutina actual del usuario
  currentRoutineId: string = '';

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

  // Día de la semana asignado a esta rutina
  routineDayOfWeek: string = '';
  hasRoutineForDay: boolean = false;

  routineType: string = '';
  routineCategory: string = '';
  routineObservations: string = '';
  showObservations: boolean = false;

  constructor() {
    addIcons({ barbell, timerOutline, alarmOutline, trashOutline, addCircleOutline, saveOutline, chatbubbleEllipsesOutline, informationCircleOutline, checkmarkCircle, ellipseOutline });
  }

  ngOnInit() {
    this.updateDayOfWeek();

    // Obtener currentRoutineId del perfil del usuario
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.currentRoutineId = profile.currentRoutineId || '';
        this.loadRoutine();
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.loading.set(false);
      }
    });
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
    // Limpiar ejercicios previos
    this.exercises.clear();
    this.hasRoutineForDay = false;
    this.routineType = '';
    this.routineCategory = '';
    this.routineObservations = '';

    if (!this.currentRoutineId) {
      this.loading.set(false);
      return;
    }

    // Obtener el número del día (0=dom, 1=lun...)
    const date = new Date(this.selectedDate + 'T12:00:00');
    const dayNum = date.getDay();

    this.loading.set(true);
    this.routinesService.findSession(this.currentRoutineId, dayNum).subscribe({
      next: (session: SesionRutina) => {
        this.hasRoutineForDay = true;
        this.routineDayOfWeek = this.dayLabels[dayNum];
        this.routineType = session.routineType;
        this.routineCategory = session.category;
        this.routineObservations = session.observations || '';

        this.buildFormFromSession(session);
        this.loading.set(false);
      },
      error: (err) => {
        // 404 = no hay sesión para ese día (normal)
        console.log('No hay sesión para este día:', err.status === 404 ? 'Sin rutina' : err);
        this.hasRoutineForDay = false;
        this.loading.set(false);
      }
    });
  }

  // Construir el FormArray a partir de la sesión de la API
  private buildFormFromSession(session: SesionRutina) {
    session.exercises.forEach(ex => {
      // Construir string de tempo
      const tempoStr = ex.tempo
        ? `${ex.tempo.eccentric}-${ex.tempo.isometric}-${ex.tempo.concentric}`
        : '2-1-0';

      const exerciseGroup = this.formBuilder.group({
        exerciseId: [ex.exerciseId],
        name: [ex.name || 'Sin nombre'],
        target: [ex.target || []],
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

  createSetGroup(kg: number = 0, reps: number = 0, rir: number = 0) {
    return this.formBuilder.group({
      kg: [kg, Validators.required],
      reps: [reps, Validators.required],
      rir: [rir, Validators.required],
    });
  }

  addSet(exerciseIndex: number) {
    this.getSets(exerciseIndex).push(this.createSetGroup());
  }

  removeSet(exerciseIndex: number, setIndex: number) {
    this.getSets(exerciseIndex).removeAt(setIndex);
  }

  removeLastSet(exerciseIndex: number) {
    const sets = this.getSets(exerciseIndex);
    if (sets.length > 1) {
      sets.removeAt(sets.length - 1);
    }
  }


  startTimer(exerciseIndex: number, setIndex: number) {
    const ejercicio = this.exercises.at(exerciseIndex).value;
    const tiempoDescanso = ejercicio.rest || 120;

    this.toastService.cargarToast(`Descanso: ${tiempoDescanso}s`, 2000, 'primary');

    setTimeout(() => {
      this.toastService.success('¡A darle!');
    }, tiempoDescanso * 1000);
  }


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
