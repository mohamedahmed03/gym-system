import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportsData {
  // عدّل الحقول دي لما تشوف شكل الـ response الحقيقي من الـ API
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private readonly API_BASE = 'http://localhost:3000/api/reports';

  /**
   * GET /api/reports
   */
  getReports(): Observable<ReportsData> {
    return this.http.get<ReportsData>(this.API_BASE, {
      withCredentials: true,
    });
  }

  /**
   * رابط الـ QR الخاص بعضو معين (يترجع صورة PNG بصيغة base64)
   * GET /api/reports/{id}/qr
   */
  getQrUrl(memberId: string): string {
    return `${this.API_BASE}/${memberId}/qr`;
  }

  /**
   * رابط التقرير الجاهز للطباعة (HTML كامل يتفتح في تاب جديد)
   * GET /api/reports/{id}/print
   */
  getPrintUrl(memberId: string): string {
    return `${this.API_BASE}/${memberId}/print`;
  }
}