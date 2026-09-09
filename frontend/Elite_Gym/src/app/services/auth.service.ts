import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

export interface LoginResponse {
  message: string;
  user: UserInfo;
}

export interface RegisterResponse {
  success: boolean;
}

export interface RefreshResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_BASE = 'http://localhost:3000/api/auth';

  /**
   * POST /api/auth/login
   * Backend sets httpOnly cookies (accessToken, refreshToken) automatically.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/login`, credentials, {
      withCredentials: true,
    });
  }

  /**
   * POST /api/auth/register
   * Returns { success: true } on 201.
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_BASE}/register`, data, {
      withCredentials: true,
    });
  }

  /**
   * POST /api/auth/refresh
   * Sends the refreshToken cookie and gets new access/refresh tokens set as cookies.
   */
  refreshToken(): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.API_BASE}/refresh`, {}, {
      withCredentials: true,
    });
  }

  /**
   * POST /api/auth/logout
   */
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_BASE}/logout`, {}, {
      withCredentials: true,
    });
  }
}
