import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Order, ORDERS_STORAGE_KEY } from '../order-history/order-history';

export type ProfileTab = 'account' | 'orders' | 'settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {

  // ── Tab state ─────────────────────────────────────────────
  activeTab: ProfileTab = 'account';

  // ── User data ─────────────────────────────────────────────
  user = { name: 'Guest User', email: 'guest@thrifthub.ph' };

  // ── Editable fields ───────────────────────────────────────
  editName = '';
  editEmail = '';
  editPhone = '';
  editAddress = '';
  editCity = '';
  editPostal = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  // ── Orders ────────────────────────────────────────────────
  orders: Order[] = [];
  expandedOrderId: string | null = null;

  // ── UI state ──────────────────────────────────────────────
  isSaving = false;
  saveSuccess = false;
  saveError = '';

  isChangingPass = false;
  passSuccess = false;
  passError = '';

  showLogoutConfirm = false;

  toastMessage = '';
  showToast = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private auth: AuthService,
    private cartService: CartService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // 1. Try AuthService public Observable/signal first (cleanest)
    try {
      const liveUser = (this.auth as any).currentUser$?.getValue?.()
        ?? (this.auth as any).user$?.getValue?.()
        ?? (this.auth as any).currentUser
        ?? (this.auth as any).user
        ?? null;

      if (liveUser?.name || liveUser?.email) {
        this.user = {
          name: liveUser.name ?? 'Thrift Fan',
          email: liveUser.email ?? '',
        };
        this.editName = this.user.name;
        this.editEmail = this.user.email;
        this.loadOrders();
        return;
      }
    } catch { /* AuthService shape unknown — fall through */ }

    // 2. Try every storage key the app might use
    const CANDIDATE_KEYS = [
      'thrifthub_user',
      'th_user',
      'user',
      'currentUser',
      'auth_user',
      'session_user',
    ];

    try {
      for (const key of CANDIDATE_KEYS) {
        const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        // Accept if it looks like a user object
        if (parsed && (parsed.name || parsed.email)) {
          this.user = {
            name: parsed.name ?? parsed.username ?? 'Thrift Fan',
            email: parsed.email ?? '',
          };
          break;
        }
      }
    } catch {
      // Stay with default guest values
    }

    this.editName = this.user.name;
    this.editEmail = this.user.email;
    this.loadOrders();
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
  }

  // ── Tab navigation ────────────────────────────────────────
  setTab(tab: ProfileTab): void {
    this.activeTab = tab;
    this.saveSuccess = false;
    this.saveError = '';
    this.passSuccess = false;
    this.passError = '';
  }

  // ── Stats ─────────────────────────────────────────────────
  get totalOrders(): number { return this.orders.length; }

  get totalSpent(): number {
    return this.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
  }

  // Most recent 3 orders — shown as a preview on the profile tab
  get recentOrders(): Order[] {
    return this.orders.slice(0, 3);
  }

  get cartItemCount(): number { return this.cartService.getCount(); }

  get memberSince(): string {
    return 'March 2026';
  }

  // ── Initials avatar ───────────────────────────────────────
  get initials(): string {
    return this.user.name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // ── Profile save ──────────────────────────────────────────
  saveProfile(): void {
    this.saveError = '';
    if (!this.editName.trim()) { this.saveError = 'Name cannot be empty.'; return; }
    if (!this.editEmail.trim() || !this.editEmail.includes('@')) {
      this.saveError = 'Please enter a valid email.'; return;
    }
    this.isSaving = true;
    setTimeout(() => {
      this.user.name = this.editName.trim();
      this.user.email = this.editEmail.trim();
      this.isSaving = false;
      this.saveSuccess = true;
      this.toast('Profile updated successfully!');
      setTimeout(() => (this.saveSuccess = false), 3000);
    }, 1000);
  }

  // ── Password change ───────────────────────────────────────
  changePassword(): void {
    this.passError = '';
    if (!this.currentPassword) { this.passError = 'Enter your current password.'; return; }
    if (this.newPassword.length < 8) { this.passError = 'New password must be at least 8 characters.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passError = 'Passwords do not match.'; return; }
    this.isChangingPass = true;
    setTimeout(() => {
      this.isChangingPass = false;
      this.passSuccess = true;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.toast('Password changed successfully!');
      setTimeout(() => (this.passSuccess = false), 3000);
    }, 1000);
  }

  // ── Orders ────────────────────────────────────────────────
  private loadOrders(): void {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Order[];
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id) {
          this.orders = parsed;
          return;
        }
      }
    } catch { /* fall through — orders stay empty */ }
    this.orders = [];
  }

  navigateToOrderHistory(): void {
    this.router.navigate(['/order-history']);
  }

  toggleOrder(id: string): void {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  isOrderExpanded(id: string): boolean { return this.expandedOrderId === id; }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  formatPrice(n: number): string { return '₱' + n.toLocaleString('en-PH'); }

  getStatusLabel(status: Order['status']): string {
    return { confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }[status];
  }

  // ── Logout ────────────────────────────────────────────────
  confirmLogout(): void { this.showLogoutConfirm = true; }
  cancelLogout(): void { this.showLogoutConfirm = false; }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // ── Toast ─────────────────────────────────────────────────
  private toast(msg: string): void {
    this.toastMessage = msg;
    this.showToast = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.showToast = false), 3000);
  }
}