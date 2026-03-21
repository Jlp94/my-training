import { ToastService } from 'src/app/services/ui/toast-service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  IonContent, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonFooter, IonText, IonTextarea, IonSpinner,
  IonDatetimeButton, IonModal, IonDatetime, IonAccordionGroup, IonAccordion,
  IonThumbnail, IonBadge, IonFab, IonFabButton, IonButtons, IonHeader,
  IonToolbar, IonTitle
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, alarmOutline, trashOutline, addCircleOutline, saveOutline, timerOutline, chatbubbleEllipsesOutline, informationCircleOutline, checkmarkCircle, ellipseOutline, documentTextOutline, chevronUpOutline, closeOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";

import { UserService } from 'src/app/services/user/user-service';
import { SesionRutina } from 'src/app/common/routine-interface';
import { TimerService } from 'src/app/services/workout/timer-service';
import { WorkoutService } from 'src/app/services/workout/workout-service';
import { WorkoutFormService } from 'src/app/services/workout/workout-form-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-routine',
  templateUrl: './my-routine.page.html',
  styleUrls: ['./my-routine.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, 
    IonIcon, IonFooter, IonText, IonTextarea, IonSpinner,
    IonDatetimeButton, IonModal, IonDatetime, IonAccordionGroup, IonAccordion,
    IonThumbnail, IonBadge, IonFab, IonFabButton, IonButtons, IonHeader,
    IonToolbar, IonTitle,
    CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent, LayoutComponent
  ]
})
export class MyRoutinePage implements OnInit {
// Injecciones
  private readonly userService: UserService = inject(UserService); 
  public readonly timerService: TimerService = inject(TimerService);
  public readonly workoutService: WorkoutService = inject(WorkoutService);
  public readonly workoutFormService: WorkoutFormService = inject(WorkoutFormService);
  private readonly toastService: ToastService = inject(ToastService);

  // Formulario
  routineForm: FormGroup = this.workoutFormService.createWorkoutForm({ exercises: [] } as any);

  // Variables 
  currentRoutineId = signal<string>('');
  currentSession = signal<SesionRutina | null>(null);
  selectedDate = signal<string>((() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })());
  hasRoutineForDay = signal<boolean | null>(null);
  isDataReady = signal<boolean>(false);
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
    this.exercises.clear();
    this.hasRoutineForDay.set(null); 
    this.isDataReady.set(false);
    this.currentSession.set(null);
    this.showObservations.set(false);

    const date = new Date(this.selectedDate() + 'T12:00:00');
    const dayNum = date.getDay();

    try {
      const data = await firstValueFrom(this.workoutService.getWorkoutData(dayNum, this.selectedDate()));
      
      this.currentRoutineId.set(data.routineId);
      this.currentSession.set(data.session);
      this.hasRoutineForDay.set(true);

      // Delegamos la construcción del formulario al servicio especializado
      this.routineForm = this.workoutFormService.createWorkoutForm(data.session, data.existingLog);
      this.isDataReady.set(true);

    } catch (err) {
      this.hasRoutineForDay.set(false);
      this.isDataReady.set(true);
    }
  }

  addSet(exerciseIndex: number) {
    this.workoutFormService.addSet(this.exercises, exerciseIndex);
  }

  removeSet(exerciseIndex: number, setIndex: number) {
    this.workoutFormService.removeSet(this.exercises, exerciseIndex, setIndex);
  }

  removeLastSet(exerciseIndex: number) {
    this.workoutFormService.removeLastSet(this.exercises, exerciseIndex);
  }

  isSetCompleted(exerciseIndex: number, setIndex: number): boolean {
    return this.workoutFormService.isSetCompleted(this.exercises, exerciseIndex, setIndex);
  }


  // ==========================================
  // Timer y Alarma (Ahora delegados al TimerService)
  // ==========================================
  startTimer(exerciseIndex: number, setIndex: number) {
    const ejercicio = this.exercises.at(exerciseIndex).value;
    const tiempoDescanso = ejercicio.rest || 120;
    this.timerService.startTimer(tiempoDescanso);
  }

  stopTimer() {
    this.timerService.stopTimer();
  }



  // ==========================================
  // Lógica de Guardado (WorkoutLogs)
  // ==========================================
  async saveRoutine() {
    if (!this.hasRoutineForDay() || !this.currentSession()) {
      this.toastService.error('No hay rutina que guardar para hoy');
      return;
    }

    const newLog = this.workoutFormService.mapFormToLog(
      this.routineForm.value, 
      this.selectedDate(), 
      this.currentRoutineId(), 
      this.workoutNotes()
    );

    if (!newLog) {
      this.toastService.cargarToast('Completa al menos una serie para guardar el entreno', 3000, 'warning');
      return;
    }

    try {
      const user = await firstValueFrom(this.userService.getUser());
      this.toastService.cargarToast('Guardando sesión...', 2000, 'secondary');

      await this.workoutService.saveWorkout(user._id, this.selectedDate(), newLog);
      this.toastService.success('¡Rutina guardada con éxito! 💪');

    } catch (error) {
      this.toastService.error('Hubo un error al guardar tu entrenamiento');
    }
  }

  async saveNote() {
    const note = this.workoutNotes().trim();
    if (!note) {
      this.toastService.error('Escribe algo antes de guardar');
      return;
    }

    try {
      const user = await firstValueFrom(this.userService.getUser());
      await this.workoutService.saveOnlyNotes(user._id, this.selectedDate(), note);
      this.toastService.success('Nota guardada');
      this.showNotesModal.set(false);
    } catch {
      this.toastService.cargarToast('La nota se guardará al finalizar la sesión', 2500, 'warning');
      this.showNotesModal.set(false);
    }
  }

}
