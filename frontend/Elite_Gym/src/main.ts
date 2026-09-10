import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Workout,
  WorkoutService,
  WorkoutType
} from './workout.service';

import { Routes } from '@angular/router';
import { WorkoutsComponent } from './workouts.component';
import { HistoryComponent } from './history.component';

export const WORKOUT_ROUTES: Routes = [
  {
    path: 'workouts',
    component: WorkoutsComponent
  },
  {
    path: 'history',
    component: HistoryComponent
  }
];


import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Workout,
  WorkoutService,
  WorkoutType
} from './workout.service';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.css'
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  readonly workoutTypes: { value: WorkoutType; label: string; icon: string }[] = [
    { value: 'strength', label: 'Strength', icon: '🏋' },
    { value: 'hiit', label: 'HIIT', icon: '⚡' },
    { value: 'cardio', label: 'Cardio', icon: '♥' },
    { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
    { value: 'crossfit', label: 'CrossFit', icon: '✦' },
    { value: 'yoga', label: 'Yoga', icon: '☯' },
    { value: 'other', label: 'Other', icon: '●' }
  ];

  selectedType: WorkoutType = 'strength';
  activeWorkout: Workout | null = null;
  elapsedSeconds = 0;
  calories = 0;
  feedback = '';
  loading = false;
  error = '';
  success = '';
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly workoutService: WorkoutService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get isActive(): boolean {
    return !!this.activeWorkout;
  }

  get timerText(): string {
    const hours = Math.floor(this.elapsedSeconds / 3600);
    const minutes = Math.floor((this.elapsedSeconds % 3600) / 60);
    const seconds = this.elapsedSeconds % 60;

    return [hours, minutes, seconds]
      .map((value, index) =>
        index === 0 ? String(value).padStart(2, '0') : String(value).padStart(2, '0')
      )
      .join(':');
  }

  selectType(type: WorkoutType): void {
    if (!this.isActive) {
      this.selectedType = type;
    }
  }

  startWorkout(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.workoutService.startWorkout(this.selectedType).then(
      response => {
        this.activeWorkout = response.workout;
        this.elapsedSeconds = 0;
        this.calories = 0;
        this.feedback = '';
        this.startTimer();
        this.success = 'Workout started successfully.';
        this.loading = false;
      },
      error => {
        this.error = error.message;
        this.loading = false;
      }
    );
  }

  stopWorkout(): void {
    if (!this.activeWorkout) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const id = this.activeWorkout._id ?? this.activeWorkout.id;
    if (!id) {
      this.error = 'Workout ID is missing.';
      this.loading = false;
      return;
    }

    this.workoutService.stopWorkout(id, this.calories > 0 ? this.calories : undefined).then(
      response => {
        this.activeWorkout = response.workout;
        this.elapsedSeconds = response.workout.duration ?? this.elapsedSeconds;
        this.clearTimer();
        this.success = 'Workout stopped successfully.';

        if (this.feedback.trim()) {
          this.sendFeedback(id);
        } else {
          this.loading = false;
        }
      },
      error => {
        this.error = error.message;
        this.loading = false;
      }
    );
  }

  saveFeedback(): void {
    if (!this.activeWorkout || !this.feedback.trim()) return;

    const id = this.activeWorkout._id ?? this.activeWorkout.id;
    if (!id) return;

    this.loading = true;
    this.error = '';

    this.sendFeedback(id);
  }

  private sendFeedback(id: string): void {
    this.workoutService.submitFeedback(id, this.feedback.trim()).then(
      response => {
        if (this.activeWorkout) {
          this.activeWorkout = {
            ...this.activeWorkout,
            feedback: response.workout.feedback
          };
        }
        this.success = 'Feedback saved.';
        this.loading = false;
      },
      error => {
        this.error = error.message;
        this.loading = false;
      }
    );
  }

  private startTimer(): void {
    this.clearTimer();

    this.timerId = setInterval(() => {
      if (!this.activeWorkout) return;

      const start = new Date(this.activeWorkout.startTimestamp).getTime();
      this.elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - start) / 1000)
      );
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}


import { Injectable } from '@angular/core';

export type WorkoutType =
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'hiit'
  | 'crossfit'
  | 'yoga'
  | 'other';

export interface Workout {
  _id?: string;
  id?: string;
  memberId?: string;
  startTimestamp: string;
  endTimestamp: string | null;
  duration: number | null;
  workoutType: WorkoutType;
  calories: number | null;
  feedback?: string | null;
  createdAt?: string;
}

export interface HistoryResponse {
  workouts: Workout[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly apiBaseUrl = 'http://localhost:3000/api';

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiBaseUrl}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {})
      }
    });

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof data === 'object' && data?.message
          ? data.message
          : `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data as T;
  }

  startWorkout(workoutType: WorkoutType) {
    return this.request<{ message: string; workout: Workout }>('/workouts/start', {
      method: 'POST',
      body: JSON.stringify({ workoutType })
    });
  }

  stopWorkout(id: string, calories?: number) {
    return this.request<{ message: string; workout: Workout }>(`/workouts/${id}/stop`, {
      method: 'POST',
      body: JSON.stringify(
        calories === undefined ? {} : { calories }
      )
    });
  }

  submitFeedback(id: string, feedback: string) {
    return this.request<{ message: string; workout: { id: string; feedback: string } }>(
      `/workouts/${id}/feedback`,
      {
        method: 'PATCH',
        body: JSON.stringify({ feedback })
      }
    );
  }

  getHistory(page = 1, limit = 10, workoutType?: WorkoutType) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (workoutType) {
      params.set('workoutType', workoutType);
    }

    return this.request<HistoryResponse>(`/workouts/history?${params.toString()}`);
  }
}

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  readonly workoutTypes: { value: WorkoutType | ''; label: string }[] = [
    { value: '', label: 'All Workouts' },
    { value: 'strength', label: 'Strength' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'other', label: 'Other' }
  ];

  workouts: Workout[] = [];
  selectedType: WorkoutType | '' = '';
  selectedWorkout: Workout | null = null;
  page = 1;
  readonly limit = 10;
  total = 0;
  loading = false;
  error = '';

  constructor(private readonly workoutService: WorkoutService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get hasPrevious(): boolean {
    return this.page > 1;
  }

  get hasNext(): boolean {
    return this.page < this.totalPages;
  }

  loadHistory(): void {
    this.loading = true;
    this.error = '';

    const type = this.selectedType || undefined;

    this.workoutService.getHistory(this.page, this.limit, type).then(
      response => {
        this.workouts = response.workouts ?? [];
        this.total = response.total ?? 0;
        this.page = response.page ?? this.page;
        this.loading = false;
      },
      error => {
        this.error = error.message;
        this.loading = false;
      }
    );
  }

  changeFilter(): void {
    this.page = 1;
    this.loadHistory();
  }

  previousPage(): void {
    if (!this.hasPrevious) return;
    this.page--;
    this.loadHistory();
  }

  nextPage(): void {
    if (!this.hasNext) return;
    this.page++;
    this.loadHistory();
  }

  openDetails(workout: Workout): void {
    this.selectedWorkout = workout;
  }

  closeDetails(): void {
    this.selectedWorkout = null;
  }

  formatDuration(seconds: number | null): string {
    if (seconds === null || seconds === undefined) return '--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m ${secs}s`;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '--';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  typeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  workoutId(workout: Workout): string {
    return workout._id ?? workout.id ?? '--';
  }
}
