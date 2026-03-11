import { ToastService } from 'src/app/services/toast-service';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonInput, IonThumbnail, IonText, IonFab, IonFabButton, IonModal, IonDatetime, IonDatetimeButton, IonSpinner, IonRow, IonCol, IonGrid, IonBadge, IonTextarea, IonHeader, IonToolbar, IonTitle, IonButtons, IonFooter } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline, timerOutline, chatbubbleEllipsesOutline, informationCircleOutline, checkmarkCircle, ellipseOutline, documentTextOutline, chevronUpOutline, closeOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";

import { RoutinesService } from 'src/app/services/routines-service';
import { UserService } from 'src/app/services/user-service';
import { SesionRutina } from 'src/app/common/routine-interface';
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
    IonBadge,
    IonTextarea,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonFooter
]
})
export class MyRoutinePage implements OnInit, OnDestroy {
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
  currentRoutineId = signal<string>('');
  currentSession = signal<SesionRutina | null>(null);
  selectedDate = signal<string>((() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })());
  hasRoutineForDay = signal<boolean | null>(null);
  showObservations = signal<boolean>(false);
  workoutNotes = signal('');
  showNotesModal = signal(false);

  constructor() {
    addIcons({ barbell, timerOutline, alarmOutline, trashOutline, addCircleOutline, saveOutline, chatbubbleEllipsesOutline, informationCircleOutline, checkmarkCircle, ellipseOutline, documentTextOutline, chevronUpOutline, closeOutline });
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

    let userId: string;
    try {
      const user = await firstValueFrom(this.userService.getUser());
      userId = user._id;
    } catch {
      return;
    }

    try {
      // 1. Obtención de Plantilla Base
      const data = await firstValueFrom(this.routinesService.getMyRoutineSession(dayNum));
    console.log('Sesion:', data.session);
      
      this.currentRoutineId.set(data.profile.currentRoutineId || '');
      this.currentSession.set(data.session);
      this.hasRoutineForDay.set(true);

      // 2. Obtención de Workout previo para hoy
      let existingLog: WorkoutLog | undefined = undefined;
    const dateStr = this.selectedDate(); // Ya es YYYY-MM-DD local
      try {
        existingLog = await firstValueFrom(this.userService.getWorkoutLogByDate(userId, dateStr));
      console.log('Log previo:', existingLog);
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
    session.exercises.forEach(exercise => {
      const tempoStr = `${exercise.tempo.eccentric}-${exercise.tempo.isometric}-${exercise.tempo.concentric}`; // Para mostrar el tempo
      const exerciseGroup = this.formBuilder.group({
        exerciseId: [exercise.exerciseId],
        name: [exercise.name],
        target: [exercise.target],
        rest: [exercise.rest],
        tempo: [tempoStr],
        executionType: [exercise.executionType],
        idExSuperSet: [exercise.idExSuperSet || null],
        restPauseSeconds: [exercise.restPauseSeconds || null],
        sets: this.formBuilder.array([])
      });

      const setsArray = exerciseGroup.get('sets') as FormArray;
      
      // Intentamos localizar este ejercicio en el Log del backend
      const savedExLog = logPrevio?.exerciseLogs?.find(log => log.exerciseId === exercise.exerciseId);

      exercise.sets.forEach((set, setIndex) => {
        // Miramos si teníamos valores guardados para la serie 'setIndex' concreta
        const savedSet = savedExLog?.sets?.[setIndex];
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

  isSetCompleted(exerciseIndex: number, setIndex: number): boolean {
    const set = this.getSets(exerciseIndex).at(setIndex);
    const kg = set.get('kg')?.value;
    const reps = set.get('reps')?.value;
    const rir = set.get('rir')?.value;
    return (kg != null && kg > 0) && (reps != null && reps > 0) && (rir != null && rir > 0);
  }


  // ==========================================
  // Timer y Alarma
  // ==========================================
  private alarmAudio = new Audio('assets/sounds/campana-de-box.mp3');
  private restTimer: any = null;
  timerSeconds = signal(0);
  timerRunning = signal(false);

  startTimer(exerciseIndex: number, setIndex: number) {
    // Si ya hay un timer activo, lo cancelamos
    if (this.restTimer) {
      clearInterval(this.restTimer);
    }

    const ejercicio = this.exercises.at(exerciseIndex).value;
    const tiempoDescanso = ejercicio.rest || 120;

    this.timerSeconds.set(tiempoDescanso);
    this.timerRunning.set(true);
    this.toastService.cargarToast(`Descanso: ${tiempoDescanso}s`, 2000, 'primary');

    this.restTimer = setInterval(() => {
      const current = this.timerSeconds();
      if (current <= 1) {
        clearInterval(this.restTimer);
        this.restTimer = null;
        this.timerSeconds.set(0);
        this.timerRunning.set(false);

        // Reproducir alarma
        this.alarmAudio.currentTime = 0;
        this.alarmAudio.play().catch(() => {});

        this.toastService.success('¡A darle! 🔔');
      } else {
        this.timerSeconds.set(current - 1);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.restTimer) {
      clearInterval(this.restTimer);
      this.restTimer = null;
      this.toastService.error('Alarma cancelada');
    }
    this.timerSeconds.set(0);
    this.timerRunning.set(false);
  }

  ngOnDestroy() {
    this.stopTimer();
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
    formValue.exercises.forEach((exercise: any) => {
      // Filtrar las series que tengan (kg > 0 o reps > 0)
      const validSets = exercise.sets.filter((set: any) => 
        (set.kg !== null && set.kg > 0) || (set.reps !== null && set.reps > 0)
      );

      // Si el ejercicio tiene al menos una serie válida, lo agregamos
      if (validSets.length > 0) {
        validExerciseLogs.push({
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          target: (Array.isArray(exercise.target) ? exercise.target : [exercise.target]).filter((t: any) => t != null),
          sets: validSets.map((validSet: any) => ({
            kg: Number(validSet.kg) || 0,
            reps: Number(validSet.reps) || 0,
            rir: Number(validSet.rir) || 0
          }))
        });
      }
    });

    if (validExerciseLogs.length === 0) {
      this.toastService.cargarToast('Completa al menos una serie para guardar el entreno', 3000, 'warning');
      return;
    }

    const dateStr = this.selectedDate();

    let userId: string;
    try {
      const user = await firstValueFrom(this.userService.getUser());
      userId = user._id;
    } catch {
      this.toastService.error('Usuario no autenticado o sesión caducada.');
      return;
    }

    const rId = this.currentRoutineId() || 'sin-rutina';

    const newLog: WorkoutLog = {
      doneAt: dateStr,
      routineId: rId,
      notes: this.workoutNotes().trim() || undefined,
      exerciseLogs: validExerciseLogs
    };

    // 3. Revisar en la API NestJS si el log ya existe (GET /users/:id/workout-logs/:date)
    // Para simplificar la lectura, utilizamos async/await con firstValueFrom de RxJS
    try {
      console.log('Payload:', JSON.stringify(newLog, null, 2));
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

  // Guarda solo la nota al workout log existente (PATCH)
  async saveNote() {
    const note = this.workoutNotes().trim();
    if (!note) {
      this.toastService.error('Escribe algo antes de guardar');
      return;
    }

    const dateStr = this.selectedDate();
    let userId: string;
    try {
      const user = await firstValueFrom(this.userService.getUser());
      userId = user._id;
    } catch {
      this.toastService.error('Usuario no autenticado');
      return;
    }

    try {
      // Intentar PATCH si ya existe el log del día
      await firstValueFrom(this.userService.updateWorkoutLog(userId, dateStr, { notes: note } as any));
      this.toastService.success('Nota guardada');
      this.showNotesModal.set(false);
    } catch {
      // Si no existe aún, el note se guardará cuando se pulse el FAB guardar
      this.toastService.cargarToast('La nota se guardará al guardar la sesión', 2500, 'warning');
      this.showNotesModal.set(false);
    }
  }

}
