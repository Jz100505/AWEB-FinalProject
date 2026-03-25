import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Order } from '../order-history/order-history';

type Tab = 'account' | 'orders' | 'settings';
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const FREE_SHIPPING_THRESHOLD = 1500;
const FLAT_SHIPPING_FEE = 120;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {

  // ── User ──────────────────────────────────────────────────────
  user = { name: 'Guest', email: '' };

  // ── Tab ───────────────────────────────────────────────────────
  activeTab: Tab = 'account';

  // ── Orders ────────────────────────────────────────────────────
  orders: Order[] = [];
  expandedOrderIds = new Set<string>();

  // ── Cart ──────────────────────────────────────────────────────
  cartItemCount = 0;

  // ── Form (Account Info) ───────────────────────────────────────
  editName = '';
  editEmail = '';
  editPhone = '';
  editAddress = '';
  editCity = '';
  editPostal = '';

  isSaving = false;
  saveSuccess = false;
  saveError = '';

  // ── Settings (Password) ───────────────────────────────────────
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  isChangingPass = false;
  passSuccess = false;
  passError = '';

  // ── Modal / toast ─────────────────────────────────────────────
  showLogoutConfirm = false;
  showToast = false;
  toastMessage = '';

  private toastTimer?: ReturnType<typeof setTimeout>;
  private cartSub?: Subscription;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const u = this.authService.currentUser;
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = { name: u.name, email: u.email };
    this.editName = u.name;
    this.editEmail = u.email;

    // Load profile extras from per-user storage
    this.loadProfileExtras();
    this.loadOrders();

    this.cartSub = this.cartService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.toastTimer);
    this.cartSub?.unsubscribe();
  }

  // ── Per-user storage key ──────────────────────────────────────
  private get userId(): string {
    return this.authService.currentUser?.id ?? 'guest';
  }

  private get userOrdersKey(): string {
    return `th_orders_${this.userId}`;
  }

  private get userProfileKey(): string {
    return `th_profile_${this.userId}`;
  }

  // ── Data loaders ──────────────────────────────────────────────
  private loadProfileExtras(): void {
    try {
      const raw = localStorage.getItem(this.userProfileKey);
      if (raw) {
        const p = JSON.parse(raw);
        this.editPhone = p.phone ?? '';
        this.editAddress = p.address ?? '';
        this.editCity = p.city ?? '';
        this.editPostal = p.postal ?? '';
      }
    } catch { /* ignore */ }
  }

  loadOrders(): void {
    try {
      const raw = localStorage.getItem(this.userOrdersKey);
      const parsed = raw ? JSON.parse(raw) : [];
      this.orders = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.orders = [];
    }
  }

  // ── Computed ──────────────────────────────────────────────────
  get initials(): string {
    return this.user.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get memberSince(): string {
    // Could be stored in user object; fall back to current year
    return new Date().getFullYear().toString();
  }

  get recentOrders(): Order[] {
    return this.orders.slice(0, 3);
  }

  get totalOrders(): number {
    return this.orders.length;
  }

  get totalSpent(): number {
    return this.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
  }

  // ── Tab ───────────────────────────────────────────────────────
  setTab(tab: Tab): void {
    this.activeTab = tab;
    this.saveSuccess = false;
    this.saveError = '';
    this.passSuccess = false;
    this.passError = '';
  }

  // ── Profile save ──────────────────────────────────────────────
  saveProfile(): void {
    if (!this.editName.trim() || !this.editEmail.trim()) {
      this.saveError = 'Name and email are required.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    setTimeout(() => {
      try {
        // Persist extras to per-user profile key
        localStorage.setItem(this.userProfileKey, JSON.stringify({
          phone: this.editPhone,
          address: this.editAddress,
          city: this.editCity,
          postal: this.editPostal,
        }));

        this.user.name = this.editName.trim();
        this.user.email = this.editEmail.trim();
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 3000);
      } catch {
        this.isSaving = false;
        this.saveError = 'Could not save changes. Please try again.';
      }
    }, 800);
  }

  // ── Password change (simulated) ───────────────────────────────
  changePassword(): void {
    this.passError = '';
    this.passSuccess = false;

    if (!this.currentPassword) {
      this.passError = 'Please enter your current password.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.passError = 'New password must be at least 8 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passError = 'New passwords do not match.';
      return;
    }

    this.isChangingPass = true;
    setTimeout(() => {
      this.isChangingPass = false;
      this.passSuccess = true;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      setTimeout(() => (this.passSuccess = false), 3000);
    }, 900);
  }

  // ── Order expand ──────────────────────────────────────────────
  toggleOrder(id: string): void {
    if (this.expandedOrderIds.has(id)) {
      this.expandedOrderIds.delete(id);
    } else {
      this.expandedOrderIds.add(id);
    }
  }

  isOrderExpanded(id: string): boolean {
    return this.expandedOrderIds.has(id);
  }

  navigateToOrderHistory(): void {
    this.router.navigate(['/order-history']);
  }

  // ── Logout ────────────────────────────────────────────────────
  confirmLogout(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  logout(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
  }

  // ── Helpers ───────────────────────────────────────────────────
  getStatusLabel(status: string): string {
    return STATUS_LABELS[status as OrderStatus] ?? status;
  }

  formatPrice(n: number): string {
    return '₱' + n.toLocaleString('en-PH');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }
}