import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  // ── Form fields ────────────────────────────────────────────
  email = '';
  password = '';
  remember = false;

  // ── UI state ───────────────────────────────────────────────
  showPass = false;
  isLoading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) { }

  // ── Toggle password visibility ─────────────────────────────
  togglePass(): void {
    this.showPass = !this.showPass;
  }

  // ── Form submit ────────────────────────────────────────────
  async onSubmit(): Promise<void> {
    this.errorMsg = '';

    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;

    const result = await this.auth.login(this.email, this.password, this.remember);

    this.isLoading = false;

    if (result.success) {
      this.router.navigate(['/home']);
    } else {
      this.errorMsg = result.message;
    }
  }
}