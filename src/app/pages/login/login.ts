import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly USERS_KEY = 'th_users';
  private readonly SESSION_KEY = 'th_session';
  private readonly SALT = 'thrifthub_salt_6aweb_2026';

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadSession());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) { }

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

  // ── Auth actions ───────────────────────────────────────────
  async login(
    email: string,
    password: string,
    remember = false
  ): Promise<{ success: boolean; message: string }> {
    const users = this.readUsers();
    const hash = await this.hashPassword(password);
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    this.saveSession(user, remember);
    this.currentUserSubject.next(user);
    return { success: true, message: 'Welcome back!' };
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    const users = this.readUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await this.hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.writeUsers(users);
    return { success: true, message: 'Account created! You can now log in.' };
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ── Password hashing (SHA-256 via built-in Web Crypto API) ─
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.SALT);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ── User store (base64-encoded JSON in localStorage) ───────
  private readUsers(): User[] {
    try {
      const raw = localStorage.getItem(this.USERS_KEY);
      return raw ? (JSON.parse(atob(raw)) as User[]) : [];
    } catch {
      return [];
    }
  }

  private writeUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, btoa(JSON.stringify(users)));
  }

  // ── Session (persistent = localStorage, tab-only = sessionStorage) ──
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