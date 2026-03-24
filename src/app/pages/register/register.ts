import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {

  // ── Form fields ────────────────────────────────────────────
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreedToTerms = false;

  // ── UI state ───────────────────────────────────────────────
  showPass = false;
  showConfirmPass = false;
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private auth: AuthService, private router: Router) { }

  // ── Hide navbar on this page ───────────────────────────────
  ngOnInit(): void {
    document.body.classList.add('no-navbar');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-navbar');
  }

  // ── Toggle password visibility ─────────────────────────────
  togglePass(): void {
    this.showPass = !this.showPass;
  }

  toggleConfirmPass(): void {
    this.showConfirmPass = !this.showConfirmPass;
  }

  // ── Password strength ──────────────────────────────────────
  get passwordStrengthClass(): string {
    const p = this.password;
    if (p.length < 6) return 'strength-weak';
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const score = [p.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 2) return 'strength-weak';
    if (score === 3) return 'strength-fair';
    return 'strength-strong';
  }

  get passwordStrengthLabel(): string {
    switch (this.passwordStrengthClass) {
      case 'strength-weak': return 'Weak';
      case 'strength-fair': return 'Fair';
      case 'strength-strong': return 'Strong';
      default: return '';
    }
  }

  // ── Form submit ────────────────────────────────────────────
  async onSubmit(): Promise<void> {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.fullName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMsg = 'Password must be at least 8 characters.';
      return;
    }

    if (!this.agreedToTerms) {
      this.errorMsg = 'Please agree to the Terms of Service and Privacy Policy.';
      return;
    }

    this.isLoading = true;

    const result = await this.auth.register(this.fullName, this.email, this.password);

    this.isLoading = false;

    if (result.success) {
      this.successMsg = 'Account created! Redirecting you to sign in…';
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } else {
      this.errorMsg = result.message;
    }
  }
}