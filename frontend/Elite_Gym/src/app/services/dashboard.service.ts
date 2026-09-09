import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  // عدّل الحقول دي لما تشوف شكل الـ response الحقيقي من الـ API
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_BASE = 'http://localhost:3000/api/dashboard';

  /**
   * GET /api/dashboard
   * الكوكيز بتتبعت تلقائي مع الـ request بسبب withCredentials: true
   */
  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.API_BASE, {
      withCredentials: true,
    });
  }
}