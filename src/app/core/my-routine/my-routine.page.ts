import { ToastService } from 'src/app/services/toast-service';
import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonInput, IonThumbnail, IonText, IonFab, IonFabButton, IonModal, IonDatetime, IonDatetimeButton, IonSpinner, IonRow, IonCol, IonGrid, IonBadge } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline, timerOutline, chatbubbleEllipsesOutline, informationCircleOutline, checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";

import { RoutinesService } from 'src/app/services/routines-service';
import { UserService } from 'src/app/services/user-service';
import { ExecutionMode, SesionRutina } from 'src/app/common/routine-interface';
import { ExerciseLog, WorkoutLog } from 'src/app/common/userInterface';
import { firstValueFrom } from 'rxjs';

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
    IonGrid,
    IonBadge
]
})
export class MyRoutinePage implements OnInit {
// Injecciones
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly routinesService: RoutinesService = inject(RoutinesService);
  private readonly userService: UserService = inject(UserService);

  // Formulario
  routineForm: FormGroup = this.formBuilder.group({
    exercises: this.formBuilder.array([])
  });

  // Variables 
  currentRoutineId:WritableSignal<string> = signal<string>('');
  currentSession:WritableSignal<SesionRutina | null> = signal<SesionRutina | null>(null);
  selectedDate:WritableSignal<string> = signal<string>(new Date().toISOString().split('T')[0]);
  hasRoutineForDay:WritableSignal<boolean | null> = signal<boolean | null>(null);
  showObservations:WritableSignal<boolean> = signal<boolean>(false);

  constructor() {
    addIcons({ barbell, timerOutline, alarmOutline, trashOutline, addCircleOutline, saveOutline, chatbubbleEllipsesOutline, informationCircleOutline, checkmarkCircle, ellipseOutline });
  }

  ngOnInit() {
    this.loadRoutine();
  }

  // Cuando el usuario cambia la fecha
  onDateChange(event: any) {
    const val = event?.detail?.value || event;
    if (typeof val === 'string') {
      this.selectedDate.set(val.split('T')[0]);
      this.loadRoutine();
    }
  }


  get exercises() {
    return this.routineForm.get('exercises') as FormArray;
  }

  getSets(exerciseIndex: number) {
    return this.exercises.at(exerciseIndex).get('sets') as FormArray;
  }


  async loadRoutine() {
    // Limpiar estado previo
    this.exercises.clear();
    this.hasRoutineForDay.set(null); // null = cargando
    this.currentSession.set(null);
    this.showObservations.set(false);

    // Obtener el número del día (0=dom, 1=lun...)
    const date = new Date(this.selectedDate() + 'T12:00:00');
    const dayNum = date.getDay();

    const userString = localStorage.getItem('user');
    if (!userString) return;
    const userId = JSON.parse(userString)._id;

    try {
      // 1. Obtención de Plantilla Base
      const data = await firstValueFrom(this.routinesService.getMyRoutineSession(dayNum));
      
      this.currentRoutineId.set(data.profile.currentRoutineId || '');
      this.currentSession.set(data.session);
      this.hasRoutineForDay.set(true);

      // 2. Obtención de Workout previo para hoy
      let existingLog: WorkoutLog | undefined = undefined;
      const dateStr = date.toISOString().split('T')[0];
      try {
        existingLog = await firstValueFrom(this.userService.getWorkoutLogByDate(userId, dateStr));
      } catch (e) {
        // Si no existe, usamos el Log vacío
      }

      this.buildFormFromSession(data.session, existingLog);

    } catch (err) {
      console.log('Sin datos para este día');
      this.hasRoutineForDay.set(false); // false = día sin rutina
    }
  }

