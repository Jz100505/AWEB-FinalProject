import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

export type ProfileTab = 'account' | 'orders' | 'settings';

export interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
}

// Mock orders for demonstration
const MOCK_ORDERS: Order[] = [
  {
    id: 'TH-20260101',
    date: '2026-01-15T10:30:00Z',
    status: 'delivered',
    total: 850,
    items: [
      { name: 'Yellow Hoodie', image: '/assets/images/yellow_hoodie.webp', price: 550, quantity: 1, size: 'M' },
      { name: 'Grey T-Shirt', image: '/assets/images/grey_tshirt.webp', price: 200, quantity: 1, size: 'L' },
    ],
  },
  {
    id: 'TH-20260215',
    date: '2026-02-08T14:22:00Z',
    status: 'shipped',
    total: 750,
    items: [
      { name: 'Blue Jeans', image: '/assets/images/blue_jeans.webp', price: 400, quantity: 1, size: 'M' },
      { name: 'Grey Sweatpants', image: '/assets/images/grey_sweatpants.webp', price: 250, quantity: 1, size: 'L' },
    ],
  },
  {
    id: 'TH-20260312',
    date: '2026-03-10T09:05:00Z',
    status: 'confirmed',
    total: 450,
    items: [
      { name: 'Vintage Long Sleeves', image: '/assets/images/vintage_long_sleeves.webp', price: 450, quantity: 1, size: 'S' },
    ],
  },
];

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
  orders: Order[] = MOCK_ORDERS;
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