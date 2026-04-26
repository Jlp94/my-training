import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SesionRutina } from '../../common/routine-interface';
import { WorkoutLog, ExerciseLog } from '../../common/userInterface';

@Injectable({
  providedIn: 'root'
})
export class WorkoutFormService {
  private readonly fb = inject(FormBuilder);

  createWorkoutForm(session: SesionRutina, logPrevio?: WorkoutLog): FormGroup {
    const routineForm = this.fb.group({
      exercises: this.fb.array([])
    });

    const exercisesArray = routineForm.get('exercises') as FormArray;

    session.exercises.forEach(exercise => {
      const tempoStr = `${exercise.tempo.eccentric}-${exercise.tempo.isometric}-${exercise.tempo.concentric}`;
      const exerciseGroup = this.fb.group({
        exerciseId: [exercise.exerciseId],
        name: [exercise.name],
        target: [exercise.target],
        rest: [exercise.rest],
        tempo: [tempoStr],
        executionType: [exercise.executionType],
        idExSuperSet: [exercise.idExSuperSet || null],
        restPauseSeconds: [exercise.restPauseSeconds || null],
        sets: this.fb.array([])
      });

      const setsArray = exerciseGroup.get('sets') as FormArray;
      const savedExLog = logPrevio?.exerciseLogs?.find(log => log.exerciseId === exercise.exerciseId);

      exercise.sets.forEach((_, setIndex) => {
        const savedSet = savedExLog?.sets?.[setIndex];
        if (savedSet) {
          setsArray.push(this.createSetGroup(savedSet.kg, savedSet.reps, savedSet.rir));
        } else {
          setsArray.push(this.createSetGroup(null, null, null));
        }
      });

      exercisesArray.push(exerciseGroup);
    });

    return routineForm;
  }

  createSetGroup(kg: number | null = null, reps: number | null = null, rir: number | null = null): FormGroup {
    return this.fb.group({
      kg: [kg, Validators.min(0)],
      reps: [reps, Validators.min(0)],
      rir: [rir, Validators.min(0)],
    });
  }

  addSet(exercises: FormArray, exerciseIndex: number) {
    const sets = exercises.at(exerciseIndex).get('sets') as FormArray;
    sets.push(this.createSetGroup());
  }

  removeSet(exercises: FormArray, exerciseIndex: number, setIndex: number) {
    const sets = exercises.at(exerciseIndex).get('sets') as FormArray;
    sets.removeAt(setIndex);
  }

  removeLastSet(exercises: FormArray, exerciseIndex: number) {
    const sets = exercises.at(exerciseIndex).get('sets') as FormArray;
    if (sets.length > 1) {
      sets.removeAt(sets.length - 1);
    }
  }

  isSetCompleted(exercises: FormArray, exerciseIndex: number, setIndex: number): boolean {
    const set = (exercises.at(exerciseIndex).get('sets') as FormArray).at(setIndex);
    const kg = set.get('kg')?.value;
    const reps = set.get('reps')?.value;
    const rir = set.get('rir')?.value;
    return (kg != null && kg >= 0) && (reps != null && reps > 0) && (rir != null && rir >= 0);
  }

  mapFormToLog(formValue: any, dateStr: string, routineId: string, notes: string): WorkoutLog | null {
    const validExerciseLogs: ExerciseLog[] = [];

    formValue.exercises.forEach((exercise: any) => {
      const validSets = exercise.sets.filter((set: any) => 
        (set.kg !== null && set.kg > 0) || (set.reps !== null && set.reps > 0)
      );

      if (validSets.length > 0) {
        validExerciseLogs.push({
          exerciseId: exercise.exerciseId,
          name: exercise.name,
          target: (Array.isArray(exercise.target) ? exercise.target : [exercise.target]).filter((t: any) => t != null),
          sets: validSets.map((s: any) => ({
            kg: Number(s.kg) || 0,
            reps: Number(s.reps) || 0,
            rir: Number(s.rir) || 0
          }))
        });
      }
    });

    if (validExerciseLogs.length === 0) return null;

    return {
      doneAt: dateStr,
      routineId: routineId || 'sin-rutina',
      notes: notes.trim() || undefined,
      exerciseLogs: validExerciseLogs
    };
  }
}