  // Construir el FormArray a partir de la sesión de la API
  private buildFormFromSession(session: SesionRutina, logPrevio?: WorkoutLog) {
    session.exercises.forEach(ex => {
      const tempoStr = `${ex.tempo.eccentric}-${ex.tempo.isometric}-${ex.tempo.concentric}`; // Para mostrar el tempo
      const exerciseGroup = this.formBuilder.group({
        exerciseId: [ex.exerciseId],
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
      
      // Intentamos localizar este ejercicio en el Log del backend
      const savedExLog = logPrevio?.exerciseLogs?.find(l => l.exerciseId === ex.exerciseId);

      ex.sets.forEach((s, idx) => {
        // Miramos si teníamos valores guardados para la serie 'idx' concreta
        const savedSet = savedExLog?.sets?.[idx];
        if (savedSet) {
          setsArray.push(this.createSetGroup(savedSet.kg, savedSet.reps, savedSet.rir));
        } else {
          setsArray.push(this.createSetGroup(null, null, null));
        }
      });

      this.exercises.push(exerciseGroup);
    });
  }

  createSetGroup(kg: number | null = null, reps: number | null = null, rir: number | null = null) {
    return this.formBuilder.group({
      kg: [kg, Validators.min(0)],
      reps: [reps, Validators.min(0)],
      rir: [rir, Validators.min(0)],
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


  // ==========================================
  // Lógica de Guardado (WorkoutLogs)
  // ==========================================
  async saveRoutine() {
    if (!this.hasRoutineForDay() || !this.currentSession()) {
      this.toastService.error('No hay rutina que guardar para hoy');
      return;
    }

    const formValue = this.routineForm.value;
    const validExerciseLogs: ExerciseLog[] = [];

    // 1. Filtrar series vacías y mapear a ExerciseLog
    formValue.exercises.forEach((ex: any) => {
      // Filtrar las series que tengan (kg > 0 o reps > 0)
      const validSets = ex.sets.filter((s: any) => 
        (s.kg !== null && s.kg > 0) || (s.reps !== null && s.reps > 0)
      );

      // Si el ejercicio tiene al menos una serie válida, lo agregamos
      if (validSets.length > 0) {
        validExerciseLogs.push({
          exerciseId: ex.exerciseId,
          name: ex.name,
          target: Array.isArray(ex.target) ? ex.target : [ex.target],
          sets: validSets.map((vs: any) => ({
            kg: Number(vs.kg) || 0,
            reps: Number(vs.reps) || 0,
            rir: Number(vs.rir) || 0
          }))
        });
      }
    });

    if (validExerciseLogs.length === 0) {
      this.toastService.cargarToast('Completa al menos una serie para guardar el entreno', 3000, 'warning');
      return;
    }

    // 2. Construir el objeto WorkoutLog
    const dateObj = new Date(this.selectedDate());
    const dateStr = dateObj.toISOString().split('T')[0];

    const userString = localStorage.getItem('user');
    if (!userString) {
      this.toastService.error('Usuario no encontrado. Inicie sesión.');
      return;
    }
    const userId = JSON.parse(userString)._id;

    const currentSess = this.currentSession()!;
    // Manejo de id dependiendo de la forma del objeto SesionRutina
    const rId = (currentSess as any)._id || (currentSess as any).id || 'unknown';

    const newLog: WorkoutLog = {
      doneAt: dateStr,
      routineId: rId,
      notes: currentSess.observations || undefined,
      exerciseLogs: validExerciseLogs
    };

    // 3. Revisar en la API NestJS si el log ya existe (GET /users/:id/workout-logs/:date)
    // Para simplificar la lectura, utilizamos async/await con firstValueFrom de RxJS
    try {
      this.toastService.cargarToast('Guardando sesión...', 2000, 'secondary');

      let exists = true;
      try {
        await firstValueFrom(this.userService.getWorkoutLogByDate(userId, dateStr));
      } catch (err: any) {
        exists = false; 
      }

      const request$ = exists 
        ? this.userService.updateWorkoutLog(userId, dateStr, newLog)
        : this.userService.addWorkoutLog(userId, newLog);

      await firstValueFrom(request$);
      this.toastService.success('¡Rutina guardada con éxito! 💪');

    } catch (error) {
      console.error('Error procesando el log de rutina:', error);
      this.toastService.error('Hubo un error al guardar tu entrenamiento');
    }
  }

}
