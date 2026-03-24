import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
    id: string;
    name: string;
    email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly SESSION_KEY = 'th_session';
    private readonly API = '/api';

    private currentUserSubject = new BehaviorSubject<User | null>(this.loadSession());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    // ── Public getters ─────────────────────────────────────────
    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isLoggedIn(): boolean {
        return !!this.currentUser;
    }

    get userInitial(): string {
        return this.currentUser?.name?.charAt(0).toUpperCase() ?? 'U';
    }

    // ── Login ──────────────────────────────────────────────────
    async login(
        email: string,
        password: string,
        remember = false
    ): Promise<{ success: boolean; message: string }> {
        try {
            const res = await firstValueFrom(
                this.http.post<{ message: string; user: User }>(
                    `${this.API}/login`,
                    { email, password }
                )
            );
            this.saveSession(res.user, remember);
            this.currentUserSubject.next(res.user);
            return { success: true, message: res.message };
        } catch (err: any) {
            const message =
                err?.error?.message ?? 'Something went wrong. Please try again.';
            return { success: false, message };
        }
    }

    // ── Register ───────────────────────────────────────────────
    async register(
        name: string,
        email: string,
        password: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const res = await firstValueFrom(
                this.http.post<{ message: string; user: User }>(
                    `${this.API}/register`,
                    { name, email, password }
                )
            );
            return { success: true, message: res.message };
        } catch (err: any) {
            const message =
                err?.error?.message ?? 'Something went wrong. Please try again.';
            return { success: false, message };
        }
    }

    // ── Logout ─────────────────────────────────────────────────
    logout(): void {
        localStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.SESSION_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    // ── Session persistence ────────────────────────────────────
    private saveSession(user: User, remember: boolean): void {
        const encoded = btoa(JSON.stringify(user));
        if (remember) {
            localStorage.setItem(this.SESSION_KEY, encoded);
        } else {
            sessionStorage.setItem(this.SESSION_KEY, encoded);
        }
    }

    private loadSession(): User | null {
        try {
            const raw =
                localStorage.getItem(this.SESSION_KEY) ??
                sessionStorage.getItem(this.SESSION_KEY);
            return raw ? (JSON.parse(atob(raw)) as User) : null;
        } catch {
            return null;
        }
    }
}